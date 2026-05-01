using Microsoft.AspNetCore.Mvc;
using Cognilink.core;
using Cognilink.infrastructure;

namespace Cognilink_ASP.NET_.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : Controller
    {
        private readonly AppDbContext _context;

        public AccountController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            // Use email as username since frontend sends email
            var usernameToSave = dto.Email ?? dto.Username;

            if (_context.Users.Any(u => u.Username == usernameToSave))
                return BadRequest("Username already in use.");

            var user = new User
            {
                Username = usernameToSave,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok("Registration successful.");
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] RegisterDto dto)
        {
            // Try matching by email or username
            var usernameToCheck = dto.Email ?? dto.Username;
            var user = _context.Users
                .FirstOrDefault(u => u.Username == usernameToCheck);

            if (user == null)
                return Unauthorized("Invalid username or password.");

            bool isValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!isValid)
                return Unauthorized("Invalid username or password.");

            // Return username so frontend can store it in localStorage
            return Ok(new { message = "Login successful.", username = user.Username });
        }

        [HttpGet("profile/{username}")]
        public IActionResult GetProfile(string username)
        {
            var user = _context.Users
                .FirstOrDefault(u => u.Username == username);
            if (user == null) return NotFound();

            return Ok(new { id = user.Id, username = user.Username });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var user = _context.Users
                .FirstOrDefault(u => u.Username == dto.CurrentUsername);
            if (user == null) return NotFound();

            if (dto.NewUsername != dto.CurrentUsername)
            {
                var taken = _context.Users
                    .Any(u => u.Username == dto.NewUsername);
                if (taken)
                    return Conflict(new { message = "Username already taken." });
                user.Username = dto.NewUsername;
            }

            if (!string.IsNullOrEmpty(dto.NewPassword))
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated.", username = user.Username });
        }
    }

    public class RegisterDto
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string Password { get; set; } = string.Empty;
    }

    public class UpdateProfileDto
    {
        public string CurrentUsername { get; set; } = string.Empty;
        public string NewUsername { get; set; } = string.Empty;
        public string? NewPassword { get; set; }
    }
}