# i18n-mcp

多语言翻译管理 MCP 服务，用于扫描、查找和替换项目中的 i18n 文件。

## 功能

- **scan_i18n_files** - 扫描项目中的语言文件
- **find_key_by_text** - 根据中文文本查找 key
- **replace_translation** - 替换指定 key 的翻译
- **add_new_key** - 添加新的翻译 key

## 安装

```bash
npm install
```

## 使用

### 在 Qoder 中配置

在 `~/.qoderwork/mcp.json` 中添加：

```json
{
  "mcpServers": {
    "i18n": {
      "command": "node",
      "args": ["C:/Users/maccura/.qoderwork/workspace/mns8a0zw8eqcthdh/i18n-mcp/index.js"]
    }
  }
}
```

### 使用示例

1. 扫描项目语言文件：
   ```
   扫描 /path/to/project 的 i18n 文件
   ```

2. 根据中文查找 key：
   ```
   查找包含"提交"的 key
   ```

3. 替换翻译：
   ```
   把 common.button.submit 的英文改成 "Confirm"
   ```

4. 添加新 key：
   ```
   添加新 key common.button.cancel，中文"取消"，英文"Cancel"
   ```

## 支持的目录结构

```
project/
├── src/i18n/
│   ├── zh.json
│   └── en.json
├── src/locales/
│   ├── zh/
│   │   └── common.json
│   └── en/
│       └── common.json
└── public/locales/
    ├── zh/
    └── en/
```
