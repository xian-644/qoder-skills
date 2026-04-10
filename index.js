#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// 创建 MCP 服务器
const server = new McpServer({
  name: 'i18n-mcp',
  version: '1.0.0'
});

// ========== Tools ==========

// 注册工具：扫描 i18n 文件
server.registerTool(
  'scan_i18n_files',
  {
    title: '扫描 i18n 文件',
    description: '扫描项目中的 i18n 语言文件，查找 src/i18n、src/locales、public/locales 等目录下的 JSON 语言文件',
    inputSchema: z.object({
      projectPath: z.string().describe('项目根目录路径')
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true
    }
  },
  async ({ projectPath }) => {
    try {
      return await scanI18nFiles(projectPath);
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `错误: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// 注册工具：根据文本查找 key
server.registerTool(
  'find_key_by_text',
  {
    title: '查找 Key',
    description: '根据中文文本查找对应的 key，支持在所有语言文件中搜索',
    inputSchema: z.object({
      projectPath: z.string().describe('项目根目录路径'),
      text: z.string().describe('要查找的中文文本'),
      lang: z.string().optional().default('zh').describe('语言代码，默认 zh')
    }),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true
    }
  },
  async ({ projectPath, text, lang }) => {
    try {
      return await findKeyByText(projectPath, text, lang);
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `错误: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// 注册工具：替换翻译
server.registerTool(
  'replace_translation',
  {
    title: '替换翻译',
    description: '替换指定 key 的翻译内容，支持嵌套 key（如 "common.button.submit"）',
    inputSchema: z.object({
      projectPath: z.string().describe('项目根目录路径'),
      key: z.string().describe('要替换的 key'),
      lang: z.string().describe('目标语言代码'),
      newValue: z.string().describe('新的翻译内容')
    }),
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true
    }
  },
  async ({ projectPath, key, lang, newValue }) => {
    try {
      return await replaceTranslation(projectPath, key, lang, newValue);
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `错误: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// 注册工具：添加新 key
server.registerTool(
  'add_new_key',
  {
    title: '添加新 Key',
    description: '添加新的翻译 key 到所有语言文件，支持嵌套 key',
    inputSchema: z.object({
      projectPath: z.string().describe('项目根目录路径'),
      key: z.string().describe('新的 key'),
      translations: z.record(z.string()).describe('各语言的翻译内容，如 { zh: "中文", en: "English" }')
    }),
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false
    }
  },
  async ({ projectPath, key, translations }) => {
    try {
      return await addNewKey(projectPath, key, translations);
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `错误: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// ========== Resources ==========

// 注册资源：已扫描的项目列表
server.registerResource(
  'projects',
  'i18n://projects',
  {
    title: '已扫描的项目列表',
    description: '显示已扫描的 i18n 项目列表信息'
  },
  async (uri) => {
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify({ message: '使用 scan_i18n_files 工具扫描项目' }, null, 2)
      }]
    };
  }
);

// ========== 工具实现 ==========

// 扫描 i18n 文件
async function scanI18nFiles(projectPath) {
  const i18nDir = path.join(projectPath, 'src', 'i18n');
  const localesDir = path.join(projectPath, 'src', 'locales');
  const publicLocalesDir = path.join(projectPath, 'public', 'locales');
  
  const possibleDirs = [i18nDir, localesDir, publicLocalesDir];
  const foundFiles = [];

  for (const dir of possibleDirs) {
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(dir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const stats = await fs.stat(filePath);
          foundFiles.push({
            path: filePath,
            name: file,
            size: stats.size,
            keyCount: countKeys(JSON.parse(content))
          });
        }
      }
    } catch (e) {
      // 目录不存在，跳过
    }
  }

  return {
    content: [{
      type: 'text',
      text: `找到 ${foundFiles.length} 个语言文件:\n\n${foundFiles.map(f => 
        `- ${f.name} (${f.keyCount} 个 key, ${f.size} bytes)`
      ).join('\n')}`
    }]
  };
}

// 根据文本查找 key
async function findKeyByText(projectPath, text, lang) {
  const files = await findLangFiles(projectPath);
  const results = [];

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const data = JSON.parse(content);
      const matches = searchInObject(data, text);
      
      if (matches.length > 0) {
        results.push({
          file: path.basename(file),
          matches
        });
      }
    } catch (e) {
      // 解析失败，跳过
    }
  }

  if (results.length === 0) {
    return {
      content: [{
        type: 'text',
        text: `未找到包含 "${text}" 的 key`
      }]
    };
  }

  return {
    content: [{
      type: 'text',
      text: `找到 ${results.length} 个匹配:\n\n${results.map(r => 
        `文件: ${r.file}\n${r.matches.map(m => `  - ${m.key}: "${m.value}"`).join('\n')}`
      ).join('\n\n')}`
    }]
  };
}

