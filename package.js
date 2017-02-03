/* eslint-disable no-var, prefer-arrow-callback */
var packages = [
  'ecmascript',
  'reactive-var',
  'promise',
  'blaze-html-templates',
];

Package.describe({
  name: 'swydo:blaze-apollo',
  version: '0.3.0',
  summary: 'Blaze integration for the Apollo Client',
  git: 'https://github.com/swydo/blaze-apollo',
  documentation: 'README.md',
});

Package.onUse(function use(api) {
  api.versionsFrom('1.3.2.4');

  api.use(packages, 'client');

  api.mainModule('client.js', 'client');
});

Package.onTest(function test(api) {
  api.use('swydo:blaze-apollo');

  api.use(packages, 'client');
  api.use([
    'tracker',
    'practicalmeteor:mocha',
    'practicalmeteor:sinon',
    'dispatch:mocha-phantomjs',
  ]);

  api.mainModule('client.spec.js', 'client');
});
