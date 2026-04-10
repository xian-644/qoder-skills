---
name: git-commit-workflow
description: 规范化的 Git 代码提交流程，适用于 IntelligentReview 项目。当用户要求"提交代码"、"commit"、"push代码"时自动触发，确保代码提交前经过检查、拉取最新代码、用户确认等完整流程。
---

# Git 代码提交流程

## 触发条件

当用户说出以下任一指令时触发：
- "提交代码"
- "commit"
- "push代码"
- "提交"

## 提交流程（必须严格执行）

### 步骤 1: 暂存当前修改
```bash
git stash
```

### 步骤 2: 拉取远端最新代码
```bash
git pull
```

### 步骤 3: 恢复本地修改
```bash
git stash pop
```

**冲突检测与处理：**

执行 `git stash pop` 后，立即检查是否存在冲突：

```bash
git diff --check
git status
```

**情况 A: 无冲突**
- 继续执行步骤 4

**情况 B: 存在冲突**
- **立即停止提交流程**
- 向用户报告冲突文件列表
- 引导用户解决冲突（见下方"冲突解决指南"）
- **等待用户确认冲突已解决后**，再继续步骤 4

### 冲突解决指南

当检测到冲突时，按以下方式提示用户：

```
⚠️ 发现代码冲突！

冲突文件：
- src/views/rulebook/rule/addRuleDialog/index.vue
- src/views/rulebook/rule/addRuleDialog/ruleJson.js

请按以下步骤解决冲突：
1. 在编辑器中打开冲突文件
2. 搜索冲突标记（<<<<<<< HEAD / ======= / >>>>>>>）
3. 手动合并代码，保留需要的部分
4. 删除冲突标记
5. 保存文件
6. 执行 `git add .` 标记冲突已解决

完成后请告诉我"冲突已解决"，我将继续提交流程。
```

### 步骤 4: 代码检查
对修改的代码进行全面检查：
- [ ] 语法错误检查
- [ ] 逻辑漏洞检查
- [ ] 是否影响之前的功能
- [ ] 是否符合项目代码规范

### 步骤 5: 给出检查结论
向用户报告检查结果，明确说明：
- 修改了哪些文件
- 是否存在问题
- 是否可以提交

### 步骤 6: 等待用户确认
**必须等待用户明确确认后**，才能执行提交操作。

### 步骤 7: 执行提交

#### 7.1 添加文件
```bash
git add .
```

#### 7.2 提交信息格式
```
类型: 描述 ---- by wangchuxian
```

**类型说明：**
- `feat`: 新功能/调整
- `fix`: Bug 修复

**示例：**
```bash
git commit -m "feat: 新增规则库表单组件 ---- by wangchuxian"
git commit -m "fix: 修复样本干扰组件变量绑定问题 ----by wangchuxian"
```

#### 7.3 推送到远端
```bash
git push
```

## 重要约束

### 禁止行为
- **禁止执行构建打包**（如 `npm run build`、`pnpm build` 等）
- 仅完成纯 Git 版本控制操作

### 提交信息规范
- 描述控制在 30 字左右
- 必须包含 `---- by wangchuxian` 或 `----by wangchuxian`
- 新功能用 `feat:`，修复用 `fix:`

## 完整示例对话

### 场景 1: 正常提交流程（无冲突）

**用户**: 提交代码

**Agent**:
1. 执行 `git stash`
2. 执行 `git pull`
3. 执行 `git stash pop`
4. 检查冲突 → 无冲突 ✓
5. 检查代码...
6. 报告：本次修改了 src/views/rulebook/ 下的 3 个文件，新增 2 个组件，经检查无语法错误，可以提交。
7. 询问：是否确认提交？

**用户**: 确认

**Agent**:
8. 执行 `git add .`
9. 执行 `git commit -m "feat: 新增规则库表单组件 ---- by wangchuxian"`
10. 执行 `git push`
11. 报告提交成功

### 场景 2: 存在代码冲突

**用户**: 提交代码

**Agent**:
1. 执行 `git stash`
2. 执行 `git pull`
3. 执行 `git stash pop`
4. 检查冲突 → ⚠️ 发现冲突！

**Agent**:
```
⚠️ 发现代码冲突！

冲突文件：
- src/views/rulebook/rule/addRuleDialog/index.vue
- src/views/rulebook/rule/addRuleDialog/ruleJson.js

请按以下步骤解决冲突：
1. 在编辑器中打开冲突文件
2. 搜索冲突标记（<<<<<<< HEAD / ======= / >>>>>>>）
3. 手动合并代码，保留需要的部分
4. 删除冲突标记
5. 保存文件
6. 执行 `git add .` 标记冲突已解决

完成后请告诉我"冲突已解决"，我将继续提交流程。
```

**用户**: 冲突已解决

**Agent**:
7. 验证冲突已解决 → ✓
8. 检查代码...
9. 报告：冲突已解决，修改了 2 个文件，可以提交。
10. 询问：是否确认提交？

**用户**: 确认

**Agent**:
11. 执行 `git add .`
12. 执行 `git commit -m "feat: 新增规则库表单组件 ---- by wangchuxian"`
13. 执行 `git push`
14. 报告提交成功
