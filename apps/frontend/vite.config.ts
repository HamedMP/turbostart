import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

// Deployment target: 'bun' (VPS/Docker) or 'cloudflare_module' (Cloudflare Workers)
const preset = (process.env.NITRO_PRESET || 'bun') as 'bun' | 'cloudflare_module'
const isCloudflare = preset === 'cloudflare_module'

const config = defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/styles.css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  plugins: [
    devtools(),
    nitro({
      preset,
      // Cloudflare Workers configuration
      ...(isCloudflare && {
        compatibilityDate: '2024-09-19',
        cloudflare: {
          deployConfig: true,
          nodeCompat: true,
        },
      }),
      routeRules: {
        // Static assets with long cache (1 year)
        '/*.webp': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        '/*.png': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        // Backend proxy (only for VPS deployment with backend)
        ...(!isCloudflare && {
          '/public/**': {
            proxy: process.env.BACKEND_INTERNAL_URL
              ? `${process.env.BACKEND_INTERNAL_URL}/public/**`
              : 'http://localhost:4000/public/**',
          },
          '/health': {
            proxy: process.env.BACKEND_INTERNAL_URL
              ? `${process.env.BACKEND_INTERNAL_URL}/health`
              : 'http://localhost:4000/health',
          },
        }),
      },
    }),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      tsr: {
        // Use src directory for temp files to avoid cross-device link issues in Docker
        generatedRouteTree: './src/routeTree.gen.ts',
      },
    }),
    viteReact(),
  ],
})

export default config
