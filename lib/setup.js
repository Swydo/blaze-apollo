import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveObserver } from './ReactiveObserver';

// TODO: can this be imported with an import statement?
const { TemplateInstance } = Blaze;

// Generate a unique key for every request
// If a template does the same request twice, it will query only once
// For now a JSON stringify seems good enough
function generateRequestKey(request) {
  return JSON.stringify(request);
}

export function graphQLClient(client, { templateInstance } = {}) {
  return {
    _gqlQueries: {},
    _gqlQueriesDep: new Tracker.Dependency(),
    gqlQuery(request, { equals } = {}) {
      const obj = templateInstance || this;
      const key = generateRequestKey(request);

      if (!obj._gqlQueries[key]) {
        obj._gqlQueries[key] = new ReactiveObserver(client.watchQuery(request), {
          equals,
        });
        obj._gqlQueriesDep.changed();
      }

      return obj._gqlQueries[key];
    },
    queriesReady() {
      const obj = templateInstance || this;
      obj._gqlQueriesDep.depend();
      return Object.keys(obj._gqlQueries).every(key => obj._gqlQueries[key].isReady());
    },
    gqlSubscribe(request) {
      const obj = templateInstance || this;
      const result = new ReactiveObserver(client.subscribe(request), {
        equals() { return false; },
      });

      result._isReady.set(true);

      const key = result._subscription._networkSubscriptionId;

      obj._gqlQueries[key] = result;

      return result;
    },
    gqlMutate(request) {
      return client.mutate(request);
    },
    breakdown: () => {
      Object.keys(graphQLClient._gqlQueries)
        .forEach(key => graphQLClient._gqlQueries[key].unsubscribe());
    },
  }
}

function initTemplateQueries(template) {
  if (!template._gqlQueries) {
    // eslint-disable-next-line no-param-reassign
    template._gqlQueries = {};
    // eslint-disable-next-line no-param-reassign
    template._gqlQueriesDep = new Tracker.Dependency();

    template.view.onViewDestroyed(() => {
      Object.keys(template._gqlQueries).forEach(key => template._gqlQueries[key].unsubscribe());
    });
  }
}

export function setup({ client } = {}) {
  TemplateInstance.prototype.gqlQuery = function gqlQuery(request, { equals } = {}) {
    initTemplateQueries(this);
    return graphQLClient(client, { templateInstance: this }).gqlQuery(request, { equals });
  };

  TemplateInstance.prototype.queriesReady = function queriesReady() {
    initTemplateQueries(this);
    return graphQLClient(client, { templateInstance: this }).queriesReady();
  };

  TemplateInstance.prototype.gqlSubscribe = function gqlSubscribe(request) {
    initTemplateQueries(this);
    return graphQLClient(client, { templateInstance: this }).gqlSubscribe(request);
  };

  TemplateInstance.prototype.gqlMutate = function gqlMutate(request) {
    return graphQLClient(client, { templateInstance: this }).gqlMutate(request);
  };

  Template.registerHelper('queriesReady', () => Template.instance().queriesReady());
}

export function breakdown() {
  delete TemplateInstance.prototype.gqlQuery;
  delete TemplateInstance.prototype.gqlMutate;
  delete TemplateInstance.prototype.gqlSubscribe;
  delete TemplateInstance.prototype.queriesReady;

  Template.deregisterHelper('queriesReady');
}
