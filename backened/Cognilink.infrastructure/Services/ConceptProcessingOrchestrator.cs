using Cognilink.core;
using Cognilink.infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Cognilink.infrastructure.Services
{
    public class ConceptProcessingOrchestrator
    {
        private readonly AppDbContext _context;
        private readonly RelationshipDetectionService _relationshipService;

        private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
        {
            "the","and","but","or","in","on","at","to","a","an","is",
            "it","of","for","with","this","that","was","are","be","have",
            "has","had","do","does","did","will","would","could","should",
            "not","from","by","as","if","so","we","he","she","they","you",
            "your","their","our","its","which","when","then","than","into"
        };

        public ConceptProcessingOrchestrator(AppDbContext context, 
            RelationshipDetectionService relationshipService)
        {
            _context = context;
            _relationshipService = relationshipService;
        }

        public async Task ProcessNoteAsync(Note note)
        {
            var words = note.Content
                .ToLower()
                .Split(new[] { ' ', '.', ',', '!', '?', '\n', '\r', ';', ':', '-', '(', ')' },
                       StringSplitOptions.RemoveEmptyEntries);

            var keywords = words
                .Where(w => w.Length > 3 && !StopWords.Contains(w))
                .GroupBy(w => w)
                .Where(g => g.Count() >= 1)
                .ToDictionary(g => g.Key, g => g.Count());

            // Remove old concepts and their relationships
            var oldConcepts = _context.Concepts.Where(c => c.NoteId == note.Id);
            var oldConceptIds = oldConcepts.Select(c => c.Id);

            var oldRelationships = _context.ConceptRelationships
                .Where(cr => oldConceptIds.Contains(cr.SourceConceptId) ||
                             oldConceptIds.Contains(cr.TargetConceptId));

            _context.ConceptRelationships.RemoveRange(oldRelationships);
            _context.Concepts.RemoveRange(oldConcepts);
            await _context.SaveChangesAsync();

            // Save new concepts
            var newConcepts = keywords.Select(kv => new Concept
            {
                Name = kv.Key,
                Frequency = kv.Value,
                NoteId = note.Id,
                UserId = note.UserId
            }).ToList();

            await _context.Concepts.AddRangeAsync(newConcepts);
            await _context.SaveChangesAsync();

            // Step 1: Detect within-note relationships using similarity
            await _relationshipService.DetectAndSaveRelationshipsAsync(newConcepts, note.UserId);

            // Step 2: Detect cross-note relationships
            await DetectCrossNoteRelationshipsAsync(note.Id, newConcepts, note.UserId);
        }

        public async Task RemoveNoteConceptsAsync(int noteId)
        {
            var concepts = _context.Concepts.Where(c => c.NoteId == noteId);
            var conceptIds = concepts.Select(c => c.Id);

            var relationships = _context.ConceptRelationships
                .Where(cr => conceptIds.Contains(cr.SourceConceptId) ||
                             conceptIds.Contains(cr.TargetConceptId));

            _context.ConceptRelationships.RemoveRange(relationships);
            _context.Concepts.RemoveRange(concepts);
            await _context.SaveChangesAsync();
        }

        private async Task DetectCrossNoteRelationshipsAsync(
            int noteId, List<Concept> newConcepts, int userId)
        {
            var otherConcepts = await _context.Concepts
                .Where(c => c.NoteId != noteId && c.UserId == userId)
                .ToListAsync();

            var toAdd = new List<ConceptRelationship>();

            foreach (var concept in newConcepts)
            {
                foreach (var other in otherConcepts)
                {
                    if (concept.Name == other.Name)
                    {
                        bool exists = await _context.ConceptRelationships.AnyAsync(r =>
                            (r.SourceConceptId == concept.Id && r.TargetConceptId == other.Id) ||
                            (r.SourceConceptId == other.Id && r.TargetConceptId == concept.Id));

                        if (!exists)
                        {
                            toAdd.Add(new ConceptRelationship
                            {
                                SourceConceptId = concept.Id,
                                TargetConceptId = other.Id,
                                SimilarityScore = 1.0,
                                IsManual = false,
                                UserId = userId
                            });
                        }
                    }
                }
            }

            if (toAdd.Any())
            {
                await _context.ConceptRelationships.AddRangeAsync(toAdd);
                await _context.SaveChangesAsync();
            }
        }
    }
}