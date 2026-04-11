using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cognilink.infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddConceptAndRelationshipTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Concepts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Frequency = table.Column<int>(type: "int", nullable: false),
                    NoteId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Concepts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Concepts_Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ConceptRelationships",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SourceConceptId = table.Column<int>(type: "int", nullable: false),
                    TargetConceptId = table.Column<int>(type: "int", nullable: false),
                    SimilarityScore = table.Column<double>(type: "float", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConceptRelationships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConceptRelationships_Concepts_SourceConceptId",
                        column: x => x.SourceConceptId,
                        principalTable: "Concepts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConceptRelationships_Concepts_TargetConceptId",
                        column: x => x.TargetConceptId,
                        principalTable: "Concepts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConceptRelationships_SourceConceptId",
                table: "ConceptRelationships",
                column: "SourceConceptId");

            migrationBuilder.CreateIndex(
                name: "IX_ConceptRelationships_TargetConceptId",
                table: "ConceptRelationships",
                column: "TargetConceptId");

            migrationBuilder.CreateIndex(
                name: "IX_Concepts_NoteId",
                table: "Concepts",
                column: "NoteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConceptRelationships");

            migrationBuilder.DropTable(
                name: "Concepts");
        }
    }
}
