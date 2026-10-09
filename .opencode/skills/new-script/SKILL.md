---
name: new-script
description: 通过对话快速创建一个新的 Tampermonkey 用户脚本包，收集脚本名与模板选择后调用 scripts/createNewScript.js 完成
---

## 流程

1. 确定脚本名称（kebab-case，如 `bilibili-comment-ip`）：
   - 用户已在对话中给出 → 直接使用
   - 未给出 → 用 question 工具询问
2. 确定模板类型（js | lit | vue | react）：
   - 用户已明确指定 → 直接使用
   - 未指定 → 用 question 工具让用户选择，并说明区别：
     - js：原生 TS，无 UI 框架，最轻量
     - lit：Lit Web Components
     - vue：Vue 3
     - react：React
3. 在仓库根目录执行创建命令：

   ```bash
   node scripts/createNewScript.js <name> --template <template>
   ```

4. 展示脚本输出，并提示后续步骤（不要自动执行，由用户自行运行）：

   ```bash
   pnpm install
   cd packages/<name> && pnpm dev
   ```

## 约束

- 创建动作必须通过 `scripts/createNewScript.js` 执行，禁止手工复制模板目录或替换文件内容
- 名称不是 kebab-case、模板无效或 `packages/<name>` 已存在时脚本会报错退出，修正后重新执行
- 创建完成后不要自动执行 `pnpm install`、不要自动启动 dev server
