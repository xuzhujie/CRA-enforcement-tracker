# CRA 产品级审核清单指南

当前 `src/data/craReview.ts` 中的 `craReviewRecords` 为空，这是有意的安全默认值：没有经批准的产品级 CRA 证据时，运行时显示 `尚未核验`，不表示合规，也不表示不存在风险或案件。

## 允许的匹配键

每条审核记录至少需要一种匹配方式：

- `productId`：看板产品 ID；
- `safetyGateAlertId`：官方 Safety Gate 数字 alert ID；
- `brand` + `model`：只有在产品身份已由责任人确认时使用。

优先使用 `productId` 或 `safetyGateAlertId`。品牌和型号不能单独作为模糊匹配键。

## CRA 记录必填内容

| 字段 | 要求 |
| --- | --- |
| `record.status` | `compliant`、`in-progress`、`attention` 或 `overdue`；已批准记录不能是 `not-reviewed` |
| `record.reportingStatus` | 制造商报告义务的可核验状态 |
| `record.regulatoryMeasure` | 独立 CRA 监管措施；不能从 Safety Gate 措施复制 |
| `record.remediationDeadline` | 有来源支持时填写，使用 `YYYY-MM-DD` |
| `record.events` | CRA 报告 / 措施 / 整改事件；不复用 Safety Gate 时间线 |
| `record.evidence` | 产品级证据摘要 |
| `record.sourceUrl` | 原始来源 URL |
| `record.lastVerifiedAt` | 最后核验日期 |
| `record.provenance` | 不能使用 `illustrative-demo` |

## 接入流程

1. CRA / 合规负责人核对原始文件、产品匹配键和事件日期。
2. 在 `craReviewRecords` 中加入记录；不要把示例或推断内容写入运行时。
3. 运行 `npm run data:check`、`npm test` 和 `npm run release:check`。
4. 通过 PR 由 CRA / 合规负责人和产品安全负责人分别审阅。

ENISA Single Reporting Platform 的提交入口不等于公开案件库；没有可公开核验的产品级证据时，继续保留 `not-reviewed`。
