# CRA / GPSR 共用产品看板设计说明

- 日期：2026-11-19
- 状态：已批准；生产化扩展中（2026-11-20）
- 已选方向：共用产品看板 + CRA / GPSR · Safety Gate 两条独立线
- 视觉概念：[cra-gpsr-dashboard-concept.png](./assets/cra-gpsr-dashboard-concept.png)

## Intent

为法律、产品安全、产品安全工程与合规团队提供一个“以产品为锚点”的欧盟产品合规看板。用户可以用同一个品牌、型号、产品类型与市场记录，分别查看：

1. **CRA 线**：制造商报告义务、监管措施、整改期限与相关证据。
2. **GPSR / Safety Gate 线**：公开安全警报、风险描述、下架 / 撤回、召回及后续跟进。

两条线可以在同一个产品详情里并列查看，但不会被建模成同一件执法事件。页面必须持续提醒：**Safety Gate 警报不等于 CRA 执法；召回也不等于罚款。**

## Goals

- 延续相邻 DSA / DMA tracker 的 React + Vite、蓝色欧盟风格、驾驶舱 / 登记库 / 时间线 / 图表信息架构。
- 让产品、品牌、型号、产品类型、市场 / 国家这些字段只维护一份，并能在两条线中复用。
- 将 CRA 与 GPSR / Safety Gate 的状态、来源、日期、风险、措施和整改节点呈现在同一产品行的两个独立分区里。
- 支持总览、CRA 专视图、GPSR / Safety Gate 专视图；支持按品牌、型号、市场和关键词筛选。
- 选择一条产品记录后，打开产品详情侧栏，并展示分开的 CRA 证据、Safety Gate 证据与双泳道时间线。
- 历史测试夹具中的示例记录均明确标记为演示数据；运行时使用官方 Safety Gate 公开快照，CRA 产品级数据在没有批准输入时显示 `not-reviewed`。
- 在页面中显式链接官方资料，并展示数据核验日期 / 来源更新时间。

## Non-goals

- 本版本不做真实的 ENISA SRP 登录、提交或读取私有报告；SRP 只作为官方报告入口与说明来源。
- 本版本不实现 Safety Gate、EUR-Lex、ENISA 或成员国监管机构的实时抓取、去重和数据治理。
- 本版本不创建公开处罚数据库，也不推断“有 Safety Gate 警报”就“有 CRA 执法 / 罚款”。
- 本版本不提供法律意见，不根据产品的并列状态自动给出合规结论。
- 本版本不引入后台、账户、权限、通知、工作流审批或真实文件上传。

## Productionization extension (2026-11-20)

用户已批准将首版静态演示扩展为可更新的公开数据快照。当前实现从欧盟委员会公开 Safety Gate 周报 XML 生成并提交一个可离线构建的规范化快照；同步、校验、构建和每周 PR 刷新路径记录在 `docs/data-operations.md`。

ENISA SRP 仍然是登录后的报告平台，不是公开案件或处罚库。CRA 产品级证据只能通过单独的批准审阅清单接入；Safety Gate 数据不会自动生成 CRA 事件、监管措施、罚款或处罚结论。

## Anti-goals

- 不把 CRA 和 Safety Gate 记录混进同一枚“案件状态”或同一条时间线。
- 不把 recall / withdrawal / takedown 渲染成 fine / penalty。
- 不把 ENISA SRP 当作公开处罚库或公开案件库。
- 不用泛化的 SaaS bento 卡片堆叠、装饰性图表或无法核验的假指标填充页面。
- 不让首屏把导航、指标、筛选器和多个竞争性面板堆到不可读。

## Approaches considered

### A. 共用产品看板 + 三种视图（已选）

提供 `总览`、`CRA`、`GPSR / Safety Gate` 三种视图。总览以产品表为主，每行先呈现 Brand / Model / Market，再分成蓝色 CRA 区和琥珀色 Safety Gate 区；详情侧栏和时间线继续保持两条证据线。这样既能复用 DSA / DMA 的 dashboard 习惯，也能直接回答“同一产品分别发生了什么”。

代价是需要比单一案件 tracker 更严格的数据模型和视觉分隔。

### B. 产品登记表优先

以产品为主键的一张表，CRA 与 Safety Gate 只作为两个状态列，点击后进入详情抽屉。它适合内部运营台账，但首屏对监管措施、报告期限与公开警报的语义表达会更弱。

### C. 两套完全独立的 tracker

CRA 和 GPSR / Safety Gate 各自拥有完整的登记库、时间线和指标，仅共享产品搜索。它的语义边界最清晰，但会重复筛选、产品信息和来源结构，也不符合“共用产品看板”的目标。

