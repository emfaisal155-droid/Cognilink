using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Cognilink.core; 


namespace Cognilink.infrastructure
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Note> Notes { get; set; }

        //iteration2
        public DbSet<Concept> Concepts { get; set; }
        public DbSet<ConceptRelationship> ConceptRelationships { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        
            modelBuilder.Entity<ConceptRelationship>()
                .HasOne(r => r.SourceConcept)
                .WithMany(c => c.SourceRelationships)
                .HasForeignKey(r => r.SourceConceptId)
                .OnDelete(DeleteBehavior.Restrict);
        
            modelBuilder.Entity<ConceptRelationship>()
                .HasOne(r => r.TargetConcept)
                .WithMany(c => c.TargetRelationships)
                .HasForeignKey(r => r.TargetConceptId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

