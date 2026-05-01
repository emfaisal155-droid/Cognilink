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
            public DbSet<Concept> Concepts { get; set; }
            public DbSet<ConceptRelationship> ConceptRelationships { get; set; }
    
            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
    
                modelBuilder.Entity<Concept>()
                   .HasOne(c => c.User)
                   .WithMany()
                   .HasForeignKey(c => c.UserId)
                   .OnDelete(DeleteBehavior.Restrict);
    
                modelBuilder.Entity<Concept>()
                    .HasOne(c => c.Note)
                    .WithMany()
                    .HasForeignKey(c => c.NoteId)
                    .OnDelete(DeleteBehavior.Restrict);
    
    
                modelBuilder.Entity<ConceptRelationship>()
                    .HasOne(cr => cr.SourceConcept)
                    .WithMany(c => c.SourceEdges)
                    .HasForeignKey(cr => cr.SourceConceptId)
                    .OnDelete(DeleteBehavior.Restrict); // prevent cascade conflict
    
                modelBuilder.Entity<ConceptRelationship>()
                    .HasOne(cr => cr.TargetConcept)
                    .WithMany(c => c.TargetEdges)
                    .HasForeignKey(cr => cr.TargetConceptId)
                    .OnDelete(DeleteBehavior.Restrict);
    
                // Unique constraint: prevent duplicate edges
                modelBuilder.Entity<ConceptRelationship>()
                    .HasIndex(cr => new { cr.SourceConceptId, cr.TargetConceptId, cr.UserId })
                    .IsUnique();
            }

}

