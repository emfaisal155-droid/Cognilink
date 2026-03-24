
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


