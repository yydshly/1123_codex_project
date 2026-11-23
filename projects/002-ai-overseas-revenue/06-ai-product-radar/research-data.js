const RADAR_DATA = {
  checked: '2026-11-22',
  evidence: {
    provider: '支付平台直连',
    connected: '挂牌已连接支付',
    seller: '卖家披露'
  },
  sourceGroups: ['公开营收榜', '转让市场', '发布与聚合'],
  sources: [
    { id: 'bootstrap', name: 'BootstrapArena', group: '公开营收榜', description: '找刚开始收钱的小型 SaaS、App 和电商。', revenue: '从支付和账单平台读取 MRR 与累计净收入。', growth: '最近 30 天净营收与前 30 天对比。样本少，查阅快照有 6 条。', links: [['打开增长榜', 'https://bootstraparena.com/top/growth'], ['按 MRR 看', 'https://bootstraparena.com/top/mrr']] },
    { id: 'startupage', name: 'StartuPage', group: '公开营收榜', description: '找小产品、创始人及最近入榜项目。', revenue: 'Stripe、Paddle、RevenueCat 等服务直连。', growth: '近 30 天 MRR 变化。历史缺失时显示横线。', links: [['打开营收榜', 'https://startupa.ge/leaderboard']] },
    { id: 'mobile', name: 'MobileMRR', group: '公开营收榜', description: '专门找 iOS 和 Android 应用，含在售项目。', revenue: '已验证 MRR 来自 RevenueCat 或 Superwall。', growth: '抽查的项目页主要展示当前 MRR、近期收入或活跃用户。', links: [['打开手机应用榜', 'https://mobilemrr.com/leaderboard'], ['查看项目样例', 'https://mobilemrr.com/apps/playlingo']] },
    { id: 'flippa', name: 'Flippa', group: '转让市场', description: '可按 AI 工具、SaaS 和电商浏览在售项目。', revenue: '看详情是否连接 Stripe、Shopify 等支付源。GA 连接验证的是流量。', growth: '部分项目提供逐月财务与流量，详细资料可能需要登录。', links: [['找 AI 工具', 'https://flippa.com/buy/ai-apps-and-tools'], ['查验证标准', 'https://support.flippa.com/hc/en-us/articles/4842857720079-Understanding-verified-listings-on-Flippa']] },
    { id: 'microns', name: 'Microns', group: '转让市场', description: '看小型订阅工具和已售的移动应用。', revenue: '卖家填报金额并提交营收凭证，公开页常见年收入和挂牌价。', growth: '少数卖家公开近期增长，回到正文核对口径和日期。', links: [['浏览小产品', 'https://www.microns.io/'], ['查凭证要求', 'https://www.microns.io/blog/create-listing-microns']] },
    { id: 'empire', name: 'Empire Flippers', group: '转让市场', description: '找经营期较长、已稳定盈利的线上业务。', revenue: '上架时审核营收、支出和流量，至少需要 12 个月收入记录。', growth: '挂牌公开趋势和财务摘要，详细报告通常需验证买家资金。', links: [['浏览 SaaS', 'https://empireflippers.com/marketplace/saas-businesses-for-sale/'], ['查审核与解锁', 'https://empireflippers.com/marketplace/technology-businesses-for-sale/']] },
    { id: 'acquire', name: 'Acquire.com', group: '转让市场', description: '找待出售的成熟 SaaS 和软件业务。', revenue: '卖家可经 ChartMogul 连接订阅和经常性收入。', growth: '连接后可有年增长率，详细项目身份与连接数据通常需签保密协议获准。', links: [['查看连接说明', 'https://help.acquire.com/how-do-i-connect-my-customer-metrics-stripe-paypal-braintree-app-stores-etc-via-chartmogul'], ['查挂牌访问规则', 'https://help.acquire.com/seller-faqs-1']] },
    { id: 'hunt', name: 'Product Hunt', group: '发布与聚合', description: '按类别找刚发布的产品、演示和首批反馈。', revenue: '发布榜以社区互动为主，收入需要另找支付数据或公开披露。', growth: '榜单积分反映发布互动，评论可带来用户需求线索。', links: [['打开发布榜', 'https://www.producthunt.com/leaderboard'], ['查排行机制', 'https://help.producthunt.com/en/articles/17734306-1-how-product-hunt-works']] },
    { id: 'untold', name: 'Untold Startups', group: '发布与聚合', description: '按赛道和增长榜筛案例，也可阅读创始人故事。', revenue: '公开营收榜的底层来自 TrustMRR，适合换视图浏览。', growth: '有增长和周榜，引用同一项目时应追溯到同一底层源。', links: [['打开营收榜和来源说明', 'https://untoldstartups.com/revenue']] },
    { id: 'showmrr', name: 'ShowMRR', group: '发布与聚合', description: '可补充找产品或其自公开的数字。', revenue: '支持支付连接。其 2026-11-21 方法页显示，正在同步且通过支付方验证的项目为 0。', growth: '有历史和增长功能说明，分析前先确认该项目有实际数据。', links: [['查验证数量', 'https://showmrr.com/methodology']] },
    { id: 'trust', name: 'TrustMRR', group: '公开营收榜', description: '作为对照源，可按营收、分类、地区和最近登记来找。', revenue: '项目页标注支付提供方、验证及同步时间。', growth: '项目可有 30 天营收走势图。优先看当期、上期和统计窗口。', links: [['最新收录', 'https://trustmrr.com/recent'], ['查看数据说明', 'https://trustmrr.com/docs/api']] },
    { id: 'verified-revenues', name: 'Verified Revenues', group: '公开营收榜', description: '补查手机应用的订阅规模和近 28 天收入。', revenue: '榜单标注验证状态，站方称源自 RevenueCat、Superwall、Stripe 等。部分项目匿名。', growth: '首页预留 7 天趋势列。抽查的榜单行有缺值，需针对具体项目核对。', links: [['查看应用营收榜', 'https://verifiedrevenues.app/top']] },
    { id: 'shipped-paid', name: 'Shipped & Paid', group: '发布与聚合', description: '按类型找用 AI 构建、已有收入的产品案例。', revenue: '案例链接到原始证明。很多验证档案仍来自 TrustMRR。', growth: '适合对照创始人披露和推广复盘，增长窗口要回到付款源核对。', links: [['查看有验证档案的案例', 'https://shippedandpaid.com/verified/']] }
  ],
  products: [
    {
      id: 'hypit', name: 'Hypit-AI', mark: 'Hy', category: '视频工作流', source: 'trust', evidence: 'provider', date: '2026-11-21', dateType: '来源同步',
      mrr: { value: 16001, currency: 'USD' },
      audience: '增长营销、UGC 创作者及需要批量生成视频的团队。',
      offer: '把参考视频拆成可编辑的时间线和可复跑的生成流程。',
      monetization: '开源框架加托管积分与充值，用户能按需增加生成量。',
      insight: '工作流可以反复换稿和换素材。对口播后期，字幕与效果能否随新稿稳定重排，比一次示范的观感更有说服力。',
      caveat: '收入快照支持有人为这类工作流付费。授权参考素材、每条成本和返工次数仍需逐单核对。',
      links: [['Stripe 验证档案', 'https://trustmrr.com/startup/hypit-ai'], ['产品官网', 'https://hypit.ai/']]
    },
    {
      id: 'productmagic', name: 'ProductMagicAI', mark: 'PM', category: '电商素材', source: 'flippa', evidence: 'connected', date: '2026-11-22', dateType: '查阅挂牌',
      mrr: { value: 682, currency: 'USD' }, subscribers: 47,
      audience: '需要商品图、广告短片和商品页文案的电商卖家。',
      offer: '一张商品原图生成电商图片、产品宣传视频和商品文案。',
      monetization: '免费版加 Pro 与 Business 订阅。',
      insight: '客户买的是一套能上架的商品素材。可以先做一个类目，把图片、短片和文案一起报价。',
      caveat: '公开数据栏为 $682 MRR，卖家标题为 $832，采用数据栏。页面列出 Stripe 和 Google Analytics 连接，未说明两处差异的原因。',
      links: [['挂牌数据栏', 'https://flippa.com/14117879-ai-saas-for-ecommerce-sellers-832-stripe-verified-mrr-934-users-image-video-listing-tools']]
    },
    {
      id: 'lightloop', name: 'Lightloop', mark: 'Ll', category: '电商素材', source: 'flippa', evidence: 'connected', date: '2026-11-22', dateType: '查阅挂牌',
      mrr: { value: 1245, currency: 'USD' }, subscribers: 28,
      audience: '需要制作产品概念图、展示视频和 3D 概念模型的设计师与硬件团队。',
      offer: '将产品想法变成可以用于设计讨论的视觉原型。',
      monetization: '订阅。Flippa 数据栏显示 28 个活跃订阅，同一页列明 Stripe 集成和人工财务核验。',
      insight: '产品设计和电商上架都用图像和视频。前者服务团队决策，后者服务商品发布，两种交付可以分别报价。',
      caveat: '以公开数据栏的 $1,245 MRR 为准。标题和描述使用了其他金额，公开页未解释覆盖范围。',
      links: [['Flippa 挂牌及验证栏', 'https://flippa.com/13829251-profitable-generative-ai-product-design-saas-1-3k-mrr-94-margins-fully-automated']]
    },
    {
      id: 'skillry', name: 'Skillry', mark: 'Sk', category: '内容工具', source: 'trust', evidence: 'provider', date: '2026-11-22', dateType: '来源同步',
      mrr: { value: 6124, currency: 'USD' }, revenue: { value: 11610, currency: 'USD', label: '近 30 天收入' },
      audience: '已有编码 Agent，希望生成网页、PPT、图片或视频的用户。',
      offer: '先预览真实成品，再安装能复跑的 Agent Skills。',
      monetization: '免费技能试用，付费包月、包年，也提供买断。',
      insight: '样片同时可以解释产品和帮助分发。先挑一套现有流程，验证陌生用户能否凭说明独立交付。',
      caveat: 'BizPeel 报告把免费视频库和同期订单增长视为线索。公开社交流量是估算，未提供按渠道成交明细。',
      links: [['Stripe 验证档案', 'https://trustmrr.com/startup/skillry'], ['BizPeel 增长样例', 'https://bizpeel.com/zh/project/skillry']]
    },
    {
      id: 'videoscore', name: 'AI Video Score Analyzer', mark: 'VS', category: '视频工作流', source: 'microns', evidence: 'seller', date: '2026-11-16', dateType: '挂牌日期',
      mrr: { value: 582, currency: 'USD' }, revenue: { value: 5316, currency: 'USD', label: '过去 12 个月收入' },
      audience: '想在发布前改进短视频的创作者。',
      offer: '对上传的短视频给评分，并给出可执行的修改建议。',
      monetization: '移动端订阅，挂牌正文披露 110 个活跃订阅。',
      insight: '检测与反馈可以做成视频交付的一环。先对比人工意见与自动意见的一致性，以及报告后是否真的有修改。',
      caveat: '卖家称数据来自 RevenueCat，网页公开的是挂牌披露，未显示同期增长。挂牌已售。',
      links: [['挂牌及财务说明', 'https://www.microns.io/startup-listings/ai-video-score-analyzer-app']]
    },
    {
      id: 'playlingo', name: 'PlayLingo', mark: 'PL', category: '移动应用', source: 'mobile', evidence: 'provider', date: '2026-11-22', dateType: '查阅日期',
      mrr: { value: 9300, currency: 'USD' }, revenue: { value: 15417, currency: 'USD', label: '近 28 天收入' },
      audience: '希望用自己喜欢的 YouTube 内容练语言的学习者。',
      offer: '把同一视频变成逐句翻译、听力练习和词汇复习。',
      monetization: '免费日额度，Pro 包月或包年解锁上限。',
      insight: '内容转练习是一个重复任务。可以参考“一份素材反复使用”的交付设计，先验证训练留存和可使用的内容范围。',
      caveat: 'MRR 由 RevenueCat 验证。当前项目详情未展示同一快照的增长率。',
      links: [['RevenueCat 验证的项目页', 'https://mobilemrr.com/apps/playlingo']]
    },
    {
      id: 'treeid', name: 'TreeID', mark: 'Tr', category: '移动应用', source: 'mobile', evidence: 'provider', date: '2026-11-22', dateType: '查阅日期',
      mrr: { value: 344, currency: 'USD' }, revenue: { value: 301, currency: 'USD', label: '近 28 天收入' },
      audience: '散步、徒步时想辨认树木的 iOS 用户。',
      offer: '通过相机给出树木识别和相关说明。',
      monetization: '有 RevenueCat 验证的订阅收入。',
      insight: '小场景也可能有人付费。与 PlayLingo 同站对照时，可追问偶发识别和重复练习分别能带来多少次购买理由。',
      caveat: '公开页只有当前 MRR 与近期收入，未提供增长率和续费周期数据。',
      links: [['MobileMRR 项目页', 'https://mobilemrr.com/apps/treeid-tree-scanner']]
    },
    {
      id: 'revise', name: 'Revise AI', mark: 'Rv', category: '内容工具', source: 'bootstrap', evidence: 'provider', date: '2026-11-22', dateType: '榜单快照',
      mrr: { value: 1679, currency: 'USD' }, revenue: { value: 14167, currency: 'USD', label: '累计净收入' },
      growth: { value: -0.3, kind: 'netGrowth', label: '近 30 天净营收较前 30 天', earlier: { date: '2026-11-20', value: 10.6 } },
      audience: '需要润色文稿，又希望保留自己语气的写作者。',
      offer: '聚焦保留作者语气的 AI 编辑器。',
      monetization: '订阅，榜单展示月度经常性收入。',
      insight: '一个可描述的质量目标可以成为独立卖点。可类比到字幕质检，先定义用户必须保留的语气、措辞或节奏。',
      caveat: '两日快照都是滚动的 30 天净营收比较，时间窗重叠。变化提示需要持续观察，无法归因到单个渠道。',
      links: [['已验证增长榜', 'https://bootstraparena.com/top/growth']]
    },
    {
      id: 'leadprysm', name: 'LeadPrysm', mark: 'Lp', category: '营销与运营', source: 'bootstrap', evidence: 'provider', date: '2026-11-22', dateType: '榜单快照',
      mrr: { value: 33, currency: 'USD' }, revenue: { value: 171, currency: 'USD', label: '累计净收入' },
      growth: { value: -39.5, kind: 'netGrowth', label: '近 30 天净营收较前 30 天' },
      audience: '想追踪新融资 AI 公司动态的创业者与商业团队。',
      offer: '围绕近期融资的 AI 创业公司整理线索。',
      monetization: '榜单显示小额经常性付费。',
      insight: '可用来对照情报类产品的留存。首轮可以先看订阅者是否在第二周仍为更新回来。',
      caveat: '营收基数较小，个位数订单就可能使百分比变化明显。',
      links: [['已验证增长榜', 'https://bootstraparena.com/top/growth']]
    },
    {
      id: 'content-membership', name: 'AI 内容工具会员站', mark: 'CM', category: '内容工具', source: 'flippa', evidence: 'connected', date: '2026-11-22', dateType: '查阅挂牌',
      mrr: { value: 551, currency: 'USD' }, subscribers: 18,
      audience: '希望持续发布社媒营销内容的旅游代理。',
      offer: '把 AI 内容生成、会员权限和既有社区捆成一项订阅。',
      monetization: '会员按期付费，挂牌数据栏显示 18 个活跃订阅。',
      insight: '适合作为先有分发再卖工具的参考。访谈时优先区分付费者用的是创作功能还是社群权益。',
      caveat: '挂牌保留了业务描述并连接 Stripe。群组规模属于卖家披露，不能用来推算订阅转化率。',
      links: [['Flippa 挂牌及验证栏', 'https://flippa.com/14333606-ai-content-generator-membership-business-with-recurring-revenue-19-8k-facebook-community']]
    },
    {
      id: 'vid', name: 'Vid.AI', mark: 'VA', category: '视频工作流', source: 'trust', evidence: 'provider', date: '2026-11-20', dateType: '来源同步',
      mrr: { value: 53853, currency: 'USD' },
      audience: '需要持续产生无真人出镜视频的创作者和 YouTube 频道。',
      offer: '从想法或脚本生成配音、素材、字幕和成片。',
      monetization: '按额度分档订阅，并可补充购买积分。',
      insight: '批量出片有收入样本。对小团队，先观察客户最常返工的步骤，再从单步切入。',
      caveat: '挂牌披露的预计利润率口径与历史经营不同，本页只采集有验证来源的 MRR。',
      links: [['Stripe 验证档案', 'https://trustmrr.com/startup/vidai-llc'], ['产品官网', 'https://vid.ai/']]
    },
    {
      id: 'gomotion', name: 'Gomotion AI', mark: 'Go', category: '视频工作流', source: 'trust', evidence: 'provider', date: '2026-10-24', dateType: '来源同步',
      mrr: { value: 57917, currency: 'USD' },
      audience: '制作 YouTube 纪录片的创作者、工作室与频道运营者。',
      offer: '输入选题后生成长篇叙事视频，覆盖脚本、配音、画面和剪辑。',
      monetization: '面向个人、工作室和代理团队分档订阅。',
      insight: '同是视频生成，它以“做一条可发布的纪录片”描述交付。适合作为聚焦内容类型的定位参考。',
      caveat: '这是 10 月的支付验证快照。与 11 月快照同时出现在本页，只用于量级对照。',
      links: [['Stripe 验证档案', 'https://trustmrr.com/startup/iker']]
    },
    {
      id: 'pixlys', name: 'Pixlys', mark: 'Px', category: '视频工作流', source: 'startupage', evidence: 'provider', date: '2026-11-21', dateType: '来源同步',
      mrr: { value: 40, currency: 'USD' }, revenue: { value: 130, currency: 'USD', label: '累计收入' },
      growth: { value: 0, kind: 'mrrGrowth', label: '近 30 天 MRR 变化' },
      audience: '用文本、照片或短片生成视频的创作者。',
      offer: '把多种通用视频生成方式集中到一个工具。',
      monetization: '榜单显示 4 个付费订阅。',
      insight: '用作通用生成的早期对照。已有产品功能时，下一轮调研应追问复用、付费和真正独特的场景。',
      caveat: '0% 是榜单公开的 30 天 MRR 变化，金额也较小。一个早期样本不能代表整类市场。',
      links: [['Stripe 验证项目页', 'https://startupa.ge/startups/pixlys']]
    },
    {
      id: 'kliptok', name: 'Kliptok', mark: 'Kt', category: '视频工作流', source: 'flippa', evidence: 'connected', date: '2026-11-22', dateType: '查阅挂牌',
      mrr: { value: 476, currency: 'EUR' },
      audience: '需要使用多个视频生成模型的创作者与小型制作团队。',
      offer: '把多种视频模型和生成额度组合在同一产品中。',
      monetization: '挂牌数据栏列出 78 个活跃订阅。',
      insight: '可用来对照模型聚合的留存风险。针对具体付费任务提供可复用工作流，才有机会减少用户做完一单就离开的情况。',
      caveat: '页面显示总体流失 28%，未注明统计窗口。单位为欧元，未加入美元 MRR 图表。',
      links: [['挂牌数据栏', 'https://flippa.com/12255808-kliptok-ai-video-saas-veo-3-seedance-kling-40k-revenue-90-margin-before-fixed-costs-fees-2-500-opt-in-contacts']]
    },
    {
      id: 'photo-video', name: 'AI Photo & Video Generator', mark: 'PV', category: '电商素材', source: 'microns', evidence: 'seller', date: '2026-05-12', dateType: '挂牌日期',
      mrr: { value: 150, currency: 'USD' }, revenue: { value: 543, currency: 'USD', label: '近 30 天收入' },
      growth: { value: 58, kind: 'sellerGrowth', label: '卖家披露的近 30 天收入变化' },
      audience: '需要快速生成 UGC 素材的创作者和品牌。',
      offer: '用上传的人像或商品素材生成适合短视频平台的图像与视频。',
      monetization: '按周或按月收费。',
      insight: '可以观察小额付费和产品包装。增长来自较低的收入基数，先把样本当作试单线索。',
      caveat: '卖家称 Stripe 核验。挂牌把 $2,530 在不同位置标为 ARR、TTM 或累计，因此这里保留正文的 $150 MRR 和 $543 近 30 天收入。',
      links: [['挂牌披露', 'https://www.microns.io/startup-listings/ai-photo-video-generator']]
    },
    {
      id: 'map-video', name: 'Cinematic 3D Map Video', mark: '3D', category: '视频工作流', source: 'microns', evidence: 'seller', date: '2026-11-19', dateType: '挂牌日期',
      mrr: { value: 40, currency: 'USD' }, revenue: { value: 46, currency: 'USD', label: '过去 12 个月收入' },
      audience: '需要地图镜头的旅行、地产与社交媒体内容创作者。',
      offer: '根据地点与路径生成有镜头运动的三维地图短视频。',
      monetization: '卖家披露有 2 个付费用户。',
      insight: '属于可快速演示的窄流程。下一步证据是同一个用户有多个地图视频需求，并愿意重复购买。',
      caveat: '来源是卖家挂牌。近 30 天注册数衡量新增注册量，未换算成营收增幅。',
      links: [['挂牌披露', 'https://www.microns.io/startup-listings/ai-cinematic-3d-map-video-generator']]
    }
  ],
  opportunities: [
    {
      priority: '优先验证', title: '口播后期交付包', audience: '有原始口播、每周发布短视频的讲师或小团队。',
      basis: 'Hypit 的工作流有人付订阅费，Video Score 的挂牌还提示发布前检查可以单独收费。两者为口播剪辑与质检提供相邻场景。',
      test: '用授权素材交 2 个前后对比样片，给 3 位目标客户报价。按条记录字幕差错、手工修订时间和是否付费。',
      measure: '每条的实际生成费、人工分钟数、修改轮次和发片日期。',
      go: '有客户付费并实际发布，扣除生成费和人工后仍有余量。',
      pause: '只有免费试用意愿，或每条需要反复手工修订。先收窄服务范围。',
      cases: ['hypit', 'videoscore', 'skillry']
    },
    {
      priority: '第二验证', title: '单品上架素材包', audience: '有商品原图、需要给一个 SKU 上架的独立站卖家。',
      basis: 'ProductMagicAI 的 $682 MRR 对应电商上架素材。Lightloop 的 $1,245 MRR 对应产品设计原型。按不同的验收任务分别试报价。',
      test: '选一个类目，交一张主图、一条产品演示和一段英文文案。记录生成成本、修订次数，以及卖家是否实际用于上架。',
      measure: '每个 SKU 的成本、卖家实际采用的素材数、追加 SKU 的报价反馈。',
      go: '至少一个卖家付费并采用素材，或提出下一批 SKU 的明确需求。',
      pause: '反馈只有“图好看”，卖家不能指出想上架的具体商品。',
      cases: ['productmagic', 'lightloop', 'photo-video']
    },
    {
      priority: '继续跟踪', title: '视频转学习练习', audience: '需要重复使用同一段示范视频的教学或培训团队。',
      basis: 'PlayLingo 的订阅快照支持围绕视频做语言练习的付费场景。课件授权、学习留存和获客成本需要本地证据。',
      test: '用一条自有教学视频做逐句字幕、三道题和复习卡。观察学员是否重复练习，并询问机构的采购方式。',
      measure: '首次完成率、隔天主动返回人数、教师是否要求制作第二节。',
      go: '有机构愿意为第二节付费，或能确定预算、内容权限和复用频次。',
      pause: '学员只看一遍、机构未给采购入口。先查清练习任务是否重复。',
      cases: ['playlingo', 'treeid']
    }
  ]
};
