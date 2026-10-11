using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Jorges.Api.Tests;

public sealed class OrderEndpointsTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    private static readonly object ValidCustomer = new
    {
        name = "Jorge Solís",
        phone = "+51 987 654 321",
        address = "Av. Larco 123, Miraflores",
    };

    [Fact]
    public async Task Create_order_computes_the_total_server_side_and_can_be_fetched()
    {
        // Margherita mediana (46) x2 = 92
        // Custom personal: base 18 + masa integral 3 + pomodoro 0 + mozzarella 5 + albahaca 2 = 28, x1 = 28
        var request = new
        {
            items = new object[]
            {
                new { pizzaId = "pz-margherita", size = "mediana", quantity = 2 },
                new
                {
                    customIngredientIds = new[] { "ing-masa-integral", "ing-salsa-pomodoro", "ing-mozzarella", "ing-albahaca" },
                    size = "personal",
                    quantity = 1,
                },
            },
            customer = ValidCustomer,
        };

        var response = await _client.PostAsJsonAsync("/api/orders", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString();
        Assert.Equal($"/api/orders/{id}", response.Headers.Location?.OriginalString);
        Assert.Equal("recibido", created.GetProperty("status").GetString());
        Assert.Equal(120m, created.GetProperty("total").GetDecimal());
        Assert.Equal("PEN", created.GetProperty("currency").GetString());
        Assert.Equal(30, created.GetProperty("estimatedMinutes").GetInt32());

        var fetched = await _client.GetFromJsonAsync<JsonElement>($"/api/orders/{id}");
        Assert.Equal(id, fetched.GetProperty("id").GetString());
        Assert.Equal(120m, fetched.GetProperty("total").GetDecimal());
        var items = fetched.GetProperty("items").EnumerateArray().ToList();
        Assert.Equal(92m, items[0].GetProperty("lineTotal").GetDecimal());
        Assert.Equal(28m, items[1].GetProperty("unitPrice").GetDecimal());
        Assert.Equal(JsonValueKind.Null, items[1].GetProperty("pizzaId").ValueKind);
    }

    [Fact]
    public async Task Invalid_order_returns_validation_problem_with_spanish_messages()
    {
        var request = new
        {
            items = new object[] { new { pizzaId = "pz-no-existe", size = "gigante", quantity = 21 } },
            customer = new { name = "", phone = "123", address = "Calle 1" },
        };

        var response = await _client.PostAsJsonAsync("/api/orders", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        var errors = problem.GetProperty("errors");
        Assert.Equal(
            ["customer.name", "customer.phone", "items[0].pizzaId", "items[0].quantity", "items[0].size"],
            errors.EnumerateObject().Select(e => e.Name).Order(StringComparer.Ordinal));
        Assert.Equal("El nombre es obligatorio.", errors.GetProperty("customer.name")[0].GetString());
    }

    [Fact]
    public async Task Empty_order_is_rejected()
    {
        var response = await _client.PostAsJsonAsync("/api/orders", new { items = Array.Empty<object>(), customer = ValidCustomer });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(problem.GetProperty("errors").TryGetProperty("items", out _));
    }

    [Fact]
    public async Task Malformed_json_returns_bad_request_problem()
    {
        using var content = new StringContent("{no es json", System.Text.Encoding.UTF8, "application/json");

        var response = await _client.PostAsync("/api/orders", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Theory]
    [InlineData("00000000-0000-0000-0000-000000000000")]
    [InlineData("no-es-un-id")]
    public async Task Unknown_order_returns_not_found_problem(string id)
    {
        var response = await _client.GetAsync($"/api/orders/{id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(404, problem.GetProperty("status").GetInt32());
    }
}
