using Jorges.Api.Domain;

namespace Jorges.Api.Features.Orders;

// Request DTOs mirror the wire format and are deliberately loose (everything nullable,
// size as text) so that every malformed field reaches OrderRequestParser and gets a
// Spanish validation message instead of a generic deserialization failure.

public sealed record CreateOrderRequest(IReadOnlyList<OrderItemRequest?>? Items, CustomerRequest? Customer);

public sealed record OrderItemRequest(
    string? PizzaId,
    IReadOnlyList<string?>? CustomIngredientIds,
    string? Size,
    int? Quantity);

public sealed record CustomerRequest(string? Name, string? Phone, string? Address);

public sealed record OrderResponse(
    string Id,
    OrderStatus Status,
    decimal Total,
    string Currency,
    int EstimatedMinutes,
    DateTimeOffset CreatedAt,
    IReadOnlyList<OrderLineResponse> Items,
    CustomerResponse Customer)
{
    public static OrderResponse From(Order order) => new(
        order.Id.ToString(),
        order.Status,
        order.Total,
        order.Currency,
        order.EstimatedMinutes,
        order.CreatedAt,
        order.Lines.Select(OrderLineResponse.From).ToList(),
        new CustomerResponse(order.Customer.Name, order.Customer.Phone, order.Customer.Address));
}

/// <summary>Exactly one of <see cref="PizzaId"/> and <see cref="CustomIngredientIds"/> is set.</summary>
public sealed record OrderLineResponse(
    string? PizzaId,
    IReadOnlyList<string>? CustomIngredientIds,
    PizzaSize Size,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal)
{
    public static OrderLineResponse From(OrderLine line) => line.Item.Pizza switch
    {
        MenuPizza menu => new(menu.Pizza.Id, null, line.Item.Size, line.Item.Quantity, line.UnitPrice, line.LineTotal),
        CustomPizza custom => new(
            null,
            custom.Ingredients.Select(i => i.Id).ToList(),
            line.Item.Size,
            line.Item.Quantity,
            line.UnitPrice,
            line.LineTotal),
        _ => throw new ArgumentOutOfRangeException(nameof(line), line.Item.Pizza, "Tipo de pizza desconocido."),
    };
}

public sealed record CustomerResponse(string Name, string Phone, string Address);
