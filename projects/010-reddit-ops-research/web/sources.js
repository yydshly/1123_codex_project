const research = {
  topics: {
    rules: "社区规则",
    demand: "需求调研",
    launch: "内容与获客",
    geo: "SEO / GEO",
    automation: "AI 辅助",
    monetization: "变现",
  },
  creators: [
    {
      name: "左海",
      handle: "zuohai",
      focus: "系列教程",
      value: "建立从读版规、选社区到发布和复盘的共同做法，作为团队的入门资料。",
      articles: [
        { key: "zuo-handbook", post: "2119950666877567149", title: "Reddit 全流程运营手册（24 篇目录）", topics: ["rules", "demand", "launch", "geo"], kind: "教程合集", value: "按实际问题索引选社区、内容日历、评论和失败案例。首次试点挑需要的章节读，用目录补齐遗漏。", note: "24 篇是作者整理的目录规模。部分旧帖使用作者旧账号 @heizolshao。" },
        { key: "zuo-start", post: "2103817677219275125", title: "Reddit 上手保姆级教程", topics: ["rules", "launch"], kind: "教程", value: "统一 Subreddit、Karma、版规和发帖的基本认识。可用来培训第一次参与 Reddit 的同事。" },
        { key: "zuo-ban", post: "2099164807748575422", title: "一篇约 4 万浏览的帖子被封后复盘", topics: ["rules", "launch"], kind: "实战复盘", value: "把浏览量与帖子、账号状态分开记录，并在项目日志里保留被移除的样本。", note: "浏览量与封禁经历来自作者自述。处置原因以社区和平台通知为准。" },
        { key: "zuo-karma", post: "2122293839595794936", title: "Reddit 养号及获取 Karma 入门", topics: ["rules"], kind: "教程", value: "提供从观察到参与的节奏示例。可借用版规阅读和评论练习的顺序，具体门槛按各社区核对。" },
      ],
    },
    {
      name: "生姜 Iris",
      handle: "WeiYipei",
      focus: "持续实操",
      value: "观察怎样把 Reddit 放进开源发布和产品推广，以及怎样安排选区、发帖和回应。",
      articles: [
        { key: "iris-30k", post: "2122526064006381795", title: "海外社区运营单周约 3 万曝光", topics: ["rules", "launch"], kind: "实战复盘", value: "把选区、标题、发帖节奏和评论区互动分成可以复盘的环节。看单周能做什么、哪些环节需要人工。", note: "3 万是作者自报的曝光。帖子介绍了付费知识库中的完整 SOP。" },
        { key: "iris-guide", url: "https://huggingface.co/datasets/Gingiris/gingiris-reddit-marketing", title: "公开版 Reddit 运营手册", topics: ["rules", "demand", "launch"], kind: "教程", value: "拿来核对目标社区、内容和案例准备工作，适合做成发布前检查表。" },
        { key: "iris-launch", post: "2110876011940413706", title: "AI 音乐模型开源发布窗口复盘", topics: ["launch"], kind: "跨渠道复盘", value: "产品有真实差异时，可围绕具体行业事件准备一个社区讨论点，再安排官网、X 和 HN 的配合。", note: "约 6,000 GitHub 星标是作者报告的综合发布结果，Reddit 的独立贡献未知。" },
      ],
    },
    {
      name: "Yanhua",
      handle: "yanhua1010",
      focus: "持续实操",
      value: "从已经被用户搜索和 AI 答案引用的帖子找问题。适合研究评论机会与搜索可见性。",
      articles: [
        { key: "yanhua-tool", post: "2122994879198597392", title: "ReddTrends 三步找讨论帖与回复机会", topics: ["demand", "geo", "launch"], kind: "工具演示", value: "先用少量真实关键词手动复核工具给出的帖子和版规，判断它能省下多少找帖时间。", note: "作者在介绍自家产品，演示中的功能和排序可自行验证。" },
        { key: "yanhua-example", post: "2121958059161600295", title: "STL Splitter 的 Reddit 讨论示例报告", topics: ["demand", "geo"], kind: "工具演示", value: "可以照它的字段记录关键词、帖子链接、讨论意图和可参与性，再用我们的产品复做一遍。" },
        { key: "yanhua-ban", post: "2115644112565404002", title: "两年 Reddit 账号被封的讨论", topics: ["rules"], kind: "实战记录", value: "账号年龄无法代替对当次发帖和链接的检查。遇到处置时，保留通知和具体动作供排查。", note: "作者询问是否与产品链接有关，帖子未确认封禁原因。" },
      ],
    },
    {
      name: "浅水虾",
      handle: "qianshuixia2026",
      focus: "专题与案例",
      value: "观察独立站推广过程中的失败和后续流量，借鉴如何把 Reddit 与其他引荐渠道分开记账。",
      articles: [
        { key: "shrimp-ban", post: "2116734650710380623", title: "新站在多平台推广时的 Reddit 封号复盘", topics: ["rules", "launch"], kind: "实战复盘", value: "适合作为失败样本，提醒团队同时记录工时、账号或发帖状态，以及尝试后的实际反馈。" },
        { key: "shrimp-traffic", post: "2120076387596042396", title: "新站出现 Reddit 来源访问", topics: ["launch"], kind: "实战记录", value: "把 Reddit 引荐列入网站分析，逐周对比访问和激活，避免混入 Google、Bing 或 ChatGPT 来源。", note: "原帖确认出现该来源，未给出访问规模或付费结果。" },
        { key: "shrimp-orders", post: "2122501766248120675", title: "新站三单与多渠道来源记录", topics: ["launch", "geo"], kind: "实战复盘", value: "具体到每笔订单记录来源。这里三单来自 ChatGPT、Google 和 Bing，Reddit 在同一篇里是仍在尝试的渠道。" },
      ],
    },
    {
      name: "Yangyi",
      handle: "yangyi",
      focus: "系列教程",
      value: "理解从社区审计、内容策略到数据复盘的完整运营，适合验证方向后再考虑团队化。",
      articles: [
        { key: "yang-loop", url: "https://yangyixxxx.substack.com/p/ai-gtmreddit-marketing-loop", date: "2026-08-10", title: "AI GTM 实践：如何构建 Reddit Marketing Loop", topics: ["demand", "launch", "automation"], kind: "实战复盘", value: "借用先人工跑通、复盘删帖和互动、再抽取可重复流程的顺序。先把社区调研和复盘模板整理好。", note: "内容包含作者做过的批量账号实验。我们的试点以 Reddit 规则、社区规范和真实参与为准。" },
        { key: "yang-guide", url: "https://xiaobot.net/p/reddit", title: "Reddit 营销获客增长手册", topics: ["rules", "demand", "launch", "monetization"], kind: "付费专栏", value: "系统查阅调研、内容、实战策略和工具。先根据我们的实际卡点决定应读哪一章。", note: "作者简介提供该专栏入口，完整章节需订阅。", reference: { title: "作者提供的入口", url: "https://lnk.bio/yangyi" } },
        { key: "yang-views", post: "2104492469836739047", title: "Reddit 客户项目的内容曝光对照", topics: ["launch", "automation"], kind: "实战记录", value: "可以借用按内容批次看曝光分布的做法，同时记录版块、时间、选题、投入和后续注册。", note: "作者自报的业务样本。内容不在同一控制条件下，不能仅凭这个对照归因给 AI。" },
      ],
    },
    {
      name: "夏林果",
      handle: "momo_peggy",
      focus: "持续实操",
      value: "跟踪从多次被封到首帖曝光的过程，理解版规、内容选题和真实参与之间的关系。",
      articles: [
        { key: "momo-guide", post: "2091340065591181702", title: "Reddit 新手从 0 到 100 Karma 实操", topics: ["rules", "launch"], kind: "教程与复盘", value: "细看账号被处置与参与社区的具体经历。对我们的用处是学会看活跃内容和版规，并选择可正常参与的社区。", note: "100 Karma 是文章的教学目标。社区可按自己的条件审核发帖。" },
        { key: "momo-first", post: "2102966368643739751", title: "新号首帖获得约 6,000 曝光", topics: ["launch"], kind: "实战记录", value: "可作为首帖获得初始反馈的案例。日后我们要同时记录回复质量、站点流量和是否实现内容目标。", note: "单帖曝光为作者自述。" },
        { key: "momo-tail", post: "2104076200461410746", title: "发帖四天后仍有讨论的长尾观察", topics: ["launch", "geo"], kind: "实战记录", value: "同一帖子在 24 小时、4 天和 7 天分别看互动，可区分首日热度和后续讨论。", note: "作者称所观察的帖子曝光破万。未单独测量搜索或 AI 引用的来源。" },
      ],
    },
    {
      name: "Christal.Z",
      handle: "better_christal",
      focus: "专题与案例",
      value: "了解从接单到独立产品的变现选项，用来选一个与现有能力匹配的验证方向。",
      articles: [
        { key: "christal-guide", post: "2056218181149282775", title: "Reddit 搞钱指南：中国人怎么在英文社区赚美金", topics: ["monetization", "launch"], kind: "专题指南", value: "把书中五种变现路径当作选项库，选一个写清客户、服务方式和支付意愿。用真实咨询或订单验证。" },
      ],
    },
    {
      name: "Victor 在西雅图",
      handle: "victor_UWer",
      focus: "专题与案例",
      value: "理解账号日常参与的人工成本，帮助我们判断哪些活可以交给工具，哪些需要本人处理。",
      articles: [
        { key: "victor-note", post: "2122930178053833114", title: "从手动参与到 Grok Bot 的新号经验", topics: ["rules", "automation"], kind: "实战记录", value: "可把找帖、总结和写草稿列为辅助工作。是否参与、是否提及产品由人工按版规判断。", note: "封禁风险变化是作者体验，帖子没有对照数据。" },
      ],
    },
    {
      name: "Coder Liang",
      handle: "LiangMout95522",
      focus: "专题与案例",
      value: "看到一个技术话题怎样产生讨论，以及如何把回复变成值得沉淀的用户语言和反例。",
      articles: [
        { key: "liang-rust", post: "2121195590826520587", title: "Rust 讨论帖的 X 复盘", topics: ["launch", "demand"], kind: "实战复盘", value: "比较发帖时的判断和评论中的反例，学习用讨论检验自己原来的说法。", note: "作者自报一天内 73 分、54 条评论。两项指标描述站内互动。" },
        { key: "liang-reddit", url: "https://www.reddit.com/r/ChatGPTCoding/comments/1xuber5/", title: "Rust 技术讨论的 Reddit 原帖", topics: ["launch", "demand"], kind: "社区原帖", value: "对照标题、正文和回复本身，标出哪些反对意见跟产品或用户问题有关。" },
        { key: "liang-ima", post: "2120806431850958973", title: "用 ima 知识库和 Grok Bot 做海外内容", topics: ["automation", "launch"], kind: "教程与复盘", value: "把已经验证过的经验沉淀在资料库，再按 Reddit 社区语境形成草稿，减少重复写作。" },
      ],
    },
    {
      name: "凯伦｜出海程序员",
      handle: "1JIP0MiYvo66937",
      focus: "专题与案例",
      value: "了解帖子带站外流量的可能性，为类似的新站建立引荐与注册的测量基线。",
      articles: [
        { key: "karen-traffic", post: "2122640558095233081", title: "一篇 Reddit 帖给站点带来近 1,000 次访问", topics: ["launch"], kind: "实战记录", value: "可以把访问作为一次引流中间结果，同时检查网站的激活、试用和付费有没有跟上。", note: "数据来自作者在自述串的跟帖。原 Reddit 帖及转化数据未在该跟帖公开。" },
        { key: "karen-thread", post: "2122638356513534065", title: "独立站出海的冷启动回顾串", topics: ["demand", "launch"], kind: "实战复盘", value: "把需求调研、上线速度和流量测试放回同一个项目周期，理解访问变化前后还有哪些动作。" },
      ],
    },
    {
      name: "宓宓要出海",
      handle: "ceoplanet519",
      focus: "持续实操",
      value: "用新号教程和后续选题试验把观察、参与、产品冷启动连接起来，最适合跟进近期操作。",
      articles: [
        { key: "mimi-start", post: "2109490209218039858", title: "从 0 Karma 开始的五步冷启动 SOP", topics: ["rules", "launch"], kind: "教程", value: "适合整理第一周的阅读、真实评论、练习发帖和垂直版块观察任务，各社区门槛单独核对。" },
        { key: "mimi-guide", post: "2112084364855324908", title: "低成本获得独立产品的第一批用户", topics: ["demand", "launch"], kind: "跨渠道复盘", value: "把 Reddit 当作寻找正经历某个问题的用户的渠道之一，配合官网和其他渠道观察后续行为。", note: "总体曝光覆盖多个渠道，不能单列为 Reddit 成果。" },
        { key: "mimi-topics", post: "2117928515312230517", title: "Reddit 主题机会的后续试验", topics: ["demand", "launch"], kind: "实战记录", value: "用已收集的真实讨论找主题，再用后续互动判断选题是否贴合。", note: "作者评价曝光不错，未公开可核对的数值。" },
        { key: "mimi-map", post: "2115637240584077811", title: "Reddit 新手入门与运营思维导图", topics: ["rules", "launch"], kind: "教程", value: "作为新手快速浏览的地图，详细规则和发布要求回到实际社区检查。" },
      ],
    },
    {
      name: "Niko",
      handle: "guishou_56",
      focus: "持续实操",
      value: "快速建立独立开发与 SaaS 社区候选清单，再逐个检查规则、真实讨论量和目标用户匹配度。",
      articles: [
        { key: "niko-map", post: "1969278172593078619", title: "Reddit 增长地图：62 个候选版块", topics: ["demand", "launch"], kind: "版块清单", value: "从地图提取可能匹配我们的版块，逐个补一列发帖限制和有代表性的近期讨论。", note: "2025 年的清单。活动量、版规和是否可推广需要重新核对。" },
        { key: "niko-list", post: "2095439896504889435", title: "17 个适合产品冷启动的 Subreddit", topics: ["demand", "launch"], kind: "版块清单", value: "适合作为候选词表，从相关版块开始筛选人群和讨论。即使是通用冷启动版块，也需要匹配产品。" },
        { key: "niko-test", post: "1969645664247431482", title: "一条主贴与多条评论的单日记录", topics: ["launch", "rules"], kind: "实战记录", value: "对比主帖与评论在社区互动中的用途。实际复盘要跟踪反馈质量和产品结果。", note: "从 0 到 3,100 Karma 为 2025 年作者自报的单日结果，原帖只简述过程。" },
        { key: "niko-conf", post: "1988809605296845167", title: "清迈 SEO 大会的 Reddit 营销笔记", topics: ["geo", "rules"], kind: "会议笔记", value: "用来了解业内如何讨论推广频率、账号维护和归因成本。涉及平台规则的判断以官方文档和各社区版规为准。" },
      ],
    },
    {
      name: "饼干哥哥 AGI",
      handle: "bggg_ai",
      focus: "持续实操",
      value: "把找帖、筛选、草稿和效果复盘拆成可审阅的环节，适合已经验证了少量社区值得长期跟踪的团队。",
      articles: [
        { key: "cookie-workflow", post: "2079737630221295993", title: "用千问 3.8 搭 Reddit 回帖获客工作流", topics: ["automation", "launch", "demand"], kind: "实战复盘", value: "先复用任务拆分和人工审核：筛相关讨论、起草、人工判断，再记录真实互动。可用同一批帖子比较工具的召回和工时。", note: "标题的成本下降属于作者对工作流的比较，站外注册或收入仍需独立测量。" },
        { key: "cookie-nov", url: "https://www.woshipm.com/ai/6490752.html", date: "2026-11-09", title: "用 Grok Bot 做跨境内容和用户洞察", topics: ["automation", "demand", "geo"], kind: "教程与复盘", value: "用 Reddit 的痛点讨论回补选题表和产品问题清单，把周期性整理先做小，再考虑接入工作流。" },
        { key: "cookie-ads", post: "2077629537500975526", title: "跨境品牌视角下的 Reddit Ads 与 ChatGPT Ads", topics: ["geo", "launch"], kind: "渠道观察", value: "用来了解为什么研究型、比较型产品值得观察社区和搜索入口。付费投放另设预算、基线和转化目标。" },
      ],
    },
  ],
};
