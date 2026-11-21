# GitHub 接入 Runbook

当前状态：本地 `main` 已同步到 `origin/main`。GitHub CI 已完成成功运行（包含 `npm run release:check`）；`Refresh Safety Gate snapshot` 已手动运行成功，artifact 已验收，[刷新 PR #1](https://github.com/xuzhujie/CRA-enforcement-tracker/pull/1) 已在 PR CI 通过后以 squash 方式合并，合并后的 `main` CI 也已成功。GitHub CLI 的本地 token 仍失效，但浏览器维护人登录态已足够完成手动运行和合并。

## 首次接入

在 GitHub 创建一个空仓库，建议仓库名为 `CRA-enforcement-tracker`。不要在创建时自动生成 README、`.gitignore` 或 license，避免覆盖本地基线。

```bash
gh auth login -h github.com
git remote add origin https://github.com/<owner>/CRA-enforcement-tracker.git
git push -u origin main
```

如果已存在同名仓库，应先确认它是本项目目标仓库，再使用对应 URL；不要把代码推送到不明 remote。当前目标仓库是 `https://github.com/xuzhujie/CRA-enforcement-tracker`。

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

目标仓库已接入后，发布签核单记录为“技术门已通过、CI 与刷新链路已成功”；后续 Safety Gate 刷新 PR 仍必须经过数据 / 产品安全审阅后才能合并。
