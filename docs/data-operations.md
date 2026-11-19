# 数据更新与发布运维

## 当前数据边界

- Safety Gate 使用欧盟委员会公开周报 XML：
  `https://ec.europa.eu/safety-gate-alerts/api/download/weeklyReport/list/xml/en`
- 默认同步最近 4 份周报，最多保留 120 条去重后的公开警报。
- 生成文件：`src/data/generated/safety-gate-snapshot.json`。
- `generatedAt` 表示快照核验日期；`latestReportDate` 表示所含最新周报日期。
- 每条记录必须保留数字 alert ID、官方 `alertDetail/<id>` 详情 URL、案件编号、周报引用、发布日期和至少一条公开措施；缺失或不匹配的记录会让同步失败。
- 快照必须通过官方来源、日期、唯一性、字段完整性和新鲜度校验；候选文件未通过校验前不会替换上一份快照。
- Safety Gate 的 `notifyingCountry` 只显示在 Safety Gate 证据区，不自动填入共用产品的 Market 字段；公开数据未说明市场时，Market 显示“公开警报未说明”。
- CRA SRP 需要登录，且不是公开案件库。CRA 产品级记录只能通过 [CRA review manifest](../src/data/craReview.ts) 由批准的数据负责人补充，不能由 Safety Gate 自动推导。

## 本地刷新

```bash
npm run data:sync -- --weeks=4 --limit=120
npm run data:check
npm run build
```

一键执行：

```bash
npm run build:live
```

普通 `npm run build` 使用已提交的快照，不依赖网络，便于可重复构建和回滚。

## 失败与回滚

同步器先写入带进程号的临时文件，只有抓取、解析、官方详情 URL / ID、日期、唯一性、措施和新鲜度校验全部成功后才原子替换快照。网络、XML 结构、字段或新鲜度失败时，旧快照保持不变。

发布前可以直接运行统一质量门：

```bash
npm run release:check
```

它覆盖以下检查：

1. `npm run data:check`
2. `npm test`
3. `npm run build`
4. Native 浏览器首屏与 CRA / GPSR 单线切换检查

如果刷新结果异常，拒绝或回滚刷新 PR 即可恢复上一份快照；不要手工把 Safety Gate 警报改写成 CRA 执法或罚款状态。

## 自动刷新

`.github/workflows/safety-gate-refresh.yml` 每周五 UTC 运行，也支持手动触发。工作流会同步、校验、测试、构建，上传快照与 `dist/` 审计产物，并创建数据刷新 PR；PR 必须经过数据负责人审阅后才能合并。它不会自动发布未经审阅的 CRA 记录。

## CRA 审阅清单

向 `src/data/craReview.ts` 添加记录前，必须确认：

- 产品匹配依据（品牌、型号、条码或内部产品 ID）；
- 若按 Safety Gate alert ID 匹配，必须填写 `safetyGateAlertId`，不能只依赖品牌 / 型号；
- CRA 报告 / 监管措施 / 整改期限的原始来源；
- `lastVerifiedAt` 和 `official-public` 或经批准的内部来源标记；
- 事件来源与时间线不会复用 Safety Gate 的 alert / recall 事件；
- 记录不会表达罚款、处罚金额或未经证实的因果关系。

## 官方参考

- [CRA 时间表 / 欧盟委员会摘要](https://digital-strategy.ec.europa.eu/en/policies/cra-summary)
- [Safety Gate 公开门户](https://ec.europa.eu/safety-gate-alerts/screen/webReport)
- [Safety Gate 统计与下载说明](https://webgate.acceptance.ec.europa.eu/safety-gate/screen/pages/statistical)
- [ENISA Single Reporting Platform](https://www.enisa.europa.eu/topics/product-security/vulnerability-services/eu-incident-response-and-cyber-crisis-management/single-reporting-platform-srp)
