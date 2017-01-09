import { chai } from 'meteor/practicalmeteor:chai';
import { setup, breakdown } from './setup';

const { TemplateInstance } = Blaze;

describe('setup', function () {
  beforeEach(function () {
      breakdown();
  });

  it('should add functions to the TemplateInstance prototype', function () {
      setup();

      chai.expect(TemplateInstance.prototype.gqlQuery).to.be.ok;
      chai.expect(TemplateInstance.prototype.queriesReady).to.be.ok;
  });
});
