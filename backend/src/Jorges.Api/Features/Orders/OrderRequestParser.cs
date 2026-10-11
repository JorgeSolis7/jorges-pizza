using System.Diagnostics.CodeAnalysis;
using Jorges.Api.Domain;

namespace Jorges.Api.Features.Orders;

/// <summary>
/// Turns an untrusted <see cref="CreateOrderRequest"/> into an <see cref="OrderDraft"/>,
/// resolving ids against the catalog. Collects every problem instead of stopping at the
/// first, keyed by the JSON path of the offending field.
/// </summary>
public static class OrderRequestParser
{
    public const int MaxNameLength = 100;
    public const int MaxPhoneLength = 20;
    public const int MaxAddressLength = 200;
    public const int MaxCustomIngredients = 12;

    public static bool TryParse(
        CreateOrderRequest request,
        Catalog catalog,
        [NotNullWhen(true)] out OrderDraft? draft,
        out Dictionary<string, string[]> errors)
    {
        var collector = new ErrorCollector();
        var items = ParseItems(request.Items, catalog, collector);
        var customer = ParseCustomer(request.Customer, collector);

        errors = collector.ToDictionary();
        draft = errors.Count == 0 && items is not null && customer is not null
            ? new OrderDraft(items, customer)
            : null;
        return draft is not null;
    }

    private static List<OrderItem>? ParseItems(
        IReadOnlyList<OrderItemRequest?>? requests,
        Catalog catalog,
        ErrorCollector errors)
    {
        if (requests is null || requests.Count == 0)
        {
            errors.Add("items", "El pedido debe incluir al menos una pizza.");
            return null;
        }

        var items = new List<OrderItem>(requests.Count);
        for (var index = 0; index < requests.Count; index++)
        {
            var item = ParseItem(requests[index], $"items[{index}]", catalog, errors);
            if (item is not null)
            {
                items.Add(item);
            }
        }

        return items.Count == requests.Count ? items : null;
    }

    private static OrderItem? ParseItem(OrderItemRequest? request, string path, Catalog catalog, ErrorCollector errors)
    {
        if (request is null)
        {
            errors.Add(path, "El ítem no puede estar vacío.");
            return null;
        }

        var pizza = ParseOrderedPizza(request, path, catalog, errors);
        var size = ParseSize(request.Size, $"{path}.size", errors);
        var quantity = ParseQuantity(request.Quantity, $"{path}.quantity", errors);

        return pizza is not null && size is { } s && quantity is { } q ? new OrderItem(pizza, s, q) : null;
    }

    private static OrderedPizza? ParseOrderedPizza(
        OrderItemRequest request,
        string path,
        Catalog catalog,
        ErrorCollector errors)
    {
        var pizzaId = string.IsNullOrWhiteSpace(request.PizzaId) ? null : request.PizzaId;

        switch (pizzaId, request.CustomIngredientIds)
        {
            case (not null, not null):
                errors.Add(path, "Indica una pizza del menú (pizzaId) o una pizza personalizada (customIngredientIds), no ambas.");
                return null;

            case (null, null):
                errors.Add(path, "Indica una pizza del menú (pizzaId) o una pizza personalizada (customIngredientIds).");
                return null;

            case (not null, null):
                var pizza = catalog.FindPizza(pizzaId);
                if (pizza is null)
                {
                    errors.Add($"{path}.pizzaId", $"La pizza '{pizzaId}' no existe en el menú.");
                    return null;
                }

                return new MenuPizza(pizza);

            case (null, var ids):
                return ParseCustomPizza(ids, $"{path}.customIngredientIds", catalog, errors);
        }
    }

