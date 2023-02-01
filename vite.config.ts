import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  clearScreen: false,
  server: {
    port: Number(process.env.PORT) || 8000,
  },
});
