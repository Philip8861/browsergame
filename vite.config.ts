import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'src/client',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'assets/**/*',
          dest: 'assets',
        },
      ],
    }),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0', // Höre auf allen Interfaces (IPv4 und IPv6)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true,
      },
    },
  },
});




