import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),
  createSvgIconsPlugin({
    // 💡 指定图标文件夹路径（指向你找到的那一堆 svg 所在目录）
    iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
    // 指定 symbolId 格式
    symbolId: 'icon-[name]',
  }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
