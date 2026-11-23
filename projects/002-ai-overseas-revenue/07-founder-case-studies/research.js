const originalPost = ["AI 雷克斯的原帖", "https://x.com/DDDDDDayu/status/2124329441514123670"];

const researchCases = [
  {
    id: "jason", name: "鱼总聊 AI", handle: "@AI_Jasonyu", stage: "deep", accent: "lilac",
    topic: "从影像 App 到增长情报工具",
    product: "Portix、Anywear Pro、PaywallPro、KOL Hunter",
    acquisition: "早期做应用商店搜索优化和内容推广，后续用出海复盘持续触达独立开发者。",
    revenue: "App 内购、试衣时长、工具订阅，另有商单和推广分成。",
    takeaway: "AI 能代做一次临时调研。长期收费要看历史记录覆盖、数据更新，以及用户需要重复做多少次。",
    sections: [
      {
        id: "path", title: "从做自己的产品，到卖调研工具",
        paragraphs: ["鱼总早期做过头像、滤镜、换脸等影像产品。他从 UI 设计转到产品岗位，出来创业时自己做选品、设计、测试和运营，再找开发合作。做订阅制 App 时，他常要下载竞品、触发付费页、截图并比较价格。这项自己一直做的工作，后来成了 PaywallPro。", "他也公开记录过扩团队后的亏损。现在的公开主页把 PaywallPro 和 X 内容运营列为重点。内容可以带来商单和推广分成，也会把做 App 的读者带给工具。"],
        sources: [["鱼总的经历和产品清单", "https://yuzong.ai/"], ["鱼总的内容运营复盘", "https://yuzong.ai/cases/14425582115155812/"]]
      },
      {
        id: "products", title: "产品怎么交付、怎么收钱",
        table: {
          headers: ["产品", "用户实际拿到什么", "收费方式"],
          rows: [
            ["Portix", "在手机上把文字或照片变成风格化图片和视频。", "免费下载，提供内购。"],
            ["Anywear Pro", "逛购物网页时，直接用摄像头预览一件衣服的上身效果。", "免费安装，按 AI 试衣时长收费。"],
            ["PaywallPro", "找同类 App 的真实付费页，比较触发时机、价格、试用和历史版本。", "免费查看部分数据，订阅解锁更多内容。"],
            ["KOL Hunter", "先选一个同行品牌，再查看哪些 X 创作者发过合作帖，以及相关帖子的浏览和互动。", "免费基础搜索，付费查看更完整的合作记录。推广仍需联系、谈价和验证转化。"]
          ]
        },
        sources: [["Portix 商店页", "https://apps.apple.com/us/app/portix-ai-video-generator/id6476134401"], ["Anywear Pro", "https://www.anywear.pro/extension"], ["PaywallPro 产品介绍", "https://www.v2ex.com/t/1164938"], ["KOL Hunter 的 CapCut 示例", "https://kolhunter.ai/brands/capcut"]]
      },
      {
        id: "how", title: "他是怎么找到收费信息和博主的？",
        bullets: [
          ["PaywallPro｜沿着用户路径找付款页", "鱼总说早期会实际体验竞品、收集付费页截图，再把价格、试用、地区和不同时点的版本做成资料库。做字幕 App 的人可以先看 Captions 如何收费，再决定自己要测试哪个节点。"],
          ["KOL Hunter｜沿着同行的广告找发帖人", "从 CapCut 这样的品牌倒查此前发过合作帖的创作者，再看内容风格、语言、浏览和互动。平台明确标注的合作与 AI 推测的合作分别显示。推广能带来多少订单，要看投放方自己的跟踪数据。"]
        ],
        sources: [["PaywallPro 公开样本", "https://github.com/paywallpro/paywall-gallery/blob/main/README.zh-CN.md"], ["Captions 付费页样本", "https://www.paywallpro.app/zh/apps/337-captions-ai-edits-your-video"], ["KOL Hunter 数据说明", "https://kolhunter.ai/brands"]]
      },
      {
        id: "judgment", title: "我们的理解｜AI 会压低临时调研的价值",
        paragraphs: ["只查今天公开的价格、或者找几位做过剪辑广告的博主，AI 联网就能先做一轮。PaywallPro 的优势更可能在已经收集好的历史付费页和地区差异。KOL Hunter 的优势要看合作档案是否完整、广告判断是否可靠，以及横向比较能否省下足够多的时间。", "原帖称有 App 营收超过 30 万美元，个人主页写的是单款超过 20 万美元。具体产品和统计期都未明确。Anywear Pro 的计费可以核实，原帖提及的盈利没有可核对的成本明细。"],
        callout: ["判断是否值得付费", "偶尔查一次，先用 AI。每周都要查、还需要过去的页面或合作记录，再看哪部分资料临时搜不回来。"],
        sources: [originalPost, ["鱼总个人主页", "https://yuzong.ai/"]]
      }
    ]
  },
  {
    id: "andrew", name: "陈锦初 Andrew", handle: "@0xajc", stage: "deep", accent: "blue",
    topic: "从碰一碰加好友，到搜索身份线索",
    product: "Instap、Nuwa World",
    acquisition: "Instap 靠抖音演示带来贴片订单。Nuwa 团队自述早期自然增长，具体渠道结构未公开。",
    revenue: "Instap 卖 NFC 贴片。Nuwa 早期按使用收费，后续公开了 API。",
    takeaway: "搜脸 App 的覆盖由底层照片索引决定。数据来源和准确率缺少公开细节，独占优势仍待验证。",
    sections: [
      {
        id: "path", title: "Instap 和 Nuwa 的两次验证",
        timeline: [
          ["2020", "Instap 把交换联系方式缩成一次碰手机", "用户预先设好社交主页，手机碰一下就能打开。Andrew 自述第一条演示视频得到 8 万多个赞，随后卖 NFC 贴片，早期自己做授权、包装和发货。"],
          ["2023", "Instap 被收购", "按 Andrew 本人说法，Instap 被收购后，他转入加密行业。"],
          ["2025–26", "用 AI 辅助编程做 Nuwa", "他在即刻把做 Nuwa 写为 2026 年 1 月，团队已经在 2025 年 12 月发过原型和早期收入复盘。具体上线日期的公开说法存在出入。"]
        ],
        sources: [["Instap 创始人采访", "https://www.sohu.com/a/542096896_237556"], ["Andrew 的即刻自述", "https://m.okjike.com/users/AA72A7F6-627C-4019-A140-2BD70A25955F"], ["Nuwa 团队复盘", "https://medium.com/@NuwaWorld/how-we-accidentally-built-one-of-the-fastest-growing-ai-products-in-december-2025-4342826fec1e"]]
      },
      {
        id: "search", title: "Nuwa 怎么把一张照片变成线索？",
        steps: [
          ["01", "先搜相似人脸", "输入图的脸被转换为可比较的数字特征，再和索引中的人脸匹配。接口返回相似度和来源网址。"],
          ["02", "再读网页文字", "匹配到一张会议照后，名字或演讲主题来自会议页面的文字。Nuwa 另有文字研究功能，可按线索整理出摘要与来源。"],
          ["03", "回来源核实", "不同角度的照片有机会匹配到同一个人。相似候选仍需来源和其他证据复核。"]
        ],
        paragraphs: ["例子是上传自己的一张自拍，找到另一个网页上自己的一张会议照。文字搜索要先有姓名、会议等线索。普通以图搜图可找到转载或视觉相似图。以脸搜脸增加了在人脸索引中匹配不同照片的能力。浏览器也可以打开同类搜脸网站，结果取决于用的是哪套索引。", "Nuwa 说它覆盖公开资料与授权数据集，并维护自身的检索索引。授权数据可以被接入自建索引，也可以通过外部检索服务调用。供应商、来源比例、多少由 Nuwa 采集以及如何授权，均未披露。"],
        sources: [["Nuwa 接口公开文档", "https://clawhub.ai/andrewchen-oss/nuwa-world-osint-human-research"], ["Nuwa 的数据来源说明", "https://www.linkedin.com/posts/nuwaworld_most-identity-intelligence-tools-still-treat-activity-7508171499829211136-akCi"], ["NIST 人脸检索说明", "https://pages.nist.gov/frvt/html/frvt1N.html"]]
      },
      {
        id: "payment", title: "谁可能买，哪些收入已经能确认？",
        bullets: [
          ["个人和创作者", "偶尔需要查自己的照片是否被冒用，找到可核实的线索就可能值一次查询费。低频需求带来的消费订阅意愿仍待验证。"],
          ["平台或反欺诈团队", "若经常复核冒用图片的账号，把几处资料集中比对能省下人工时间。Nuwa 提到匿名企业案例，未披露合同金额和续费情况。"],
          ["公开营收口径", "团队 2025 年 12 月称早期按使用付费，平均日营收约 378 美元，峰值 1,500 美元。13.8 万美元是按日营收折算的年化估计。原帖另称约 1 万美元 MRR、后到 30 万美元 ARR，收入构成和计算明细尚未核实。"]
        ],
        sources: [["早期按次营收复盘", "https://medium.com/@NuwaWorld/how-we-accidentally-built-one-of-the-fastest-growing-ai-products-in-december-2025-4342826fec1e"], ["企业使用案例", "https://www.linkedin.com/posts/nuwaworld_most-identity-tools-ask-you-to-know-who-youre-activity-7504913287814488064-LbgS"], ["Nuwa API 平台", "https://platform.nuwa.world/"], originalPost]
      },
      {
        id: "judgment", title: "我们的理解｜App 可以实现，差异要看搜索结果",
        paragraphs: ["用有权使用的 100 张照片就能做一个小实验，用现成模型提取特征，再给一张新图找相似脸。把这个能力扩大到网络规模的难处，是可查的照片覆盖、更新和授权。若接入的库人人可得，便利和排序仍有价值，竞争者也可以接入同样的数据。"],
        callout: ["判断产品价值的测试", "拿同一批经过授权的测试图片，比同类服务多找到哪些正确来源、出现多少误匹配，客户是否会重复用。现有公开资料尚无这组独立结果。"]
      }
    ]
  },
  {
    id: "yuwen", name: "余温", handle: "@gkxspace", stage: "deep", accent: "green",
    topic: "从真实问法找到 GTM 需求",
    graphic: {
      src: "yuwen-demand-map.png", width: 2700, height: 4068,
      alt: "余温的 GTM 出海站研究总览。包括他的产品、收入和获客，Google、ChatGPT 与社区的三种需求调研方法，实测搜索结果、13 条社区提问，以及从问题验证到订单的步骤。"
    },
    product: "最初自用的 GTM 网站，站名和产品功能未公开。",
    acquisition: "Claude 辅助研究竞品和制作细分页，余温自述早期主要靠 ChatGPT 等搜索入口带来流量。",
    revenue: "本人披露过站点订单及单日收入，具体商品、定价结构和净利未公开。",
    takeaway: "用搜索问法找候选，用公开工作场景核对真实卡点，再用试用和订单验证。",
    sections: [
      {
        id: "methods", title: "先查 Google 搜什么，再查 ChatGPT 怎么问",
        methods: [
          {
            name: "Google 搜索", purpose: "找实际搜索用词，比较相关需求。",
            steps: ["打开 Google Trends，输入 recently funded startups。选美国和过去 12 个月。", "在「相关搜索」里看「热门」和「上升」，记录具体词组及所选地区。Google 联想词也能补充候选表达。", "需要比较月搜索量时，把候选交给 Google Ads 关键字规划工具，按平均每月搜索量排。需要完成账号和结算设置，数值包含近似变体。"],
            result: "你会得到相关搜索词、相对热度，或估算的月搜索量。",
            sources: [["Google Trends", "https://trends.google.com/trends/"], ["相关搜索说明", "https://support.google.com/trends/answer/4355000?hl=zh-Hans"], ["关键字规划工具", "https://support.google.com/google-ads/answer/7337243?hl=zh-Hans"]]
          },
          {
            name: "ChatGPT 问法", purpose: "看问题怎么写，以及用户想拿到什么结果。",
            steps: ["打开 Semrush 的 AI Visibility Toolkit → Prompt Research，输入同一个种子主题。", "打开相关主题或 Prompts 标签，查看 ChatGPT 问法样本。记录问题里的对象、条件和预期交付，例如国家、融资轮次、是否要导出。", "用 AI Volume 比较主题的估算热度。拿典型问法做一次联网测试，记录它能找到哪些页面，以及答案能给到哪一步。"],
            result: "样本可以帮助理解问法。主题热度是估算，公开渠道看不到其他人完整的 ChatGPT 对话。",
            sources: [["Prompt Research 操作说明", "https://www.semrush.com/kb/1597-prompt-research-report"], ["问法数据来源", "https://www.semrush.com/kb/1607-semrush-ai-visibility-data"], ["OpenAI Signals 汇总数据", "https://openai.com/signals/"]]
          }
        ],
        callout: ["同一个问题分两次看", "用户有没有问过，用搜索词和问法样本核对。现成答案能交付到哪一步，用联网复测核对。已上线后，可再对照自己站点的搜索词、访问来源和订单。"],
        sources: [["Search Console 查询报告", "https://support.google.com/webmasters/answer/17010961"], ["Bing AI 引用与检索词", "https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/"]]
      },
      {
        id: "case", title: "余温实际公开了什么？",
        paragraphs: ["GTM（Go-to-Market）在这里指找目标客户、推广和拿到订单。余温说这个站属于 GTM，最初给自己用。原帖披露的是他的增长方法，站名、网站功能及付费项目都未公开。", "他的做法是先让 Claude 研究竞品和表现好的页面，再让它按人群、场景和具体问法生成上千个概览和问答页面。站点上线后，看收录、成交与收入，再优化转化好的页面。Claude 负责研究和生产网页，ChatGPT 联网搜索可以引用网页并带来点击。", "他称 11 月 11 日日收入从数百元升到 1,000–2,000 多元，随后提到一笔 100 美元订单。11 月 19 日自述单日约 7,000 元，含一笔 600 美元订单。数据是单站自报记录，具体卖的东西、付费结构、利润和 ChatGPT 订单占比均未披露。"],
        sources: [["余温确认 GTM 及自用起点", "https://www.teapaw.org/gkxspace/status/2120501979743219819"], ["11 月 11 日增长复盘", "https://www.teapaw.org/gkxspace/status/2120464771900379217"], ["单笔 100 美元的更新", "https://www.teapaw.org/gkxspace/status/2120497678857769379"], ["11 月 19 日订单复盘", "https://www.teapaw.org/gkxspace/status/2123387683615735845"]]
      },
      {
        id: "signals", title: "我们的搜索记录｜哪些问题有现成答案？",
        table: {
          headers: ["我们要找的需求", "Google 实测联想词", "主动联网检索的发现"],
          rows: [
            ["找首批 SaaS 客户", "how to get first clients for saas\nb2b saas how to get first customers", "已有直接讲怎么拿到前 10 位 B2B 客户的教程。"],
            ["找刚融资的公司", "recently funded startups in usa\nrecently funded startups in australia\nrecently funded startups hiring", "已有近 90 天融资名单、按轮次筛选和导出服务。通用名单已经有供给。"],
            ["有公司名单，找决策人", "how to find decision makers on linkedin\nhow to find decision makers in a company", "找到 Apollo 从公司网址查决策人的说明。一个网址是具体的产品输入。"],
            ["查某家公司实际用什么软件", "how to find a company's tech stack\nhow to find out what tech stack a company uses", "通用问题能找到查网站技术的工具。具体问澳大利亚护理机构使用哪套内部排班或开票软件时，结果大多是行业产品和官方门户。"]
          ]
        },
        callout: ["记录口径", "上表的 Google 联想词是我们实际取到的结果。联网一列是我们主动输入问题做的检索。Google Trends 当时限流，未取得趋势对照。本轮未测月搜索量，也尚未取得本主题的真实 ChatGPT 提问样本或频次。"],
        sources: [["Google 联想词口径", "https://support.google.com/websearch/answer/7368877"], ["首批客户教程", "https://getlaunchlist.com/blog/how-to-get-your-first-10-customers"], ["融资名单产品", "https://www.vcbacked.co/recently-funded-companies"], ["Apollo 公司域名查询", "https://www.apollo.io/insights/find-all-the-key-decision-makers-at-a-company-using-just-its-website-domain"], ["Wappalyzer 网站技术查询", "https://www.wappalyzer.com/docs/api/v2/lookup/"]]
      },
      {
        id: "community-method", title: "从社区找问题｜怎么搜、怎么判断",
        steps: [
          ["01", "按手头的工作去搜", "找首批访谈或试用时，搜 Reddit、Hacker News、Indie Hackers、Product Hunt 和 V2EX。查名单、融资、联系人或采购角色时，再搜 Clay、Crunchbase 和 HubSpot 的公开支持社区。前者能看到创业者想完成什么，后者常能看到已有工具用到哪一步卡住。"],
          ["02", "留下原话里的具体条件", "点开提问原帖及作者的跟进，记下谁在做、手上已有的材料或工具、试过的办法、卡住的一步和想交付的结果。例如「手里已经有一份 CSV，还要判断每家公司是否做 AI、后来有没有融资」，比只记「需要找潜客」更接近可做的需求。"],
          ["03", "跨来源核对，把同一个问题合在一起", "同一个人跨版发帖按一个案例看。有人在不同社区独立提到同一道工序，值得优先核对。首批访谈、试用和付费是不同阶段，哪怕都写成「找首批客户」，也应保留各自具体的卡点。"],
          ["04", "看用户已经投入了什么", "已整理的名单、手工核对的工时和已付费的工具，都能说明这个工作已经有人在做。Crunchbase Pro 用户过去付过钱，能说明他有这项工作和现有预算。其他人愿为新方案付费多少，要用交付和订单继续验证。"]
        ],
        bullets: [
          ["可复用的找帖搜索词", "site:news.ycombinator.com \"validate your idea\"、site:v2ex.com \"第一批\" \"用户\"、site:community.clay.com \"funding\"、site:community.hubspot.com \"left company\"。拿 Google 或 AI 样本里看到的表达替换关键词，再回原帖查实际情境。"]
        ],
        callout: ["把热度线索变成可检验的需求", "搜索能告诉我们人们可能怎样表达，社区能说明已经做了什么。两个信号都出现时，可以先做一份很小的样表，观察它是否真的让用户少做一步。社区帖子本身没有 Google 月搜索量、ChatGPT 提问频次或复购指标。"]
      },
      {
        id: "forums", title: "两轮社区调研｜实际提问与来源",
        paragraphs: ["下表汇总了前面两轮查过的原帖。问题是中文转述，最后两列记录我们从案例里看到的已有材料和工作障碍。"],
        table: {
          headers: ["真实提问", "手上已有的东西", "真正卡住的一步", "原帖"],
          rows: [
            ["产品还没做，到哪找 10 个潜在客户聊需求？", "有 SaaS 想法，想用十次对话了解问题。", "找到符合目标条件、愿意给出实际反馈的人。", [["Reddit · 找访谈对象", "https://www.reddit.com/r/SaaS/comments/1ufhlgs/how_would_you_find_your_first_10_customer/"]]],
            ["产品已经做出来了，去哪找第一批愿意试用并反馈的人？", "有自己已在用的产品，或有少量注册。", "接触愿意实际试用、反馈足够具体的人。", [["V2EX · 首批试用", "https://fast.v2ex.com/t/1258625"], ["Hacker News · MVP 反馈", "https://news.ycombinator.com/item?id=26644616"]]],
            ["产品做好了，没营收，冷邮件、社区、SEO 和广告该先做哪个？", "已有 B2B SaaS，要在有限时间内找首批付费客户。", "判断哪条渠道最可能在当前阶段拿到实际订单。", [["Reddit · 首批客户渠道", "https://www.reddit.com/r/SaaS/comments/1v5g2c5/how_did_you_land_your_first_10_customers_cold/"]]],
            ["有人注册或看演示，怎么让前几家真的用起来并付钱？", "有演示、试用或免费注册。其中一位发帖人有 220 个注册，尚无付费。", "区分已看演示、已实际使用和已付费，找到用户在哪一步停下来。", [["Indie Hackers · 前五家实际使用", "https://www.indiehackers.com/post/b2b-founders-how-did-you-get-your-first-5-customers-to-actually-use-the-product-e6ef23429b"], ["Product Hunt · 首批付费", "https://www.producthunt.com/p/general/how-did-you-actually-get-your-first-10-paying-customers-not-signups-paying"], ["Reddit · 220 个免费注册", "https://www.reddit.com/r/SaaS/comments/1oe0ih2/220_free_users_0_paid_whats_your_1_tactic_for/"]]],
            ["怎么找种子轮到 B 轮、主营 App 或订阅的公司？", "有明确的融资和产品条件。", "筛出公司后，核对它的主营业务确实符合条件。", [["Reddit · 融资与产品条件", "https://www.reddit.com/r/ycombinator/comments/1qs3giu/how_to_search_leads_for_b2b/"]]],
            ["怎么找刚融到资、只有 1～10 人、正在做增长的 B2B 软件团队？", "知道目标公司处于种子或种子前阶段，想选合适的数据源和筛选项。", "同时核实融资轮次、团队大小和增长信号。", [["Reddit · 小团队和融资", "https://www.reddit.com/r/SaaS/comments/1ts2f4o/how_do_you_find_earlystage_funded_b2b_saas/"], ["Reddit · 近期融资名单", "https://www.reddit.com/r/b2bmarketing/comments/1mbame2/where_can_i_find_lists_of_startups_that_have/"]]],
            ["怎么筛出 YC 2023 批次中做 AI、后来又融资、仍在运营的公司？", "发帖人后来拿到了 YC 公司 CSV。", "逐家补充并核实业务、融资和运营状态。", [["Clay · 补齐 YC 名单", "https://community.clay.com/x/general/msg_WmHny846TT2q/finding-2023-yc-companies-focused-on-ai-with-fundi"]]],
            ["昨天有一批新公司进了我的保存搜索，今天怎么找回？", "已付费的 Crunchbase Pro 账号、保存好的搜索条件。", "按进入结果集的日期找回上一批公司，接着昨天的工作继续。", [["Crunchbase · 保存搜索反馈", "https://support.crunchbase.com/hc/en-us/community/posts/44407081213715-Is-there-a-way-to-sort-companies-in-a-Saved-Search-by-when-they-were-added-to-Crunchbase"]]],
            ["怎么查不足 50 人、登记未满一年的澳大利亚护理机构，在用什么排班或开票软件？", "政府注册机构 CSV、行业目录 PDF，已设定要找的公司范围。", "补齐登记时间、团队规模和现用软件，同时留下能核查的出处和缺失项。", [["Clay · 护理机构数据需求", "https://community.clay.com/x/general/msg_u3Q4TH4YmWVQ/how-can-i-find-small-care-providers-and-see-what-s"]]],
            ["公司正在招运营人员，怎么判断它可能需要我的自动化服务？", "知道目标公司和招聘信息，也有明确的服务内容。", "把岗位描述里的任务和服务对应起来，再判断是否有足够的证据值得跟进。", [["Reddit · 招聘与购买信号", "https://www.reddit.com/r/b2bmarketing/comments/1xtintj/how_do_you_guys_actually_use_buying_signals_for/"]]],
            ["已有目标公司，也有人回信，但回信的人做不了采购决定，接下来找谁？", "已经联系到公司里负责调研选项的人。", "找到使用者、评估人和能审批预算的人，弄清 IT、法务或财务何时参与。", [["Reddit · 中型公司的购买人", "https://www.reddit.com/r/SaaSSales/comments/1u1b4gq/how_to_find_decision_makers_at_midmarket_companies/"]]],
            ["联系人已经离职，怎么保留历史又能筛掉？", "CRM 里已有该联系人和历史交流。", "保留旧记录，同时把仍可跟进的联系人筛出来。", [["HubSpot · 联系人离职", "https://community.hubspot.com/t/contacts-who-left-company/38285"]]],
            ["同一个人这笔交易是决策人，下一笔只负责引荐，怎么记录？", "销售团队已经在 CRM 里关联多个联系人和多个交易。", "按具体交易保留购买角色，避免更新当前角色时覆盖历史。", [["HubSpot · 按交易记录购买角色", "https://community.hubspot.com/t/best-practice-recommendation-buying-roles-as-a-deal-property-rather-than-a-contact-property/21651"]]]
          ]
        }
      },
      {
        id: "apollo", title: "真实同类示例｜Apollo 的文章怎么接到产品？",
        paragraphs: ["假设一个字幕软件创始人问：怎么找 50 家美国小型视频营销公司和对接人？如果 ChatGPT 联网引用 Apollo 的按行业建名单指南，他能点开文章，再用免费版按地区、行业、公司规模和职位试做名单。持续找新名单、补工作联系信息、同步 CRM 时，才可能需要更多额度或订阅。", "如果 ChatGPT 联网一次就能找出足够的名单和可核查来源，这次没有必要买 Apollo。付费的价值要比较重复使用时节省了多少时间、有效线索多了多少。Apollo 是用于解释链路的真实例子，余温的站具体卖什么仍待查证。"],
        sources: [["Apollo 的落地页面", "https://www.apollo.io/insights/build-a-prospecting-list-of-accounts-and-decision-makers-in-a-specific-industry"], ["Apollo 的筛选功能", "https://knowledge.apollo.io/hc/en-us/articles/4412665755661-Use-Search-Filters-to-Find-Prospects"], ["Apollo 的收费口径", "https://www.apollo.io/pricing"]]
      },
      {
        id: "judgment", title: "我们的理解｜先确认卡在哪里，再决定做什么",
        steps: [
          ["01", "找出现过的问法", "从 Google 或 AI 样本挑一个反复出现的话题，记下用户明确说出的条件。"],
          ["02", "看他已做过什么", "在实际帖子和支持论坛找现有材料、工具和已经试过的做法，定位卡住的一步。"],
          ["03", "给出一个可验证结果", "先拿 20 家护理机构做一份有来源的样表，区分核实项、推测项与缺失项，验证是否改变跟进决策。"]
        ],
        paragraphs: ["关键词热度只能带我们找到人们怎么表达。真正值得单独做一页的条件是：回答这个问题，需要不同的筛选、示例或交付。已有页能完整回答的近义问法可以合在一起。访问、页面被引用、点进来试用、付费需要分别追踪。"],
        callout: ["最值得继续研究的切口", "从泛泛的「卖公司名单」缩到「帮客户核实一列难查的信息」。问清楚谁每周都要做、目前花多少时间、这份结果能不能改变下一步决策。"]
      }
    ]
  },
  {
    id: "droidhz", name: "droidHZ", handle: "@hezhiyan7", stage: "deep", accent: "lilac", topic: "从 5 美元订阅到持续经营一个海外工具站",
    graphic: {
      src: "droidhz-channel-map.png", width: 2700, height: 4518, skipLabel: "跳到正文",
      alt: "droidHZ 研究长图。从 MakeMeme 的小额付款到主力站的海外订单，介绍社区、搜索词、竞品差评与目录点击四种需求信号，演示 TAAFT 回本和订单追踪，并列出 ReplyGuy 从客户提议、人工试做、首批付费到购买精选位的时间线。"
    },
    product: "早期公开过 AI 表情包工具 MakeMeme，还试过 Wan 视频模型相关的新词站。后续主力站未公开站名。",
    acquisition: "早期试过产品发布目录。主力站有海外付费后，加内页、买目录外链、小额投流并检查用户体验。",
    revenue: "MakeMeme 本人披露订阅收入 5 美元和国内转账 20 元。2026 年 5 月复盘称 3 月达到月入万刀，主力站的收费结构未公开。",
    takeaway: "用目标用户的付费决定集中经营哪一个站，再看哪个渠道带来的用户完成体验和下单。",
    sections: [
      {
        id: "products", title: "他到底做了什么网站？",
        paragraphs: ["droidHZ（赫兹）以前做 App 开发，2025 年 5 月 22 日开始学习做海外网站。他早期公开了 MakeMeme，一款把普通照片生成表情包的网页工具。2025 年 7 月的复盘写明，当时已做过 5 个海外站，其中 3 个是练手站。MakeMeme 披露的订阅收入是 5 美元，另有国内用户转账 20 元。", "他也试过围绕 Wan 视频模型的热词做站。多数试验反馈有限，表情包站零星出单且付费以国内用户为主。2025 年 11 月初开始有持续海外付费的，是复盘中提到的另一个站。公开资料无法确认这个主力站卖的具体功能、域名或定价。"],
        sources: [["2025 年 7 月本人复盘", "https://w2solo.com/topics/5969"], ["MakeMeme 官网", "https://www.makememe.net/"], ["十个月出海复盘原文镜像", "https://en.rattibha.com/thread/2038764303608852543"]]
      },
      {
        id: "timeline", title: "从零星出单到集中做一个站",
        timeline: [
          ["2025.05", "开始做海外站", "从 App 开发转入 Web，利用 AI 编程快速上线。七月已经有 MakeMeme 等试验产品和真实小额付款。"],
          ["2025.08–10", "多次试词，结果有限", "尝试多个新词站，有项目进黑客松决赛，实际订单与结果仍然不连续。"],
          ["2025.11", "出现海外用户付费，转向主力站", "增加推广、外链和内页，用看板看体验和付费。截至 11 月 22 日，他披露当月网站收入 990.28 美元，另有独立披露的商单收入。"],
          ["2026.03–05", "继续优化获客与转化", "试小额关键词投放、内页、外链和英文社媒。一周年复盘称 3 月达到万刀，5 月仍相对稳定。完整月度流水未公开。"]
        ],
        sources: [["出海半年复盘存档", "https://javaht.github.io/chuhai-knowledge-base/0302.html"], ["十个月复盘", "https://en.rattibha.com/thread/2038764303608852543"], ["本人一周年复盘", "https://www.w2solo.com/topics/7406"]]
      },
      {
        id: "demand", title: "他如何找需求，怎么知道有进展？",
        bullets: [
          ["从几个不同信号找产品题目", "先看自己与社区遇到的具体问题，再找有增长的关键词。看已有软件差评或有人花钱买的人工服务，也能找到用户想替换的步骤。"],
          ["看目录用户实际点去哪", "他公开分享过用 Similarweb 看 Toolify 等工具目录的出站流量，观察哪些产品拿到点击，也查竞品主要从哪些外部站点接到访问。这属于点击和渠道线索，付费仍要用自己的订单验证。"],
          ["把流量词翻译成用户任务", "他举过 free ai tools 和 ai image to video generator 的例子。前一个词的人可能随便逛，后一个词的用户已经有一张图和一个明确任务，可以用能否生成视频来检验体验。"],
          ["用上线且可付费的版本看反馈", "MakeMeme 的小额支付表明有人付过费。主力站出现实际海外客户后，他才把更多维护和推广投入放到同一个站。两个站各自最早是从哪里发现需求的，公开资料未说明。"]
        ],
        sources: [["赫兹的选品与 MVP 方法", "https://w2solo.com/topics/5969"], ["十个月复盘的选、看、测流程", "https://en.rattibha.com/thread/2038764303608852543"], ["赫兹的出站流量与外链文章索引", "https://www.w2solo.com/topics/7406"]]
      },
      {
        id: "channels", title: "海外首单后，他怎样放大流量？",
        bullets: [
          ["有受众的目录或外链", "把产品放到工具目录或发布平台，让正在找相类工具的人点击进来。目录流量和外链对搜索曝光的作用是两个观测口径，复盘没有拆算各自贡献。"],
          ["小额投流与站内页面", "本人说先找和产品契合的关键词，试每天几十元，看到收益打正后才慢慢加预算。同时加内页和外链，也试过英文 X 和 YouTube。"],
          ["追踪访问到付款", "按来源对照访问 → 登录 → 成功体验功能 → 付费。用 Clarity 回放观察用户卡在哪里，结合反馈修产品。看渠道时要同时看有效体验和订单。"]
        ],
        sources: [["十个月复盘的获客与转化部分", "https://en.rattibha.com/thread/2038764303608852543"], ["本人整理的外链和投放资料", "https://www.w2solo.com/topics/7406"]]
      },
      {
        id: "revenue", title: "TAAFT 的 1,229 美元和 16,065 美元怎么读？",
        paragraphs: ["TAAFT 指 AI 工具目录 There’s An AI For That。已查到赫兹本人的公开披露。他列出 7 × 49 + 347 + 490 + 49 美元，累计支出 1,229 美元。他的文章索引标注这条渠道有 800 多笔付费订单、16,065 美元收益。花费来自多笔记录，两数相除约 13.1 倍。购买细节在付费文章中，本次只核对了公开口径。", "他也提到有人买目录后没出单，可能与类目和站内转化有关。判断这条渠道有多值，还要知道归因窗口和规则、是否含续费、退款、算力成本及支付费用。公开数据支持作者披露了渠道收入和支出，净利与投放增量仍待验证。"],
        sources: [["赫兹的 TAAFT 本人披露存档", "https://mobile.twstalker.com/hezhiyan7"], ["赫兹网站的复盘索引", "https://aichuhai.dev/articles?tag=all"], ["赫兹的 TAAFT 详述（付费文章）", "https://mp.weixin.qq.com/s/qhm4EIMToTHQYPAuebWshA?scene=1"], originalPost]
      },
      {
        id: "directory-test", title: "已经出单，怎么决定要不要买目录展示？",
        steps: [
          ["01", "确认来的人在找同一件事", "看目标国家的已付款客户用什么功能，查看目录的对应类目和同类产品。第三方出站流量只用来判断可能的访问来源。"],
          ["02", "先算要几单回本", "例：一次展示 100 美元，每单扣掉交付和收款费用后剩 25 美元，至少要 4 单回本。如果预计只来 100 个相关访问，至少要有 4% 的付费转化。这是示例，目录现价和实际转化要另查。"],
          ["03", "跟踪来源，跑完再决定加不加", "为目录访问使用专门的来源参数，例如 utm_source=taaft。站内记录成功体验和付款，尽量分开新订单和续费。自然搜索排名的变化单独看。"]
        ],
        callout: ["赫兹公开过一次实际的广告归因", "在 Google Ads 复盘中，他先选已有出单的国家，给广告加 UTM 来源追踪，并记录登录和购买事件。那次自述广告花费 2,159 港元、归因收入 2,823 港元，尚未扣 API 成本。这是独立于 TAAFT 的另一笔渠道账。"],
        sources: [["赫兹的 Google 投流复盘", "https://mobile.twstalker.com/hezhiyan7/status/2016671075023933615"], ["Google 的网站来源参数说明", "https://support.google.com/analytics/answer/10917952?hl=en"]]
      },
      {
        id: "replyguy", title: "真实案例｜ReplyGuy 从需求到出单，再投 TAAFT",
        timeline: [
          ["2023.04", "现有客户主动提出需求", "创始人做过品牌提及监测，几位客户提出：发现有人提及品牌后，希望能更及时地回应。"],
          ["2023.09–10", "先人工交付，随后有人付款", "先由人处理回复，验证客户是否需要这一步。早期版本叫 Replyze，第一批付费客户从 X 找来。"],
          ["2024.01", "在 Product Hunt 重新发布", "创始人自述发布后四天新增约 30 位付费客户，已经有一批明确的购买者。"],
          ["2024.02–05", "免费露出后买精选位，效果后来消退", "当时先免费进入 TAAFT 新发布区，再付费买精选展示位。创始人说这个渠道带来一些年付客户，3 月之后效果不再，团队转而试其他渠道。未披露该渠道花费和订单流水。"]
        ],
        sources: [["ReplyGuy 创始人的完整复盘", "https://medium.com/@alexandr.belogubov/from-a-failed-launch-to-10k-mmr-and-a-6-figure-sale-the-replyguy-story-58bb9a0fd331"], ["Product Hunt 历史发布页", "https://www.producthunt.com/products/replyguy"]]
      },
      {
        id: "judgment", title: "我们的理解｜先找到对的人，再看哪一步值得加钱",
        paragraphs: ["这个案例最清楚的一步是，从很多快速试验中找到了有真实海外客户的那个站。拿到订单后，才逐步查清流量从哪来、体验在哪卡住、花钱推广有没有多转化。主力站的具体任务和付费动机仍待核实，这限制了我们对选品本身的判断。"],
        callout: ["可以复用的验证", "给一条推广来源单独记录访问、成功完成核心任务和订单。入口没人点，先核对人群和场景。有人试但做不完，先修产品。有人完成但不买，先研究免费和付费各交付什么。"]
      }
    ]
  },
  {
    id: "61", name: "61", handle: "@liuyi0922", stage: "deep", accent: "blue", topic: "把听歌和学单词做成愿意重复的动作",
    graphic: {
      src: "61-product-value.png", width: 2700, height: 2417, skipLabel: "跳到正文",
      alt: "61 的产品研究图。谜底黑胶的价值在唱针、播放和桌面小组件的使用体验，AI 能推荐专辑并辅助设计。CapWords 的价值在拍照后自动保存词卡并方便复习，多模态 AI 能完成识物、取词和生成词卡内容。检验价值分别看重复播放与收藏后复习。"
    },
    product: "谜底黑胶让流媒体用户选唱片、放唱针、在桌面看唱片旋转。CapWords 把拍下来的物品变成带外语名称和发音的词汇贴纸，供收藏和复习。",
    acquisition: "谜底黑胶的桌面组件在 TikTok 被用户展示，61 也发过 X 视频和小红书录屏。CapWords 获得苹果设计奖，也有 App Store 编辑专题。",
    revenue: "谜底黑胶免费下载安装，提供一次性 Pro 内购。CapWords 用月订阅和年订阅解锁无限拍词和完整复习。两款产品的实际收入和转化率未公开核实。",
    takeaway: "从真实生活里找一个想反复做的动作。用短演示验证别人能否看懂，再看他们第一次做完后会不会主动做第二次。",
    sections: [
      {
        id: "product-value", title: "两款 App 分别给用户什么？",
        bullets: [
          ["谜底黑胶把价值交付在听歌当下", "你想认真听一张熟悉的专辑。歌还是从已有的音乐服务播放，谜底黑胶让你像翻唱片一样挑中它、放下唱针，也能把转动的唱片放到手机桌面。对喜欢专辑封面和黑胶操作的人，这套播放体验本身就有价值。"],
          ["CapWords 把查词变成下次还能用的词卡", "你散步时碰到一个路锥，举起手机拍照，得到 traffic cone 的文字、发音和用那张照片做的贴纸。晚上重新打开，能用自己见过的那个路锥复习。一次问 AI 也能得到词义，CapWords 把随手查到的词直接留下来，减少自己整理词卡的步骤。"]
        ],
        callout: ["怎么判断这份价值有没有持续", "谜底黑胶看用户尝鲜后是否还会用它听歌。CapWords 看用户收藏之后是否回来复习。公开资料能确认两款产品交付的体验，实际留存和学习效果仍待验证。"],
        sources: [["61 本人解释黑胶播放体验", "https://quaily.com/apptisan/p/md-vinyl/"], ["Apple 展示 CapWords 的拍照贴纸流程", "https://developer.apple.com/articles/capwords/"], ["CapWords 官网关于词库和复习的说明", "https://capwords.app/faqs"]]
      },
      {
        id: "starting-point", title: "61 怎么发现这两个机会？",
        paragraphs: ["61（柳毅）在做过 Mac App 和 Price Tag 后，于 2018 年与伙伴成立谜底科技。谜底黑胶来自他的收藏和听歌习惯。他注意到流媒体让播放越来越方便，现实里翻封套、挑选唱片、把唱针放下去这些动作，却会让自己更专注地听一张专辑。于是团队先把这段体验搬到 iPhone。", "CapWords 来自另一个反复出现的场景。按苹果对团队的采访，Ace Lee 的女儿会沿路指着东西问英文怎么说。他从孩子喜欢贴贴纸这件事想到，能否把路上遇见的物品变成贴纸，既知道怎么称呼它，也能留到以后再看。61 在获奖时公开说自己和朋友业余参与了这个产品，苹果访谈记录了发起人 Ace 和合作者的设计过程。"],
        sources: [["61 本人谈谜底黑胶的起点", "https://quaily.com/apptisan/p/md-vinyl/"], ["参与者 61 的 CapWords 获奖发帖存档", "https://xoutlier.il.ly/u/liuyi0922"], ["Apple 对 CapWords 团队的访谈", "https://developer.apple.com/articles/capwords/"]]
      },
      {
        id: "md-vinyl", title: "谜底黑胶｜把听歌做成一次可见的动作",
        steps: [
          ["01", "连上已有的音乐服务", "用已有曲库听歌。产品从一个唱片旋转小组件起步，后来把挑唱片、播放和展示做进完整 App。"],
          ["02", "像翻唱片一样选歌", "滑过一排专辑封面，抽出想听的一张。把唱针拖到盘面，唱片开始转动并播放。"],
          ["03", "把正在听的歌摆到桌面", "手机桌面的小组件继续显示转动的唱片和唱片封面。这个动作也很容易用一段录屏展示。"]
        ],
        callout: ["用户看重什么", "61 的访谈强调听音乐时的注意力和感受。商店里也有用户提到唱针控制、桌面小组件和去广告是考虑买断的原因。这是具体购买动机的线索，整体付费构成仍需数据。"],
        sources: [["61 的产品设计和买断访谈", "https://quaily.com/apptisan/p/md-vinyl/"], ["谜底黑胶 App Store 产品页与开发者回复", "https://apps.apple.com/us/app/md-vinyl-music-app/id1606306441"]]
      },
      {
        id: "capwords", title: "CapWords｜拍一下，留下一个自己遇到过的词",
        steps: [
          ["01", "拍下今天遇到的东西", "比如看到路锥，打开相机拍一张。最初的版本用 Apple VisionKit 抠出照片里的物体，团队用 GPT-4 验证能否识别物体并返回多种语言的名称。"],
          ["02", "确认物体，听发音，把它收下来", "点击确认时后台已经在请求识别结果，贴纸动效给等待一个自然过渡。结果是从自己照片里取出的可保存贴纸，带单词和发音。"],
          ["03", "从词库回到自己的生活", "贴纸进入个人词库，后续可以复习。2.0 的 Speak 又把已保存的词和日常照片带入口语练习，让用户用自己经历过的事开口。"]
        ],
        callout: ["为什么专门做个 App", "问 AI 一次就能得到 traffic cone。CapWords 把拍照、识别、听音、收藏和复习连在一起，下次回来可以接着练自己拍过的词。长期价值要看用户是否真的回来复习或开口。"],
        sources: [["Apple 访谈里的抠图、识别与动效", "https://developer.apple.com/articles/capwords/"], ["CapWords 团队讲产品起点", "https://capwords.app/about"], ["CapWords App Store 更新记录", "https://apps.apple.com/us/app/capwords-ai-language-tutor/id6738896465"]]
      },
      {
        id: "acquisition", title: "怎么获客？能查到哪些具体动作？",
        timeline: [
          ["2022.07", "海外用户在 TikTok 展示桌面组件", "当年的报道记录了一位用户把旋转唱片放在手机桌面正中央，拍成短视频。该时期谜底黑胶的美区下载榜排名也快速上升，具体有多少下载来自视频尚无公开归因。"],
          ["2025.02", "谜底黑胶 3.0 用录屏展示", "61 在 X 发上线视频和设计过程，又把一段实际操作的录屏发到小红书小号。他在日记里说这条笔记受到关注，随后开始用开发者身份介绍产品。"],
          ["2025.03", "谜底黑胶获得过 App Store 首页推荐", "61 在 3 月 7 日的日记记录了首页 Banner。平台推荐和社媒传播各带来多少安装，缺少公开归因。"],
          ["2025", "CapWords 获奖和商店编辑曝光", "CapWords 获得 Apple Design Awards 的 Delight and Fun 类别奖，也获选中国大陆 App Store 年度 App。苹果的编辑专题用拍照变贴纸演示产品。"]
        ],
        callout: ["产品本身可以演示", "谜底黑胶的录屏能看见唱针落下、唱片转起来。CapWords 的录屏能看见物品从照片里变成贴纸。我们可以推断这让产品更容易被展示，具体下载和购买仍要按渠道测。"],
        sources: [["扬帆出海对早期 TikTok 视频的报道", "https://www.yfchuhai.com/article/7394.html"], ["61 记录在 X 发演示的日记", "https://61.life/2025/0227"], ["61 记录小红书录屏的日记", "https://61.life/2025/0228"], ["61 记录 App Store 推荐的日记", "https://61.life/2025/0307"], ["苹果设计奖结果", "https://developer.apple.com/design/awards/2025/"], ["CapWords 中国大陆年度 App 专题", "https://apps.apple.com/cn/iphone/story/id1850796065"]]
      },
      {
        id: "revenue", title: "怎么赚钱？下载数据能说明什么？",
        bullets: [
          ["谜底黑胶的买断", "App Store 标为免费并含内购。核对时美国区列有 14.99 美元的 MD Vinyl Pro，开发者也确认过一次性终身内购。61 在采访里说团队常从一个小点子和买断起步，随产品完善调价，觉得价值足够时再考虑同时提供订阅和买断。"],
          ["CapWords 的订阅", "按官网 FAQ，可选月付、年付。Pro 解锁不限次数拍词和完整复习。到期后仍可访问已存贴纸，新拍词次数受限。用户是否愿意续费，取决于这套流程能不能持续用起来。"],
          ["500 万下载有本人记录", "61 在 2025 年 8 月的日记记录了谜底黑胶达到 500 万 iOS 下载。原帖里的 13 亿首歌为转述。原帖还提到一款买断产品接近 1,000 万下载，但没有点出产品名，当前未找到原始发言来确认。下载量和播放量各自衡量使用规模，付费比例和利润需要另外的数据。"]
        ],
        sources: [["谜底黑胶美国区内购与开发者回复", "https://apps.apple.com/us/app/md-vinyl-music-app/id1606306441"], ["61 本人谈买断和定价", "https://quaily.com/apptisan/p/md-vinyl/"], ["CapWords 订阅条款说明", "https://capwords.app/faqs"], ["61 记录 500 万 iOS 下载", "https://61.life/2025/0824"], originalPost]
      },
      {
        id: "judgment", title: "AI 时代最值得借鉴的一点",
        paragraphs: ["先找出用户愿意重复做的动作，再决定技术怎么配合。谜底黑胶让每天的听歌多一个选唱片和操作播放的理由。CapWords 用 AI 减少识别和翻译的麻烦，再让用户一张张积累自己的词库。两者的价值都要靠反复使用来验证。"],
        callout: ["把这个思路用到我们自己的产品", "用一小段完整演示测别人能否马上看懂，再让对方用自己的音乐或照片试一回。记录首次成功后第二次打开做了什么。对 CapWords 这样的产品，尤其值得看用户第二天是否主动拍新词、重看旧词或练口语，以及哪一步和付费有关。"]
      }
    ]
  },
  {
    id: "james", name: "在悉尼和稀泥", handle: "@JamesAI", stage: "deep", accent: "green", topic: "从投广告找付费用户，到把推广工作做成工具",
    graphic: {
      src: "james-product-map.png", width: 2700, height: 2723, skipLabel: "跳到正文",
      alt: "James 的产品对照图。用商品视频站说明按量收费的 CCAPI 负责生成视频，KOLFind 帮找博主，AdWhiz 管付费广告，SEOMate 为自然搜索写稿和发布。James 披露 2.5 万美元 MRR，公开时间线更吻合早期 API 项目，缺少把这个数字直接归到 CCAPI 的证据。"
    },
    product: "CCAPI 提供生图、生视频等模型接口。KOLFind 找博主，AdWhiz 管付费广告，SEOMate 辅助写和发搜索内容。",
    acquisition: "早期用付费广告引流，并根据头几位付款客户调整产品。KOLFind 用个人账号发帖和分销。后来在采访中提到也做搜索内容和达人推广。",
    revenue: "本人把 2.5 万美元 MRR 归到 2024 年第一个独立开发项目。公开时间线更吻合早期模型 API，尚无账单确认。CCAPI 目前按调用收费，AdWhiz 与 SEOMate 提供订阅。",
    takeaway: "先弄清广告带来的谁肯付费，再围绕这群人的用途改流程和价格。后来也可以把自己反复做的推广工作做成产品。",
    sections: [
      {
        id: "product-lines", title: "他到底做什么？一条线卖生成能力，一条线卖推广工具",
        bullets: [
          ["CCAPI｜给网站和开发者接入模型", "他早期公开提过 Midjourney 生图 API，Orris 官网也把 CCAPI 列在最早的产品记录里。现在开发者可以从同一个平台接生图和 Seedance 等视频模型。比如电商软件可以用接口把一张商品照生成短视频。CCAPI 商业定价页显示现在按用量扣余额。"],
          ["KOLFind｜帮商家找到可以合作的博主", "比如你要推广一个商品视频工具，想找经常教小卖家拍视频的博主。KOLFind 让你按平台、领域、粉丝量和互动等筛人，结果是你可以去联系的一批创作者。"],
          ["AdWhiz｜管理直接花给广告平台的预算", "同一个工具也可以买 Google 搜索广告或 Instagram 广告。AdWhiz 接入广告账户，帮你查钱花在哪、哪些词带来访问却很少转化，并建议或在授权后实施调整。广告预算付给平台，AdWhiz 收软件订阅。"],
          ["SEOMate｜为自然搜索生产内容", "还可以写一篇回答「如何把一张商品照做成视频」的文章，接住主动搜这类问题的人。SEOMate 把选词、写文章和发布做成一套付费工具。"]
        ],
        callout: ["产品方向和收入排名是两个问题", "James 的公开产品确实包括生图和生视频，也有面向商家与出海团队的推广工具。公开访谈只说有三四个盈利主力，未列逐款收入。目前可以描述他卖什么，无法给这些产品按营收排名。"],
        sources: [["Orris 官网的产品清单与时间线", "https://www.orris.ai/about"], ["James 自己的开源项目披露 CCAPI 归属", "https://github.com/iamzifei/show-me-the-money/blob/master/README.zh-CN.md"], ["CCAPI 模型与计费", "https://ccapi.ai/pricing"], ["KOLFind 官网", "https://kolfind.com/"], ["AdWhiz 官网", "https://www.adwhiz.ai/about"], ["SEOMate 官网", "https://www.seomate.ai/"], ["James 谈多产品收入的访谈", "https://www.tmtpost.com/7925842.html"]]
      },
      {
        id: "revenue-attribution", title: "2.5 万美元 MRR 来自哪款产品？",
        paragraphs: ["James 在 2025 年 2 月发布副业日记时，将 2.5 万美元 MRR 写成 2024 年第一个独立开发项目的成绩。MRR 是经常性收入按月折算。原帖把达到这一水平的时间写为 2024 年 6 月。SEOMate 自己的产品页把公开测试上线写在 2024 年末。", "2024 年 3 月，James 回顾已经运行约半年的 AI SaaS，写明首月收入约 1,000 美元，推广主要靠付费广告，当时没有做 SEO 或上 Product Hunt。同期他提到自己的 Midjourney API 站有年付会员，Orris 官网也把 CCAPI 上线列在 2023 年。结合这些线索，早期模型 API 与这笔 MRR 的时间和业务更相符。"],
        callout: ["能确认到哪一步", "2.5 万美元是 James 对早期第一个项目的自述 MRR。CCAPI 是有公开资料支持的解释，但仍缺一份本人点名的记录或历史账单把 2.5 万美元直接归到 CCAPI。"],
        sources: [["James 本人写第一个项目做到 2.5 万美元 MRR", "https://x.com/JamesAI/status/1889641160622420340"], ["2024 年 3 月产品获客复盘", "https://x.com/JamesAI/status/1771361880487112748"], ["Orris 官网对 CCAPI 的上线记录", "https://www.orris.ai/about"], ["SEOMate 自己的公开测试时间线", "https://www.seomate.ai/about"], originalPost]
      },
      {
        id: "early-saas", title: "早期怎么获客和收费？先跟着实际付款的人改",
        steps: [
          ["01", "买一些访问，看谁肯付钱", "本人说当时花钱投放，再根据数据调预算。首月已经有约 1,000 美元收入。"],
          ["02", "发现买家和预想不同", "上站时按 A 类用户设计，头几位真正付款的却是 B 类。他会主动看客户自己运营的网站、和客户私聊答疑，然后按 B 类重做网站功能和使用流程。"],
          ["03", "用户多了以后再拆定价", "按不同群体的使用方式拆分套餐，再拆网站流程。他称那两次调整后客单价和用户数都有增加。具体套餐价格和获客成本未披露。"]
        ],
        callout: ["另有一条同时期的生图 API 线索", "2024 年 2 月，他直接提过自己的 Midjourney API 站有年费会员。他用 Sora 应用落地页预告内测权益，把感兴趣的访问者引到 API 年费套餐，并说用专属优惠码确认了一笔年付的来源。这笔付费能对上 API 站，2.5 万美元 MRR 与该站的关系仍待确认。"],
        sources: [["早期 SaaS 的产品与广告复盘", "https://x.com/JamesAI/status/1771361880487112748"], ["用 Sora 落地页给生图 API 站带来年付", "https://x.com/JamesAI/status/1758588310283276367"], ["本人主页介绍图片生成、内容获客与 AI API", "https://vibethursday.com/members/james"]]
      },
      {
        id: "kolfind", title: "KOLFind｜帮独立开发者找到能推荐产品的博主",
        bullets: [
          ["产品交付", "比如给一个视频工具找做剪辑教程的中小创作者。KOLFind 提供按领域筛选、匹配创作者和查看资料或联系方式，减少逐个平台找人和整理名单的时间。"],
          ["获客", "James 在 X 用自己的账号发上线结果，讨论 SEO 和找博主推广的话题。他说看这个话题的出海开发者与潜在买家重合，也会有人转到 SEO 群。他估计上线前两天约一半的成绩来自自己的账号影响力，同时开放分销。"],
          ["怎么收钱", "他披露 2024 年黑五活动是 59 美元一次性付费，并称上线两天变现约 2,000 美元。官网现有按搜索匹配额度区分的付费计划。上线两天的收款口径与订阅 MRR 不同。"]
        ],
        sources: [["James 本人的 KOLFind 上线复盘", "https://x.com/JamesAI/status/1863477726658936863"], ["KOLFind 官网功能与套餐", "https://kolfind.com/"], ["KOLFind 分销计划", "https://kolfind.com/affiliate"]]
      },
      {
        id: "adwhiz", title: "AdWhiz｜让 AI 在真实广告账户里干活",
        paragraphs: ["广告主授权接入 Google Ads 或 Meta Ads 后，可以用 AdWhiz 查哪些关键词花钱却没有转化、看调整建议，并在授权范围内实施调整。官网记载 2026 年 2 月推出，定价页列有 79 美元起的月订阅。用户买的是持续读账户数据、审查投放与执行的流程。", "James 用自己的投放做过演示，发帖称一次搭好 2 个广告系列，在两天内收到 3 个转化。帖文没有说明转化事件是否为付款。官网也提供输入网址生成投放方案的免费入口，让客户先看到部分交付，再决定要不要接入实际账户。"],
        sources: [["James 本人演示用 AdWhiz 投放", "https://ww.twstalker.com/JamesAI/status/2027343307622277505"], ["AdWhiz 上线与功能说明", "https://www.adwhiz.ai/about"], ["AdWhiz 定价页", "https://www.adwhiz.ai/pricing"], ["免费生成投放方案", "https://www.adwhiz.ai/ads-strategy"]]
      },
      {
        id: "seo", title: "SEOMate｜把写博客和发布做成订阅工具",
        paragraphs: ["他在 2026 年采访中把 SEO、广告、达人推广和社媒列为产品获客的四条路。对于搜索这条路，他描述的是让 AI 找长尾词、分析竞品流量、生成文章。Orris 官网列出的对外 SEO 产品是 SEOMate。它支持输入网址或关键词，生成面向搜索的文章、配图与内链建议，并发布到已有网站。官网定价页列有 79 美元月订阅。", "研究原帖说他用自己做的 SEO 工具生成新站全部博客内容，原文没点名。SEOMate 的功能和这条描述吻合。具体测试的网站、通过文章拿到的订单和 SEOMate 自身的营收，仍缺可以核验的记录。"],
        callout: ["真正要验证的结果", "生成多少篇是交付量。要判断获客价值，可以跟到页面收录、相关搜索词带来的点击、访客试用和付费。不同渠道的订单需要能识别来源，才知道内容这条路是否值得继续投入。"],
        sources: [["Orris 官网的 SEO 产品清单", "https://www.orris.ai/about"], ["SEOMate 官网页面", "https://www.seomate.ai/"], ["SEOMate 订阅定价", "https://www.seomate.ai/pricing"], ["James 谈搜索、广告、达人与社媒获客的采访", "https://www.tmtpost.com/7925842.html"], originalPost]
      },
      {
        id: "judgment", title: "哪些收入可以对上，最值得学什么？",
        bullets: [
          ["收入各有口径", "2.5 万美元是早期项目自述 MRR。KOLFind 的约 2,000 美元是其上线两天自述变现。后来访谈中说的约 10 万美元月流水，则是与同伴运营多个产品的整体口径。TrustMRR 另有连接 Stripe 的项目记录，但项目以别名公开，无法补证 2024 年的产品归属。"],
          ["产品经验也有独立收费", "他把早期副业经验写成《搞到钱再说》，公开定价 199 元，后续发帖称首个 24 小时共 92 单。这是读者为复盘资料付的费。"]
        ],
        callout: ["最值得借鉴的一步", "他的早期复盘有个很具体的动作。第一批实际付款的人和设想不一样，他就先弄懂这些人拿工具做什么，随后改流程、拆套餐。能找到愿意付费的人，才有依据判断下一笔推广预算要花在谁身上。"],
        sources: [["James 自述副业日记定价", "https://x.com/JamesAI/status/1889641160622420340"], ["James 披露首日订单", "https://x.com/JamesAI/status/1890015148175450448"], ["本人谈多产品流水", "https://www.tmtpost.com/7925842.html"], ["James 的 TrustMRR 项目页", "https://trustmrr.com/founder/JamesAI"]]
      }
    ]
  },
  {
    id: "kevin", name: "Kevin", handle: "@ciaotigre", stage: "deep", accent: "lilac", topic: "从自然搜索流量追到付费和利润",
    graphic: {
      src: "kevin-cuty-seo-map.png", width: 2700, height: 3554, skipLabel: "跳到正文",
      alt: "Kevin 和 Cuty.ai 研究图。用西语搜索、图片放大页、免费试用积分和付费订阅示范用户路径。概括任务工具页、模型试用页和竞品对比页，并给出 AI 搜索时代的需求研究、页面、检索和转化验证方法。2 万美元 MRR 为 Kevin 自述，产品归属仍待确认。"
    },
    product: "已核实 Kevin 和团队推出了 Cuty.ai，早期用自然语言生成和修改图片，现有放大图片、生视频等功能。",
    acquisition: "Cuty.ai 在 Product Hunt 发布，也用独立工具页承接搜索。Kevin 另晒过 5 万次搜索点击，尚无站点和订单归因。",
    revenue: "Cuty.ai 提供免费试用积分、订阅和积分加购。Kevin 自述项目六个月达 2 万美元 MRR，公开发帖没有点名对应的站。",
    takeaway: "搜索点击只是起点。追到哪一页带来成功使用、付款、续费，再把支付和推广成本算进来。",
    sections: [
      {
        id: "product", title: "查到的产品是 Cuty.ai，最早主打用一句话修图",
        paragraphs: ["Kevin 用 @ciaotigre 在 2025 年 7 月发布过 Cuty.ai 的上线帖。Product Hunt 的发布页把 Kevin 标为开发者，也明确写了团队做的是对话式图片工具。你可以用文字生成一张图，也可以上传原图，然后描述怎么改，比如保留商品、把背景换成白底。现在官网还提供去背景、放大图片、图生视频等入口。", "从公开产品看，Cuty.ai 的核心工作是把 FLUX、Seedance 等多个模型做成浏览器里可直接用的工具。用户能在不同任务之间切换，用同一账户的积分生成或处理图片和视频。单一任务在模型官网就能顺手完成的用户，使用这类站的额外收益会小。", "2026 年 4 月 3 日，他说和一位同为程序员的搭档用了一个月做出一个 MVP，六个月达到 2 万美元 MRR。这篇收入帖没有产品名，当前能直接核对的是他参与做过 Cuty.ai，以及 Cuty.ai 的公开功能和收费。"],
        callout: ["还有一笔未署站名的早期记录", "2025 年 7 月 11 日，Kevin 记下一个刚上线且给新用户送试用积分的网站出现首位付费用户。同月他明确为 Cuty.ai 宣传过免费积分，但首位付费用户帖没有给站名和金额文字，尚不能据此认定订单归属。"],
        sources: [["Kevin 本人的 Cuty.ai 上线帖", "https://x.com/ciaotigre/status/1949367472525836510"], ["Product Hunt 发布页与 Kevin 的介绍", "https://www.producthunt.com/products/cuty-ai"], ["Cuty.ai 官网", "https://www.cuty.ai/"], ["Cuty.ai 统一积分规则", "https://www.cuty.ai/pricing"], ["Kevin 宣传 Cuty.ai 免费积分", "https://x.com/ciaotigre/status/1944829982385332639"], ["本人谈搭档、MVP 与 2 万美元 MRR", "https://x.com/ciaotigre/status/2039939626849484829"], ["2025 年 7 月记录首位付费用户", "https://x.com/ciaotigre/status/1943600805698814387"]]
      },
      {
        id: "cuty-funnel", title: "Cuty.ai 实例｜从搜「提高图片清晰度」到买积分",
        steps: [
          ["01", "用户先搜一个要完成的任务", "例如一个卖家拿到的商品照比较小，搜西语 mejorar calidad de imagen，也就是「提高图片清晰度」。Vaneform 把这个词列在 Cuty.ai 的搜索预估样本里。Cuty.ai 确实有一个西语图片放大页，标题和正文明确针对这项任务。"],
          ["02", "点进工具页，用自己的图片试一次", "工具页告诉卖家可以直接放大 JPG 或 PNG。点「Mejorar imagen」进入处理页，上传商品照并选择放大倍率，再提交处理。官网说明可用免费积分试用。卖家可以用自己要上架的照片判断放大后的边缘、文字和商品细节是否够用。"],
          ["03", "经常上新时，才更可能买持续额度", "一张图用免费额度够用。每周反复上新、要处理几十张图或需要更高规格输出时，更多额度和处理能力才有价值。Cuty.ai 定价页列有按月发积分的订阅，例如 Lite 每月 300 积分。各任务消耗不同，付费用户可另买积分包。"]
        ],
        callout: ["这条路径能核验到哪一步", "关键词样本是第三方估算，着陆页、试用说明和收费是网站公开的。上新卖家的路径是对真实功能的示范，这个词实际带来的点击、购买和续费还需站方数据。"],
        sources: [["Cuty.ai 的搜索词估算样本", "https://vaneform.com/e/cuty-ai"], ["Cuty.ai 西语图片放大入口", "https://www.cuty.ai/es/ai-tool/image-upscaler"], ["Cuty.ai 图片放大工作台", "https://www.cuty.ai/studio/ai-tools/image-upscaler"], ["Cuty.ai 订阅与积分规则", "https://www.cuty.ai/pricing"]]
      },
      {
        id: "search-layout", title: "Cuty.ai 怎么做 SEO？按用户在搜什么做不同入口",
        bullets: [
          ["搜任务，就给任务工具页", "搜「提高图片清晰度」的人想处理一张已有的图。Cuty.ai 用单独的图片放大页接住这件事，另外还做了去背景、去杂物等工具页。"],
          ["搜模型，就给该模型的试用页", "搜 Seedance 2.5 的人可能已经知道想用哪个模型。Cuty.ai 做了对应的页面，让用户直接选这个模型做视频。"],
          ["搜替代品，就给比较页面", "搜 higgsfield alternative 的人正在找另一套工具。Cuty.ai 的博客有一篇替代工具对比，也把自己列为选项，读者可以再进站试用。"]
        ],
        callout: ["同一个工具也能用不同语言承接", "图片放大有独立的英语和西语页面，页面会提供其他语言版本的链接信息给搜索引擎。不同入口把人带到站内工具，试用和订阅可以继续走同一套账户与积分。"],
        paragraphs: ["Kevin 本人公开提出，SEO 要提供对用户有用的内容或工具。他也曾在整理别人的案例时提到关键词工具、用 AI 写文章与自动发布。Cuty.ai 的上述三类页面可以直接核对。他具体怎么选词、建了多少页、哪类页面贡献了最多订单，目前还没有站方数据。"],
        sources: [["Kevin 本人谈 SEO", "https://x.com/ciaotigre/status/2107706745594540084"], ["Kevin 整理的选词案例", "https://x.com/ciaotigre/status/1957277721127792837"], ["Cuty.ai 西语图片放大页", "https://www.cuty.ai/es/ai-tool/image-upscaler"], ["Cuty.ai 的 Seedance 2.5 试用入口", "https://www.cuty.ai/studio/video/seedance-2.5"], ["Cuty.ai 的 Higgsfield 替代品文章", "https://www.cuty.ai/blog/top-10-alternatives-to-higgsfield-ive-tested-myself"]]
      },
      {
        id: "ai-search-era", title: "我们的扩展｜让同一个工具接住 Google 搜索和 AI 问答",
        steps: [
          ["01", "把真实问法归成任务", "已有网站可以看 Search Console 哪个查询和页面已有曝光。新站用搜索联想、社区求助、用户反馈和竞品页找例子。把短词、长问题和用户条件交给 AI 归组，再用原始材料检查是否真的在做同一件事。"],
          ["02", "把能验证的信息放到工具页", "例如给图片放大工具放真实处理前后图，讲清 JPG、PNG 等输入、放大规格、试用额度和付费规则，让用户直接测试。把同一任务的不同写法合在这个入口。看到另一种语言的真实需求后，再用 AI 辅助本地化并核对实际表述。"],
          ["03", "检查可访问性，再用问题实测", "对 Google 看重要页面能否收录并展示摘要。对 ChatGPT 搜索检查公开页是否向 OAI-SearchBot 开放。用带场景和约束的问题测试，记录日期、是否出现网站和引用链接指向的页面。主动提问提供可重复的样本。"],
          ["04", "把点击和真实转化分别记下来", "在 Search Console 看查询和落地页，站内分析记来访来源、首次成功处理、购买及续费。ChatGPT 搜索链接可带 utm_source=chatgpt.com，在站内按来源识别。Google AI 功能的数据计入 Search Console 的 Web 搜索口径。"]
        ],
        callout: ["图片放大工具的测试问法", "我给网店上新，只有低清商品照。有什么工具能用西语、先试一张，再按量或订阅处理更多？这个问题需要页面同时回答用途、语言、试用和计费。能否稳定被发现、能否带来处理和付费，分别看测试记录和站内数据。"],
        sources: [["Google 搜索的 AI 功能与网站资格", "https://developers.google.com/search/docs/appearance/ai-features"], ["Google 关于多语言页面的说明", "https://developers.google.com/search/docs/specialty/international/localized-versions"], ["OpenAI 关于搜索抓取与转介标记的说明", "https://help.openai.com/en/articles/12627856-publishers-and-developers-faq"], ["Google Search Console 的查询和点击说明", "https://support.google.com/webmasters/answer/7576553?hl=en"]]
      },
      {
        id: "search-growth", title: "他是怎么用 SEO 获客的？能对上哪些结果？",
        timeline: [
          ["2026.10.06", "本人晒出约 5 万次点击", "帖子把这一成绩与 SEO 联系起来。正文没有列出统计窗口、域名、从哪些关键词来的访问或对应的订单。"],
          ["2026.10.14", "本人提到覆盖 20 多个国家", "他在聊自然搜索的帖子里提到用户分布在 20 多个国家。公开帖文没有披露每个国家带来的注册、订单或续费。"],
          ["2026.10.22", "另披露一款产品超过 20 万用户", "该帖没有说明用户口径、付费比例或站名。现有材料无法确认三条结果对应同一个网站。"]
        ],
        callout: ["找到的选品文章属于他对别人的复盘", "2025 年他分享过 Samuel 的案例，列举先找有真实用户和收入的竞品，挑一个更细分的场景做小版本，低预算试转化，再研究关键词和自然搜索。这里有可参考的测试顺序，Kevin 自己的投放预算、选词和改页面过程仍待核实。"],
        sources: [["Kevin 披露搜索点击", "https://x.com/ciaotigre/status/2107307114528170066"], ["Kevin 谈 20 多个国家的用户", "https://nitter.cf/ciaotigre/status/2110345337730924720"], ["Kevin 披露单产品用户数", "https://nitter.cf/ciaotigre/status/2113255362023526498"], ["Kevin 整理的 Samuel 案例", "https://x.com/ciaotigre/status/1957277709626962049"], ["案例中的 SEO 步骤", "https://x.com/ciaotigre/status/1957277721127792837"]]
      },
      {
        id: "money", title: "9.9 美元、2 万美元和 2,000 美元是同一份账吗？",
        bullets: [
          ["9.9 美元与 2,000 美元", "研究原帖分别转述这是一笔早期首单和一笔大额订单，并把首单时间放在 2025 年 11 月左右。已找到的更早发帖记录了 2025 年 7 月有网站出现首位付费用户。两份材料的日期和口径有差异，站点和具体订单仍待核实。"],
          ["2 万美元 MRR", "2026 年 4 月 3 日的本人发帖确认他公开说过六个月达到这个水平。收入是自述，缺少逐月历史账、付费套餐、用户数和续费率。"],
          ["已核实的定价属于 Cuty.ai", "当前 Cuty.ai 定价页公开了订阅和积分加购规则。Kevin 也说过早期会盯 Stripe 收款通知。把不同站或不同日期的付款对应到 Cuty.ai，仍需明确的产品归因。"]
        ],
        sources: [originalPost, ["Kevin 本人披露项目 MRR", "https://x.com/ciaotigre/status/2039939626849484829"], ["Kevin 记录 2025 年 7 月的首位付费用户", "https://x.com/ciaotigre/status/1943600805698814387"], ["Kevin 记录 Stripe 收款通知", "https://x.com/ciaotigre/status/2109279933730312648"], ["Cuty.ai 的公开定价", "https://www.cuty.ai/pricing"]]
      },
      {
        id: "costs", title: "为什么他说网站收到钱，还要先算账？",
        paragraphs: ["他在 2026 年 1 月就提醒过，月收入一万美元时还要看实际支出。9 月他提到有一天的 Stripe 手续费加 Radar 服务费将近 50 美元，10 月也把搜索广告、达人和外链建设列作经营成本。两笔公开信息可以说明成本的类型，不能据此推算该项目的月利润。", "看经常性收入时，还要核对每月有多少用户续费。若产品每次处理也花模型或算力费用，还要按活跃用户的用量计算交付成本。一笔大额订单可以提高当月收款，只有证实它按期重复才能算进 MRR。"],
        sources: [["Kevin 对网站收入和利润的判断", "https://x.com/ciaotigre/status/2009928149489070211"], ["Kevin 披露一日支付和反欺诈费用", "https://x.com/ciaotigre/status/2100626230399893576"], ["Kevin 谈广告、达人与外链开支", "https://x.com/ciaotigre/status/2112948085739676100"]]
      },
      {
        id: "judgment", title: "最能复用的一步｜从关键词追到订单和续费",
        steps: [
          ["01", "先把搜索词和用户任务对上", "Cuty.ai 的西语放大页优先解释用户能处理什么图片、怎么试用。做类似页面时，先用一个明确的任务来写标题和页面，再给真正能完成任务的入口。"],
          ["02", "以落地页为线索看后续行为", "在 Search Console 按关键词和页面看点击，再用站内分析按来访来源和落地页比较试用、成功处理、付款与续费。点进来却没试用，先看页面能否完成那个任务。有试用没付款，再看处理结果与付费方案。"],
          ["03", "按来源和成本看哪一页值得继续做", "如果某一页持续带来订单，再核算平均每单的交付、收款和内容成本。若第一次付款后大多流失，再查产品是否进入用户平时做事的流程。"]
        ],
        sources: [["Kevin 谈怎样在功能、增长和体验之间分配时间", "https://nitter.cf/ciaotigre/status/2108624545540382751"], ["Google Search Console 的搜索点击与查询说明", "https://support.google.com/webmasters/answer/7576553?hl=en"]]
      }
    ]
  },
  {
    id: "timo", name: "炼金金", handle: "@Timojoy713", stage: "deep", accent: "blue", topic: "从开源工具试做到不露脸短视频",
    graphic: {
      src: "timo-pixelle-video-map.png", width: 1920, height: 1962, skipLabel: "跳到正文",
      alt: "炼金金看到有人卖数字人短视频工具，提出用开源项目试做基础版的问题。他用 Pixelle-Video 跑出约 22 秒样片，再用插图和字幕讲制作过程，连同项目链接发在 X。图中展示约第 11 秒的真实画面。第 24 条左右起量及四个月收入 1,241、4,310、7,062、11,701 美元来自 winkle 的另一篇自述，实际频道题材、起量原因和收入构成未披露。"
    },
    product: "炼金金公开演示过中文 AI 工具解说短视频。四个月收入对应的 YouTube 案例来自 winkle 的英文自述，频道题材未核实。",
    acquisition: "炼金金把样片和项目链接发到 X。约第 24 条起量来自 winkle 自述，相关 YouTube 视频与流量来源未公开。",
    revenue: "第 4 个月 11,701 美元来自 winkle 的自述。文章讨论了广告分成、联盟佣金、赞助和数字产品，实际收入构成未公开。",
    takeaway: "用 AI 降低每次选题测试的成本，再用流量来源、点击率和观看留存判断哪个选题值得继续做。",
    sections: [
      {
        id: "attribution", title: "先核对出处｜四个月的数字来自 winkle 的英文自述",
        paragraphs: ["按北京时间，winkle 在 2026 年 5 月 13 日发了英文文章，炼金金在 5 月 14 日发了中文文章。两篇的四个月收入数字、制作工具、每周约五小时，以及第 8 条想放弃、第 24 条左右起量的叙述逐项对应。炼金金的中文文章用了第一人称，这些频道经营数据应归到更早的 winkle 自述。", "在所查公开材料里，仍未核实该案例的频道名、视频链接或后台明细，也未找到炼金金自营频道对应这组数据的记录。"],
        sources: [["winkle 的英文原帖", "https://x.com/w1nklerr/status/2054253509155922219"], ["英文原文存档", "https://maxed.wiki/posts/how-i-made-an-ai-channel-that-generated-12-000-in-one-month/"], ["炼金金的中文文章", "https://x.com/Timojoy713/status/2054791085432463668"], originalPost]
      },
      {
        id: "format", title: "频道做什么？能确认制作形式，具体题材未披露",
        paragraphs: ["他描述的是旁白配画面的无出镜视频。先确定一条选题，用 Claude 写脚本、给分镜画面建议，再用 ElevenLabs 生成旁白、用 CapCut 把素材和旁白剪在一起。发布前准备标题、封面、视频简介和章节。作者说剪辑组装仍是最花时间的一步。", "原文的脚本模板面向英语解说，给了 5、8、12 分钟三个可填时长。原文还举了金融、科技、健康、真实犯罪和泛娱乐来讨论变现。这些是模板选项和赛道示例，实际频道的题材、视频时长和受众仍无法确定。"],
        sources: [["英文原文中的脚本模板和制作流程", "https://maxed.wiki/posts/how-i-made-an-ai-channel-that-generated-12-000-in-one-month/"]]
      },
      {
        id: "growth", title: "为什么约第 24 条才起量？公开资料只能定位时间",
        paragraphs: ["winkle 说前五条几乎没播放，第八条时差点放弃，频道在发到约第 24 条时开始有起色。他没给出那段时间的视频列表或逐条数据，所以还不知道是新视频受到推荐、旧视频被带起来，还是搜索或站外流量增加。YouTube 公布的推荐依据包括观众兴趣与视频表现，并未给出固定发布条数门槛。", "他建议早期测试几种内容形式，再集中做表现较好的类型。这个做法需要一批视频才能比较，回顾时更有用的是找出当时哪个指标先变。"],
        steps: [
          ["01", "先找播放增量从哪里来", "对比起量前后的同等时间窗口，查看主要是首页等浏览功能、相关视频、YouTube 搜索、Shorts 动态还是站外。先找出是哪几条视频贡献了大部分增量。"],
          ["02", "再看观众为什么点开或继续看", "以长视频为例，在相同流量来源内比较首周的曝光和点击率。点击率变化值得回看选题、标题和封面，前 30 秒留存变化值得回看开场兑现了什么。"],
          ["03", "用下一条视频验证判断", "拿表现更好的选题做两三个相邻问题，保留其他制作条件，观察相同来源的播放和留存能否复现。"]
        ],
        sources: [["winkle 的发片过程与第 24 条自述", "https://maxed.wiki/posts/how-i-made-an-ai-channel-that-generated-12-000-in-one-month/"], ["YouTube 推荐机制", "https://support.google.com/youtube/answer/141805?hl=en"], ["YouTube 流量来源报告", "https://support.google.com/youtube/answer/9314355?hl=en"], ["YouTube 观众留存报告", "https://support.google.com/youtube/answer/9314415?hl=en"]]
      },
      {
        id: "revenue", title: "收入主要从哪来？文章把广告作为底盘，实际占比未知",
        paragraphs: ["winkle 自报四个月分别是 1,241、4,310、7,062 和 11,701 美元，没公布这四个月各自的收入明细。原文附的 YouTube Studio 照片显示 2025 年 5 月的一段 28 天期间有 80,529,579 次观看、9,463.12 美元预估收入。照片看不出频道身份或收入来源，也无法与四个月金额逐项对上。", "变现部分举了一个假设。每月有 60 万次观看，假定每千次观看带来 18 美元广告分成，就估算出 10,800 美元。另列的联盟佣金、赞助和数字产品收入也都是同一张测算表里的数字。"],
        bullets: [
          ["平台广告分成", "频道符合条件并开通相应变现功能后，由 YouTube 按相应内容形式的规则结算。"],
          ["联盟佣金", "推荐工具或商品，观众通过链接完成符合条件的购买后，商家支付佣金。"],
          ["品牌赞助和数字产品", "前者由品牌购买视频中的露出，后者由观众直接购买模板、资料等产品。"]
        ],
        sources: [["英文原文的数字和测算", "https://maxed.wiki/posts/how-i-made-an-ai-channel-that-generated-12-000-in-one-month/"], ["原文所附的 YouTube Studio 照片", "https://pbs.twimg.com/media/HIIjkBGWoAAD2YL.png"], ["YouTube 合作伙伴收入规则", "https://support.google.com/youtube/answer/72902?hl=en"], ["YouTube 广告与收入分析说明", "https://support.google.com/youtube/answer/9314357?hl=en"]]
      },
      {
        id: "judgment", title: "炼金金实际试过什么？做一条插图式工具解说短视频",
        paragraphs: ["2026 年 6 月，炼金金在 X 发了一条约 22 秒的中文竖屏视频。它用连续插图和中文字幕解说 Pixelle-Video 如何自动写稿、出图、配音和剪辑。帖子说他在本地部署后做了这个简短版本。这是公开可看的样片，能看到他试过的内容形式和具体选题。", "他也探索过用 n8n 串起脚本、配音、分镜、图生视频和发布，解决的是账号持续出片的问题。他曾发帖描述一个给自媒体矩阵搭工作流的方案，公开信息只到方案自述，没有对应成品或运营结果。", "乡村美食、手艺制作、市井纪实、修复解压和中文口播，是他建议起步的人找对标的方向。另有帖子把自动化工具用在批量制作选题草稿，再人工筛选。可复用的一步是用同样的制作流程快速验证多个相邻选题，保留观看反馈再决定下一条。"],
        sources: [["炼金金发布的 Pixelle-Video 短视频样片", "https://x.com/Timojoy713/status/2066079524920643850"], ["炼金金分享 n8n 自动出片方案", "https://x.com/Timojoy713/status/1998689441054077045"], ["炼金金分享怎样找对标频道", "https://x.com/Timojoy713/status/2065685839984693476"], ["炼金金分享怎样降低视频测试成本", "https://x.com/Timojoy713/status/2064941206191353882"]]
      }
    ]
  },
  {
    id: "sintone", name: "野原新之栋 Sintone", handle: "@s1ntone", stage: "deep", accent: "green", topic: "用预售验证 Mac 效率工具",
    graphic: {
      src: "sintone-mac-product-value.png", width: 1920, height: 2183, skipLabel: "跳到正文",
      alt: "Sintone 的两款 Mac 工具。CleanClip 用填报销表演示连续复制发票号、金额和抬头，切回表格一次，再逐格粘贴。同类工具可检测系统剪贴板变化并另存。ScreenSage Pro 用录制导出报表演示，记录点击时间和坐标，在成片对应位置自动放大，省下手动剪辑。CleanClip 的 12 元预售可见原帖，约 20 人来自本人回顾。ScreenSage 的 69 美元预售首单和十天约 30 单来自本人自述。2025 年黑五单月超 1 万美元是本人披露，Stripe 显示 12 月自然月 8,992 美元。另一张 9,400 多美元截图为 AI 工具预估使用费用。"
    },
    product: "CleanClip 管理复制历史和粘贴顺序。ScreenSage Pro 把录屏、光标跟踪和自动运镜集中到一个 Mac 工具里。",
    acquisition: "在 V2EX 预售 CleanClip。借 CleanClip 的黑五热度和海外 Mac 用户社区验证 ScreenSage Pro，再用早鸟优惠和成片演示推广。",
    revenue: "ScreenSage Pro 销售一次性授权。Sintone 自报 2025 年黑五期间单月超 1 万美元。TrustMRR 的 Stripe 数据显示 2025 年 12 月自然月 8,992 美元。",
    takeaway: "先把具体的人、难题、交付时间和价格讲清楚，用预售订单判断用户愿不愿买，再做技术验证。",
    sections: [
      {
        id: "cleanclip", title: "CleanClip｜让复制过的东西找得回、按顺序贴得出",
        paragraphs: ["做报销表时，你可能先复制发票号，再复制金额和抬头。用普通剪贴板得在原文件和表格间来回切换。CleanClip 能保存复制历史，在光标附近唤出菜单，逐个选回刚才复制的内容。还可以先把几项放进粘贴队列，再按顺序填。付费价值来自每天重复时少切换几次界面。", "Sintone 先在 V2EX 帖子里展示想要的交互，承诺凑到 20 人后开做，开发第 7 天交第一版。早期预售是人民币 12 元买断。他在访谈里说，一周凑到 20 位用户，下一周做出第一版。早期用户也帮他校正真正顺手的操作。"],
        sources: [["CleanClip 官网和使用演示", "https://www.cleanclip.cc/"], ["macOS 剪贴板变化接口", "https://developer.apple.com/documentation/appkit/nspasteboard/changecount"], ["最初的 V2EX 需求帖", "https://v2ex.com/t/963132"], ["CleanClip 的 12 元预售帖", "https://v2ex.com/t/966459"], ["Sintone 谈两次预售", "https://openhunts.com/story/screensage-pro-the-magic-of-screen-recording"]]
      },
      {
        id: "screensage", title: "ScreenSage Pro｜省下把原始录屏剪成产品演示的时间",
        paragraphs: ["Sintone 做 CleanClip 后要反复录功能演示。他回忆，录一分钟的素材，自己还要花约半小时手动放大重点、调整画面过渡。于是他做了一个面向产品开发者、教程作者和培训人员的录屏剪辑工具。", "假设你要录一条「怎么用 CleanClip 按顺序粘贴」的演示。你正常操作一遍，ScreenSage Pro 同时记录屏幕、光标和点击位置，再据此生成可调整的缩放和镜头运动。摄像头、麦克风和系统声音也能分别录制。产品的价值在于观众能看清你点哪儿，制作者少补一遍关键帧。"],
        callout: ["这个功能为什么能做出来", "他先在开源 QuickRecorder 上测试能否记录鼠标事件并在回放时按点击位置放大。正式产品把屏幕、音视频和这些操作数据分别录下来，后面还可以改镜头。"],
        sources: [["ScreenSage Pro 官网", "https://screensage.pro/"], ["Sintone 的录屏开发实录", "https://fatbobman.com/zh/posts/screensage-from-pixel-to-meta/"], ["正式发布的 V2EX 帖", "https://www.v2ex.com/t/1141279"]]
      },
      {
        id: "presale", title: "他怎么找到第一批人？用已有用户验证下一款产品",
        timeline: [
          ["01", "先用 CleanClip 的黑五活动触达同类人群", "2024 年黑五，CleanClip 迎来一轮增长。同一时期他也在 V2EX 和 GitHub 整理其他 Mac App 的黑五优惠，触达正在找 Mac 工具的人。"],
          ["02", "用一页产品承诺和价格验证付费", "他用约三小时做出名字、标志和预售页，给早期买家开出 69 美元终身版。他自述次日收到第一单，几天内约 20 单。另一篇访谈提到十天约 30 单、超过 2,000 美元。现在可见的 Reddit 帖改为功能介绍和邮件登记，作者标注删去了最早的预售推广。"],
          ["03", "交付首版，再用真实演示扩散", "他在开发实录里写首版于 2025 年 4 月 1 日发布，后来在 V2EX 放出实际效果、早鸟优惠和转发活动。会做产品演示的人可以先看缩放和运镜的成片，再判断是否值得买。"]
        ],
        sources: [["黑五优惠清单的 V2EX 帖", "https://v2ex.com/t/1091143"], ["ScreenSage 早期 Reddit 帖", "https://www.reddit.com/r/macapps/comments/1h23scx/starting_work_on_screensage_a_professional_screen/"], ["首单与交付的本人复盘", "https://fatbobman.com/zh/posts/screensage-from-pixel-to-meta/"], ["十天预售的创始人访谈", "https://openhunts.com/story/screensage-pro-the-magic-of-screen-recording"], ["V2EX 发布和早鸟活动", "https://www.v2ex.com/t/1141279"]]
      },
      {
        id: "revenue", title: "怎么赚钱？买断授权和活动销售收入",
        paragraphs: ["截至 2026 年 11 月 23 日查看，ScreenSage Pro 官网展示单台 Mac 59 美元、三台 99 美元、终身更新 299 美元。前两档含一年更新，到期可继续使用已获得的版本，需要新版本时可选择续更。"],
        table: { headers: ["数字", "证据口径"], rows: [
          ["黑五期间单月 $10K+", "2025 年 12 月 12 日 Sintone 披露，明确指 ScreenSage Pro。未公开精确起止日期。"],
          ["2025 年 12 月 $8,992", "TrustMRR 公布的 Stripe 自然月收入。与黑五帖的统计窗口未必一致。"],
          ["30 天 $9,400+", "2026 年 5 月的原帖配图来自 Vibe Usage，金额为 9,405.78 美元的 AI 工具预估使用费用。TrustMRR 的 2026 年 5 月 Stripe 自然月收入为 2,758 美元。"],
          ["累计 $51,106", "截至 2026 年 11 月 23 日，TrustMRR 连接 Stripe 的累计收入。页面当时显示没有活跃订阅。"]
        ] },
        sources: [["ScreenSage Pro 官网定价", "https://screensage.pro/pricing"], ["Sintone 的黑五收入帖", "https://x.com/s1ntone/status/1999389396601307641"], ["2026 年 5 月的 30 天帖子", "https://x.com/s1ntone/status/2054766346852839777"], ["该帖子所附预估费用截图", "https://pbs.twimg.com/media/HIP-dTdWMAA9s5C.jpg?name=orig"], ["TrustMRR 的 Stripe 月度收入数据", "https://trustmrr.com/startup/screensage-pro.md"]]
      },
      {
        id: "judgment", title: "最能复用的一步｜把重复工作变成一个可预售的交付",
        paragraphs: ["他的切口来自自己的重复任务。做 CleanClip 时是跨多个窗口找回复制过的东西，做 ScreenSage Pro 时是每次发布都要重剪录屏。拿到第一批愿意为同一问题付费的人，再投入做能交付的核心功能。", "AI 可以降低制作预售页和演示素材的成本。ScreenSage Pro 解决的具体工作仍是录下用户刚做的真实操作，并按光标、点击和音轨自动整理成说明视频。最容易判断这个价值的人，是本来就需要反复做产品演示的人。"]
      }
    ]
  },
  {
    id: "sitin", name: "sitin", handle: "@sitinme", stage: "deep", accent: "lilac", topic: "从人际关系 App、工具导航到模型接入服务",
    graphic: {
      src: "sitin-hiapi-product-value.png", width: 1920, height: 2283, skipLabel: "跳到正文",
      alt: "sitin 的公开项目包括他自述开发的人际关系 App 我是鱼、出售收录和赞助文章的 AI 工具导航站 ToolCenter、早期公众号 RPA 工具，以及他在 2026 年 4 月称为核心业务的 HiAPI。以商品视频站为例，卖家上传商品照，开发者经 HiAPI 向 Wan 2.7 等上游模型发任务并取回视频。HiAPI 的统一密钥、任务流程和充值余额可以减少接入工作。官网示例的 5 秒 720p 视频收费 0.50 美元。月入 1 万美元为 sitin 自述，单站收入未公开。"
    },
    product: "自述开发过「我是鱼」，公开复盘了 AI 导航站 ToolCenter，也展示过公众号 RPA 工具。2026 年 4 月，他把 HiAPI 称为核心业务。",
    acquisition: "ToolCenter 用工具详情页承接搜索。HiAPI 团队用公开模型页、社区活动、X 演示和 GitHub 集成触达开发者。各渠道订单未公开。",
    revenue: "「我是鱼」提供会员内购，ToolCenter 卖工具收录与赞助文章，HiAPI 按量收费。自述月入 1 万美元未披露单个项目所占份额。",
    takeaway: "做开发者产品时，把文档、示例和真实可跑的首个任务作为获客入口，再看它是否带来第二次调用和充值。",
    sections: [
      {
        id: "other-products", title: "除了 HiAPI，他还做过哪些项目？",
        bullets: [
          ["「我是鱼」｜按人组织资料和提醒", "比如给朋友建一份档案，把上次聊天、生日和下周的约定放在一起，到点提醒。sitin 在 2024 年发帖称自己开发过这个 App，也记录了用户拿它管理原创角色和人物关系的反馈。App Store 详情页能核对功能和内购，月会员 6 元、年会员 38 元、永久会员 88 元。上架开发者署名为「宇 李」，两者的具体分工和收入未公开。"],
          ["ToolCenter｜AI 工具目录和付费收录", "访客按类别找工具，看介绍和使用场景，再去工具官网。开发者可以购买收录或赞助文章。sitin 在 2026 年 3 月的 SEO 复盘中称它为自己的站。"],
          ["公众号 RPA｜早期内容工作流", "2024 年他公开介绍过用于公众号写作和分发的自动化机器人，多次发布相似度检查、模型支持和发布平台的更新。能核对这些公开记录，独立站入口、定价和收入未公开。"],
          ["千里会和课程｜内容与社群交付", "2026 年 4 月复盘里，他说千里会仍在持续交付，会继续分享创业、流量、销售和 AI 出海。早期也公开提过其小鹅通课程。这些是他公开做过的业务，收费额和人数没有可靠拆分。"]
        ],
        sources: [["sitin 自述开发「我是鱼」", "https://x.com/sitinme/status/1803615926857900095"], ["sitin 记录原创角色用户反馈", "https://x.com/sitinme/status/1780079257596870762"], ["「我是鱼」App Store 与会员内购", "https://apps.apple.com/cn/app/%E6%88%91%E6%98%AF%E9%B1%BC-%E4%BA%BA%E9%99%85%E5%85%B3%E7%B3%BB%E7%AE%A1%E7%90%86-%E4%BA%BA%E8%84%89%E7%BB%B4%E7%B3%BB%E5%B7%A5%E5%85%B7/id6450589948?platform=ipad"], ["sitin 的 ToolCenter SEO 复盘", "https://www.ipengtao.com/34-1/"], ["公众号 RPA 工具更新", "https://x.com/sitinme/status/1810931651922288693"], ["sitin 谈千里会和出海群", "https://x.com/sitinme/status/2049015107628552294"], ["sitin 提及小鹅通课程", "https://x.com/sitinme/status/1769000857381769477"]]
      },
      {
        id: "toolcenter", title: "ToolCenter｜29 美元收录能买到什么？",
        graphic: {
          src: "sitin-toolcenter-sparkvid-map.png", width: 1920, height: 2598,
          alt: "ToolCenter 付费收录和 SparkVid 实例。sitin 披露三个月全站 Google 展示 24.5 万次、点击 807 次。LMArena 榜单页有 34,286 次展示、1 次点击。确认 ToolCenter 首页有 SparkVid 卡片，详情页有 Sponsored 和 Visit Website 按钮，官网链接带 ref=toolcenter。SparkVid image to video 是搜索词示例，真实排名、访问量、所购套餐和订单未公开。公开 Basic 价格 29 美元，含审核通过后的永久页、赞助链接和七天 New 标记。假设每单扣除随单成本后留下 20 美元，需要两单回本，若到站转付费为 2%，相当于约 100 次官网来访的期望。"
        },
        bullets: [
          ["Google 搜索｜站长披露的数据", "sitin 2026 年 3 月的复盘显示，过去三个月全站有 24.5 万次 Google 展示、807 次点击。LMArena 榜单页的搜索词包括 lmsys chatbot arena leaderboard 等，整个页面 34,286 次展示、1 次点击。它说明工具详情页可以获得搜索曝光，每个页面能获得的点击需要分别看。"],
          ["SparkVid｜已核实的访客路径", "站内可以从 ToolCenter 首页的 SparkVid 卡片进入详情。详情页标有 Sponsored，介绍功能和使用场景。Visit Website 指向 sparkvid.ai 并带 ref=toolcenter。用户到了 SparkVid 官网才实际上传照片、试用或付费。SparkVid image to video 是可能对应的搜索词，实际带来多少访问未公开。"],
          ["29 美元｜官网公开的套餐权益", "Basic 是一次性 29 美元。获批后有永久工具详情页、标记为 sponsored 的外链、7 天 New 标记。30 天首页推荐和 14 天分类置顶列在 69 美元档。SparkVid 展示了真实的赞助页，它选择的套餐未公开。"],
          ["回本｜用产品自己的数据估算", "先看该条目带来的官网来访，再追踪这些来访的注册和付费。如果每单扣除随单成本后留下 20 美元，需要两单覆盖 29 美元。若官网来访到付费的转化率是 2%，约 100 次官网来访对应两单的期望。每单留下的金额和转化率是测算假设，SparkVid 的实际导流和订单数未公开。"]
        ],
        sources: [["sitin 的 Search Console 复盘", "https://www.ipengtao.com/34-1/"], ["LMArena 榜单页", "https://www.toolcenter.ai/en/tools/lmsys-chatbot-arena-leaderboard"], ["ToolCenter 首页", "https://www.toolcenter.ai/en"], ["SparkVid 的真实收录页", "https://www.toolcenter.ai/en/tools/sparkvid"], ["SparkVid 官网图生视频入口", "https://sparkvid.ai/image-to-video"], ["ToolCenter 收录定价及权益", "https://www.toolcenter.ai/en/submit"]]
      },
      {
        id: "product", title: "HiAPI 是什么？给做 AI 产品的人用的模型接入服务",
        paragraphs: ["sitin 的个人主页列出 HiAPI，活动主办方介绍他是创始人兼 CEO。他在 2026 年 4 月复盘中称 HiAPI 为核心业务，也谈到企业客户会把稳定性、开票和服务纳入采购判断。更早几十个站的完整清单和各站收入仍未公开。", "HiAPI 把多个厂商的模型放到一个账号下。开发者可以在 Playground 先试效果，再用一把 API Key 接入自己的站或内部工具。图像、视频和音频走统一的异步任务接口，文字模型提供兼容 OpenAI SDK 的接口。它把身份验证、任务状态、结果地址和计费做成一套共同的接入方式，各模型仍有自己的参数和能力。"],
        sources: [["sitin 的公开主页", "https://nitter.cf/sitinme"], ["活动主办方对 sitin 的介绍", "https://x.com/vista8/status/2120066792995561957"], ["sitin 复盘 HiAPI 核心业务", "https://x.com/sitinme/status/2049015103039942953"], ["HiAPI 开发者文档", "https://hiapi.ai/docs/"], ["HiAPI 模型目录", "https://hiapi.ai/en/models"]]
      },
      {
        id: "flow", title: "真实接口示范｜让卖家上传商品照，生成 5 秒短片",
        steps: [
          ["01", "卖家在你的网页交素材", "假设你做了一个给卖家用的商品素材站。卖家上传一张商品照，想要镜头缓缓推进的 5 秒视频。你的服务器把参考图、动作描述、时长和分辨率交给 HiAPI 的 Wan 2.7 图生视频接口。"],
          ["02", "你的程序接收任务号，再取回成片", "视频需要时间生成。HiAPI 先返回任务 ID。你的程序可以查询状态，或接收完成通知，拿到生成视频的地址，再把视频显示给卖家。失败状态也通过任务记录交回你的程序。"],
          ["03", "有更多需求时，复用这套接入", "想加另一款视频模型给用户挑镜头风格，或再加生图和配音，仍可沿用同一 API Key、任务查询方式及余额。开发者还要根据模型参数和成本调整请求。"]
        ],
        callout: ["用户付钱买什么", "卖家在这个例子里使用你的商品素材站。向 HiAPI 付钱的是要交付视频的开发者。接多家模型时，开发者可以少重复写几套任务查询、结果下载和充值管理。只用一款模型的团队，可以比较同样规格的价格和出片稳定性再选接入方式。"],
        sources: [["Wan 2.7 图生视频的真实接口与示例", "https://hiapi.ai/en/models/wan2.7-video-image-to-video"], ["HiAPI 异步任务文档", "https://hiapi.ai/docs/async-api/?lang=en"], ["HiAPI 统一模型接入说明", "https://hiapi.ai/en/blog/hiapi-image-video-generation-platform-guide"]]
      },
      {
        id: "acquisition", title: "他怎么找客户？把模型尝试变成可复用的入口",
        bullets: [
          ["公开模型页承接明确任务", "每款模型有自己的页面，能看样片、输入规则、用量定价和接口代码。正在找 Wan 2.7 图生视频接口的人，可以在同一页核对它能否完成手上的任务。页面可核对，实际搜索流量和订单归因未公开。"],
          ["在开发者社区给出明确的试用理由", "HiAPI 团队成员 qxiaoyuan 在 V2EX 发过节日活动，给出 GPT Image 2.5 的规格、活动单价和 Playground。sitin 在帖下参与讨论。sitin 也在 4 月复盘里说，上线当天接入 ChatGPT Image 2 后，新增用户数是平时的几倍，具体人数和订单未公开。"],
          ["让助手用户能直接跑一个任务", "他在 X 展示过让 Codex 或 Claude Code 调用 Seedance 的例子，提供可获取的 GitHub Skill。活动主办方也提到，自己的 RSS 站用过 sitin 送的额度处理翻译和转写。这个例子能证明有外部场景试用，相关付费数据未公开。"]
        ],
        sources: [["HiAPI 团队的 V2EX 活动帖", "https://v2ex.com/t/1244571"], ["sitin 发布的 Seedance 接入例子", "https://x.com/sitinme/status/2082098445415055439"], ["HiAPI 的 GitHub 集成", "https://github.com/HiAPIAI/hiapi-seedance-2-0-video-skill"], ["外部 RSS 站的额度使用说明", "https://x.com/vista8/status/2120066792995561957"], ["HiAPI 的模型页", "https://hiapi.ai/en/models/wan2.7-video-image-to-video"], ["sitin 关于模型上新带动增长的复盘", "https://x.com/sitinme/status/2049015103039942953"]]
      },
      {
        id: "billing", title: "怎么收费？按模型和用量从同一个余额扣费",
        paragraphs: ["官网定价页说明，1 美元对应 2,000 积分。图片按张、视频按秒、语音按字数等维度扣费。定价受模型、分辨率和路线影响。提交生成任务时会扣积分，官网说明任务失败会退回相应积分。", "以官网 Wan 2.7 指南的价格为例，720p 图生视频每秒 0.10 美元，一次成功的 5 秒生成是 0.50 美元。如果成功生成三版再选其中一版，就会花 1.50 美元。网站开发者可以按这个数估算自己的交付成本。HiAPI 实际采购成本、毛利和各模型销量未公开。"],
        sources: [["HiAPI 积分和计费 FAQ", "https://hiapi.ai/en/pricing"], ["Wan 2.7 的官方图生视频与价格示例", "https://www.hiapi.ai/en/blog/wan2-7-video-api-guide"]]
      },
      {
        id: "evidence", title: "1 万美元和海外收款分别能确认到哪一步？",
        paragraphs: ["sitin 在 X 自介写做了几十个站、已实现月入 10K 美元。活动介绍也引用了这个数字，没有给出对应月份、网站收入拆分或可核对的支付后台。HiAPI 的产品和计费可以核查，HiAPI 在这 1 万美元中占多少仍未知。", "2025 年他发帖说拿到了美国 EIN，并把企业账户和 Stripe 列为接下来推进的事项。后来他也公开分享了支付实现，例如收到 Stripe 支付事件后核对订单状态，以及用沙盒测试支付流程。这些是他公开讲过的操作经验，不能由此计算 HiAPI 收入。"],
        sources: [["sitin 的公开自介", "https://nitter.cf/sitinme"], ["活动嘉宾介绍", "https://x.com/vista8/status/2120066792995561957"], ["sitin 记录拿到 EIN", "https://x.com/sitinme/status/1946786393616994321"], ["sitin 讨论收银台与沙盒测试", "https://x.com/sitinme/status/2116117911299670032"], originalPost]
      },
      {
        id: "judgment", title: "最能复用的一步｜让第一次试用直接产生可带走的结果",
        paragraphs: ["sitin 公开分享过一套找需求的方法。先从工具榜单找增长中的方向，再用流量、关键词和竞品观察人从哪儿来，最后找能核对的付费信号。做出小版本后，把入口、首个任务、付费和交付一起检查。", "对类似 HiAPI 的开发者产品，最早要证明的是有人会拿自己的素材真正跑一遍。给他一条具体的任务说明、能跑的示例和可计算的价格，再看他是否用同一接口跑第二批素材或充值。这样才能发现他愿意为接入省事、模型覆盖还是交付稳定性买单。"],
        sources: [["sitin 分享发现 Web 需求的方式", "https://x.com/sitinme/status/2101644291088990398"], ["sitin 的线下增长复盘", "https://x.com/sitinme/status/2091811248400957571"]]
      }
    ]
  }
];
