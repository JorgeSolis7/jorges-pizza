using Jorges.Api.Data;
using Jorges.Api.Domain;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Jorges.Api.Features.Ingredients;

public sealed record IngredientResponse(
    string Id,
    string Slug,
    string Name,
    IngredientKind Kind,
    decimal ExtraPrice,
    string Image);

public static class IngredientsEndpoints
{
    public static RouteGroupBuilder MapIngredients(this RouteGroupBuilder api)
    {
        api.MapGet("/ingredients", GetIngredients)
            .WithName("GetIngredients")
            .WithTags("Ingredients");
        return api;
    }

    private static async Task<Ok<List<IngredientResponse>>> GetIngredients(
        ICatalogSource catalogSource,
        CancellationToken cancellationToken)
    {
        var catalog = await catalogSource.GetCatalogAsync(cancellationToken);
        var response = catalog.Ingredients
            .Select(i => new IngredientResponse(
                i.Id, i.Slug, i.Name, i.Kind, i.ExtraPrice, $"/assets/ingredients/{i.Slug}.webp"))
            .ToList();
        return TypedResults.Ok(response);
    }
}
