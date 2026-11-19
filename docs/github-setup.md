# GitHub 接入 Runbook

当前状态：本地 `main` 已初始化，基线提交为 `a618c1b`；没有 `origin` remote。GitHub CLI 的本地 token 已失效，因此远端创建和首次推送必须由仓库维护人完成或在重新认证后执行。

## 首次接入

在 GitHub 创建一个空仓库，建议仓库名为 `CRA-enforcement-tracker`。不要在创建时自动生成 README、`.gitignore` 或 license，避免覆盖本地基线。

```bash
gh auth login -h github.com
git remote add origin https://github.com/<owner>/CRA-enforcement-tracker.git
git push -u origin main
```

如果已存在同名仓库，应先确认它是本项目目标仓库，再使用对应 URL；不要把代码推送到不明 remote。

## Actions 与审阅规则

1. 在仓库 Settings → Actions → General 中启用 Actions。
2. 手动运行 `Refresh Safety Gate snapshot` 一次，确认 `data:sync`、`release:check` 和 artifact 上传通过。
3. 将 `docs/ownership.md` 中的负责人替换为真实 GitHub handle。
4. 为 `main` 设置 PR review 要求，至少覆盖 Safety Gate 数据负责人、产品安全负责人和 CRA / 合规负责人。
5. 对自动刷新 PR 保留合并前审阅；不要启用绕过审阅的自动发布。

## 验证

```bash
git remote -v
git status --short --branch
npm run release:check
```

目标仓库未接入前，发布签核单保持“技术门已通过、外部 Actions 待启用”。
