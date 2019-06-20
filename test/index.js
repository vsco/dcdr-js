/* eslint-disable no-undef */
'use strict';

var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;

var dcdr = require('../index');

dcdr.config = {
  dcdr: {
    path: '/etc/dcdr/decider.json'
  }
};

var mockFeatures = {
  dcdr: {
    features: {
      default: {
        boolean_feature: true,
        boolean_feature_off : false,
        percentile_feature : 0.5,
        percentile_feature_off : 0
      }
    }
  }
};

describe('Dcdr', function() {
  var tempDir = process.env.TEMP || process.env.TMP || '/tmp';
  var tempPath = tempDir + '/dcdr-test.json';

  afterEach(function() {
    dcdr.internalStopWatch();
  });

  // deletes test decider.json file after tests are complete
  after(function() {
    fs.unlinkSync(tempPath);
  });

  it('loads features', function(done) {
    dcdr.setFeatures(mockFeatures);

    expect(dcdr.isAvailable('boolean_feature')).be.true;
    done();
  });

  it('hashes features correctly', function(done) {
    expect(dcdr.crc('some_feature' + '123')).to.equal(1706325722);
    done();
  });

  it('handles booleans', function(done) {
    dcdr.setFeatures(mockFeatures);

    expect(dcdr.isAvailable('boolean_feature')).to.be.true;
    expect(dcdr.isAvailable('boolean_feature_off')).to.be.false;
    expect(dcdr.isAvailable('nonexistent_feature')).to.be.false;
    done();
  });

  it('handles percentiles', function(done) {
    dcdr.setFeatures(mockFeatures);

    expect(dcdr.isAvailableForId('percentile_feature', 2)).to.be.true;
    expect(dcdr.isAvailableForId('percentile_feature', 8)).to.be.false;
    expect(dcdr.isAvailableForId('nonexistent_feature', 6)).to.be.false;
    done();
  });

  /**
   * A test to guard against the crc function hashing specific values which
   * ultimatley end in `00`, and therefore would return true for `isAvailableForId`
   * lookups since the comparison operator was mistakenly set to `<=` versus `<`
   */
  it('handles percentiles with specific hashes that trick the crc % function', function(done) {
    dcdr.setFeatures(mockFeatures);
    expect(dcdr.isAvailableForId('percentile_feature_off', 231917551091711)).to.be.false;
    expect(dcdr.isAvailableForId('percentile_feature_off', 3945464305025023)).to.be.false;
    expect(dcdr.isAvailableForId('percentile_feature_off', 3945464305025023)).to.be.false;
    expect(dcdr.isAvailableForId('percentile_feature_off', 669979974303743)).to.be.false;
    expect(dcdr.isAvailableForId('percentile_feature_off', 7717664547930111)).to.be.false;
    done();
  });

  it('handles percentiles with really large ID values', function(done) {
    dcdr.setFeatures(mockFeatures);
    expect(dcdr.isAvailableForId('percentile_feature_off', Number.MAX_SAFE_INTEGER)).to.be.false;
    done();
  });

  it('handles scalars', function(done) {
    dcdr.setFeatures(mockFeatures);

    expect(dcdr.scaleValue('percentile_feature', 0, 10)).to.equal(5);
    expect(dcdr.scaleValue('percentile_feature', 5, 10)).to.equal(7.5);
    done();
  });

  it('fail closed when decider.json is not found', function(done) {
    var cfg = {
      dcdr: {
        path: './not_found'
      }
    };

    dcdr.features = {};
    dcdr.init(cfg);

    expect(dcdr.isAvailable('boolean_feature')).to.be.false;
    done();
  });

  it('handles features file updated to zero length', function(done) {
    fs.writeFileSync(tempPath, '{"dcdr":{"features":{"default":{"test": 1}}}}');
    dcdr.init({ dcdr: { path: tempPath } });
    setTimeout(function() {
      fs.writeFileSync(tempPath, '');
      setTimeout(done, 100);
    }, 50);
  });

  it('should detect feature flag value changes', function(done) {
    var features = {
      dcdr: {
        features: {
          default: {
            boolean_feature: true
          }
        }
      }
    };

    fs.writeFileSync(tempPath, JSON.stringify(features));
    dcdr.init({ dcdr: { path: tempPath } });

    expect(dcdr.isAvailable('boolean_feature')).to.be.true;

    // flip the feature flag
    features.dcdr.features.default.boolean_feature = false;
    fs.writeFileSync(tempPath, JSON.stringify(features));
    setTimeout(function() {
      expect(dcdr.isAvailable('boolean_feature')).to.be.false;
      done();
    }, 300);
  });
});
