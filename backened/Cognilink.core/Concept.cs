using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Cognilink.core
{
     public class Concept
     {
         public int Id { get; set; }
    
         [Required]
         public string Name { get; set; } = string.Empty;
    
         public int Frequency { get; set; } = 1;
    
         public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
         // FK to Note
         public int NoteId { get; set; }
         [ForeignKey("NoteId")]
         public Note? Note { get; set; }
    
         // FK to User
         public int UserId { get; set; }
         [ForeignKey("UserId")]
         public User? User { get; set; }
    
         // Navigation: edges where this concept is source
         public ICollection<ConceptRelationship> SourceEdges { get; set; } = new List<ConceptRelationship>();
    
         // Navigation: edges where this concept is target
         public ICollection<ConceptRelationship> TargetEdges { get; set; } = new List<ConceptRelationship>();
     }
}
