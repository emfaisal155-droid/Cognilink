using Microsoft.EntityFrameworkCore;
using Cognilink.infrastructure;
using Cognilink.infrastructure.Repositories;
using Cognilink.infrastructure.Services; //for iteration2

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:5173")
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });


/*builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));*/


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Server=(localdb)\\mssqllocaldb;Database=CognilinkDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"));


builder.Services.AddScoped<INoteRepository, NoteRepository>();  //This allows Ammara to ask for INoteRepository in her Controllers, and the system will automatically provide the database logic you wrote.

builder.Services.AddAuthentication();
builder.Services.AddAuthorization();
builder.Services.AddScoped<ConceptProcessingOrchestrator>(); //iteration2

builder.Services.AddScoped<RelationshipDetectionService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins("http://localhost:5173") // Vite default port
              .AllowAnyHeader()
              .AllowAnyMethod());
});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseCors("AllowReactApp");
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");




app.UseCors("AllowReact");

app.Run();

