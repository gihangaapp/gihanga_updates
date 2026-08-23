// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Deploy target: this app is deployed on Vercel. The default nitro preset
  // is "cloudflare-module" (from @lovable.dev/vite-tanstack-config), which
  // does not run on Vercel's build output — so it's explicitly overridden
  // to Vercel's Nitro preset here. process.env.VERCEL is set automatically
  // by Vercel's build environment; locally/elsewhere this falls back to the
  // "node-server" preset, so `npm run build` + `npm run preview` still work.
  nitro: {
    preset: process.env.VERCEL ? "vercel" : "node-server",
  },
});
