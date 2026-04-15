
# Cognilink

## Description
CogniLink is an innovative web-based knowledge management system designed to bridge the gap between traditional linear note-taking and complex mental models. Developed using C# and ASP.NET Core, it transforms unstructured plain text into a dynamic, interactive knowledge graph.
By automatically extracting key concepts and identifying meaningful relationships between ideas, CogniLink moves beyond simple storage. It provides researchers, students, and professionals with a visual landscape of their data—where concepts appear as nodes and connections as edges—allowing users to intuitively explore, search, and manage the hidden links within their own information.

## Team Members
- Eman Faisal 24L-2514
- Ammara Saleem 24L-2571
- Farwa Batool Naqvi 24L-2508
  
## Tech Stack
- Backend: C# ASP.NET Core
- Frontend: React 
- Database: Microsoft SQL Server

## Project Overview
**Iteration 1: The Foundation**
Iteration 1 focused on the core infrastructure and basic CRUD (Create, Read, Update, Delete) functionality to establish a reliable data management system.

User Authentication: Secure Login and Signup system integrated with a SQL Server backend.

Document Management: A central dashboard for creating, editing, and organizing notes.

Persistence: Direct integration with a C# API on port 7174 to ensure all data is stored securely in a relational database.

Brutalist UI: Implementation of a high-contrast design system featuring bold borders and sharp "Hard Shadows" for a technical, document-focused aesthetic.

**Iteration 2: Automated Intelligence & Visualization**
Iteration 2 evolved the platform from a storage tool into an active intelligence system using automated extraction and graph visualization.

Automated Concept Extraction: A backend NLP pipeline that identifies core keywords and concepts from note content upon saving.

Relationship Detection: Algorithms that calculate similarity scores between documents to discover non-linear connections.

Interactive Knowledge Map: A dedicated "Concept View" using a custom Node-Link diagram to visualize the user's entire knowledge base.

At-a-Glance Analytics: Dashboard expansion featuring real-time statistics (Total Nodes and Edges) and a feed of recently extracted term
  
## How to Run
### Backend 
1. Clone the repository
2. Open the solution in Visual studio 2022
3. Add connection string to appsettings.json
4. Run 'Update-Data' in Package Manager Console
5. Press Play to run the project

### API Endpoints
**Authentication:**
-POST /api/account/register-Register new user
-POST /api/account/login-Login with cerendentials

**Notes:**
-POST /api/notes -Create a note
-GET /api/notes{username} -Get all notes
-PUT /api/notes/{id} -Update a note
-DELETE /api/notes/{id} - Delete a note

#Security
-Passwords hashed using BCrypt
-Users can only access their own notes
-Unauthorized access returns error codes

### Unit Tests
6 tests written and passing:
-Register new user returns 200
-Dupliacte username returns 400
-Login correct password returns 200
-Login wrongs password returns 401
-Create note links to correct user
-Delete another user's note return 403

### Frontend
```
cd frontend 
npm install
npm run dev


