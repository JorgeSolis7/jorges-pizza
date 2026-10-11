using System.Text.Json;
using System.Text.Json.Serialization;
using Jorges.Api;
using Jorges.Api.Data;
using Jorges.Api.Features.Ingredients;
using Jorges.Api.Features.Menu;
using Jorges.Api.Features.Orders;

const string FrontendCorsPolicy = "Frontend";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails(options => options.CustomizeProblemDetails = context =>
{
    if (context.Exception is BadHttpRequestException)
    {
        context.ProblemDetails.Title = "La solicitud no es válida.";
        context.ProblemDetails.Detail = "Revisa que el cuerpo sea JSON válido y tenga el formato esperado.";
    }
});
builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));

builder.Services.AddOptions<StoreOptions>()
    .Bind(builder.Configuration.GetSection(StoreOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<ICatalogSource, InMemoryCatalogSource>();
builder.Services.AddSingleton<IOrderStore, InMemoryOrderStore>();

// Only the origins listed under Cors:AllowedOrigins (set in appsettings.Development.json).
// In Docker the frontend reaches the API through the nginx proxy, so no CORS is needed.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddPolicy(FrontendCorsPolicy, policy => policy
    .WithOrigins(allowedOrigins)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .WithExposedHeaders("Location")));

var app = builder.Build();

// Malformed requests (e.g. invalid JSON) surface as BadHttpRequestException; keep their 400.
app.UseExceptionHandler(new ExceptionHandlerOptions
{
    StatusCodeSelector = exception => exception is BadHttpRequestException badRequest
        ? badRequest.StatusCode
        : StatusCodes.Status500InternalServerError,
});
app.UseStatusCodePages();
app.UseCors(FrontendCorsPolicy);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/health", () => TypedResults.Ok(new HealthResponse("ok")))
    .WithName("Health")
    .WithTags("Health");

app.MapGroup("/api")
    .MapMenu()
    .MapIngredients()
    .MapOrders();

app.Run();

public sealed record HealthResponse(string Status);

/// <summary>Entry point, exposed so integration tests can host the app with WebApplicationFactory.</summary>
public partial class Program;
