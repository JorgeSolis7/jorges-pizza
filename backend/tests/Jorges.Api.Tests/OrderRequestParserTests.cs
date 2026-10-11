using Jorges.Api.Data;
using Jorges.Api.Domain;
using Jorges.Api.Features.Orders;

namespace Jorges.Api.Tests;

public sealed class OrderRequestParserTests
{
    private static readonly Catalog Catalog = SeedData.CreateCatalog();
    private static readonly CustomerRequest ValidCustomer = new("Ana", "987654321", "Jr. Cusco 456");

    private static OrderItemRequest Menu(string pizzaId = "pz-margherita", string? size = "mediana", int? quantity = 1) =>
        new(pizzaId, null, size, quantity);

    private static OrderItemRequest Custom(params string?[] ingredientIds) =>
        new(null, ingredientIds, "familiar", 1);

    private static Dictionary<string, string[]> ErrorsFor(CreateOrderRequest request)
    {
        Assert.False(OrderRequestParser.TryParse(request, Catalog, out var draft, out var errors));
        Assert.Null(draft);
        return errors;
    }

    private static Dictionary<string, string[]> ErrorsFor(OrderItemRequest item) =>
        ErrorsFor(new CreateOrderRequest([item], ValidCustomer));

    [Fact]
    public void Valid_request_parses_into_a_draft()
    {
        var request = new CreateOrderRequest(
            [Menu(quantity: 3), Custom("ing-masa-delgada", "ing-pepperoni")],
            new CustomerRequest("  Ana  ", "987654321", "Jr. Cusco 456"));

        Assert.True(OrderRequestParser.TryParse(request, Catalog, out var draft, out var errors));
        Assert.Empty(errors);
        Assert.Equal("Ana", draft.Customer.Name);
        Assert.Equal(3, draft.Items[0].Quantity);
        var custom = Assert.IsType<CustomPizza>(draft.Items[1].Pizza);
        Assert.Equal("ing-masa-delgada", custom.Masa.Id);
        Assert.Equal(PizzaSize.Familiar, draft.Items[1].Size);
    }

    [Fact]
    public void Missing_items_and_customer_are_reported()
    {
        var errors = ErrorsFor(new CreateOrderRequest(null, null));

        Assert.Equal(["customer", "items"], errors.Keys.Order(StringComparer.Ordinal));
    }

    [Fact]
    public void Item_with_both_pizza_and_custom_ingredients_is_rejected()
    {
        var errors = ErrorsFor(new OrderItemRequest("pz-margherita", ["ing-masa-delgada"], "mediana", 1));

        Assert.Contains("no ambas", errors["items[0]"][0], StringComparison.Ordinal);
    }

    [Fact]
    public void Item_with_neither_pizza_nor_custom_ingredients_is_rejected()
    {
        var errors = ErrorsFor(new OrderItemRequest(null, null, "mediana", 1));

        Assert.True(errors.ContainsKey("items[0]"));
    }

    [Fact]
    public void Unknown_pizza_is_rejected()
    {
        var errors = ErrorsFor(Menu("pz-hawaiana"));

        Assert.Equal("La pizza 'pz-hawaiana' no existe en el menú.", errors["items[0].pizzaId"][0]);
    }

    [Fact]
    public void Unknown_and_repeated_ingredients_are_rejected_by_position()
    {
        var errors = ErrorsFor(Custom("ing-masa-delgada", "ing-piña", "ing-masa-delgada", null));

        Assert.Equal(
            ["items[0].customIngredientIds[1]", "items[0].customIngredientIds[2]", "items[0].customIngredientIds[3]"],
            errors.Keys.Order(StringComparer.Ordinal));
    }

    [Theory]
    [InlineData]
    [InlineData("ing-mozzarella", "ing-pepperoni")]
    [InlineData("ing-masa-delgada", "ing-masa-integral", "ing-mozzarella")]
    public void Custom_pizza_needs_exactly_one_masa(params string[] ingredientIds)
    {
        var errors = ErrorsFor(Custom(ingredientIds));

        Assert.Equal("Una pizza personalizada debe incluir exactamente una masa.", errors["items[0].customIngredientIds"][0]);
    }

    [Theory]
    [InlineData(null)]
    [InlineData(0)]
    [InlineData(21)]
    public void Quantity_outside_one_to_twenty_is_rejected(int? quantity)
    {
        var errors = ErrorsFor(Menu(quantity: quantity));

        Assert.Equal("La cantidad debe estar entre 1 y 20.", errors["items[0].quantity"][0]);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("Mediana")]
    [InlineData("grande")]
    public void Unknown_size_is_rejected(string? size)
    {
        var errors = ErrorsFor(Menu(size: size));

        Assert.True(errors.ContainsKey("items[0].size"));
    }

    [Theory]
    [InlineData(null, "987654321", "Calle 1", "customer.name")]
    [InlineData("Ana", "   ", "Calle 1", "customer.phone")]
    [InlineData("Ana", "12-34", "Calle 1", "customer.phone")]
    [InlineData("Ana", "987654321", "", "customer.address")]
    public void Customer_fields_are_required(string? name, string? phone, string? address, string expectedKey)
    {
        var errors = ErrorsFor(new CreateOrderRequest([Menu()], new CustomerRequest(name, phone, address)));

        Assert.Equal([expectedKey], errors.Keys);
    }

    [Fact]
    public void Errors_from_several_items_are_all_collected()
    {
        var errors = ErrorsFor(new CreateOrderRequest([Menu(quantity: 0), Menu(), Menu(size: "xl")], ValidCustomer));

        Assert.Equal(["items[0].quantity", "items[2].size"], errors.Keys.Order(StringComparer.Ordinal));
    }
}
