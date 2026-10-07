# API documentation

The interactive Swagger UI is served by the NestJS application at `/docs`.
The generated OpenAPI JSON document is available at `/docs/openapi.json`.

`openapi.yaml` contains the checked-in OpenAPI 3.0 description of the current
HTTP API. The running Swagger document is generated from the decorators in
`src/authentication/authentication.controller.ts` and `src/app.controller.ts`.
