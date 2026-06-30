import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = dirname(fileURLToPath(import.meta.url));

// 多入口构建：每个页面一个 HTML 入口，产物落在 dist/ 下并保持原有 URL 结构。
// 现有 Node 服务（server.mjs）会优先从 dist/ 提供这些产物，未迁移的页面回退到项目根目录。
export default defineConfig({
  plugins: [react()],
  // 模组图片等静态资源仍由 server.mjs 从项目根目录的 assets/ 提供，
  // 这里关闭 Vite 的 public 目录拷贝，避免重复与混淆。
  publicDir: false,
  resolve: {
    alias: {
      "@shared": resolve(root, "src/shared"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // 构建产物放在 app-assets/，与模组图片目录 /assets/ 区分开。
    assetsDir: "app-assets",
    rollupOptions: {
      input: {
        home: resolve(root, "index.html"),
        kp: resolve(root, "kp-site/index.html"),
        player: resolve(root, "player/index.html"),
      },
    },
  },
});
