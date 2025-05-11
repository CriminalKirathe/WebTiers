// vite.config.ts (ან vite.config.js)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path'; // დაამატეთ path მოდული alias-ისთვის

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        // აქ შეგიძლიათ დაამატოთ SVGR-ის კონკრეტული პარამეტრები საჭიროებისამებრ
      },
      esbuildOptions: {
        // აქ შეგიძლიათ დაამატოთ esbuild-ის პარამეტრები საჭიროებისამებრ
      },
      include: "**/*.svg?react",
      exclude: "",
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // განახლებული alias გზა საიმედოობისთვის
    }
  }
});