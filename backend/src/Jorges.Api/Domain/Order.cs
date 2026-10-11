namespace Jorges.Api.Domain;

public enum OrderStatus
{
    Recibido,
}

public sealed record Customer(string Name, string Phone, string Address);

/// <summary>What was ordered: a pizza from the menu or one built from ingredients.</summary>
public abstract record OrderedPizza;

public sealed record MenuPizza(Pizza Pizza) : OrderedPizza;

/// <summary>A build-your-own pizza. It has exactly one masa, held apart from the toppings.</summary>
public sealed record CustomPizza : OrderedPizza
{
    public CustomPizza(Ingredient masa, IReadOnlyList<Ingredient> toppings)
    {
        if (masa.Kind != IngredientKind.Masa)
        {
            throw new ArgumentException("La base de una pizza personalizada debe ser una masa.", nameof(masa));
        }

        if (toppings.Any(t => t.Kind == IngredientKind.Masa))
        {
            throw new ArgumentException("Una pizza personalizada solo puede tener una masa.", nameof(toppings));
        }

        Masa = masa;
        Toppings = toppings;
    }

    public Ingredient Masa { get; }
    public IReadOnlyList<Ingredient> Toppings { get; }

    public IEnumerable<Ingredient> Ingredients => Toppings.Prepend(Masa);
}

/// <summary>A requested line before pricing. Quantity is within <see cref="MinQuantity"/>..<see cref="MaxQuantity"/>.</summary>
public sealed record OrderItem
{
    public const int MinQuantity = 1;
    public const int MaxQuantity = 20;

    public OrderItem(OrderedPizza pizza, PizzaSize size, int quantity)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(quantity, MinQuantity);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(quantity, MaxQuantity);
        Pizza = pizza;
        Size = size;
        Quantity = quantity;
    }

    public OrderedPizza Pizza { get; }
    public PizzaSize Size { get; }
    public int Quantity { get; }
}

/// <summary>A parsed, valid order request: at least one item and a complete customer.</summary>
public sealed record OrderDraft
{
    public OrderDraft(IReadOnlyList<OrderItem> items, Customer customer)
    {
        if (items.Count == 0)
        {
            throw new ArgumentException("Un pedido necesita al menos un ítem.", nameof(items));
        }

        Items = items;
        Customer = customer;
    }

    public IReadOnlyList<OrderItem> Items { get; }
    public Customer Customer { get; }
}

/// <summary>An order line with its unit price fixed when the order was placed.</summary>
public sealed record OrderLine(OrderItem Item, decimal UnitPrice)
{
    public decimal LineTotal => UnitPrice * Item.Quantity;
}

public sealed record Order(
    Guid Id,
    OrderStatus Status,
    IReadOnlyList<OrderLine> Lines,
    Customer Customer,
    string Currency,
    int EstimatedMinutes,
    DateTimeOffset CreatedAt)
{
    public decimal Total => Lines.Sum(l => l.LineTotal);

    public static Order Place(OrderDraft draft, Catalog catalog, string currency, DateTimeOffset now)
    {
        var lines = draft.Items
            .Select(item => new OrderLine(item, Pricing.UnitPrice(item.Pizza, item.Size, catalog)))
            .ToList();

        return new Order(
            Guid.CreateVersion7(now),
            OrderStatus.Recibido,
            lines,
            draft.Customer,
            currency,
            Pricing.EstimatedMinutes(draft.Items.Sum(i => i.Quantity)),
            now);
    }
}

public static class Pricing
{
    public static decimal UnitPrice(OrderedPizza pizza, PizzaSize size, Catalog catalog) => pizza switch
    {
        MenuPizza menu => menu.Pizza.Prices.For(size),
        CustomPizza custom => catalog.CustomPizzaBasePrices.For(size) + custom.Ingredients.Sum(i => i.ExtraPrice),
        _ => throw new ArgumentOutOfRangeException(nameof(pizza), pizza, "Tipo de pizza desconocido."),
    };

    /// <summary>25 minutes for up to two pizzas, 5 more per additional pair, capped at 60.</summary>
    public static int EstimatedMinutes(int pizzaCount)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(pizzaCount);
        return Math.Min(25 + (5 * ((pizzaCount - 1) / 2)), 60);
    }
}
