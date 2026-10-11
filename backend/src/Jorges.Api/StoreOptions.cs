using System.ComponentModel.DataAnnotations;

namespace Jorges.Api;

/// <summary>Store-wide settings bound from the "Store" configuration section.</summary>
public sealed class StoreOptions
{
    public const string SectionName = "Store";

    /// <summary>ISO 4217 code of the currency every price is expressed in.</summary>
    [Required]
    [RegularExpression("^[A-Z]{3}$", ErrorMessage = "Store:Currency debe ser un código ISO 4217 de tres letras mayúsculas.")]
    public string Currency { get; set; } = "PEN";
}
