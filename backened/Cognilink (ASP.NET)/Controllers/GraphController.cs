using Cognilink.core;
using Cognilink.infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cognilink_ASP.NET_.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GraphController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GraphController(AppDbContext context)
        {
            _context = context;
        }

        // GET api/graph
        // Returns ALL nodes (concepts) and edges (relationships)
        [HttpGet("{username}")]
        public async Task<IActionResult> GetGraph(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return Unauthorized("User not found.");

            var nodes = await _context.Concepts
                .Where(c => c.UserId == user.Id)
                .Select(c => new {
                    id = c.Id,
                    label = c.Name,
                    weight = c.Frequency,
                    noteId = c.NoteId
                })
                .ToListAsync();

            var edges = await _context.ConceptRelationships
                .Where(r => r.UserId == user.Id)
                .Select(r => new {
                    source = r.SourceConceptId,
                    target = r.TargetConceptId,
                    score = r.SimilarityScore
                })
                .ToListAsync();

            return Ok(new { nodes, edges });
        }

        // GET api/graph/filter?noteId=2
        // Returns nodes and edges for one specific note
        [HttpGet("filter")]
        public async Task<IActionResult> GetFilteredGraph([FromQuery] int? noteId, [FromQuery] string? username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return Unauthorized("User not found.");

            var query = _context.Concepts.Where(c => c.UserId == user.Id);

            if (noteId.HasValue)
                query = query.Where(c => c.NoteId == noteId.Value);

            var nodes = await query
                .Select(c => new {
                    id = c.Id,
                    label = c.Name,
                    weight = c.Frequency,
                    noteId = c.NoteId
                })
                .ToListAsync();

            var nodeIds = nodes.Select(n => n.id).ToHashSet();

            var edges = await _context.ConceptRelationships
                .Where(r => nodeIds.Contains(r.SourceConceptId) &&
                            nodeIds.Contains(r.TargetConceptId))
                .Select(r => new {
                    source = r.SourceConceptId,
                    target = r.TargetConceptId,
                    score = r.SimilarityScore
                })
                .ToListAsync();

            return Ok(new { nodes, edges });
        }

        // GET api/graph/relationships
        // Returns all detected concept links with keyword names
        [HttpGet("relationships")]
        public async Task<IActionResult> GetRelationships([FromQuery] string? username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return Unauthorized("User not found.");

            var result = await _context.ConceptRelationships
                .Include(r => r.SourceConcept)
                .Include(r => r.TargetConcept)
                .Where(r => r.UserId == user.Id)
                .Select(r => new {
                    from = r.SourceConcept.Name,
                    to = r.TargetConcept.Name,
                    score = r.SimilarityScore
                })
                .ToListAsync();

            return Ok(result);
        }
    }
}
