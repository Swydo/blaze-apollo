import { chai } from 'meteor/practicalmeteor:chai';

import { Result } from './result';

describe('Result', function() {
  it('should subscribe', function (done) {
    var observer = {
      subscribe() {
        done();
      }
    };

    new Result({
      observer
    });
  });

  it('should set a value', function () {
    var value = 'foo';

    var observer = {
      subscribe({ next }) {
        next({
          data: value
        });
      }
    };

    var result = new Result({
      observer
    });

    chai.expect(result.get()).to.equal(value);
  });
});
