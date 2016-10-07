import { Result } from './result';
import { Template } from 'meteor/templating';

// TODO: can this be imported with an import statement?
const { TemplateInstance } = Blaze;

function initTemplateQueries(template) {
    if (!template._gqlQueries) {
        template._gqlQueries = {};
        template._gqlQueriesDep = new Tracker.Dependency;

        template.view.onViewDestroyed(function () {
            Object.keys(template._gqlQueries).forEach((key) => template._gqlQueries[key].unsubscribe());
        });
    }
}

export function setup ({ client } = {}) {
    TemplateInstance.prototype.gqlQuery = function (request) {
        initTemplateQueries(this);

        // Generate a unique key for every request
        // If a template does the same request twice, it will only query once
        // For now a JSON stringify seems good enough
        const key = JSON.stringify(request);

        if (!this._gqlQueries[key]) {
          this._gqlQueries[key] = new Result({
            observer: client.watchQuery(request)
          });
          this._gqlQueriesDep.changed();
        }

        return this._gqlQueries[key];
    };

    TemplateInstance.prototype.queriesReady = function () {
        initTemplateQueries(this);

        this._gqlQueriesDep.depend();

        return Object.keys(this._gqlQueries).every((key) => this._gqlQueries[key].isReady());
    };

    Template.registerHelper('queriesReady', function() {
        return Template.instance().queriesReady();
    });

    TemplateInstance.prototype.gqlMutate = function (request) {
        return client.mutate(request);
    };
}
