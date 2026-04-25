using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cognilink.infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsManualField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Concepts_Notes_NoteId",
                table: "Concepts");

            migrationBuilder.DropIndex(
                name: "IX_ConceptRelationships_SourceConceptId",
                table: "ConceptRelationships");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Concepts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsManual",
                table: "ConceptRelationships",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Concepts_UserId",
                table: "Concepts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConceptRelationships_SourceConceptId_TargetConceptId_UserId",
                table: "ConceptRelationships",
                columns: new[] { "SourceConceptId", "TargetConceptId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConceptRelationships_UserId",
                table: "ConceptRelationships",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ConceptRelationships_Users_UserId",
                table: "ConceptRelationships",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Concepts_Notes_NoteId",
                table: "Concepts",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Concepts_Users_UserId",
                table: "Concepts",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConceptRelationships_Users_UserId",
                table: "ConceptRelationships");

            migrationBuilder.DropForeignKey(
                name: "FK_Concepts_Notes_NoteId",
                table: "Concepts");

            migrationBuilder.DropForeignKey(
                name: "FK_Concepts_Users_UserId",
                table: "Concepts");

            migrationBuilder.DropIndex(
                name: "IX_Concepts_UserId",
                table: "Concepts");

            migrationBuilder.DropIndex(
                name: "IX_ConceptRelationships_SourceConceptId_TargetConceptId_UserId",
                table: "ConceptRelationships");

            migrationBuilder.DropIndex(
                name: "IX_ConceptRelationships_UserId",
                table: "ConceptRelationships");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Concepts");

            migrationBuilder.DropColumn(
                name: "IsManual",
                table: "ConceptRelationships");

            migrationBuilder.CreateIndex(
                name: "IX_ConceptRelationships_SourceConceptId",
                table: "ConceptRelationships",
                column: "SourceConceptId");

            migrationBuilder.AddForeignKey(
                name: "FK_Concepts_Notes_NoteId",
                table: "Concepts",
                column: "NoteId",
                principalTable: "Notes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
