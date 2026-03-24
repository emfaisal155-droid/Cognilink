using Xunit;
using Microsoft.EntityFrameworkCore;
using Cognilink.infrastructure;
using Cognilink.core;
using Cognilink_ASP.NET_.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace CogniLink.Tests
{
    public class AccountControllerTests
    {
        private AppDbContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        // Test 1: Register with new username should succeed
        [Fact]
        public async Task Register_NewUser_ReturnsOk()
        {
            var context = GetInMemoryContext();
            var controller = new AccountController(context);
            var dto = new RegisterDto { Username = "testuser", Password = "Test123!" };

            var result = await controller.Register(dto);

            Assert.IsType<OkObjectResult>(result);
        }

        // Test 2: Register with duplicate username should return 400
        [Fact]
        public async Task Register_DuplicateUsername_ReturnsBadRequest()
        {
            var context = GetInMemoryContext();
            var controller = new AccountController(context);
            var dto = new RegisterDto { Username = "testuser", Password = "Test123!" };

            await controller.Register(dto);
            var result = await controller.Register(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        // Test 3: Login with correct password should succeed
        [Fact]
        public async Task Login_CorrectPassword_ReturnsOk()
        {
            var context = GetInMemoryContext();
            var controller = new AccountController(context);
            var dto = new RegisterDto { Username = "testuser", Password = "Test123!" };

            await controller.Register(dto);
            var result = await controller.Login(dto);

            Assert.IsType<OkObjectResult>(result);
        }

        // Test 4: Login with wrong password should return 401
        [Fact]
        public async Task Login_WrongPassword_ReturnsUnauthorized()
        {
            var context = GetInMemoryContext();
            var controller = new AccountController(context);
            var registerDto = new RegisterDto { Username = "testuser", Password = "Test123!" };
            var loginDto = new RegisterDto { Username = "testuser", Password = "wrongpassword" };

            await controller.Register(registerDto);
            var result = await controller.Login(loginDto);

            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        // Test 5: Create note should link to correct user
        [Fact]
        public async Task CreateNote_ValidUser_ReturnsOk()
        {
            var context = GetInMemoryContext();
            var accountController = new AccountController(context);
            var notesController = new NotesController(context);

            await accountController.Register(new RegisterDto { Username = "testuser", Password = "Test123!" });

            var noteDto = new NoteDto { Username = "testuser", Title = "Test Note", Content = "Test Content" };
            var result = await notesController.CreateNote(noteDto);

            Assert.IsType<OkObjectResult>(result);
        }

        // Test 6: Delete another user's note should return 403
        [Fact]
        public async Task DeleteNote_WrongUser_ReturnsForbidden()
        {
            var context = GetInMemoryContext();
            var accountController = new AccountController(context);
            var notesController = new NotesController(context);

            await accountController.Register(new RegisterDto { Username = "user1", Password = "Test123!" });
            await accountController.Register(new RegisterDto { Username = "user2", Password = "Test123!" });

            var noteDto = new NoteDto { Username = "user1", Title = "User1 Note", Content = "Content" };
            await notesController.CreateNote(noteDto);

            var result = await notesController.DeleteNote(1, new DeleteDto { Username = "user2" });

            Assert.IsType<ObjectResult>(result);
            Assert.Equal(403, ((ObjectResult)result).StatusCode);
        }
    }
}