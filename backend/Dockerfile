# syntax=docker/dockerfile:1

# ---- build ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first, from the project file alone, so the layer is cached until dependencies change.
COPY Directory.Build.props ./
COPY src/Jorges.Api/Jorges.Api.csproj src/Jorges.Api/
RUN dotnet restore src/Jorges.Api/Jorges.Api.csproj

COPY src/ src/
RUN dotnet publish src/Jorges.Api/Jorges.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish \
    /p:UseAppHost=false

# ---- runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_HTTP_PORTS=8080 \
    DOTNET_NOLOGO=true
EXPOSE 8080

COPY --from=build /app/publish .

# Non-root user shipped with the official .NET images.
USER app

# The runtime image has no curl or wget, so probe /health with bash's /dev/tcp.
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
    CMD ["bash", "-c", "exec 3<>/dev/tcp/127.0.0.1/8080 && printf 'GET /health HTTP/1.0\\r\\nHost: localhost\\r\\n\\r\\n' >&3 && head -n 1 <&3 | grep -q ' 200 '"]

ENTRYPOINT ["dotnet", "Jorges.Api.dll"]
