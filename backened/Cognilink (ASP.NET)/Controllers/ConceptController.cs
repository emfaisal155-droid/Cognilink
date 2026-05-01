using Cognilink.infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cognilink_ASP.NET_.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConceptsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ConceptsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("recent/{username}")]
        public async Task<IActionResult> GetRecentConcepts(string username)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return Unauthorized();

            var recent = await _context.Concepts
                .Where(c => c.UserId == user.Id)
                .OrderByDescending(c => c.CreatedAt)
                .Take(5)
                .Select(c => new {
                    id = c.Id,
                    name = c.Name,
                    frequency = c.Frequency,
                    createdAt = c.CreatedAt
                })
                .ToListAsync();

            return Ok(recent);
        }
    }
}