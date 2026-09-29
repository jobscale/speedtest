import standard from '@jobscale/eslint-plugin-standard';

export default [{
  ignores: [
    ...standard.configs.standard.ignores,
    '**/target/*/build/**',
  ],
}, {
  ...standard.configs.node,
  name: 'node rule',
  files: ['**/*.js'],
  rules: {
    ...standard.rules,
  },
}, {
  ...standard.configs.browser,
  name: 'browser rule',
  files: ['**/docs/**/*.js', 'public/**/*.js', 'src/**/*.js', 'tauri-app/src/**/*.js'],
  rules: {
    ...standard.rules,
    'no-loop-func': 'off',
  },
}];
