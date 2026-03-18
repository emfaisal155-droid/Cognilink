using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Cognilink.core;

namespace Cognilink.infrastructure.Repositories
{
    public interface INoteRepository
    {
        Task<IEnumerable<Note>> GetAllNotesAsync(int userId);
        Task<Note> GetNoteByIdAsync(int id);
        Task AddNoteAsync(Note note);
        Task UpdateNoteAsync(Note note);
        Task DeleteNoteAsync(int id);
    }

}
