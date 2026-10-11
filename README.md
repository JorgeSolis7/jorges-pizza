# Jorges

Aplicación web de **Jorges**, una pizzería premium: menú con pizzas de la casa, un constructor de pizzas
personalizadas y pedidos en línea.

- **Backend**: API mínima en ASP.NET Core (.NET 10), datos en memoria listos para cambiar a una base de datos.
- **Frontend**: TypeScript + Vite (en `frontend/`).
- **Infraestructura**: Docker multi-stage y `docker-compose` (API + nginx sirviendo el frontend).

## Estructura

```
.
├── backend/
│   ├── Jorges.slnx
│   ├── Directory.Build.props        # net10.0, nullable, warnings como errores
│   ├── Dockerfile                   # sdk:10.0 -> aspnet:10.0, usuario no root, puerto 8080
│   ├── src/Jorges.Api/
│   │   ├── Program.cs               # ProblemDetails, OpenAPI, CORS, JSON, registro de endpoints
│   │   ├── Domain/                  # Catálogo, pedidos y precios (invariantes en los constructores)
│   │   ├── Data/                    # ICatalogSource / IOrderStore + implementación en memoria y datos semilla
│   │   └── Features/                # Endpoints por funcionalidad: Menu, Ingredients, Orders
│   └── tests/Jorges.Api.Tests/      # xUnit: dominio, parser de pedidos y endpoints (WebApplicationFactory)
├── frontend/                        # Aplicación Vite + TypeScript
├── docs/                            # Investigación y diseño
├── DESIGN.md                        # Sistema de diseño
└── docker-compose.yml
```

## Requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js 24](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (solo para ejecutar con contenedores)

## Ejecutar en local

### Backend

```bash
cd backend/src/Jorges.Api
dotnet run
```

La API queda en <http://localhost:5080>. En desarrollo:

- Documento OpenAPI: <http://localhost:5080/openapi/v1.json>
- CORS permite `http://localhost:5173` (configurable en `appsettings.Development.json`, `Cors:AllowedOrigins`).

### Frontend

En otra terminal, con el backend corriendo:

```bash
cd frontend
npm install
npm run dev
```

Abre <http://localhost:5173>. Vite redirige las llamadas a `/api` hacia la API en `http://localhost:5080`.

## Ejecutar con Docker

Necesitas Docker Desktop instalado y en ejecución.

```bash
docker compose up --build
```

- Web: <http://localhost:3000> (nginx sirve el frontend y redirige `/api/` a la API).
- API: <http://localhost:5080> (contenedor en el puerto 8080, entorno `Production`, sin OpenAPI).

El servicio `web` espera a que el `HEALTHCHECK` de la API (`/health`) esté sano.

## Pruebas

```bash
cd backend
dotnet test
```

Para comprobar el formato del código C#:

```bash
cd backend
dotnet format Jorges.slnx --verify-no-changes
```

## API

Todas las respuestas son JSON en camelCase. Los errores usan
[ProblemDetails](https://www.rfc-editor.org/rfc/rfc9457) (`application/problem+json`).

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `GET` | `/health` | `200 {"status":"ok"}` |
| `GET` | `/api/menu` | Moneda, categorías y productos con precios por tamaño |
| `GET` | `/api/ingredients` | Ingredientes con tipo y precio extra |
| `POST` | `/api/orders` | `201` + `Location` con el pedido creado, o `400` ValidationProblem |
| `GET` | `/api/orders/{id}` | `200` con el pedido, o `404` ProblemDetails |

Ejemplo de pedido:

```json
{
  "items": [
    { "pizzaId": "pz-margherita", "size": "mediana", "quantity": 2 },
    {
      "customIngredientIds": ["ing-masa-integral", "ing-salsa-pomodoro", "ing-mozzarella"],
      "size": "personal",
      "quantity": 1
    }
  ],
  "customer": { "name": "Jorge", "phone": "+51 987 654 321", "address": "Av. Larco 123, Miraflores" }
}
```

Reglas de un pedido:

- Al menos un ítem; cada ítem lleva `pizzaId` **o** `customIngredientIds`, nunca ambos.
- Una pizza personalizada lleva exactamente una masa, sin ingredientes repetidos (máximo 12).
- `size`: `personal`, `mediana` o `familiar`. En "Para picar" y "Postres y bebidas" equivalen a porción chica, mediana y grande.
- `quantity` entre 1 y 20.
- `customer.name`, `customer.phone` (al menos 6 dígitos) y `customer.address` son obligatorios.

El total lo calcula el servidor. Una pizza personalizada cuesta el precio base de su tamaño
(`customPizza.basePrices` en `/api/menu`) más el `extraPrice` de cada ingrediente elegido.

## Configuración

| Clave | Por defecto | Descripción |
| --- | --- | --- |
| `Store:Currency` | `PEN` | Código ISO 4217 de la moneda (variable de entorno `Store__Currency`) |
| `Cors:AllowedOrigins` | `["http://localhost:5173"]` en Development | Orígenes permitidos por CORS |
| `ASPNETCORE_HTTP_PORTS` | `8080` en el contenedor | Puerto de Kestrel |

Los pedidos se guardan en memoria y se pierden al reiniciar la API. Para usar una base de datos,
implementa `ICatalogSource` e `IOrderStore` (en `backend/src/Jorges.Api/Data/`) y regístralos en `Program.cs`.
