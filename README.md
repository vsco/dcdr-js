# dcdr-js

VSCO’s [DCDR](https://github.com/vsco/dcdr) (Decider) package for Node.js

[![Build Status](https://travis-ci.org/vsco/dcdr-js.svg?branch=master)](https://travis-ci.org/vsco/dcdr-js)

## Overview

Decider is a [feature flag](https://en.wikipedia.org/wiki/Feature_toggle) system with adaptable backends. Read more on the [DCDR](https://github.com/vsco/dcdr#dcdr-decider) repo.

## Example

```js
var dcdr = require('dcdr');

dcdr.init({ dcdr: { path: '/etc/dcdr/decider.json' } });

if (dcdr.isAvailable('enable_feature')) {
  console.log('feature enabled');
} else {
  console.log('feature disabled');
}
```
