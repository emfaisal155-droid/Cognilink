using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cognilink.infrastructure.Repositories
{
    public interface IConceptExtractionService
    {
        // Sub-story 1.1 + 1.3: parse text, extract keywords, filter stop words
        Task<List<string>> ExtractConceptsAsync(string noteText, int noteId);

        // Sub-story 4.1 + 4.2: re-run extraction when note is updated/deleted
        Task UpdateConceptsAsync(int noteId, string updatedText);
    }
}