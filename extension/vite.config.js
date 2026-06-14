import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: 'src/background/service-worker.js', dest: 'background' },
        { src: 'src/content/scraper.js',           dest: 'content'    },
      ]
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: { main: resolve(__dirname, 'index.html') },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
})