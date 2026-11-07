import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';
import { whop } from '@whop/cli/vite';
export default defineConfig({plugins:[cloudflare({ viteEnvironment: { name: 'server' } }),react(), ...whop()]});
