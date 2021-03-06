'use strict';

const WebhookRegistrar = require('./register-webhook');
const handlers = { };

class TrelloWebhookServer {
  constructor(config) { // port, host, apiKey, apiToken, clientSecret) {
    if (!config) {
      throw new Error('Config is required');
    }
    this.config = { };
    let serverSetupModule = './get-express-server-setup';
    this.config.server = config.server;
    this.start = require(serverSetupModule)(this, handlers);

    if (!config.hostURL || !config.hostURL.match(/^https?:\/\//)) {
      throw new Error('Host URL (config.hostURL) must be specified and must begin with http:// or https://');
    }

    if (!config.apiKey) {
      throw new Error('Trello API key (config.apiKey) must be specified');
    }

    if (!config.apiToken) {
      throw new Error('Trello API token (config.apiToken) must be specified');
    }

    if (!config.clientSecret) {
      throw new Error('Trello client secret (config.clientSecret) must be specified');
    }

    this.config.hostURL = config.hostURL;
    this.config.clientSecret = config.clientSecret;

    this.registrar = new WebhookRegistrar(config.apiKey, config.apiToken);
  }

  cleanup() {
    return this.registrar.unregister();
  }

  on(eventName, handler) {
    if (!this.config.modelID) {
      throw new Error('Cannot subscribe to events prior to calling start');
    }
    if (!handlers[this.config.modelID]) {
      handlers[this.config.modelID] = { };
    }
    if (!Array.isArray(handlers[this.config.modelID][eventName])) {
      handlers[this.config.modelID][eventName] = [];
    }
    if (typeof handler === 'function') {
      handlers[this.config.modelID][eventName].push(handler);
    }
  }
}

module.exports = TrelloWebhookServer;