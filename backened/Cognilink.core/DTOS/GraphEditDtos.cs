using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cognilink.core.DTOS
{
    public class RenameNodeDto
    {
        public string NewName { get; set; } = string.Empty;
    }

    public class CreateManualEdgeDto
    {
        public int SourceConceptId { get; set; }
        public int TargetConceptId { get; set; }
    }

    // Standard response sent to React frontend (camelCase for JSON)
    public class GraphDto
    {
        public List<NodeDto> Nodes { get; set; } = new();
        public List<EdgeDto> Edges { get; set; } = new();
    }

    public class NodeDto
    {
        public int id { get; set; }
        public string label { get; set; } = string.Empty;
        public int frequency { get; set; }
        public DateTime createdAt { get; set; }
    }

    public class EdgeDto
    {
        public int id { get; set; }
        public int source { get; set; }
        public int target { get; set; }
        public double similarityScore { get; set; }
        public bool isManual { get; set; }
    }
}
