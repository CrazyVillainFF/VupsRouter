/**
 * Abstract Base Provider Adapter
 */
export class BaseProvider {
  constructor(name, id, config = {}) {
    this.name = name;
    this.id = id;
    this.config = config;
  }

  async listModels() {
    throw new Error(`listModels() not implemented for ${this.name}`);
  }

  async getModel(modelId) {
    const models = await this.listModels();
    return models.find((m) => m.id === modelId) || null;
  }

  async healthCheck() {
    throw new Error(`healthCheck() not implemented for ${this.name}`);
  }

  async chat({ model, messages, temperature = 0.7, maxTokens = 2048 }) {
    throw new Error(`chat() not implemented for ${this.name}`);
  }

  async chatStream({ model, messages, temperature = 0.7, maxTokens = 2048, onChunk, onDone, onError }) {
    throw new Error(`chatStream() not implemented for ${this.name}`);
  }
}
