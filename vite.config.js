import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { whop } from '@whop/cli/vite';
export default defineConfig({plugins:[react(), ...whop()],build:process.env.WHOP_SERVER?{rollupOptions:{output:{entryFileNames:'index.js'}}}:undefined});
