# CRA / GPSR 看板合规审阅边界

日期：2026-11-20  
状态：实现约束与人工审阅清单；不构成法律意见。

## 结论

本看板把同一产品的两类证据并列展示，但不把它们合并成一个执法案件：

- CRA 线只记录制造商报告义务、监管措施、整改期限及可核验的 CRA 证据。
- GPSR / Safety Gate 线只记录公开安全警报、风险、下架 / 撤回 / 召回及后续跟进。
- Safety Gate 警报不等于 CRA 执法；召回不等于罚款。
- ENISA Single Reporting Platform（SRP）用于受限报告提交和处理，不是公开处罚库；看板不读取或推断 SRP 私有报告。

## 数据来源政策

| 数据类别 | 允许来源 | 看板处理 | 禁止推断 |
| --- | --- | --- | --- |
| CRA 适用日期、报告节点、义务说明 | [欧盟委员会 CRA 摘要](https://digital-strategy.ec.europa.eu/en/policies/cra-summary) | 作为规则与来源卡 | 不推断某产品已经被执法 |
| CRA 产品级报告 / 措施 | 经批准的内部或官方可核验证据 | 标记来源、核验日期和覆盖状态 | 不从 Safety Gate 记录生成 CRA 案件 |
| Safety Gate 警报 | [Safety Gate 官方公开门户](https://ec.europa.eu/safety-gate-alerts/screen/webReport) 与 [官方周报 XML](https://ec.europa.eu/safety-gate-alerts/api/download/weeklyReport/list/xml/en) | 生成公开快照，保留 alert ID 和详情链接 | 不把公开警报改写成罚款或 CRA 处罚 |
| CRA 报告入口 | [ENISA SRP 说明](https://www.enisa.europa.eu/topics/product-security/vulnerability-services/eu-incident-response-and-cyber-crisis-management/single-reporting-platform-srp) | 作为报告平台入口 | 不把 SRP 当作公开案件库 |

## 状态词审核

- `尚未核验`：当前没有可用的 CRA 产品级证据；不是“合规”，也不是“没有问题”。
- `当前同步数据集中未发现公开记录`：只描述本次公开数据快照的覆盖结果；不是全市场否定。
- `整改逾期`：只有在记录的 CRA 整改期限已过且记录仍处于开放 / 非合规状态时使用。
- `公开召回`、`下架 / 撤回`：只表示 Safety Gate 公开措施，不表示罚款、处罚金额或 CRA 执法结论。
- Safety Gate 的通知国家不是产品销售市场；公开警报未说明市场时，共用 Market 字段保持“公开警报未说明”。
- 只有逐条公开记录才显示“官方来源”；CRA `尚未核验` 即使链接 CRA 官方说明页，也不显示为产品级官方证据。
- `看板状态`：是两条证据线的工作台摘要，不是法律结论。

## 上线前人工签核

- [ ] 业务负责人确认产品匹配字段（品牌、型号、条码、市场）和同一产品归并规则。
- [ ] CRA 记录负责人逐条确认来源、核验日期、报告节点与整改期限。
- [ ] 产品安全负责人逐条确认 Safety Gate alert ID、风险和措施类型。
- [ ] 法务 / 合规负责人复核页面文案、免责声明和外部发布范围。
- [ ] 发布负责人确认数据刷新失败时保留上一个已验证快照，不发布半成品。
