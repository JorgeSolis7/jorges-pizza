using Jorges.Api.Domain;

namespace Jorges.Api.Data;

/// <summary>
/// The starting menu: six categories, one per slice of the home animation (see DESIGN.md).
/// Prices are in the configured currency (PEN by default).
/// </summary>
public static class SeedData
{
    public static Catalog CreateCatalog() => new(Categories, Pizzas, Ingredients, CustomPizzaBasePrices);

    private static readonly SizePrices CustomPizzaBasePrices = new(personal: 18m, mediana: 26m, familiar: 34m);

    private static readonly Category[] Categories =
    [
        new("cat-clasicas", "clasicas", "Clásicas", IsPizza: true),
        new("cat-de-la-casa", "de-la-casa", "De la casa", IsPizza: true),
        new("cat-blancas", "blancas", "Blancas", IsPizza: true),
        new("cat-veganas", "veganas", "Veganas", IsPizza: true),
        new("cat-para-picar", "para-picar", "Para picar", IsPizza: false),
        new("cat-postres-y-bebidas", "postres-y-bebidas", "Postres y bebidas", IsPizza: false),
    ];

    private static readonly Ingredient[] Ingredients =
    [
        new("ing-masa-tradicional", "masa-tradicional", "Masa tradicional de 48 horas", IngredientKind.Masa, 0m),
        new("ing-masa-delgada", "masa-delgada", "Masa delgada crocante", IngredientKind.Masa, 0m),
        new("ing-masa-integral", "masa-integral", "Masa integral de masa madre", IngredientKind.Masa, 3m),
        new("ing-salsa-pomodoro", "salsa-pomodoro", "Salsa de tomate San Marzano", IngredientKind.Salsa, 0m),
        new("ing-crema-de-rocoto", "crema-de-rocoto", "Crema de rocoto", IngredientKind.Salsa, 3m),
        new("ing-pesto-genoves", "pesto-genoves", "Pesto genovés", IngredientKind.Salsa, 4m),
        new("ing-mozzarella", "mozzarella", "Mozzarella fior di latte", IngredientKind.Queso, 5m),
        new("ing-parmigiano", "parmigiano", "Parmigiano Reggiano", IngredientKind.Queso, 6m),
        new("ing-gorgonzola", "gorgonzola", "Gorgonzola dolce", IngredientKind.Queso, 6m),
        new("ing-prosciutto", "prosciutto", "Prosciutto di Parma", IngredientKind.Carne, 9m),
        new("ing-pepperoni", "pepperoni", "Pepperoni artesanal", IngredientKind.Carne, 6m),
        new("ing-nduja", "nduja", "'Nduja calabresa", IngredientKind.Carne, 8m),
        new("ing-champinones", "champinones", "Champiñones salteados", IngredientKind.Vegetal, 4m),
        new("ing-aceitunas-botija", "aceitunas-botija", "Aceitunas de botija", IngredientKind.Vegetal, 3m),
        new("ing-cebolla-caramelizada", "cebolla-caramelizada", "Cebolla caramelizada", IngredientKind.Vegetal, 3m),
        new("ing-pimientos-asados", "pimientos-asados", "Pimientos asados", IngredientKind.Vegetal, 4m),
        new("ing-ajo-confitado", "ajo-confitado", "Ajo confitado", IngredientKind.Vegetal, 2m),
        new("ing-albahaca", "albahaca", "Albahaca fresca", IngredientKind.Hierba, 2m),
        new("ing-rucula", "rucula", "Rúcula", IngredientKind.Hierba, 3m),
        new("ing-oregano", "oregano", "Orégano silvestre", IngredientKind.Hierba, 1m),
    ];

