const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081, // 将端口号改为所需的值
    open: true, // 是否自动打开浏览器
  }
})