using Jorges.Api.Data;
using Jorges.Api.Domain;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Options;

namespace Jorges.Api.Features.Orders;

public static class OrdersEndpoints
{
    public static RouteGroupBuilder MapOrders(this RouteGroupBuilder api)
    {
        var orders = api.MapGroup("/orders").WithTags("Orders");

        orders.MapPost("/", CreateOrder).WithName("CreateOrder");
        orders.MapGet("/{id}", GetOrder).WithName("GetOrder");

        return api;
    }

    private static async Task<Results<Created<OrderResponse>, ValidationProblem>> CreateOrder(
        CreateOrderRequest request,
        ICatalogSource catalogSource,
        IOrderStore orderStore,
        IOptions<StoreOptions> options,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var catalog = await catalogSource.GetCatalogAsync(cancellationToken);
        if (!OrderRequestParser.TryParse(request, catalog, out var draft, out var errors))
        {
            return TypedResults.ValidationProblem(errors, title: "El pedido tiene errores de validación.");
        }

        var order = Order.Place(draft, catalog, options.Value.Currency, timeProvider.GetUtcNow());
        await orderStore.AddAsync(order, cancellationToken);

        return TypedResults.Created($"/api/orders/{order.Id}", OrderResponse.From(order));
    }

    private static async Task<Results<Ok<OrderResponse>, ProblemHttpResult>> GetOrder(
        string id,
        IOrderStore orderStore,
        CancellationToken cancellationToken)
    {
        var order = Guid.TryParse(id, out var orderId)
            ? await orderStore.FindAsync(orderId, cancellationToken)
            : null;

        return order is null
            ? TypedResults.Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Pedido no encontrado.",
                detail: $"No existe un pedido con id '{id}'.")
            : TypedResults.Ok(OrderResponse.From(order));
    }
}
