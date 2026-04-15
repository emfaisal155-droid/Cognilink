namespace Cognilink.core
{
    public class Note
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool Deleted { get; set; } = false;
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public ICollection<Concept> Concepts { get; set; } = new List<Concept>();
    }
}