/* eslint-disable no-undef */
'use strict';

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
        percentile_feature : 0.5
      }
    }
  }
};

describe('Dcdr', function() {
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
});
