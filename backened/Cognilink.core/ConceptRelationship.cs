using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cognilink.core
{
    public class ConceptRelationship
    {
        public int Id { get; set; }
        public int SourceConceptId { get; set; }
        public int TargetConceptId { get; set; }
        public double SimilarityScore { get; set; }
        public int UserId { get; set; }

        public Concept SourceConcept { get; set; } = null!;
        public Concept TargetConcept { get; set; } = null!;
    }
}
