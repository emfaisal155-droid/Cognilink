using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cognilink.infrastructure.Repositories
{
    public interface IRelationshipDetectionService
    {
        // Sub-story 2.1: detect co-occurrence between concepts
        Task<List<(string ConceptA, string ConceptB, double Score)>>
            DetectRelationshipsAsync(List<string> concepts);

        // Sub-story 2.2: calculate similarity score between two concepts
        Task<double> CalculateSimilarityAsync(string conceptA, string conceptB);

        // Sub-story 2.3: fetch all relationships for a specific user
        Task<List<(string ConceptA, string ConceptB, double Score)>>
            GetRelationshipsByUserAsync(int userId);

    }
}
