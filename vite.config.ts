import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'three', test: /node_modules[\\/](three|postprocessing|maath|troika-[a-z-]+|bidi-js|webgl-sdf-generator)[\\/]/ },
            { name: 'r3f', test: /node_modules[\\/]@react-three[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler|its-fine|react-reconciler|zustand|suspend-react|react-use-measure|@use-gesture)[\\/]/ },
            { name: 'gsap', test: /node_modules[\\/](gsap|lenis)[\\/]/ },
          ],
        },
      },
    },
  },
});
