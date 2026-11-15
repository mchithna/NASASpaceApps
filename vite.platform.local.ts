import { defineConfig, mergeConfig } from 'vite'
import base from './vite.config.ts'
export default defineConfig(async (env) => mergeConfig(
  await (typeof base === 'function' ? base(env) : base),
  { server: { hmr: false, watch: null } },
))
