using Jorges.Api.Data;
using Jorges.Api.Domain;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Options;

namespace Jorges.Api.Features.Menu;

public sealed record MenuResponse(
    string Currency,
    IReadOnlyList<CategoryResponse> Categories,
    IReadOnlyList<PizzaResponse> Pizzas,
    CustomPizzaResponse CustomPizza);

public sealed record CategoryResponse(string Id, string Slug, string Name);

public sealed record PricesResponse(decimal Personal, decimal Mediana, decimal Familiar)
{
    public static PricesResponse From(SizePrices prices) => new(prices.Personal, prices.Mediana, prices.Familiar);
}

public sealed record PizzaResponse(
    string Id,
    string Slug,
    string Name,
    string Description,
    string CategoryId,
    PricesResponse Prices,
    string Image,
    IReadOnlyList<string> IngredientIds,
    IReadOnlyList<PizzaTag> Tags);

/// <summary>A build-your-own pizza costs the base price for its size plus each ingredient's extra price.</summary>
public sealed record CustomPizzaResponse(PricesResponse BasePrices);

public static class MenuEndpoints
{
    public static RouteGroupBuilder MapMenu(this RouteGroupBuilder api)
    {
        api.MapGet("/menu", GetMenu)
            .WithName("GetMenu")
            .WithTags("Menu");
        return api;
    }

    private static async Task<Ok<MenuResponse>> GetMenu(
        ICatalogSource catalogSource,
        IOptions<StoreOptions> options,
        CancellationToken cancellationToken)
    {
        var catalog = await catalogSource.GetCatalogAsync(cancellationToken);
        var response = new MenuResponse(
            options.Value.Currency,
            catalog.Categories.Select(c => new CategoryResponse(c.Id, c.Slug, c.Name)).ToList(),
            catalog.Pizzas.Select(p => new PizzaResponse(
                p.Id,
                p.Slug,
                p.Name,
                p.Description,
                p.CategoryId,
                PricesResponse.From(p.Prices),
                $"/assets/pizzas/{p.Slug}.webp",
                p.IngredientIds,
                catalog.TagsFor(p))).ToList(),
            new CustomPizzaResponse(PricesResponse.From(catalog.CustomPizzaBasePrices)));
        return TypedResults.Ok(response);
    }
}
