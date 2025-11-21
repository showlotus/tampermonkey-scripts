#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs-extra')

// 解析命令行参数
const args = process.argv.slice(2)
const scriptName = args[0]
const templateIndex = args.indexOf('--template')
const templateType = templateIndex !== -1 ? args[templateIndex + 1] : null

// 有效的模板类型
const validTemplates = ['js', 'lit', 'vue', 'react']

// 参数验证
if (!scriptName) {
  console.error('❌ 请提供插件名称')
  console.log('使用方法: node createNewScript.js <插件名称> --template <模板类型>')
  console.log(`可用的模板类型: ${validTemplates.join(', ')}`)
  process.exit(1)
}

if (!templateType) {
  console.error('❌ 请指定模板类型')
  console.log('使用方法: node createNewScript.js <插件名称> --template <模板类型>')
  console.log(`可用的模板类型: ${validTemplates.join(', ')}`)
  process.exit(1)
}

if (!validTemplates.includes(templateType)) {
  console.error(`❌ 无效的模板类型: ${templateType}`)
  console.log(`可用的模板类型: ${validTemplates.join(', ')}`)
  process.exit(1)
}

// 定义路径
const templateDir = path.join(__dirname, '../templates', templateType)
const targetDir = path.join(__dirname, '../packages', scriptName)

// 检查模板目录是否存在
if (!fs.existsSync(templateDir)) {
  console.error(`❌ 模板目录不存在: ${templateDir}`)
  process.exit(1)
}

// 检查目标目录是否已存在
if (fs.existsSync(targetDir)) {
  console.error(`❌ 目录 ${scriptName} 已存在`)
  process.exit(1)
}

// 复制模板到目标目录
console.log(`📦 正在从 ${templateType} 模板创建新项目 ${scriptName}...`)
fs.copySync(templateDir, targetDir, {
  filter: src => {
    // 排除 node_modules 和其他不需要的文件
    const relativePath = path.relative(templateDir, src)
    return (
      !relativePath.includes('node_modules') &&
      !relativePath.includes('dist') &&
      !relativePath.includes('package-lock.json')
    )
  }
})

// 获取模板名称用于替换
const templateName = `tampermonkey-scripts-template-${templateType}`

// 更新 package.json
const packageJsonPath = path.join(targetDir, 'package.json')
if (fs.existsSync(packageJsonPath)) {
  const packageJson = fs.readJsonSync(packageJsonPath)
  packageJson.name = scriptName
  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 })
  console.log('✅ 已更新 package.json')
}

// 更新 README.md
const readmePath = path.join(targetDir, 'README.md')
if (fs.existsSync(readmePath)) {
  let readme = fs.readFileSync(readmePath, 'utf-8')
  readme = readme.replace(new RegExp(templateName, 'g'), scriptName)
  fs.writeFileSync(readmePath, `# ${scriptName}\n\nTampermonkey script for ${scriptName}`)
  console.log('✅ 已更新 README.md')
}

// 更新 vite.config.ts
const viteConfigPath = path.join(targetDir, 'vite.config.ts')
if (fs.existsSync(viteConfigPath)) {
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8')
  viteConfig = viteConfig.replace(
    new RegExp(`namespace: ['"]${templateName}['"]`, 'g'),
    `namespace: '${scriptName}'`
  )
  fs.writeFileSync(viteConfigPath, viteConfig)
  console.log('✅ 已更新 vite.config.ts')
}

// 更新 tailwind.config.ts（如果存在）
const tailwindConfigPath = path.join(targetDir, 'tailwind.config.ts')
if (fs.existsSync(tailwindConfigPath)) {
  let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf-8')
  // 处理 important 字段（js、react 模板有，vue 模板被注释）
  tailwindConfig = tailwindConfig.replace(
    new RegExp(`important: ['"]#${templateName}['"]`, 'g'),
    `important: '#${scriptName}'`
  )
  // 处理注释中的 important 字段（vue 模板）
  tailwindConfig = tailwindConfig.replace(
    new RegExp(`// important: ['"]#${templateName}['"]`, 'g'),
    `// important: '#${scriptName}'`
  )
  fs.writeFileSync(tailwindConfigPath, tailwindConfig)
  console.log('✅ 已更新 tailwind.config.ts')
}

// 更新 main.ts 或 main.tsx
const mainTsPath = path.join(targetDir, 'src/main.ts')
const mainTsxPath = path.join(targetDir, 'src/main.tsx')

if (fs.existsSync(mainTsPath)) {
  let mainTs = fs.readFileSync(mainTsPath, 'utf-8')
  // 替换 APP_ID 常量（js 模板）
  mainTs = mainTs.replace(
    new RegExp(`const APP_ID = ['"]${templateName}['"]`, 'g'),
    `const APP_ID = '${scriptName}'`
  )
  // 替换 setAttribute('id', ...) （vue 模板）
  mainTs = mainTs.replace(
    new RegExp(`setAttribute\\(['"]id['"], ['"]${templateName}['"]\\)`, 'g'),
    `setAttribute('id', '${scriptName}')`
  )
  fs.writeFileSync(mainTsPath, mainTs)
  console.log('✅ 已更新 src/main.ts')
}

if (fs.existsSync(mainTsxPath)) {
  let mainTsx = fs.readFileSync(mainTsxPath, 'utf-8')
  // 替换 setAttribute('id', ...) （react 模板）
  mainTsx = mainTsx.replace(
    new RegExp(`setAttribute\\(['"]id['"], ['"]${templateName}['"]\\)`, 'g'),
    `setAttribute('id', '${scriptName}')`
  )
  fs.writeFileSync(mainTsxPath, mainTsx)
  console.log('✅ 已更新 src/main.tsx')
}

console.log('')
console.log(`✅ 项目 ${scriptName} 创建成功！`)
console.log(`📂 项目路径: ${targetDir}`)
console.log(`📝 模板类型: ${templateType}`)
console.log('')
console.log('📥 下一步：进入项目目录并安装依赖')
console.log(`   cd packages/${scriptName}`)
console.log('   pnpm install')
