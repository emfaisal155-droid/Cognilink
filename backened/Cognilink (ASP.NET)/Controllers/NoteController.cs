using Microsoft.AspNetCore.Mvc;
using Cognilink.core;
using Cognilink.infrastructure;
using Cognilink.infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace Cognilink_ASP.NET_.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotesController : Controller
    {
        private readonly AppDbContext _context;
        private readonly ConceptProcessingOrchestrator _orchestrator;

        public NotesController(AppDbContext context, ConceptProcessingOrchestrator orchestrator)
        {
            _context = context;
            _orchestrator = orchestrator;
        }

        // POST: api/notes
        [HttpPost]
        public async Task<IActionResult> CreateNote([FromBody] NoteDto dto)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == dto.Username);
            if (user == null)
                return Unauthorized("User not found.");

            var note = new Note
            {
                Title = dto.Title,
                Content = dto.Content,
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow,
                Deleted = false
            };

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            // Ammara: trigger concept extraction after note is saved
            await _orchestrator.ProcessNoteAsync(note);

            return Ok(note);
        }

        // GET: api/notes/{username}
        [HttpGet("{username}")]
        public IActionResult GetNotes(string username)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
                return Unauthorized("User not found.");

            var notes = _context.Notes
                .Where(n => n.UserId == user.Id)
                .Select(n => new {
                    id = n.Id,
                    title = n.Title,
                    content = n.Content,
                    createdAt = n.CreatedAt,
                    deleted = n.Deleted,
                    userId = n.UserId
                })
                .ToList();

            return Ok(notes);
        }

        // PUT: api/notes/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, [FromBody] NoteDto dto)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == dto.Username);
            if (user == null)
                return Unauthorized("User not found.");

            var note = _context.Notes.FirstOrDefault(n => n.Id == id);
            if (note == null)
                return NotFound("Note not found.");

            if (note.UserId != user.Id)
                return StatusCode(403, "You can only edit your own notes.");

            note.Title = dto.Title;
            note.Content = dto.Content;
            await _context.SaveChangesAsync();

            // Ammara: re-extract concepts when note is updated
            await _orchestrator.ProcessNoteAsync(note);

            return Ok(new
            {
                id = note.Id,
                title = note.Title,
                content = note.Content,
                createdAt = note.CreatedAt,
                deleted = note.Deleted,
                userId = note.UserId
            });
        }

        // DELETE: api/notes/{id}
        // Fixed: removed [FromBody] since frontend sends no body
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var note = _context.Notes.FirstOrDefault(n => n.Id == id);
            if (note == null)
                return NotFound("Note not found.");

            // Ammara: remove concepts before deleting note
            await _orchestrator.RemoveNoteConceptsAsync(note.Id);
            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();

            return Ok("Note deleted successfully.");
        }
    }

    public class NoteDto
    {
        public string Username { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }

    public class DeleteDto
    {
        public string Username { get; set; } = string.Empty;
    }
}