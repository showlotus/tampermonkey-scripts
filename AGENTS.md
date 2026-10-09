# AGENTS.md

Tampermonkey 用户脚本集合，pnpm monorepo（workspace = `packages/*` + `templates/*`）。

## 两类脚本（先分清再动手）

- **单文件纯 JS 脚本**：如 `packages/bilibili-comment-ip/index.js`，Userscript 元数据写在文件头，无 package.json、无构建。直接编辑 `index.js`，版本号等元数据在 `==UserScript==` 注释块内维护。
- **Vite 构建脚本**：如 `packages/peek-media`、`packages/bilibili-video-note-export*`，入口 `src/main.ts(x)`，用 `vite-plugin-monkey` 打包成 `.user.js`。元数据（namespace、match 等）在 `vite.config.ts` 的 `monkey()` 配置中，不在源码里。

## 常用命令

```bash
pnpm install                                # 根目录安装（含全部 workspace 包）
pnpm typecheck                              # 全部 TS 包类型检查

cd packages/<name>
pnpm dev      # Vite 构建类脚本：启动 dev server，产出可安装的 userscript URL
pnpm build    # peek-media 还会先生成 tailwind CSS
```

新建脚本用 `new-script` skill（对话式收集名称与模板，底层执行 `node scripts/createNewScript.js <name> --template <js|lit|vue|react>`），`pnpm new` 命令已移除。

## 仓库特有的坑

- **无测试、无 ESLint**（只有 Prettier）。类型检查入口是根目录 `pnpm typecheck`；各 TS 包单独跑 `pnpm typecheck`，其中 **v2 必须用 `tsc -b`**（solution 风格 tsconfig，裸 `tsc` 会空转不检查）。
- **pnpm ≥12 的 build scripts 审批**已通过 `pnpm-workspace.yaml` 的 `allowBuilds`（esbuild、@tailwindcss/oxide）放行；若未来新增依赖触发 `ERR_PNPM_IGNORED_BUILDS`，按同样方式补条目。
- **`packages/peek-media` 的 Tailwind 是独立步骤**：`build = build:tailwind && tsc && vite build`，产出 `src/tailwind.generated.css`（生成文件勿手改）；dev 时需另开 `pnpm watch:tailwind`。
- **`packages/bilibili-video-note-export/dist` 被提交到 git**（`.gitignore` 特意排除），作为可安装产物；该包构建后需确认 dist 变更。其余包的 `dist` 一律忽略。
- **`@tampermonkey-scripts/utils` 是 workspace 共享库**：`bilibili-video-note-export-v2` 虽声明了 `workspace:*` 依赖，但 vite.config.ts 通过 alias 直接指向源码 `../utils/index.ts`（不走 dist），改 utils 源码会直接影响 v2 构建。

## 代码风格

根 `.prettierrc.json`：无分号、单引号、printWidth 100、trailingComma `none`、arrowParens `avoid`。
