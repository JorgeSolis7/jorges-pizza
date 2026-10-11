namespace Jorges.Api.Domain;

/// <summary>
/// A consistent snapshot of the menu. Construction checks that ids and slugs are unique
/// and that every reference resolves, so lookups on a <see cref="Catalog"/> never dangle.
/// </summary>
public sealed class Catalog
{
    private readonly Dictionary<string, Pizza> _pizzasById;
    private readonly Dictionary<string, Ingredient> _ingredientsById;
    private readonly Dictionary<string, Category> _categoriesById;

    public Catalog(
        IReadOnlyList<Category> categories,
        IReadOnlyList<Pizza> pizzas,
        IReadOnlyList<Ingredient> ingredients,
        SizePrices customPizzaBasePrices)
    {
        EnsureUnique(categories.Select(c => c.Id), "id de categoría");
        EnsureUnique(categories.Select(c => c.Slug), "slug de categoría");
        EnsureUnique(pizzas.Select(p => p.Slug), "slug de pizza");
        EnsureUnique(ingredients.Select(i => i.Slug), "slug de ingrediente");
        EnsureUnique(pizzas.Select(p => p.Id), "id de pizza");
        EnsureUnique(ingredients.Select(i => i.Id), "id de ingrediente");

        _pizzasById = pizzas.ToDictionary(p => p.Id, StringComparer.Ordinal);
        _ingredientsById = ingredients.ToDictionary(i => i.Id, StringComparer.Ordinal);
        var categoriesById = categories.ToDictionary(c => c.Id, StringComparer.Ordinal);

        foreach (var ingredient in ingredients)
        {
            ArgumentOutOfRangeException.ThrowIfNegative(ingredient.ExtraPrice);
        }

        foreach (var pizza in pizzas)
        {
            if (!categoriesById.TryGetValue(pizza.CategoryId, out var category))
            {
                throw new ArgumentException($"La pizza '{pizza.Id}' usa la categoría inexistente '{pizza.CategoryId}'.");
            }

            var missing = pizza.IngredientIds.FirstOrDefault(id => !_ingredientsById.ContainsKey(id));
            if (missing is not null)
            {
                throw new ArgumentException($"La pizza '{pizza.Id}' usa el ingrediente inexistente '{missing}'.");
            }

            var masaCount = pizza.IngredientIds.Count(id => _ingredientsById[id].Kind == IngredientKind.Masa);
            if (category.IsPizza && masaCount != 1)
            {
                throw new ArgumentException($"La pizza '{pizza.Id}' debe tener exactamente una masa.");
            }

            if (!category.IsPizza && masaCount != 0)
            {
                throw new ArgumentException($"El producto '{pizza.Id}' no es una pizza y no puede llevar masa.");
            }
        }

        _categoriesById = categoriesById;
        Categories = categories;
        Pizzas = pizzas;
        Ingredients = ingredients;
        CustomPizzaBasePrices = customPizzaBasePrices;
    }

    public IReadOnlyList<Category> Categories { get; }
    public IReadOnlyList<Pizza> Pizzas { get; }
    public IReadOnlyList<Ingredient> Ingredients { get; }

    /// <summary>Base price of a build-your-own pizza; each chosen ingredient adds its extra price.</summary>
    public SizePrices CustomPizzaBasePrices { get; }

    public Pizza? FindPizza(string id) => _pizzasById.GetValueOrDefault(id);

    public Ingredient? FindIngredient(string id) => _ingredientsById.GetValueOrDefault(id);

    /// <summary>
    /// Editorial tags, plus "vegetariana" exactly when a pizza has no meat.
    /// Sides never get the derived tag: their ingredient lists are not exhaustive.
    /// </summary>
    public IReadOnlyList<PizzaTag> TagsFor(Pizza pizza)
    {
        var isVegetarian = _categoriesById[pizza.CategoryId].IsPizza
            && pizza.IngredientIds.All(id => _ingredientsById[id].Kind != IngredientKind.Carne);
        var tags = pizza.Tags.Where(t => t != PizzaTag.Vegetariana);
        return (isVegetarian ? tags.Append(PizzaTag.Vegetariana) : tags).ToList();
    }

    private static void EnsureUnique(IEnumerable<string> values, string what)
    {
        var seen = new HashSet<string>(StringComparer.Ordinal);
        var duplicate = values.FirstOrDefault(v => !seen.Add(v));
        if (duplicate is not null)
        {
            throw new ArgumentException($"Valor de {what} duplicado: '{duplicate}'.");
        }
    }
}
