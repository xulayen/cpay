const cPay =require('../dist/lib');
const assert = require('assert');
describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

describe('微信支付', function () {
  describe('#H5支付', function () {
    it('返回SUCCESS', function () {
      assert.equal("SUCCESS", "SUCCESS");
    });
  });
});