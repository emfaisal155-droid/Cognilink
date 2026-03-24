-- Create a test user (Note: Id will be 1)
INSERT INTO [Users] ([Username], [PasswordHash]) 
VALUES ('Tester', 'AQAAAAEAACcQAAAAE...');

-- Create sample notes for that user
INSERT INTO [Notes] ([Title], [Content], [UserId]) 
VALUES ('Iteration 1 Tasks', 'Setup GitHub and Database Schema.', 1);

INSERT INTO [Notes] ([Title], [Content], [UserId]) 
VALUES ('Grocery List', 'Milk, Bread, and Coffee.', 1);

GO
