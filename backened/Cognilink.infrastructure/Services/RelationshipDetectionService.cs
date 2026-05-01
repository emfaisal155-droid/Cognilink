using Cognilink.core;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Cognilink.infrastructure.Services
{
    public class RelationshipDetectionService
    {
        private readonly AppDbContext _context;

        // MAX edges per node — this is what prevents hairballs
        private const int MAX_EDGES_PER_NODE = 5;
        // Minimum score threshold — weak links are discarded
        private const double MIN_SIMILARITY_THRESHOLD = 0.15;

        public RelationshipDetectionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task DetectAndSaveRelationshipsAsync(List<Concept> concepts, int userId)
        {
            if (concepts.Count < 2) return;

            var scoredPairs = new List<(Concept A, Concept B, double Score)>();

            // Calculate co-occurrence scores for all pairs
            for (int i = 0; i < concepts.Count; i++)
            {
                for (int j = i + 1; j < concepts.Count; j++)
                {
                    double score = CalculateSimilarity(concepts[i], concepts[j]);

                    if (score >= MIN_SIMILARITY_THRESHOLD)
                        scoredPairs.Add((concepts[i], concepts[j], score));
                }
            }

            // Sort by score descending (strongest links first)
            scoredPairs = scoredPairs.OrderByDescending(p => p.Score).ToList();

            // Edge count tracker per node to enforce MAX_EDGES_PER_NODE
            var edgeCount = new Dictionary<int, int>();

            foreach (var (a, b, score) in scoredPairs)
            {
                edgeCount.TryAdd(a.Id, 0);
                edgeCount.TryAdd(b.Id, 0);

                // Skip if either node has hit the limit
                if (edgeCount[a.Id] >= MAX_EDGES_PER_NODE ||
                    edgeCount[b.Id] >= MAX_EDGES_PER_NODE)
                    continue;

                // Skip if this edge already exists
                bool exists = await _context.ConceptRelationships.AnyAsync(e =>
                    (e.SourceConceptId == a.Id && e.TargetConceptId == b.Id) ||
                    (e.SourceConceptId == b.Id && e.TargetConceptId == a.Id));

                if (exists) continue;

                var relationship = new ConceptRelationship
                {
                    SourceConceptId = a.Id,
                    TargetConceptId = b.Id,
                    SimilarityScore = score,
                    IsManual = false,
                    UserId = userId
                };

                _context.ConceptRelationships.Add(relationship);
                edgeCount[a.Id]++;
                edgeCount[b.Id]++;
            }

            await _context.SaveChangesAsync();
        }

        private double CalculateSimilarity(Concept a, Concept b)
        {
            // Frequency-weighted co-occurrence score
            // Higher frequency = stronger conceptual weight
            double freqScore = (double)(a.Frequency + b.Frequency) /
                               (Math.Max(a.Frequency, b.Frequency) * 2 + 1);

            // Levenshtein-based name similarity (catches related terms)
            double nameSimilarity = 1.0 - (LevenshteinDistance(a.Name, b.Name) /
                                   (double)Math.Max(a.Name.Length, b.Name.Length));

            // Weighted combination
            return (freqScore * 0.7) + (nameSimilarity * 0.3);
        }

        private int LevenshteinDistance(string s, string t)
        {
            int[,] dp = new int[s.Length + 1, t.Length + 1];
            for (int i = 0; i <= s.Length; i++) dp[i, 0] = i;
            for (int j = 0; j <= t.Length; j++) dp[0, j] = j;

            for (int i = 1; i <= s.Length; i++)
                for (int j = 1; j <= t.Length; j++)
                    dp[i, j] = s[i - 1] == t[j - 1]
                        ? dp[i - 1, j - 1]
                        : 1 + Math.Min(dp[i - 1, j - 1],
                              Math.Min(dp[i - 1, j], dp[i, j - 1]));

            return dp[s.Length, t.Length];
        }
    }
}
