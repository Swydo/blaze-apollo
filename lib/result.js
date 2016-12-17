import { ReactiveVar } from 'meteor/reactive-var';

function eqls(a, b) {
  return EJSON.stringify(a) === EJSON.stringify(b);
}

export class Result {
    constructor({
        observer,
        defaultValue = {},
        equals = eqls
    } = {}) {
        this.observer = observer;

        this._isReady = new ReactiveVar(false);
        this._errors = new ReactiveVar();
        this._var = new ReactiveVar(defaultValue, equals);

        this.subscribe();
    }

    isReady() {
        return this._isReady.get();
    }

    get() {
        return this._var.get();
    }

    getErrors() {
        return this._errors.get();
    }

    unsubscribe() {
        return this._subscription && this._subscription.unsubscribe();
    }

    subscribe() {
        if (this._subscription) {
            this.unsubscribe();
        }

        this._subscription = this.observer.subscribe({
            next: ({ errors, data }) => {
                if (errors) {
                    this._errors.set(errors);
                } else {
                    this._errors.set(null);
                    this._var.set(data);
                }
                this._isReady.set(true);
            },
            error: (error) => {
                this._errors.set([].concat(error));
                this._isReady.set(true);
            }
        });
    }
}
