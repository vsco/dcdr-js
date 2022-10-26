'use strict';

var fs = require('fs');
var crc = require('buffer-crc32');
var chokidar = require('chokidar');

var ROOT_KEY = 'dcdr';

function Dcdr() {
  this.features = {};
}

Dcdr.prototype.init = function(config) {
  this.config = config;
  this.config.logger = this.config.logger || console;

  if (fs.existsSync(this.config.dcdr.path)) {
    this.loadFeatures(this.config.dcdr.path, true);
    this.watchConfig();
  } else {
    this.config.logger.error(this.config.dcdr.path + ' not found.');
  }
};

Dcdr.prototype.watchConfig = function() {
  function watchHandler() {
    this.config.logger.info('Reloading features from ' + this.config.dcdr.path);
    this.loadFeatures(this.config.dcdr.path, false);
  }

  chokidar.watch(this.config.dcdr.path)
    .on('change', watchHandler.bind(this))
    .on('add', watchHandler.bind(this));
};

Dcdr.prototype.loadFeatures = function(path, isInitialLoad) {
  var featuresJson = fs.readFileSync(path, 'utf8');
  if (featuresJson !== '' || isInitialLoad) {
    var features = JSON.parse(featuresJson);
    this.setFeatures(features);
  }
};

Dcdr.prototype.setFeatures = function(features) {
  if (features[ROOT_KEY] && features[ROOT_KEY].features && features[ROOT_KEY].features.default) {
    this.features = features[ROOT_KEY].features.default;
  } else {
    this.config.logger.error(ROOT_KEY + '.features.default key not found.');
  }
};

Dcdr.prototype.withinPercentile = function(feature, id, val) {
  var uid = this.crc(feature + id.toString());
  var percent = val * 100.00;

  return uid % 100 < percent;
};

Dcdr.prototype.crc = function(feature) {
  var buf = Buffer.from(feature);
  return crc.unsigned(buf);
};

Dcdr.prototype.isAvailable = function(feature) {
  return this.features && this.features[feature] !== null
    && this.features[feature] === true;
};

Dcdr.prototype.isAvailableForId = function(feature, id) {
  return (this.features && this.features[feature] !== null
    && this.withinPercentile(feature, id, this.features[feature]));
};

Dcdr.prototype.scaleValue = function(feature, min, max) {
  if (!this.features || this.features[feature] === null) return min;
  return min + ((max - min) * this.features[feature]);
};

module.exports = new Dcdr();
