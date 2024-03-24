const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  devServer: {
    port : 3000,
    proxy : {
      '': {
        target : 'http://localhost:8080', // 스프링부트 개발포트
        changeOrigin : true,
      }
    }
  },
  configureWebpack: {
    plugins : [
      new (require('webpack').ProvidePlugin)({
        $: 'jquery',
        jQuery : 'jquery',
        'window.jQuery' : 'jquery'
      })
    ]
  }
})