选择 A，因为它保留了两条线的证据边界，同时让品牌 / 型号 / 市场成为稳定的共同锚点。

## Regulatory and source grounding

以下内容作为首版 UI 文案与数据字段的依据，页面中的具体记录仍需经过数据接入和人工核验：

- [CRA 时间表 / 欧盟委员会摘要](https://digital-strategy.ec.europa.eu/en/policies/cra-summary)：CRA 于 2024-12-10 生效；主要规定自 2027-12-11 起适用；合格评定机构通知章节自 2026-06-11 起适用；第 14 条报告义务自 2026-09-11 起适用。报告节点包括早期预警 24 小时、主报告 72 小时，以及主动利用漏洞在纠正 / 缓解措施可用后不迟于 14 天提交最终报告、严重事件在 72 小时提交后一个月内提交最终报告。
- [Safety Gate](https://ec.europa.eu/safety-gate-alerts/screen/webReport)：公开警报呈现危险非食品产品的产品信息、风险描述以及经济运营者或主管机关采取的措施；措施可能包括销售禁令、下架 / 撤回、召回或警示。
- [Safety Gate 产品安全说明](https://ec.europa.eu/safety-gate/screen/pages/productSafetyLegislation)：市场监督机关根据风险采取措施，并通过 Safety Gate 共享相关信息；公开警报代表产品安全措施或警报，不代表 CRA 处罚。
- [ENISA · Single Reporting Platform](https://www.enisa.europa.eu/topics/product-security/vulnerability-services/eu-incident-response-and-cyber-crisis-management/single-reporting-platform-srp)：SRP 是制造商向 ENISA / 相关 CSIRT 提交 CRA 主动利用漏洞和严重事件通知的报告工具；首版只作为来源入口和报告义务说明，不展示私有报告内容。

页面会把“来源类型”明确分为 `Official public source` 与 `Illustrative demo record`，并为每一条记录保留 `last_verified_at`。

## Information architecture

### 1. App shell / header

- 页面标题：`CRA / GPSR · 共用产品看板`
- 右侧显示 `最后核验`、`数据日期`、三个官方来源快捷链接、中文 / English 切换。
- 不使用营销式 hero；标题直接进入工作区。

### 2. Mode switch

三个主模式：

- `总览`：共享产品登记表 + 两条线并列状态。
- `CRA`：隐藏 Safety Gate 细节，强调报告时钟、监管措施和整改期限。
- `GPSR / Safety Gate`：隐藏 CRA 细节，强调警报、风险、下架 / 撤回和召回。

### 3. Separation notice

首屏在指标和表格之前固定显示：

> Safety Gate 警报不等于 CRA 执法；召回也不等于罚款。

### 4. Overview metrics

四个指标只对当前筛选结果计算：

- `CRA 关注产品`
- `Safety Gate alerts`
- `整改期限`
- `公开召回`

每个指标带短说明，不展示无法由当前数据推导的累计金额或处罚总额。

### 5. Shared filter bar

- Brand
- Model
- Market / country
- Product type
- 关键词搜索（品牌、型号、产品名、警报 ID）
- 清除筛选

筛选器作用于产品登记表、指标、详情侧栏和时间线；当前模式只改变可见的线内容，不改变共享产品筛选结果。

### 6. Product register

主表字段按以下顺序排列：

1. `#`
2. `Brand`
3. `Model`
4. `Market`
5. `CRA（制造商报告 / 监管措施 / 整改期限）`
6. `GPSR / Safety Gate（安全警报 / 下架撤回 / 召回）`

每个产品行是可选择的；选中行使用左侧蓝色指示条和浅蓝背景。两条线拥有不同的语义颜色，但共用产品识别字段：

- CRA：深蓝 / 蓝色；状态包括 `合规`、`进行中`、`关注`、`整改逾期`。
- Safety Gate：琥珀 / 橙 / 红；状态包括 `无公开警报`、`已发布警报`、`撤回 / 下架`、`公开召回`。

### 7. Product detail rail

右侧固定详情面板（窄屏改为抽屉）包含：

- 共享产品信息：品牌、型号、产品类型、市场、制造商、产品状态。
- `CRA 相关证据`：报告状态、报告节点、监管措施、整改期限、主管机关、来源链接、核验日期。
- `Safety Gate 相关证据`：警报状态、Safety Gate ID、风险级别、措施类型、发布日期、涉及国家、来源链接、核验日期。
- 两个区块之间放置轻量分隔文案：`同一产品的并列记录；不表示同一执法程序。`

### 8. Dual-lane timeline

以当前选中产品为例展示两条独立泳道：

- CRA lane：`T0 / 24h`、`T0 / 72h`、`最终报告`、`整改期限`。
- Safety Gate lane：`警报发布`、`下架 / 撤回`、`公开召回`。

两条泳道共用日期轴的阅读方式，但事件、状态、来源和颜色都不混合。没有事件时显示 `无公开记录`，不使用空白或假占位。

### 9. Source rail and footer

来源卡至少包含：

- `CRA 时间表`
- `Safety Gate`
- `ENISA · SRP`

底部保留研究用途说明、数据核验日期和“以官方原文为准”。

## Data model

```ts
type RecordProvenance = 'official-public' | 'illustrative-demo'
type RecordCoverage = 'recorded' | 'checked-no-record' | 'not-reviewed'

interface EvidenceRef {
  text: string
  sourceUrl: string
  provenance: RecordProvenance
  lastVerifiedAt: string
}

interface CraEvent {
  id: string
  label: string
  date?: string
  state: 'done' | 'current' | 'upcoming'
  evidence?: EvidenceRef
}

interface SafetyGateEvent {
  id: string
  label: string
  date?: string
  state: 'done' | 'current' | 'upcoming'
  measure?: string
  evidence?: EvidenceRef
}

interface ProductRecord {
  id: string
  brand: string
  model: string
  productName: string
  productType: string
  markets: string[]
  manufacturer: string
  boardStatus: 'multi-track-attention' | 'cra-attention' | 'safety-gate-attention' | 'no-public-record'
  cra?: CraRecord
  safetyGate?: SafetyGateRecord
}

interface CraRecord {
  status: 'compliant' | 'in-progress' | 'attention' | 'overdue'
  reportingStatus: string
  regulatoryMeasure: string
  remediationDeadline?: string
  authority?: string
  events: CraEvent[]
  coverage: RecordCoverage
  evidence: string
  sourceUrl: string
  provenance: RecordProvenance
  lastVerifiedAt: string
}

interface SafetyGateRecord {
  alertStatus: 'none' | 'alert' | 'withdrawal' | 'recall'
  alertId?: string
  risk?: 'serious' | 'high' | 'medium' | 'low' | 'unknown'
  measures: string[]
  notifiedBy?: string
  alertDate?: string
  countries?: string[]
  events: SafetyGateEvent[]
  coverage: RecordCoverage
  evidence: string
  sourceUrl: string
  provenance: RecordProvenance
  lastVerifiedAt: string
}
```

`cra` 和 `safetyGate` 是可选且互不推导的两个对象；每条线内部用事件数组保存同一产品的多次报告、监管措施、Safety Gate 警报和后续跟进，表格只展示摘要，详情和时间线展示事件。共享产品字段可以复用，但任何跨线关联都只能表达为“同一产品匹配”，不能表达为因果或处罚关系。

## Interaction and responsive behavior

- 初始状态：`总览`、无筛选、第一条产品记录选中。
- 切换 `CRA` / `GPSR · Safety Gate` 时，主表仍保留 Brand / Model / Market，并同步切换指标、对应轨道、详情区块和单线时间线；选中产品和筛选条件保持不变。`总览` 才展示双线指标、双线详情和双泳道时间线。
- 选择任意产品行后更新右侧详情和双泳道时间线；关闭详情时保留选中状态。
- 展开来源链接使用新标签页；来源卡和表格里的来源都必须可键盘聚焦。
- 桌面端优先约 1440px 宽度；移动端将产品表拆为“共享产品信息 → 当前选中线”的单线视图，可在 CRA 与 GPSR / Safety Gate 之间切换，不把每个单元格强行压缩成卡片。
- 使用 `prefers-reduced-motion` 时不做滑入、闪烁或自动滚动。

## Design system

- 背景：`#f5f7fb`；表面：纯白；边框：`#dce4ef`。
- 主色：`#0b2a6b` / `#1e56c8`；主文字：`#17233c`；次文字：`#6d7b91`。
- CRA 语义色：`#1e56c8` / `#d9e8ff`。
- Safety Gate 语义色：`#b97812` / `#fff2d9`；严重 / 召回使用 `#c94d5c` / `#fff0f1`。
- 成功色：`#25866a` / `#e7f6ef`。
- 字体：Inter / system-ui / `PingFang SC` / `Microsoft YaHei` fallback。
- 圆角：常规 8–10px；主表与详情面板最多 12px；不使用大面积圆形容器。
- 阴影：仅用于选中详情 rail 与聚焦状态，使用低对比度阴影。
- 图标：Lucide 风格线性图标，保持 14–18px、统一 stroke weight；图标只用于语义提示和交互，不做装饰填充。

## Implementation inventory

建议的 React 组件边界：

- `AppShell`
- `HeaderMeta`
- `ModeTabs`
- `SeparationNotice`
- `MetricStrip`
- `FilterBar`
- `ProductRegister`
- `ProductRow`
- `TrackStatusCell`
- `ProductDetailRail`
- `EvidenceSection`
- `DualLaneTimeline`
- `SourceRail`
- `FooterNote`

当前运行时使用 `src/data/generated/safety-gate-snapshot.json` 的官方公开快照提供产品记录；CRA 产品级记录没有批准输入时显示 `not-reviewed`，不改动产品视图和两条线的结构。旧演示数据只保留在历史测试夹具中，不进入运行时产品数组。

## Verification and success criteria

- `npm run build` 通过，首屏无运行时错误。
- 桌面端能清楚看见共享产品字段、CRA 区、Safety Gate 区和分离提示。
- 切换三个模式、修改品牌 / 市场筛选、选择产品行、打开 / 关闭详情时，真实 UI 状态同步更新。
- 详情侧栏能同时展示两个证据区，并明确说明两者不是同一执法程序。
- 双泳道时间线不会把 CRA 报告节点和 Safety Gate 措施合并成同一事件。
- 桌面端与移动端均无横向溢出、裁切或不可读文本；移动端能在单线视图之间切换。
- 官方来源链接可打开；演示数据不冒充官方统计或处罚结果。
- 浏览器截图会与视觉概念图逐项核对：标题 / 导航、颜色与语义分区、表格密度、详情 rail、时间线、移动端折叠方式至少五项。

## Builder decisions left open

- 当前工作区实现采用 React + Vite + TypeScript，沿用相邻 `/Users/xuzhujie/Documents/MyProjects/dsa-enforcement-tracker` 与 `/Users/xuzhujie/Documents/MyProjects/dma-enforcement-tracker` 的视觉语言；不直接跨项目 import 代码。
- 当前默认中文界面，保留 English 切换；文案与数据字段会集中在单一配置中，便于后续扩充。
- 运行时产品记录来自提交的 Safety Gate 官方周报快照（默认最近 4 期、最多 120 条）；历史 5 条示例记录只保留在测试夹具中。
- 不引入后端、认证或私有 ENISA SRP 访问；更新通过公开周报同步脚本、校验和 PR 审阅完成，若之后需要更高频实时化将另立数据同步设计。

## Builder check resolutions

独立 builder check 提出的歧义按以下 v1 默认值处理，不改变已选的产品中心信息架构：

- **一产品多事件**：一个 `ProductRecord` 对应一个可识别产品，但 `cra.events[]` 与 `safetyGate.events[]` 支持多次报告、监管措施、Safety Gate 警报和后续跟进；表格只展示摘要，详情和时间线展示事件。
- **缺失记录**：`safetyGate` 缺失不自动等于“全市场没有警报”，只在当前同步数据集显示“未发现公开记录”；数据层保留 `coverage: 'checked-no-record' | 'recorded' | 'not-reviewed'`。运行时缺少 CRA 产品级输入时显示“未核验”。
- **指标口径**：`CRA 关注产品` = CRA 状态为 `attention`、`in-progress` 或 `overdue` 的去重产品；`Safety Gate alerts` = 存在已发布公开警报的去重产品；`整改期限` = 相对 `AS_OF_DATE` 未来 30 天内到期或已经逾期的开放 CRA 期限；`公开召回` = 存在 recall 措施的去重产品。
- **模式状态**：`总览` 使用四个跨线指标与双泳道；`CRA` 使用 CRA 指标、CRA 轨道和 CRA 详情；`GPSR / Safety Gate` 使用 Safety Gate 指标、Safety Gate 轨道和 Safety Gate 详情。共享产品字段始终保留。
- **来源粒度**：来源、核验日期和 `official-public` / `illustrative-demo` provenance 以 track / event 为粒度；`official-public` 只有在该 track 有逐条公开记录时才显示“官方来源”；CRA `not-reviewed` 只显示“尚未核验”，即使它链接到 CRA 官方说明页。
- **产品状态字段**：详情里的 `看板状态` 是由两条线摘要计算出的非法律结论标签，只用于排序和提醒；不提供单一“合规 / 不合规”结论。
- **日期语义**：快照以 `generatedAt` 为核验基准，时间线用日期而非时区时间；CRA 真实 24h / 72h / 最终报告节点只有在批准的 CRA review manifest 中提供后才显示，不从 Safety Gate 事件推导。
