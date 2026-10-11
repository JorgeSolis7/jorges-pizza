namespace Jorges.Api.Domain;

public enum PizzaSize
{
    Personal,
    Mediana,
    Familiar,
}

public enum IngredientKind
{
    Masa,
    Salsa,
    Queso,
    Carne,
    Vegetal,
    Hierba,
}

public enum PizzaTag
{
    Picante,
    Vegetariana,
    Nueva,
    Favorita,
}

/// <summary>Price of a pizza for every size. Every size has a positive price.</summary>
public sealed record SizePrices
{
    public SizePrices(decimal personal, decimal mediana, decimal familiar)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(personal);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(mediana);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(familiar);
        Personal = personal;
        Mediana = mediana;
        Familiar = familiar;
    }

    public decimal Personal { get; }
    public decimal Mediana { get; }
    public decimal Familiar { get; }

    public decimal For(PizzaSize size) => size switch
    {
        PizzaSize.Personal => Personal,
        PizzaSize.Mediana => Mediana,
        PizzaSize.Familiar => Familiar,
        _ => throw new ArgumentOutOfRangeException(nameof(size), size, "Tamaño desconocido."),
    };
}

/// <summary>
/// A menu section. Pizza sections hold pizzas; the others ("Para picar", "Postres y bebidas")
/// hold sides whose small/medium/large portions reuse the personal/mediana/familiar sizes.
/// </summary>
public sealed record Category(string Id, string Slug, string Name, bool IsPizza);

public sealed record Ingredient(string Id, string Slug, string Name, IngredientKind Kind, decimal ExtraPrice);

/// <summary>
/// An item on the menu: a pizza, or a side when its category is not a pizza category
/// (the API contract lists both under "pizzas"). <see cref="Tags"/> holds only the
/// editorial tags; "vegetariana" is derived from the ingredients by <see cref="Catalog.TagsFor"/>.
/// </summary>
public sealed record Pizza(
    string Id,
    string Slug,
    string Name,
    string Description,
    string CategoryId,
    SizePrices Prices,
    IReadOnlyList<string> IngredientIds,
    IReadOnlyList<PizzaTag> Tags);
