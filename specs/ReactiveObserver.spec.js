/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import { chai } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Promise } from 'meteor/promise';
import { Tracker } from 'meteor/tracker';

import { ReactiveObserver } from '../lib/ReactiveObserver';

describe('ReactiveObserver', function () {
  it('should subscribe', (done) => {
    const observer = {
      subscribe() {
        done();
      },
    };

    // eslint-disable-next-line no-new
    new ReactiveObserver(observer);
  });

  it('should set a value', function () {
    const data = 'foo';

    const observer = {
      subscribe({ next }) {
        next({ data });
      },
    };

    const result = new ReactiveObserver(observer);

    chai.expect(result.get()).to.equal(data);
  });

  it('should trigger on new data', () => {
    const data = 'foo';
    let nextFunc;

    const observer = {
      subscribe({ next }) {
        nextFunc = next;
        next({ data });
      },
    };

    const result = new ReactiveObserver(observer);

    const spy = sinon.spy(result, 'get');

    Tracker.autorun(function () { result.get(); });

    nextFunc({ data: 'bar' });

    Tracker.flush();

    result.get.restore();

    chai.expect(result.get()).to.equal('bar');
    chai.expect(spy.callCount, 'result.get was called twice').to.equal(2);
  });

  it('should not trigger on same data', () => {
    const data = { foo: 'bar' };
    let nextFunc;

    const observer = {
      subscribe({ next }) {
        nextFunc = next;
        next({ data });
      },
    };

    const result = new ReactiveObserver(observer);

    const spy = sinon.spy(result, 'get');

    Tracker.autorun(function () { result.get(); });

    nextFunc({ data });

    Tracker.flush();

    result.get.restore();

    chai.expect(spy.callCount, 'result.get was called once').to.equal(1);
  });

  it('should not modify original', function () {
    // The latest Apollo client returns a frozen object, so it can't be modified
    const data = Object.freeze({ foo: 'bar' });

    const observer = {
      subscribe({ next }) {
        next({ data });
      },
    };

    const result = new ReactiveObserver(observer);

    const clone = result.get();

    clone.baz = 'qux';

    chai.expect(result.get().baz, 'added key').to.equal(undefined);
  });

  it('should not throw when data is undefined', function () {
    const data = undefined;

    const observer = {
      subscribe({ next }) {
        next({ data, loading: true, networkStatus: 1, stale: true });
      },
    };

    const result = new ReactiveObserver(observer);
    chai.expect(result.get(), 'result value').to.equal(undefined);
  });

  describe('#then', function () {
    it('should return a promise', function () {
      const observer = {
        subscribe() {},
        result() {
          return Promise.resolve();
        },
      };

      const result = new ReactiveObserver(observer);

      const promise = result.then();

      chai.expect(promise).to.be.instanceof(Promise);
    });

    it('should return data', function (done) {
      const data = 'foo';

      const observer = {
        subscribe() {},
        result() {
          return Promise.resolve({ data });
        },
      };

      const result = new ReactiveObserver(observer);

      result.then((value) => {
        chai.expect(value).to.equal(data);
        done();
      }).catch(done);
    });
  });
});
