# CRA / GPSR · Shared Product Board

[![CI](https://github.com/xuzhujie/CRA-enforcement-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/xuzhujie/CRA-enforcement-tracker/actions/workflows/ci.yml)

一个以产品为锚点的 EU CRA / GPSR · Safety Gate 双轨看板。

## 数据边界

- Safety Gate 线使用欧盟委员会公开周报 XML，并提交规范化快照到 `src/data/generated/safety-gate-snapshot.json`。
- CRA 线不从 Safety Gate 警报推断案件、监管措施、罚款或合规结论；没有经批准的产品级输入时显示 `尚未核验`。
- ENISA Single Reporting Platform 是报告入口，不是公开处罚库。

详见：[合规审阅](docs/compliance-review.md)、[CRA 清单指南](docs/cra-review-manifest.md)、[数据运维](docs/data-operations.md)、[责任矩阵](docs/ownership.md)、[发布签核](docs/release-signoff.md)、[GitHub 接入 Runbook](docs/github-setup.md)。

## 本地运行

```bash
npm ci
npm run dev
```

默认构建使用已提交快照，不需要网络：

```bash
npm run build
```

刷新官方数据并完成构建：

```bash
npm run build:live
```

发布前质量门：

```bash
npm run release:check
```

## GitHub Actions

`.github/workflows/safety-gate-refresh.yml` 每周五 UTC 运行，也支持手动触发。它会同步、校验、测试、构建、上传快照和 `dist/` 审计产物，并创建待审阅 PR；不会自动发布未经审阅的 CRA 记录。

`.github/workflows/ci.yml` 在推送到 `main` 或创建 PR 时运行 `npm run release:check`，作为日常质量门。

推送到 GitHub 后，请在仓库 Actions 设置中确认工作流已启用，并为刷新 PR 指定数据负责人和产品安全审阅人。
