using Jorges.Api.Data;
using Jorges.Api.Domain;

namespace Jorges.Api.Tests;

public sealed class DomainTests
{
    private static readonly Catalog Catalog = SeedData.CreateCatalog();
    private static readonly Customer Customer = new("Ana", "987654321", "Jr. Cusco 456");

    private static Ingredient IngredientById(string id) => Catalog.FindIngredient(id)!;

    [Fact]
    public void Order_total_sums_unit_price_times_quantity_for_every_line()
    {
        var diavola = Catalog.FindPizza("pz-diavola")!;
        var custom = new CustomPizza(
            IngredientById("ing-masa-tradicional"),
            [IngredientById("ing-crema-de-rocoto"), IngredientById("ing-prosciutto"), IngredientById("ing-rucula")]);
        var draft = new OrderDraft(
            [
                new OrderItem(new MenuPizza(diavola), PizzaSize.Familiar, 3),
                new OrderItem(custom, PizzaSize.Mediana, 2),
            ],
            Customer);

        var order = Order.Place(draft, Catalog, "PEN", DateTimeOffset.UnixEpoch);

        // Diavola familiar 72 x3 = 216; custom mediana 26 + 0 + 3 + 9 + 3 = 41 x2 = 82
        Assert.Equal([72m, 41m], order.Lines.Select(l => l.UnitPrice));
        Assert.Equal(298m, order.Total);
        Assert.Equal(OrderStatus.Recibido, order.Status);
    }

    [Theory]
    [InlineData(1, 25)]
    [InlineData(2, 25)]
    [InlineData(3, 30)]
    [InlineData(10, 45)]
    [InlineData(40, 60)]
    public void Estimated_minutes_grow_with_pizza_count_and_are_capped(int pizzas, int expected)
    {
        Assert.Equal(expected, Pricing.EstimatedMinutes(pizzas));
    }

    [Fact]
    public void Catalog_rejects_a_pizza_with_an_unknown_ingredient()
    {
        var pizza = Catalog.Pizzas[0] with { IngredientIds = ["ing-masa-tradicional", "ing-inexistente"] };

        Assert.Throws<ArgumentException>(() =>
            new Catalog(Catalog.Categories, [pizza], Catalog.Ingredients, Catalog.CustomPizzaBasePrices));
    }

    [Fact]
    public void Catalog_rejects_a_pizza_without_exactly_one_masa()
    {
        var pizza = Catalog.Pizzas[0] with { IngredientIds = ["ing-mozzarella"] };

        Assert.Throws<ArgumentException>(() =>
            new Catalog(Catalog.Categories, [pizza], Catalog.Ingredients, Catalog.CustomPizzaBasePrices));
    }

    [Fact]
    public void Custom_pizza_cannot_hold_a_second_masa_among_its_toppings()
    {
        Assert.Throws<ArgumentException>(() =>
            new CustomPizza(IngredientById("ing-masa-delgada"), [IngredientById("ing-masa-integral")]));
    }
}
