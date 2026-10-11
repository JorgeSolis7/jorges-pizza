using System.Collections.Concurrent;
using Jorges.Api.Domain;

namespace Jorges.Api.Data;

/// <summary>
/// Where the menu comes from. The in-memory seed implements it today; a database-backed
/// implementation can replace it without touching the endpoints or the domain.
/// </summary>
public interface ICatalogSource
{
    ValueTask<Catalog> GetCatalogAsync(CancellationToken cancellationToken);
}

/// <summary>Persistence for placed orders.</summary>
public interface IOrderStore
{
    ValueTask AddAsync(Order order, CancellationToken cancellationToken);

    ValueTask<Order?> FindAsync(Guid id, CancellationToken cancellationToken);
}

public sealed class InMemoryCatalogSource : ICatalogSource
{
    private readonly Catalog _catalog = SeedData.CreateCatalog();

    public ValueTask<Catalog> GetCatalogAsync(CancellationToken cancellationToken) => ValueTask.FromResult(_catalog);
}

/// <summary>Keeps orders for the lifetime of the process; they are lost on restart.</summary>
public sealed class InMemoryOrderStore : IOrderStore
{
    private readonly ConcurrentDictionary<Guid, Order> _orders = new();

    public ValueTask AddAsync(Order order, CancellationToken cancellationToken)
    {
        if (!_orders.TryAdd(order.Id, order))
        {
            throw new InvalidOperationException($"Ya existe un pedido con id '{order.Id}'.");
        }

        return ValueTask.CompletedTask;
    }

    public ValueTask<Order?> FindAsync(Guid id, CancellationToken cancellationToken) =>
        ValueTask.FromResult(_orders.GetValueOrDefault(id));
}