// 替换翻译
async function replaceTranslation(projectPath, key, lang, newValue) {
  const files = await findLangFiles(projectPath);
  const targetFile = files.find(f => f.includes(lang) || path.basename(f, '.json') === lang);
  
  if (!targetFile) {
    throw new Error(`未找到语言文件: ${lang}`);
  }

  const content = await fs.readFile(targetFile, 'utf-8');
  const data = JSON.parse(content);
  
  // 支持嵌套 key，如 "common.button.submit"
  const keys = key.split('.');
  let current = data;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      throw new Error(`Key 不存在: ${key}`);
    }
    current = current[keys[i]];
  }
  
  const lastKey = keys[keys.length - 1];
  if (!(lastKey in current)) {
    throw new Error(`Key 不存在: ${key}`);
  }
  
  const oldValue = current[lastKey];
  current[lastKey] = newValue;
  
  await fs.writeFile(targetFile, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  
  return {
    content: [{
      type: 'text',
      text: `✅ 替换成功!\n文件: ${path.basename(targetFile)}\nkey: ${key}\n旧值: "${oldValue}"\n新值: "${newValue}"`
    }]
  };
}

// 添加新 key
async function addNewKey(projectPath, key, translations) {
  const files = await findLangFiles(projectPath);
  const results = [];

  for (const [lang, value] of Object.entries(translations)) {
    const targetFile = files.find(f => 
      f.includes(lang) || path.basename(f, '.json') === lang
    );
    
    if (!targetFile) {
      results.push({ lang, status: 'skipped', reason: '文件不存在' });
      continue;
    }

    const content = await fs.readFile(targetFile, 'utf-8');
    const data = JSON.parse(content);
    
    // 支持嵌套 key
    const keys = key.split('.');
    let current = data;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    await fs.writeFile(targetFile, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    results.push({ lang, status: 'success', file: path.basename(targetFile) });
  }

  return {
    content: [{
      type: 'text',
      text: `✅ 添加 key: "${key}"\n\n${results.map(r => 
        `- ${r.lang}: ${r.status}${r.file ? ` (${r.file})` : ''}${r.reason ? ` - ${r.reason}` : ''}`
      ).join('\n')}`
    }]
  };
}

// ========== 辅助函数 ==========

// 查找所有语言文件
async function findLangFiles(projectPath) {
  const dirs = [
    path.join(projectPath, 'src', 'i18n'),
    path.join(projectPath, 'src', 'locales'),
    path.join(projectPath, 'public', 'locales'),
    path.join(projectPath, 'locales')
  ];
  
  const files = [];
  
  for (const dir of dirs) {
    try {
      const entries = await fs.readdir(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          // 处理嵌套目录结构，如 locales/en/common.json
          const subEntries = await fs.readdir(fullPath);
          for (const subEntry of subEntries) {
            if (subEntry.endsWith('.json')) {
              files.push(path.join(fullPath, subEntry));
            }
          }
        } else if (entry.endsWith('.json')) {
          files.push(fullPath);
        }
      }
    } catch (e) {
      // 目录不存在，跳过
    }
  }
  
  return [...new Set(files)];
}

// 统计 key 数量
function countKeys(obj, prefix = '') {
  let count = 0;
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      count += countKeys(value, fullKey);
    } else {
      count++;
    }
  }
  return count;
}

// 在对象中搜索文本
function searchInObject(obj, searchText, currentKey = '') {
  const matches = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = currentKey ? `${currentKey}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      matches.push(...searchInObject(value, searchText, fullKey));
    } else if (String(value).includes(searchText)) {
      matches.push({ key: fullKey, value: String(value) });
    }
  }
  
  return matches;
}

// ========== 启动服务器 ==========

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('i18n-mcp server running on stdio');
}

main().catch(console.error);
