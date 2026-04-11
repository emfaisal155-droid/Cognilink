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
        public string Name { get; set; } = string.Empty;
        public int Frequency { get; set; }
        public int NoteId { get; set; }
        public int UserId { get; set; }

        public Note Note { get; set; } = null!;

        public ICollection<ConceptRelationship> SourceRelationships { get; set; }
            = new List<ConceptRelationship>();
        public ICollection<ConceptRelationship> TargetRelationships { get; set; }
            = new List<ConceptRelationship>();
    }
}