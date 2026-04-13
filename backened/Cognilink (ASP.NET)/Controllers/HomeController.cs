using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using Cognilink__ASP.NET_.Models;

namespace Cognilink__ASP.NET_.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return Ok("CogniLink API is running.");
        }

        public IActionResult Privacy()
        {
            return Ok("Privacy page.");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return Ok("An error occurred.");
        }
    }
}