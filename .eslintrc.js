module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: ['@nuxtjs', 'plugin:prettier/recommended', 'prettier/vue'],
  plugins: ['prettier'],
  // add your custom rules here
  rules: {}
}
