Package.describe({
  name: 'swydo:blaze-apollo',
  version: '0.0.1',
  summary: 'Blaze integration for the Apollo Client',
  git: 'https://github.com/swydo/blaze-apollo',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');

  api.use([
    'ecmascript',
    'reactive-var',
    'blaze-html-templates'
  ], 'client');

  api.mainModule('client.js', 'client');
});
