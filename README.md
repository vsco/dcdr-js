# dcdr-js

VSCO's [DCDR](https://github.com/vsco/dcdr) (Decider) package for Node.js

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

## Release

Since we host this package on npm, there are a few steps to follow in order to do a release.

1. Decide the release type. We follow the [semantic versioning](https://docs.npmjs.com/getting-started/semantic-versioning#semver-for-publishers) (semver) standard. Is it a patch, minor, or major release?
2. Run `npm version <release_type>`. This updates the `version` number in `package.json`.
3. Run `script/release`.
4. Fill out the release notes. What changed?
5. Run `npm publish`. See the [docs](https://docs.npmjs.com/getting-started/publishing-npm-packages) for more info.
