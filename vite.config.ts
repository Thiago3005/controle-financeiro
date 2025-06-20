
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

// Helper to get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/controle-financeiro/',
      define: {
        // Maintaining both for compatibility, though GEMINI_API_KEY is preferred for genai SDK
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY), 
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'), // path.resolve with '.' on __dirname just results in __dirname
        }
      }
    };
});