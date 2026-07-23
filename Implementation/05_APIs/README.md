# 05_APIs

## Purpose
The `05_APIs` folder houses the API specifications, OpenAPI contracts, Protocol Buffer definitions, and client SDK wrappers for JARVIS-X. It defines the formal data communication contracts governing REST, WebSocket, gRPC, and IPC channels across the entire ecosystem.

---

## Responsibilities
- **OpenAPI 3.0 Specifications**: Maintaining versioned JSON/YAML specifications for all REST endpoints.
- **Contract-First Validation**: Serving as the single source of truth for request and response JSON schemas.
- **Interactive Documentation**: Auto-generating Swagger UI documentation pages (`/documentation`).
- **WebSocket Protocol Definitions**: Defining payload schemas for telemetry, speech, vision, and token streaming.
- **Client SDK Generation**: Auto-generating typed TypeScript client SDKs for frontend and plugin developers.

---

## Files Created in this Folder
- `openapi/v1/openapi.yaml`: Master OpenAPI 3.0 specification for API Version 1.
- `schemas/`: Shared JSON Schemas for requests, responses, and error envelopes (RFC 7807).
- `websockets/`: AsyncAPI / WebSocket payload schema definitions (`telemetry.schema.json`, `ai-stream.schema.json`).
- `proto/`: Protocol Buffer `.proto` files for low-latency internal microservice IPC.
- `sdk/`: Auto-generated TypeScript API client wrappers.

---

## Development Workflow
1. Navigate to `Implementation/05_APIs/`.
2. Edit OpenAPI definitions inside `openapi/v1/openapi.yaml`.
3. Run `pnpm run validate:specs` to lint and validate OpenAPI specifications.
4. Run `pnpm run generate:sdk` to re-generate typed TypeScript SDK wrappers.

---

## System Integration
The API specifications defined in this folder are enforced at runtime by `02_Backend` route controllers, consumed by `01_Frontend` HTTP clients, adhered to by `04_AI` streaming endpoints, and exposed to external third-party developers via `06_Plugins`.
