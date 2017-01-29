/* eslint-disable prefer-arrow-callback, func-names */
/* eslint-env mocha */
import { chai } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Promise } from 'meteor/promise';
import { Tracker } from 'meteor/tracker';
import { Meteor } from 'meteor/meteor';

import { Result } from './result';

describe('Result', function () {
  it('should subscribe', (done) => {
    const observer = {
      subscribe() {
        done();
      },
    };

    // eslint-disable-next-line no-new
    new Result({ observer });
  });

  it('should set a value', function () {
    const data = 'foo';

    const observer = {
      subscribe({ next }) {
        next({ data });
      },
    };

    const result = new Result({ observer });

    chai.expect(result.get()).to.equal(data);
  });

  it('should not trigger on new data', (done) => {
    const data = 'foo';
    let nextFunc;

    const observer = {
      subscribe({ next }) {
        nextFunc = next;
        next({ data });
      },
    };

    const result = new Result({ observer });

    const spy = sinon.spy(result, 'get');

    Tracker.autorun(function () { result.get(); });

    nextFunc({ data: 'bar' });

    // Wait one tick so the autorun can run
    Meteor.setTimeout(function () {
      result.get.restore();

      try {
        chai.expect(result.get()).to.equal('bar');
        chai.expect(spy.callCount, 'result.get was called twice').to.equal(2);
        done();
      } catch (e) {
        done(e);
      }
    }, 1);
  });

  it('should not trigger on same data', (done) => {
    const data = { foo: 'bar' };
    let nextFunc;

    const observer = {
      subscribe({ next }) {
        nextFunc = next;
        next({ data });
      },
    };

    const result = new Result({ observer });

    const spy = sinon.spy(result, 'get');

    Tracker.autorun(function () { result.get(); });

    nextFunc({ data });

    // Wait one tick so the autorun can run
    Meteor.setTimeout(function () {
      result.get.restore();

      try {
        chai.expect(spy.callCount, 'result.get was called once').to.equal(1);
        done();
      } catch (e) {
        done(e);
      }
    }, 1);
  });

  it('should not modify original', function () {
    const data = { foo: 'bar' };

    const observer = {
      subscribe({ next }) {
        next({ data });
      },
    };

    const result = new Result({ observer });

    const clone = result.get();

    clone.baz = 'qux';

    chai.expect(result.get().baz, 'added key').to.equal(undefined);
  });

});
