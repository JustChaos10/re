// Stub module to prevent bundling server-only @google-cloud/vertexai in the browser build.
export class VertexAI {
  constructor(_: any) {
    throw new Error('VertexAI is server-only. The demo UI calls the API server instead.');
  }
}
