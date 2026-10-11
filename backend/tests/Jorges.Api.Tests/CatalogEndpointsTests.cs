using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Jorges.Api.Tests;

public sealed class CatalogEndpointsTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Health_returns_ok()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("""{"status":"ok"}""", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Menu_matches_the_contract()
    {
        var menu = await _client.GetFromJsonAsync<JsonElement>("/api/menu");

        Assert.Equal("PEN", menu.GetProperty("currency").GetString());

        var categories = menu.GetProperty("categories").EnumerateArray().ToList();
        Assert.Equal(
            ["clasicas", "de-la-casa", "blancas", "veganas", "para-picar", "postres-y-bebidas"],
            categories.Select(c => c.GetProperty("slug").GetString()));
        var categoryIds = categories.Select(c => c.GetProperty("id").GetString()).ToHashSet();

        var ingredients = await _client.GetFromJsonAsync<JsonElement>("/api/ingredients");
        var ingredientIds = ingredients.EnumerateArray().Select(i => i.GetProperty("id").GetString()).ToHashSet();

        var pizzas = menu.GetProperty("pizzas").EnumerateArray().ToList();
        Assert.All(categoryIds, id => Assert.True(
            pizzas.Count(p => p.GetProperty("categoryId").GetString() == id) >= 2,
            $"La categoría {id} necesita al menos dos productos."));
        foreach (var pizza in pizzas)
        {
            var slug = pizza.GetProperty("slug").GetString();
            Assert.Equal($"/assets/pizzas/{slug}.webp", pizza.GetProperty("image").GetString());
            Assert.Contains(pizza.GetProperty("categoryId").GetString(), categoryIds);
            Assert.All(pizza.GetProperty("ingredientIds").EnumerateArray(), id => Assert.Contains(id.GetString(), ingredientIds));

            var prices = pizza.GetProperty("prices");
            var personal = prices.GetProperty("personal").GetDecimal();
            var mediana = prices.GetProperty("mediana").GetDecimal();
            var familiar = prices.GetProperty("familiar").GetDecimal();
            Assert.True(personal < mediana && mediana < familiar, $"{slug}: los precios deben crecer con el tamaño.");

            Assert.All(
                pizza.GetProperty("tags").EnumerateArray(),
                tag => Assert.Contains(tag.GetString(), new[] { "picante", "vegetariana", "nueva", "favorita" }));
        }
    }

    [Fact]
    public async Task Menu_tags_vegetarian_pizzas_by_their_ingredients_and_leaves_sides_untagged()
    {
        var menu = await _client.GetFromJsonAsync<JsonElement>("/api/menu");
        var kinds = await IngredientKindsById();
        var sideCategories = new[] { "cat-para-picar", "cat-postres-y-bebidas" };

        foreach (var pizza in menu.GetProperty("pizzas").EnumerateArray())
        {
            var tags = pizza.GetProperty("tags").EnumerateArray().Select(t => t.GetString()).ToList();
            if (sideCategories.Contains(pizza.GetProperty("categoryId").GetString()))
            {
                Assert.Empty(tags);
                continue;
            }

            var hasMeat = pizza.GetProperty("ingredientIds").EnumerateArray().Any(id => kinds[id.GetString()!] == "carne");
            Assert.Equal(!hasMeat, tags.Contains("vegetariana"));
        }
    }

    [Fact]
    public async Task Vegan_pizzas_have_no_cheese_or_meat()
    {
        var menu = await _client.GetFromJsonAsync<JsonElement>("/api/menu");
        var kinds = await IngredientKindsById();

        var vegan = menu.GetProperty("pizzas").EnumerateArray()
            .Where(p => p.GetProperty("categoryId").GetString() == "cat-veganas")
            .ToList();

        Assert.NotEmpty(vegan);
        Assert.All(vegan, pizza => Assert.All(
            pizza.GetProperty("ingredientIds").EnumerateArray(),
            id => Assert.DoesNotContain(kinds[id.GetString()!], new[] { "queso", "carne" })));
    }

    private async Task<Dictionary<string, string>> IngredientKindsById()
    {
        var ingredients = await _client.GetFromJsonAsync<JsonElement>("/api/ingredients");
        return ingredients.EnumerateArray().ToDictionary(
            i => i.GetProperty("id").GetString()!,
            i => i.GetProperty("kind").GetString()!);
    }

    [Fact]
    public async Task Ingredients_match_the_contract()
    {
        var ingredients = (await _client.GetFromJsonAsync<JsonElement>("/api/ingredients")).EnumerateArray().ToList();

        Assert.InRange(ingredients.Count, 15, 20);
        foreach (var ingredient in ingredients)
        {
            var slug = ingredient.GetProperty("slug").GetString();
            Assert.Equal($"/assets/ingredients/{slug}.webp", ingredient.GetProperty("image").GetString());
            Assert.Contains(
                ingredient.GetProperty("kind").GetString(),
                new[] { "masa", "salsa", "queso", "carne", "vegetal", "hierba" });
            Assert.True(ingredient.GetProperty("extraPrice").GetDecimal() >= 0);
            Assert.False(string.IsNullOrWhiteSpace(ingredient.GetProperty("name").GetString()));
        }
    }

    [Fact]
    public async Task Currency_comes_from_configuration()
    {
        var client = factory.WithWebHostBuilder(b => b.UseSetting("Store:Currency", "USD")).CreateClient();

        var menu = await client.GetFromJsonAsync<JsonElement>("/api/menu");

        Assert.Equal("USD", menu.GetProperty("currency").GetString());
    }

    [Fact]
    public async Task OpenApi_document_is_served_in_development()
    {
        var response = await _client.GetAsync("/openapi/v1.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
