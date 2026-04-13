INSERT INTO Users (Id, Username, Email, PasswordHash)
VALUES 
(1, 'eman_faisal',   'eman@cognilink.com',   'hashed_password_1'),
(2, 'ammara_saleem', 'ammara@cognilink.com', 'hashed_password_2'),
(3, 'farwa_naqvi',   'farwa@cognilink.com',  'hashed_password_3');

INSERT INTO Notes (Id, Title, Content, CreatedAt, UserId)
VALUES
(1, 'Biology Notes',    
    'Photosynthesis is the process by which plants convert sunlight into energy. Chlorophyll absorbs sunlight. Glucose is produced during photosynthesis.',
    '2026-04-01', 1),

(2, 'CS Notes',         
    'Machine learning is a subset of artificial intelligence. Neural networks are used in deep learning. Algorithms learn from data patterns.',
    '2026-04-02', 1),

(3, 'Database Notes',   
    'SQL is used for relational databases. Queries retrieve data from tables. Indexes improve query performance significantly.',
    '2026-04-03', 2),

(4, 'AI Research',      
    'Deep learning uses neural networks with many layers. Artificial intelligence mimics human intelligence. Machine learning algorithms improve over time.',
    '2026-04-04', 2);

INSERT INTO Concepts (Id, Name, Frequency, NoteId, UserId)
VALUES
-- Concepts from Note 1 (Biology Notes)
(1,  'photosynthesis',  3,  1,  1),
(2,  'chlorophyll',     1,  1,  1),
(3,  'glucose',         2,  1,  1),
(4,  'sunlight',        2,  1,  1),
(5,  'energy',          1,  1,  1),

-- Concepts from Note 2 (CS Notes)
(6,  'machine learning',    3,  2,  1),
(7,  'artificial intelligence', 2, 2, 1),
(8,  'neural networks',     2,  2,  1),
(9,  'deep learning',       1,  2,  1),
(10, 'algorithms',          2,  2,  1),

-- Concepts from Note 3 (Database Notes)
(11, 'sql',             2,  3,  2),
(12, 'queries',         2,  3,  2),
(13, 'indexes',         1,  3,  2),
(14, 'tables',          1,  3,  2),
(15, 'performance',     1,  3,  2),

-- Concepts from Note 4 (AI Research)
(16, 'deep learning',       2,  4,  2),
(17, 'neural networks',     2,  4,  2),
(18, 'artificial intelligence', 3, 4, 2),
(19, 'algorithms',          1,  4,  2),
(20, 'human intelligence',  1,  4,  2);

INSERT INTO ConceptRelationships (Id, SourceConceptId, TargetConceptId, SimilarityScore, UserId)
VALUES
-- Relationships within Biology Notes (NoteId=1)
(1,  1,  2,  0.75,   1),   -- photosynthesis ↔ chlorophyll (strong, co-occur)
(2,  1,  3,  0.85,   1),   -- photosynthesis ↔ glucose     (very strong)
(3,  1,  4,  0.80,   1),   -- photosynthesis ↔ sunlight    (strong)
(4,  2,  4,  0.60,   1),   -- chlorophyll    ↔ sunlight    (moderate)
(5,  3,  5,  0.55,   1),   -- glucose        ↔ energy      (moderate)

-- Relationships within CS Notes (NoteId=2)
(6,  6,  7,  0.90,   1),   -- machine learning ↔ artificial intelligence (very strong)
(7,  6,  8,  0.85,   1),   -- machine learning ↔ neural networks         (strong)
(8,  6,  9,  0.88,   1),   -- machine learning ↔ deep learning           (very strong)
(9,  7,  8,  0.80,   1),   -- artificial intelligence ↔ neural networks  (strong)
(10, 8,  9,  0.92,   1),   -- neural networks ↔ deep learning            (very strong)
(11, 6,  10, 0.70,   1),   -- machine learning ↔ algorithms              (strong)

-- Relationships within Database Notes (NoteId=3)
(12, 11, 12, 0.80,   2),   -- sql     ↔ queries     (strong)
(13, 11, 14, 0.85,   2),   -- sql     ↔ tables      (strong)
(14, 12, 13, 0.65,   2),   -- queries ↔ indexes     (moderate)
(15, 13, 15, 0.70,   2),   -- indexes ↔ performance (strong)

-- Cross-note relationships (same user, concepts appear in multiple notes)
(16, 8,  17, 0.95,   2),   -- neural networks (note2) ↔ neural networks (note4)  (near identical)
(17, 9,  16, 0.93,   2),   -- deep learning (note2)   ↔ deep learning (note4)    (near identical)
(18, 7,  18, 0.91,   2),   -- AI (note2)              ↔ AI (note4)               (near identical)
(19, 10, 19, 0.72,   2),   -- algorithms (note2)      ↔ algorithms (note4)       (strong)
(20, 6,  18, 0.88,   2);   -- machine learning (note2) ↔ AI (note4)              (very strong)
