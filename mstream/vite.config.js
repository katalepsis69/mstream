import { defineConfig, loadEnv } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'MStream',
          short_name: 'MStream',
          description: 'Your favorite destination for movies and TV shows',
          theme_color: '#e50914',
          background_color: '#141414',
          display: 'standalone',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      },
    },
    build: {
      target: "es2022",
      outDir: "dist",
      assetsDir: "assets",
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://api.themoviedb.org/3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Add API key to all proxied requests
              if (env.VITE_TMDB_API_KEY) {
                const url = new URL(proxyReq.path, 'https://api.themoviedb.org');
                url.searchParams.append('api_key', env.VITE_TMDB_API_KEY);
                proxyReq.path = url.pathname + url.search;
              }
            });
          }
        }
      }
    }
  }
})