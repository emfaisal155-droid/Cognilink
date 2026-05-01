using Cognilink.core;
using Cognilink.core.DTOS;
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

        // GET api/graph/{userId}
        [HttpGet("{userId}")]
        public async Task<ActionResult<GraphDto>> GetGraph(int userId)
        {
            var concepts = await _context.Concepts
                .Where(c => c.UserId == userId)
                .ToListAsync();

            var edges = await _context.ConceptRelationships
                .Where(e => e.UserId == userId)
                .ToListAsync();

            var validNodeIds = concepts.Select(c => c.Id).ToHashSet();
            var ghostEdges = edges.Where(e =>
                !validNodeIds.Contains(e.SourceConceptId) ||
                !validNodeIds.Contains(e.TargetConceptId)).ToList();

            if (ghostEdges.Any())
            {
                _context.ConceptRelationships.RemoveRange(ghostEdges);
                await _context.SaveChangesAsync();
                edges = edges.Except(ghostEdges).ToList();
            }

            var graphDto = new GraphDto
            {
                Nodes = concepts.Select(c => new NodeDto
                {
                    id = c.Id,
                    label = c.Name,
                    frequency = c.Frequency,
                    createdAt = c.CreatedAt
                }).ToList(),

                Edges = edges.Select(e => new EdgeDto
                {
                    id = e.Id,
                    source = e.SourceConceptId,
                    target = e.TargetConceptId,
                    similarityScore = e.SimilarityScore,
                    isManual = e.IsManual
                }).ToList()
            };

            return Ok(graphDto);
        }

        // User Story 2.2 — Filter graph by noteId
        [HttpGet("filter")]
        public async Task<ActionResult<GraphDto>> GetFilteredGraph(
            [FromQuery] int noteId, [FromQuery] string username)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return Unauthorized();

            var concepts = await _context.Concepts
                .Where(c => c.NoteId == noteId && c.UserId == user.Id)
                .ToListAsync();

            var conceptIds = concepts.Select(c => c.Id).ToHashSet();

            var edges = await _context.ConceptRelationships
                .Where(e => conceptIds.Contains(e.SourceConceptId)
                         && conceptIds.Contains(e.TargetConceptId))
                .ToListAsync();

            return Ok(new GraphDto
            {
                Nodes = concepts.Select(c => new NodeDto
                {
                    id = c.Id,
                    label = c.Name,
                    frequency = c.Frequency,
                    createdAt = c.CreatedAt
                }).ToList(),
                Edges = edges.Select(e => new EdgeDto
                {
                    id = e.Id,
                    source = e.SourceConceptId,
                    target = e.TargetConceptId,
                    similarityScore = e.SimilarityScore,
                    isManual = e.IsManual
                }).ToList()
            });
        }

        // User Story 4.2 — JSON Export
        [HttpGet("export/{userId}")]
        public async Task<IActionResult> ExportGraph(int userId)
        {
            var concepts = await _context.Concepts
                .Where(c => c.UserId == userId)
                .ToListAsync();

            var edges = await _context.ConceptRelationships
                .Where(e => e.UserId == userId)
                .ToListAsync();

            var export = new
            {
                exportedAt = DateTime.UtcNow,
                nodes = concepts.Select(c => new {
                    id = c.Id,
                    label = c.Name,
                    frequency = c.Frequency,
                    createdAt = c.CreatedAt
                }),
                edges = edges.Select(e => new {
                    id = e.Id,
                    source = e.SourceConceptId,
                    target = e.TargetConceptId,
                    similarityScore = e.SimilarityScore,
                    isManual = e.IsManual
                })
            };

            return Ok(export);
        }

        // PATCH api/graph/node/{nodeId}/rename
        [HttpPatch("node/{nodeId}/rename")]
        public async Task<IActionResult> RenameNode(int nodeId, [FromBody] RenameNodeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NewName))
                return BadRequest(new { message = "Name cannot be empty." });

            var concept = await _context.Concepts.FindAsync(nodeId);
            if (concept == null)
                return NotFound(new { message = "Node not found." });

            concept.Name = dto.NewName.Trim();
            await _context.SaveChangesAsync();

            return Ok(new { message = "Node renamed successfully.", newName = concept.Name });
        }

        // DELETE api/graph/node/{nodeId}
        [HttpDelete("node/{nodeId}")]
        public async Task<IActionResult> DeleteNode(int nodeId)
        {
            var concept = await _context.Concepts
                .Include(c => c.SourceEdges)
                .Include(c => c.TargetEdges)
                .FirstOrDefaultAsync(c => c.Id == nodeId);

            if (concept == null)
                return NotFound(new { message = "Node not found." });

            _context.ConceptRelationships.RemoveRange(concept.SourceEdges);
            _context.ConceptRelationships.RemoveRange(concept.TargetEdges);
            _context.Concepts.Remove(concept);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Node and all its edges deleted." });
        }

        // DELETE api/graph/edge/{edgeId}
        [HttpDelete("edge/{edgeId}")]
        public async Task<IActionResult> DeleteEdge(int edgeId)
        {
            var edge = await _context.ConceptRelationships.FindAsync(edgeId);
            if (edge == null)
                return NotFound(new { message = "Edge not found." });

            _context.ConceptRelationships.Remove(edge);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Edge deleted successfully." });
        }

        // POST api/graph/edge/manual
        [HttpPost("edge/manual")]
        public async Task<IActionResult> CreateManualEdge([FromBody] CreateManualEdgeDto dto)
        {
            if (dto.SourceConceptId == dto.TargetConceptId)
                return BadRequest(new { message = "Source and target cannot be the same node." });

            var sourceExists = await _context.Concepts.AnyAsync(c => c.Id == dto.SourceConceptId);
            var targetExists = await _context.Concepts.AnyAsync(c => c.Id == dto.TargetConceptId);

            if (!sourceExists || !targetExists)
                return NotFound(new { message = "One or both nodes do not exist." });

            var duplicate = await _context.ConceptRelationships.AnyAsync(e =>
                (e.SourceConceptId == dto.SourceConceptId && e.TargetConceptId == dto.TargetConceptId) ||
                (e.SourceConceptId == dto.TargetConceptId && e.TargetConceptId == dto.SourceConceptId));

            if (duplicate)
                return Conflict(new { message = "A relationship between these nodes already exists." });

            var sourceConcept = await _context.Concepts.FindAsync(dto.SourceConceptId);

            var edge = new ConceptRelationship
            {
                SourceConceptId = dto.SourceConceptId,
                TargetConceptId = dto.TargetConceptId,
                SimilarityScore = 1.0,
                IsManual = true,
                UserId = sourceConcept!.UserId
            };

            _context.ConceptRelationships.Add(edge);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Manual edge created.",
                edgeId = edge.Id,
                source = edge.SourceConceptId,
                target = edge.TargetConceptId
            });
        }
    }
}