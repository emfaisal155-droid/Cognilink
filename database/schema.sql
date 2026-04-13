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