    private static CustomPizza? ParseCustomPizza(
        IReadOnlyList<string?> ids,
        string path,
        Catalog catalog,
        ErrorCollector errors)
    {
        if (ids.Count > MaxCustomIngredients)
        {
            errors.Add(path, $"Una pizza personalizada admite como máximo {MaxCustomIngredients} ingredientes.");
            return null;
        }

        var ingredients = new List<Ingredient>(ids.Count);
        var seen = new HashSet<string>(StringComparer.Ordinal);
        var valid = true;
        for (var index = 0; index < ids.Count; index++)
        {
            var id = ids[index];
            var ingredient = id is null ? null : catalog.FindIngredient(id);
            if (ingredient is null)
            {
                errors.Add($"{path}[{index}]", $"El ingrediente '{id}' no existe.");
                valid = false;
            }
            else if (!seen.Add(ingredient.Id))
            {
                errors.Add($"{path}[{index}]", $"El ingrediente '{id}' está repetido.");
                valid = false;
            }
            else
            {
                ingredients.Add(ingredient);
            }
        }

        if (!valid)
        {
            return null;
        }

        var masas = ingredients.Where(i => i.Kind == IngredientKind.Masa).ToList();
        if (masas.Count != 1)
        {
            errors.Add(path, "Una pizza personalizada debe incluir exactamente una masa.");
            return null;
        }

        return new CustomPizza(masas[0], ingredients.Where(i => i.Kind != IngredientKind.Masa).ToList());
    }

    private static PizzaSize? ParseSize(string? size, string path, ErrorCollector errors)
    {
        PizzaSize? parsed = size switch
        {
            "personal" => PizzaSize.Personal,
            "mediana" => PizzaSize.Mediana,
            "familiar" => PizzaSize.Familiar,
            _ => null,
        };

        if (parsed is null)
        {
            errors.Add(path, "El tamaño debe ser 'personal', 'mediana' o 'familiar'.");
        }

        return parsed;
    }

    private static int? ParseQuantity(int? quantity, string path, ErrorCollector errors)
    {
        if (quantity is not { } q || q < OrderItem.MinQuantity || q > OrderItem.MaxQuantity)
        {
            errors.Add(path, $"La cantidad debe estar entre {OrderItem.MinQuantity} y {OrderItem.MaxQuantity}.");
            return null;
        }

        return q;
    }

    private static Customer? ParseCustomer(CustomerRequest? request, ErrorCollector errors)
    {
        if (request is null)
        {
            errors.Add("customer", "Los datos del cliente son obligatorios.");
            return null;
        }

        var name = RequiredText(request.Name, "customer.name", "El nombre", MaxNameLength, errors);
        var phone = RequiredText(request.Phone, "customer.phone", "El teléfono", MaxPhoneLength, errors);
        var address = RequiredText(request.Address, "customer.address", "La dirección", MaxAddressLength, errors);

        if (phone is not null && phone.Count(char.IsAsciiDigit) < 6)
        {
            errors.Add("customer.phone", "El teléfono debe tener al menos 6 dígitos.");
            phone = null;
        }

        return name is not null && phone is not null && address is not null ? new Customer(name, phone, address) : null;
    }

    private static string? RequiredText(string? value, string path, string label, int maxLength, ErrorCollector errors)
    {
        var trimmed = value?.Trim();
        if (string.IsNullOrEmpty(trimmed))
        {
            errors.Add(path, $"{label} es obligatorio.");
            return null;
        }

        if (trimmed.Length > maxLength)
        {
            errors.Add(path, $"{label} no puede superar los {maxLength} caracteres.");
            return null;
        }

        return trimmed;
    }

    private sealed class ErrorCollector
    {
        private readonly Dictionary<string, List<string>> _errors = new(StringComparer.Ordinal);

        public void Add(string path, string message)
        {
            if (!_errors.TryGetValue(path, out var messages))
            {
                messages = [];
                _errors[path] = messages;
            }

            messages.Add(message);
        }

        public Dictionary<string, string[]> ToDictionary() =>
            _errors.ToDictionary(e => e.Key, e => e.Value.ToArray(), StringComparer.Ordinal);
    }
}
