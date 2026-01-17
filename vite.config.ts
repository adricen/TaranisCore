import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      'core': '/src/core',
      'components': '/src/core/components',
    }
  },
  test: {
    globals: true,  // Active les globaux comme `describe`, `it`, etc.
    exclude: [...configDefaults.exclude],  // Exclut node_modules
    environment: 'happy-dom', // Utilise happy-dom comme environnement de test
    coverage: {
      provider: 'v8',  // Pour la couverture de code (optionnel)
    },
  },
})
