module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {},
  extends: [
    '@nuxtjs',
    'plugin:prettier/recommended',
    'prettier'
    // 'prettier/vue',
    // 'plugin:nuxt/recommended'
  ],
  plugins: ['prettier'],
  // add your custom rules here
  rules: {
    // 'vue/v-slot-style': [
    //   'off',
    //   {
    //     atComponent: 'v-slot',
    //     default: 'shorthand',
    //     named: 'shorthand'
    //   }
    // ]
    'vue/valid-v-slot': ['error', { allowModifiers: true }],
    'vue/no-mutating-props': 0
  }
}
