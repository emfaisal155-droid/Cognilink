IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [Username] nvarchar(max) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Notes] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(max) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_Notes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Notes_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Notes_UserId] ON [Notes] ([UserId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260317213333_InitialCreate', N'8.0.25');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Concepts] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Frequency] int NOT NULL,
    [NoteId] int NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_Concepts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Concepts_Notes_NoteId] FOREIGN KEY ([NoteId]) REFERENCES [Notes] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [ConceptRelationships] (
    [Id] int NOT NULL IDENTITY,
    [SourceConceptId] int NOT NULL,
    [TargetConceptId] int NOT NULL,
    [SimilarityScore] float NOT NULL,
    [UserId] int NOT NULL,
    CONSTRAINT [PK_ConceptRelationships] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ConceptRelationships_Concepts_SourceConceptId] FOREIGN KEY ([SourceConceptId]) REFERENCES [Concepts] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_ConceptRelationships_Concepts_TargetConceptId] FOREIGN KEY ([TargetConceptId]) REFERENCES [Concepts] ([Id]) ON DELETE NO ACTION
);
GO

CREATE INDEX [IX_ConceptRelationships_SourceConceptId] ON [ConceptRelationships] ([SourceConceptId]);
GO

CREATE INDEX [IX_ConceptRelationships_TargetConceptId] ON [ConceptRelationships] ([TargetConceptId]);
GO

CREATE INDEX [IX_Concepts_NoteId] ON [Concepts] ([NoteId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260411104014_AddConceptAndRelationshipTables', N'8.0.25');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Notes] ADD [IsDeleted] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260418064512_AddSoftDeleteToNotes', N'8.0.25');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Concepts] DROP CONSTRAINT [FK_Concepts_Notes_NoteId];
GO

DROP INDEX [IX_ConceptRelationships_SourceConceptId] ON [ConceptRelationships];
GO

ALTER TABLE [Concepts] ADD [CreatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [ConceptRelationships] ADD [IsManual] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

CREATE INDEX [IX_Concepts_UserId] ON [Concepts] ([UserId]);
GO

CREATE UNIQUE INDEX [IX_ConceptRelationships_SourceConceptId_TargetConceptId_UserId] ON [ConceptRelationships] ([SourceConceptId], [TargetConceptId], [UserId]);
GO

CREATE INDEX [IX_ConceptRelationships_UserId] ON [ConceptRelationships] ([UserId]);
GO

ALTER TABLE [ConceptRelationships] ADD CONSTRAINT [FK_ConceptRelationships_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE [Concepts] ADD CONSTRAINT [FK_Concepts_Notes_NoteId] FOREIGN KEY ([NoteId]) REFERENCES [Notes] ([Id]) ON DELETE NO ACTION;
GO

ALTER TABLE [Concepts] ADD CONSTRAINT [FK_Concepts_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260425211939_AddIsManualField', N'8.0.25');
GO

COMMIT;
GO

