import { chai } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';

import { Result } from './result';

describe('Result', function() {
  it('should subscribe', function (done) {
    var observer = {
      subscribe() {
        done();
      }
    };

    new Result({ observer });
  });

  it('should set a value', function () {
    var data = 'foo';

    var observer = {
      subscribe({ next }) {
        next({ data });
      }
    };

    var result = new Result({ observer });

    chai.expect(result.get()).to.equal(data);
  });

  it('should not trigger on new data', function (done) {
    var data = 'foo';
    var nextFunc;

    var observer = {
      subscribe({ next }) {
        nextFunc = next;
        next({ data });
      }
    };

    var result = new Result({ observer });

    var spy = sinon.spy(result, "get");

    Tracker.autorun(function() { result.get() });

    nextFunc({ data: 'bar' });

    // Wait one tick so the autorun can run
    Meteor.setTimeout(function() {
      result.get.restore();

      try {
        chai.expect(result.get()).to.equal('bar');
        chai.expect(spy.callCount, 'result.get was called twice').to.equal(2);
        done()
      } catch (e) {
        done(e);
      }
    }, 1)
  });

  it('should not trigger on same data', function (done) {
    var data = { foo: 'bar' };
    var nextFunc;

    var observer = {
      subscribe({ next }) {
        nextFunc = next;
        next({ data });
      }
    };

    var result = new Result({ observer });

    var spy = sinon.spy(result, "get");

    Tracker.autorun(function() { result.get() });

    nextFunc({ data });

    // Wait one tick so the autorun can run
    Meteor.setTimeout(function() {
      result.get.restore();

      try {
        chai.expect(spy.callCount, 'result.get was called once').to.equal(1);
        done()
      } catch (e) {
        done(e);
      }
    }, 1)
  });
});
