# 发布签核单

状态：技术门已通过；代码基线 `8334bae` 和交接状态提交 `6d234b6` 已推送到 `origin/main`。GitHub 已显示 workflow，但尚无运行记录；CLI 认证、责任人和业务 / 法务签核待补。

## 技术门

- [x] 官方 Safety Gate 快照可离线构建
- [x] 快照更新失败时保留上一份已验证快照
- [x] CRA 与 Safety Gate 独立建模
- [x] `npm run data:check`
- [x] `npm test`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Native 三模式、详情来源和键盘行选择已复核
- [x] 本地 Git `main` 基线已提交
- [x] GitHub Actions workflow 已进入目标仓库
- [ ] GitHub Actions 已手动运行并确认 artifact / 刷新 PR

## 业务签核

| 签核项 | 负责人 | 状态 | 日期 |
| --- | --- | --- | --- |
| Safety Gate 数据质量 | 待指定 | 待签 | — |
| 产品安全分类 | 待指定 | 待签 | — |
| CRA 产品级证据 | 待指定 | 待签；当前无记录 | — |
| CRA / 法务合规边界 | 待指定 | 待签 | — |
| 外部发布范围 | 待指定 | 待签 | — |

## 发布决定

在 GitHub remote、责任人和业务 / 法务签核补齐前，只允许作为内部研究看板使用。签核完成后，发布负责人应在 PR 中附上 `npm run release:check` 输出，并保留上一份快照的回滚路径。
