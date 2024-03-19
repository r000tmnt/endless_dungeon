// vite.config.js
import { defineConfig } from "vite";
// import path, { resolve } from "path";
import pkgJSON from './package.json'

export default defineConfig(({mode}) => {
  const config = {
      // 指定預設的根目錄
  base: "./",
  // 定義全域常數
  define: {
    "__APP_VERSION__": JSON.stringify(pkgJSON.version)
  },
  // 判別現在是開發環境或打包後部署上去的遠端環境，遠端名稱要跟你的Github專案一樣
  publicPath: process.env.NODE_ENV === "production" ? "/endless_dungeon/" : "./",
//   resolve: {
//     // 寫js相關模組時對應路徑的別名，增加引用的便利性
//     alias: {
//       "@": path.resolve(__dirname, "src"),
//       "assets": path.resolve(__dirname, "src/assets/"),
//       "img": path.resolve(__dirname, "src/img"),
//       "styles": path.resolve(__dirname, "src/styles/"),
//       "pages": path.resolve(__dirname, "src/pages/"),
//     },
//   },
  build: {
    // 這裡用的是底層相依套件Rollup，設定入口頁面和打包出來的各個資源目錄要長什麼樣子
    // 和Vue、React等不同，這份教學展示的是靜態網頁，所以可以設定多個入口HTML檔彼此連結
    rollupOptions: {
    //   input: {
    //     // 首頁須使用main作為命名，指向index.html，其他依照檔名即可
    //     main: resolve(__dirname, "index.html"),
    //     topic: resolve(__dirname, "topic.html"),
    //     contact: resolve(__dirname, "contact.html"),
    //   },
      output: {
        /* 
         [name]是對應的檔名，hash則是打包後會加上類似亂碼的字元
         用以防止檔案被Server端Cache住，造成畫面看起來沒更新
        */
        chunkFileNames: "js/[name].[hash].js",
        entryFileNames: "js/[name].[hash].js",
        /*
          對應的副檔名在打包後會自動幫你歸類到所屬的目錄下
        */
        assetFileNames: (info) => {
          let type = info.name.split(".")[1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(type)) {
            type = "img";
          } else if (/ttf|eot|woff|woff2/i.test(type)) {
            type = "fonts"
          } else if (/mp4|webm|ogg/i.test(type)) {
            type = "video"
          } else if (/mp3|wav/i.test(type)) {
            type = "sound"
          }
          return `${type}/[name]-[hash].[ext]`;
        },
      },
    },
    cssCodeSplit: false,
  },
//   cssPreprocessOptions: {
//     // 如果要使用SASS全域變數就在這裡設定路徑
//     scss: {
//       // additionalData: '@import "./styles/variable.scss";',
//     },
//   },
//   css: {
//     // 官方列為實驗性功能，可以找出是由哪個來源建構的css
//     devSourceMap: true,
//   },
  }

  if(mode === 'test'){
    config.base = '/endless_dungeon/'
  }
});