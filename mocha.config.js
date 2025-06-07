// mocha.config.js
module.exports = {
  require: ['ts-node/register'],
  extension: ['ts'],
  spec: 'src/tests/**/*.test.ts',
  recursive: true
};
