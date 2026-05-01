using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Cognilink.core
{
        public class ConceptRelationship
        {
            public int Id { get; set; }
    
            public int SourceConceptId { get; set; }
            [ForeignKey("SourceConceptId")]
            public Concept? SourceConcept { get; set; }
    
            public int TargetConceptId { get; set; }
            [ForeignKey("TargetConceptId")]
            public Concept? TargetConcept { get; set; }
    
            public double SimilarityScore { get; set; }
    
            // true = manually created by user, false = AI-generated
            public bool IsManual { get; set; } = false;
    
            public int UserId { get; set; }
            [ForeignKey("UserId")]
            public User? User { get; set; }
        }

}
