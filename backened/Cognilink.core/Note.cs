using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cognilink.core
{
    internal class Note
    {
    }
}

public class Note
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    // Foreign Key
    public int UserId { get; set; }

    public virtual User User { get; set; } = null!;
}