    private static readonly Pizza[] Pizzas =
    [
        // Clásicas
        new(
            "pz-margherita", "margherita", "Margherita",
            "Tomate San Marzano, mozzarella fior di latte y albahaca fresca sobre nuestra masa de 48 horas.",
            "cat-clasicas", new SizePrices(32m, 46m, 58m),
            ["ing-masa-tradicional", "ing-salsa-pomodoro", "ing-mozzarella", "ing-albahaca"],
            [PizzaTag.Favorita]),
        new(
            "pz-pepperoni", "pepperoni", "Pepperoni",
            "Pepperoni artesanal que se dora en el horno de piedra, con mozzarella y tomate.",
            "cat-clasicas", new SizePrices(35m, 49m, 63m),
            ["ing-masa-tradicional", "ing-salsa-pomodoro", "ing-mozzarella", "ing-pepperoni"],
            [PizzaTag.Favorita]),
        new(
            "pz-diavola", "diavola", "Diavola",
            "'Nduja calabresa y pepperoni sobre tomate San Marzano: intensa y ahumada.",
            "cat-clasicas", new SizePrices(40m, 56m, 72m),
            ["ing-masa-tradicional", "ing-salsa-pomodoro", "ing-mozzarella", "ing-nduja", "ing-pepperoni"],
            [PizzaTag.Picante]),

        // De la casa
        new(
            "pz-jorges-especial", "jorges-especial", "Jorges Especial",
            "La de la casa: prosciutto di Parma, champiñones, aceitunas de botija y mozzarella.",
            "cat-de-la-casa", new SizePrices(42m, 59m, 75m),
            ["ing-masa-tradicional", "ing-salsa-pomodoro", "ing-mozzarella", "ing-prosciutto", "ing-champinones", "ing-aceitunas-botija"],
            [PizzaTag.Favorita]),
        new(
            "pz-prosciutto-rucula", "prosciutto-rucula", "Prosciutto e Rúcula",
            "Prosciutto di Parma y rúcula fresca añadidos al salir del horno, con lascas de parmesano.",
            "cat-de-la-casa", new SizePrices(44m, 62m, 78m),
            ["ing-masa-delgada", "ing-salsa-pomodoro", "ing-mozzarella", "ing-prosciutto", "ing-rucula", "ing-parmigiano"],
            []),
        new(
            "pz-rocoto-andina", "rocoto-andina", "Rocoto Andina",
            "Crema de rocoto, 'nduja y cebolla caramelizada: el picante peruano se encuentra con Calabria.",
            "cat-de-la-casa", new SizePrices(41m, 57m, 73m),
            ["ing-masa-tradicional", "ing-crema-de-rocoto", "ing-mozzarella", "ing-nduja", "ing-cebolla-caramelizada"],
            [PizzaTag.Picante, PizzaTag.Nueva]),

        // Blancas (sin salsa de tomate)
        new(
            "pz-cuatro-quesos", "cuatro-quesos", "Cuatro Quesos",
            "Mozzarella, Parmigiano Reggiano y gorgonzola dolce fundidos sobre masa crocante.",
            "cat-blancas", new SizePrices(38m, 54m, 68m),
            ["ing-masa-delgada", "ing-mozzarella", "ing-parmigiano", "ing-gorgonzola"],
            []),
        new(
            "pz-dulce-gorgonzola", "dulce-gorgonzola", "Dulce Gorgonzola",
            "Gorgonzola, cebolla caramelizada y rúcula: el contraste dulce y salado de la casa.",
            "cat-blancas", new SizePrices(39m, 55m, 70m),
            ["ing-masa-tradicional", "ing-mozzarella", "ing-gorgonzola", "ing-cebolla-caramelizada", "ing-rucula"],
            [PizzaTag.Nueva]),
        new(
            "pz-pesto-verde", "pesto-verde", "Pesto Verde",
            "Pesto genovés, mozzarella, parmesano y rúcula sobre masa delgada.",
            "cat-blancas", new SizePrices(36m, 51m, 65m),
            ["ing-masa-delgada", "ing-pesto-genoves", "ing-mozzarella", "ing-parmigiano", "ing-rucula"],
            []),

        // Veganas (sin queso ni carne)
        new(
            "pz-marinara", "marinara", "Marinara",
            "La napolitana original: tomate San Marzano, ajo confitado, orégano silvestre y albahaca.",
            "cat-veganas", new SizePrices(28m, 40m, 52m),
            ["ing-masa-tradicional", "ing-salsa-pomodoro", "ing-ajo-confitado", "ing-oregano", "ing-albahaca"],
            []),
        new(
            "pz-huerta", "huerta", "Huerta",
            "Champiñones, pimientos asados, cebolla caramelizada y aceitunas de botija sobre masa integral.",
            "cat-veganas", new SizePrices(34m, 48m, 61m),
            ["ing-masa-integral", "ing-salsa-pomodoro", "ing-champinones", "ing-pimientos-asados", "ing-cebolla-caramelizada", "ing-aceitunas-botija"],
            [PizzaTag.Nueva]),

        // Para picar (personal/mediana/familiar = porción chica/mediana/grande)
        new(
            "pz-focaccia-ajo", "focaccia-ajo", "Focaccia de ajo y orégano",
            "Focaccia esponjosa del horno de piedra con ajo confitado, orégano y aceite de oliva.",
            "cat-para-picar", new SizePrices(12m, 18m, 24m),
            ["ing-ajo-confitado", "ing-oregano"],
            []),
        new(
            "pz-burrata", "burrata", "Burrata con tomates asados",
            "Burrata cremosa con tomates asados, albahaca y pan tostado para compartir.",
            "cat-para-picar", new SizePrices(24m, 34m, 44m),
            ["ing-albahaca"],
            []),

        // Postres y bebidas (personal/mediana/familiar = porción o vaso chico/mediano/grande)
        new(
            "pz-tiramisu", "tiramisu", "Tiramisú de la casa",
            "Mascarpone, café de Villa Rica y cacao amargo, montado cada mañana.",
            "cat-postres-y-bebidas", new SizePrices(14m, 22m, 30m),
            [],
            []),
        new(
            "pz-limonada-hierbabuena", "limonada-hierbabuena", "Limonada de hierbabuena",
            "Limón de Chulucanas, hierbabuena fresca y un toque de jarabe de caña.",
            "cat-postres-y-bebidas", new SizePrices(8m, 12m, 18m),
            [],
            []),
    ];
}
