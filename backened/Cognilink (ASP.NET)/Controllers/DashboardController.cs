using Cognilink.infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cognilink_ASP.NET_.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats/{username}")]
        public async Task<IActionResult> GetStats(string username)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return Unauthorized();

            var totalNodes = await _context.Concepts
                .CountAsync(c => c.UserId == user.Id);

            var totalEdges = await _context.ConceptRelationships
                .CountAsync(e => e.UserId == user.Id);

            return Ok(new { totalNodes, totalEdges });
        }
    }
}