window.toolDeepDives = {
  notebooklm: {
    principle: [
      ['导入来源', '网页、PDF、笔记等内容进入一个专题。网页通常取正文，关联网页和嵌入视频要另加；公开 YouTube 视频主要用可取得的字幕。'],
      ['选择范围并提问', '先选本轮要使用的来源，再用清楚的问题查输入、限制和例外。例如分别问“接受什么参考素材”和“什么要到模型界面确认”。'],
      ['回答附出处，人工复核', '回复可附引文，点开回到段落。再把判断、证据位置和待办写成项目决策卡。引用负责定位证据，最终采用的结论由项目验证。'],
    ],
    mechanism: '研究模式可理解为「给定材料 → 定位相关内容 → 生成带引用的答复」。官方文档说明了可选来源和引用行为。内部检索排序与段落切分应以 Google 的公开披露为限。',
    principleSources: [
      ['Google 来源导入说明', 'https://support.google.com/gemininotebook/answer/16215270?hl=en'],
      ['Google 引用说明', 'https://support.google.com/gemininotebook/answer/16179559?hl=en'],
    ],
    personal: [
      ['工具研究里的选型记录', '你在 Codex 已经能查公开网页。NotebookLM 的增量是对同一批已选资料反复问不同问题，复查时更容易找到原来的证据。把最终判断留在对应的子项目文档里。'],
      ['深潜档案的制作复盘', '把角色规范、转身试镜样片说明和验收记录收在一起。下次给 Brine 换模型时，可追查上次到底用的什么参考视角、哪条条件失效、为什么要改方案。'],
    ],
    products: [
      ['带出处的工具选型台', '同时比较两三家服务的个人研究者或小团队。', '录入候选、官方文档和实测条目，生成一页证据对照表，标明版本、判断和待核实项。', '最小版本用一个专题笔记本加一份 Markdown 模板，先走通“问一个能力 → 点开证据 → 写下取舍”。让隔天接手的人从记录找到同一段原文。'],
      ['项目复盘问答库', '反复制作相近作品或更新同类技能的人。', '按项目加入版本说明、成功和失败案例，输出带原因的排查步骤。', '先用「参考图不一致」一个问题，准备两条有效案例和一条失败案例。用新角色复测，统计建议是否能定位到可复现的设置。'],
    ],
    demoSteps: '先用三条来源回答试镜问题，再取消 Photopea 来源。你会看到关于 PSD 的结论随证据消失。随后换成角色一致性问题，观察过程建议和结果证据的区别。',
    sample: {
      title: 'Vesper 转身试镜研究卡',
      status: '固定样例 · 产品能力已查源，生成表现待测',
      file: 'notebooklm-vesper-evidence.md',
      rows: [
        ['研究问题', '用已有角色图做一个转身镜头，需要准备什么？'],
        ['可确认能力', '即梦支持使用已有图片作为视频生成输入。模型的具体参考选项需要在对应模式里确认。'],
        ['素材决策', '用原始设定稿和可改源文件保留依据，从 GLB 导出对应角度的 PNG。'],
        ['验收假设', '抽看转到背面前后几帧，逐项记录双联气瓶、阀轮位置与轮廓。'],
        ['待测记录', '填写模型、参考模式、尝试次数、第一次通过用时和失败样片路径。'],
      ],
      sources: [
        ['即梦视频生成说明', 'https://jimeng.jianying.com/tools/ai-video-generator'],
        ['Photopea 文件保存说明', 'https://www.photopea.com/learn/opening-saving'],
      ],
    },
  },
  perplexity: {
    recap: {
      summary: 'Perplexity 本身就是联网 AI 搜索。它先找相关网页和内容，再提取要点、综合来源、给出带引用的答案。你可以点引用回到来源页，看原文是否支持那句话。',
      headline: '搜到网页，整理答案，回查原文',
      stages: [
        ['联网检索', '从问题出发，找相关网页与片段。'],
        ['分析与汇总', '提取要点，综合多个来源。'],
        ['回答附引用', '把结论和可点击的出处一起给你。'],
        ['原文复核', '你点回来源页，核对具体说法。'],
      ],
      points: [
        ['能力', '用完整问题找资料，在同一会话里追问细节。'],
        ['效果', '得到一份整理过的回答，以及回查来源的入口。'],
        ['价值', '少花时间筛读网页，把核对过的出处留给项目。'],
      ],
      comparison: [
        ['直接搜索', '先拿到网页链接，自己选择、阅读和汇总。'],
        ['Perplexity', '先拿到带引用的回答，集中核对关键出处。'],
        ['Codex 等联网 AI', '同样能检索、汇总和引用。Codex 还能接着查代码、写回项目。'],
      ],
      example: ['SRT 查证示例', 'YouTube 官方确认基本 SRT 使用 UTF-8。所查的官方格式页没有列出每行 42 字符上限。点击引用后，可在同一份原文中核对两个判断。'],
      demoLink: '打开 SRT 核查示例',
    },
    principle: [
      ['发现网页并建立索引', '官方区分两种访问。PerplexityBot 帮助网页进入搜索结果。用户提问时，Perplexity-User 也可能访问具体网页获取回答材料。能找到链接和取得可用正文是不同的条件。'],
      ['把复杂问题拆成若干搜索', '根据 Pro Search 的公开说明，复杂问题可以拆成多次搜索，再读取结果。以字幕质检为例，先分别找 YouTube 的导入规则和 Subtitle Edit 的功能文档，两方面证据分别承担不同的判断。'],
      ['返回排过序的页面和相关片段', 'Search API 的公开行为是查询 Perplexity 的网页索引并返回按相关程度排列的页面。每条有标题、链接、与查询相关的正文片段和已知日期。同一页面针对不同查询可以返回不同的片段。'],
      ['模型组织回答并附引用', '网页端把找到的材料放进回答，在引用处提供来源。引用把你带到证据候选。点击原文后，按适用产品、版本、范围和措辞核对这句话。'],
      ['用追问补齐缺项', '在同一会话收窄一个缺项。例如追问「你引用的官方段落有没有直接写行长上限？」记录可确认的规则和还要实测的条件。'],
    ],
    mechanism: '可以理解为「检索材料 → 模型写带出处的回答」。Search API 和网页端各有公开说明，网页端每次拆出哪些词、内部采用何种排序权重及如何选取引用，仍属于个别查询层面的未知细节。',
    modes: [
      ['网页 Search', '适合查单点事实或做多来源对比。官方当前说明是由 Search 按计划与额度启用 Pro Search。达到额度后仍可做基础搜索。'],
      ['Deep Research', '适合需要结构化长报告的复杂问题。会根据已经读到的材料决定接下来查什么。可用性和额度按当前计划核对。'],
      ['Search API', '适合把搜索加进自己的项目。你的代码收到已排序的页面结果，可按域名、语言、日期等过滤，并自行保存或传给模型。'],
      ['Agent API + web_search', '适合程序既要查网页，又要接收带来源的生成式答案。Search API 负责返回结果，生成答案可以交给 Agent API。'],
    ],
    principleSources: [
      ['Pro Search 官方说明', 'https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search'],
      ['Search API 检索、片段与过滤方式', 'https://docs.perplexity.ai/docs/search/overview'],
      ['Perplexity 的网页抓取说明', 'https://docs.perplexity.ai/docs/resources/perplexity-crawlers'],
      ['Deep Research 官方说明', 'https://www.perplexity.ai/help-center/en/articles/10738684-what-is-research-mode'],
    ],
    personal: [
      ['陌生方向更快找到搜索切口', '当你还不熟悉一个领域的英文术语时，可让它列出专业叫法与对应文档。例如从「字幕重叠怎么检查」找到 overlap、CPS 和 rules profile，再追到厂商的功能页。已经知道精准页面时，直接读官方说明就能解决查证。'],
      ['给字幕质检项目明确差异', 'YouTube 的帮助页确认输入格式，Subtitle Edit 的文档让我们看到逐条列错和导出已有替代方案。你现有网页检测器可以用本地用例验证能力，差异则需观察真实审稿人能否用浏览器报告更快交接。'],
      ['与目前的 Codex 搜索搭配', '你已经有联网查源入口。Perplexity 的候选价值是低摩擦的搜索会话，以及可能补到另一个入口漏掉的一手资料。可用同题比较首条有效出处、需要人工纠正的声明和最终查证用时。'],
      ['把证据变成项目资产', '对每个会影响决策的判断保留问题、结论、原始链接、原文位置、适用版本、查证日期和下一步。类似主题反复研读时，把这些已选资料交给 NotebookLM，产品判断回存到自己的项目。'],
    ],
    products: [
      ['可复核的工具替代对照页', '正在换工具或决定是否采购的小团队。', '输入要替代的功能，输出带官方出处的候选、已核实能力、缺项及核验日期。', '先把字幕质检做成一页，限定四个常见功能。由第二个人只看链接复核每个格子。'],
      ['垂直查源工作台', '反复追查平台功能变化的本地化团队。', '按查询模板保存原始结果、证据链接和适用条件，支持标记过期与重新查证。', '从手工保存三次检索开始。只有重复查询能稳定产生有用差异时，再考虑接 Search API。'],
    ],
    demoSteps: '默认展示字幕质检案例。展开「问题如何拆开」，再核对三条判断。切换「只看官方资料」会收起项目线索，逐条核查仍会保留待实测的判断。可切换到即梦或 Photopea 案例。',
    searchCase: {
      label: 'YouTube 接收哪种 SRT？现有工具能做哪些质检？',
      answer: 'YouTube 文档确认基本 UTF-8 SRT。Subtitle Edit 官方文档说明支持查重叠、长行、阅读速度和导出问题清单。你现有网页工具的本地规则与平台是否接收，要用各自的证据判断。',
      query: '我在做浏览器 SRT 质检工具。请核查 YouTube 接收的 SRT 格式、编码和样式，以及 Subtitle Edit 已支持的重叠、行长、阅读速度和导出。每条给官方出处与段落位置，注明政策、工具功能或项目待验证项。',
      plan: [
        ['平台输入规则', '查 YouTube 帮助的 SubRip 行，分别核查格式、编码与样式。'],
        ['现有工具能力', '查 Subtitle Edit 文档的 Error Types 和 Export，核对它检查什么、怎么交给他人。'],
        ['网页产品价值', '用本地样例确认代码能找出问题，再用真实的审稿流程判断有没有节省交接时间。'],
      ],
      sources: [
        ['YouTube 官方 · 字幕格式', '支持基本的纯 UTF-8 SubRip。样式标记在这一格式中不被识别。', 'https://support.google.com/youtube/answer/2734698?hl=en'],
        ['Subtitle Edit 官方 · 问题列表', '可按规则检查时间重叠、行长和阅读速度，问题列表可导出为文本或网页等。', 'https://subtitleedit.github.io/subtitleedit/features/list-errors.html'],
        ['项目线索 · 浏览器交接价值', '本地样例证明检测器可以定位问题。审稿人是否更愿用它交接，以及能节省多少时间，仍待真实任务对照。'],
      ],
      audit: [
        ['YouTube 接受基本 UTF-8 SRT', '官方确认', '打开字幕格式页的基本文件格式表，定位 SubRip（.srt）这一行。', 0],
        ['Subtitle Edit 已能列出重叠并导出清单', '官方确认', '打开官方说明的 Error Types 与 Export 两节，分别核对重叠检查与导出。', 1],
        ['超过 42 字符就一定被 YouTube 拒绝', '当前出处不足', '复查 YouTube 格式表。42 字符是本项目的一项可调可读性规则。它对本地报告的影响已用样例复测，YouTube 对具体文件的处理要单独验证。', 0],
      ],
      caseNote: '案例基于已打开核对的官方原文和本地字幕样例。Perplexity 网页试跑停在安全验证页，问题拆分是演示，平台输出与耗时留待实测。',
    },
    sample: {
      title: 'SRT 质检查源与复测记录',
      status: '一手文档已核查 · 本地样例已复跑',
      file: 'perplexity-srt-evidence-check.md',
      rows: [
        ['查证问题', 'YouTube 接收哪种 SRT？现有桌面编辑器已经做了哪些质检？每个结论落到哪个官方段落？'],
        ['平台格式', 'YouTube 帮助的基本文件格式表确认基本 UTF-8 SRT。样式信息不被识别。'],
        ['竞品能力', 'Subtitle Edit 的 Error Types 和 Export 分别确认规则化检查和报告导出。'],
        ['本地复测', '独立网站子项目的样例检查全部通过。timing.srt 报出第 6、10 行重叠，以及第 14、18 行的无效时长。'],
        ['待实测', 'Perplexity 网页停在安全验证，平台回答和用时待测。客户是否愿意采用网页报告，以及交接能省多少时间，需观察实际任务。'],
        ['双路对照字段', '用同一问题记录首条有效出处用时、直接支持的声明数、错误归因以及完成人工查证的总时间。'],
      ],
      sources: [
        ['YouTube 字幕格式', 'https://support.google.com/youtube/answer/2734698?hl=en'],
        ['Subtitle Edit 问题列表', 'https://subtitleedit.github.io/subtitleedit/features/list-errors.html'],
      ],
    },
  },
  khan: {
    recap: {
      summary: '可汗学院把同一知识点的讲解、做题、反馈和进度排在一起。真人团队主导并审核正式课程，AI 可参与起草。遇到课内的分步提示可以自己重做，打开 Khanmigo 则能用对话继续追问。',
      headline: '看讲解，做练习，再用到项目',
      stages: [
        ['按学科找课', '从学科进课程、单元和课节。'],
        ['选讲解或例题', '桌面左侧选内容，右侧看当前讲解。'],
        ['作答并检查', '填答案点 Check，卡住时看提示。'],
        ['换到项目复测', '换一组数据，检查能否独立解释。'],
      ],
      points: [
        ['能力', '提供分层课程、练习、测验与技能进度。'],
        ['效果', '知道自己错在哪里，接下来该练哪一块。'],
        ['价值', '把规则、错题和手算案例带进项目。'],
      ],
      comparison: [
        ['真人课程', '由专家主导制作和审核。AI 可帮忙起草文章或提供样题。'],
        ['课内分步提示', '展开当前题的解题步骤，再自己重算。'],
        ['Khanmigo AI 辅导', '你提出具体问题，它会在对话中生成下一步引导。'],
      ],
      example: ['百分数课实测', '讲解下方的 Up next: exercise 直接进入练习。答错后会出现 Try again，可点 Show a step 展开第一步。'],
      demoLink: '打开点击率练习',
      guideLink: ['courses', '查看课程与讲者'],
    },
    courseGuide: {
      layout: [
        ['首页 → 学科目录', '在顶部点 Explore，先选学科和课程。进入课程后，按单元找到需要的那一节。'],
        ['课节的桌面布局', '以「使用百分数」为例，左侧列同课节的视频和练习。点其中一项，右侧显示当前内容。视频下方的 Up next: exercise 可直接切到下一项练习。'],
        ['练习怎样展示结果', '右侧显示题目和答案输入框，下方有 Check 按钮和做题进度。示例课节的这组练习显示 4 道题。判错后可以重算，也可以逐步看提示。'],
      ],
      walkthrough: '我们实测的百分数练习要求算两个月的复利。输入 600 后，页面显示 Try again（再试一次）。点 Show a step（显示一步），第一条提示说明每个月都要用当时的金额作为基数。自己按 400 → 500 → 625 重算，就能看出原先漏在哪里。',
      lessonLinks: [
        ['官方 Explore 菜单说明', 'https://support.khanacademy.org/hc/en-us/articles/39586522176909-Update-New-and-improved-Explore-menu'],
        ['打开实际百分数讲解', 'https://www.khanacademy.org/math/pre-algebra/pre-algebra-ratios-rates/pre-algebra-percent-problems/v/finding-percentage-change'],
        ['打开实际百分数练习', 'https://www.khanacademy.org/math/ka-math-class-8-ncf/x5c620ccbb96453eb:fractions-in-disguise/x5c620ccbb96453eb:using-percentages/e/commercial-math-7-g'],
      ],
      subjects: [
        ['数学与统计', '算术、比例、代数、几何、三角函数、微积分、统计与概率。', 'https://www.khanacademy.org/math'],
        ['自然科学', '物理、化学、生物、环境科学、天文学和电路基础。', 'https://www.khanacademy.org/science'],
        ['计算机与编程', 'Python、JavaScript、HTML/CSS、SQL、算法和互联网。', 'https://www.khanacademy.org/computing'],
        ['经济与金融', '微观与宏观经济学、供需与定价、金融和资本市场。', 'https://www.khanacademy.org/economics-finance-domain'],
        ['英语语言艺术', '分年级的阅读理解、词汇，以及语法练习。', 'https://www.khanacademy.org/ela'],
        ['人文与社会科学', '世界历史、艺术史等。', 'https://www.khanacademy.org/humanities'],
        ['生活与职业技能', '预算、储蓄、信用与借贷、职业探索、升学和创业。', 'https://www.khanacademy.org/college-careers-more'],
        ['考试备考', 'SAT 数学、SAT 阅读与写作、MCAT 等。', 'https://www.khanacademy.org/test-prep'],
      ],
      projectLinks: [
        ['角色展台的虚拟摄影机 · Pixar in a Box', 'https://www.khanacademy.org/v/virtual-cameras'],
        ['交互网页与小游戏 · JavaScript 与网页', 'https://www.khanacademy.org/computer-programming'],
        ['广告周报的数据分析 · 统计基础', 'https://www.khanacademy.org/math/high-school-math/probability'],
      ],
      teaching: [
        ['真人制作的正式课程', '学科专家主导制作并审核视频、文章和练习。一些视频由带署名的真人制作，例如 Sal Khan 的百分比增长课。平台也会让 AI 辅助起草文章或提供样题，再由团队检查和修改。', [
          ['内容制作说明', 'https://support.khanacademy.org/hc/en-us/articles/14004618952717-How-does-the-Khan-Academy-content-team-use-large-language-models'],
          ['Sal Khan 署名的百分比课程', 'https://www.khanacademy.org/v/growing-by-a-percentage?playlist=Algebra'],
        ]],
        ['随练习显示的分步提示', 'Check 检查答案。Show a step 展开这道题的解题步骤，你可以按提示回到输入框重新计算。', [
          ['实际练习页', 'https://www.khanacademy.org/math/ka-math-class-8-ncf/x5c620ccbb96453eb:fractions-in-disguise/x5c620ccbb96453eb:using-percentages/e/commercial-math-7-g'],
        ]],
        ['Khanmigo 对话辅导', '当你想问「为什么这一步要换分母」时，可以向 Khanmigo 提问。它会根据你这次的输入生成回复，用对话继续引导。', [
          ['Khanmigo 官方介绍', 'https://www.khanacademy.org/khanmigo'],
        ]],
      ],
    },
    principle: [
      ['把课程拆成可练的知识点', '课程下面有单元、课节和练习。对广告周报，先补「比率和百分数」，再单独分清点击率、增长率和百分点，避免把不同问题套进同一个公式。'],
      ['先学概念，再自己算', '看一段视频或一篇讲解，回答「这道题的分子和分母分别是什么」。合并点击率要先汇总点击与展示。增长率用上期值作分母。'],
      ['用练习暴露哪一步错了', '先独立作答，卡住时看提示。把错误记到具体环节，比如拿错分母、把两组百分数直接平均，或忘了统一单位。'],
      ['用测验和掌握度追踪技能', '支持 Mastery 的课程根据练习、测验等结果更新技能等级，技能可能升级或降级。官方口径下，课程或单元掌握度统计达到 Proficient 或 Mastered 的技能占比，个别地区可能有不同口径。'],
      ['换成自己的任务再检验', '把课内题换成广告周报数据、画布尺寸或试玩记录。不看答案独立算对，并解释分母或者坐标基准，才有证据表明知识能用回项目。'],
    ],
    mechanism: '例如 20 项技能里有 5 项达到 Proficient 或 Mastered，按官方口径掌握度为 25%。本页练习进度按答对的本地题计数。项目效果则看换一组数据后能否算对并说明原因。',
    principleSources: [
      ['课程与练习如何组织', 'https://support.khanacademy.org/hc/en-us/articles/18564282990861-What-types-of-content-can-I-assign-to-my-students'],
      ['课程与单元掌握度', 'https://support.khanacademy.org/hc/en-us/articles/115002552631-What-are-Course-and-Unit-Mastery'],
      ['掌握度计算方式', 'https://support.khanacademy.org/hc/en-us/articles/48411237993357-How-is-my-mastery-percentage-calculated'],
    ],
    personal: [
      ['广告周报的口径可以手算验收', '先约定点击、展示、周期和归属范围。对可以汇总的来源，用总点击除以总展示，把 24/1,100 这类手算例子留作将来验收脚本的固定样本。'],
      ['角色与小游戏里按任务补基础', '角色图坐标可先练比例和归一化，货运分拣的随机包裹可先练概率。掌握最小概念后，在原型里调一个值，再观察实际结果。'],
      ['已有 AI 帮助时的增量', '遇到一个公式就问 AI，能快速进入当前问题。如果同类错误反复出现，可汗学院给你固定的课、同类练习和测验。学完让 AI 用项目字段出迁移题，由你先答再看反馈。'],
    ],
    products: [
      ['广告周报口径练习卡', '刚接手报表的运营或自动化服务客户。', '每题给一个项目场景、一个常见错法、一份可复核的手算过程。', '先做两个渠道 CTR 合并题。更换行数和分布，检查使用者能否独立解释加权结果。'],
      ['零基础互动技术课', '需要短时间理解坐标和动效的制作者。', '用坐标转换、比例和运动曲线三节连接真实画布，并即时反馈。', '先交付一题「屏幕像素换算成画布比例」，让读者能在页面上验证坐标。'],
    ],
    demoSteps: '先到「渠道点击率」试填 3，看反馈如何指出分母。改用总展示量算一次，再切换「渠道点击率 · 换数复测」。两题输入相近，分母不同，能检查你会不会重复使用上次答案。',
    sample: {
      title: '项目练习卡 · 两个渠道的点击率',
      status: '人工构造数据 · 可直接复核计算',
      file: 'khan-ctr-practice.md',
      rows: [
        ['题目', '同口径下，A 渠道是 20 次点击、1,000 次展示，B 渠道是 4 次点击、100 次展示。合并点击率是多少？'],
        ['逐项计算', 'A 为 2%，B 为 4%。合并后 24 ÷ 1,100 × 100% ≈ 2.18%。'],
        ['容易误算的答案', '3% 来自直接平均两个渠道的点击率，忽略了两个渠道的展示量不同。'],
        ['迁移题', '把 B 的展示量改为 200，点击数仍为 4。算出新结果，检查结果为何是 2%。'],
        ['交付标准', '保留输入计数、分母、计算式及四舍五入规则。总展示为零或两份数据口径不一致时，单独标记并确认处理方式。'],
      ],
      sources: [
        ['百分数变化讲解', 'https://www.khanacademy.org/math/pre-algebra/pre-algebra-ratios-rates/pre-algebra-percent-problems/v/finding-percentage-change'],
      ],
    },
  },
  deepl: {
    recap: {
      summary: '读英文论文时，浏览器自带翻译适合扫读，双语插件方便随时核对原文。遇到反复出现的专业词，或要留一份可修改的中文稿，再用 DeepL 的术语表和文件翻译。支持选择翻译服务的双语插件，也可以调用 DeepL。',
      headline: '读懂英文论文，按需留下译稿',
      stages: [
        ['扫读摘要', '用浏览器整页翻译看大意。'],
        ['中英对照', '读方法和结果时随手核原文。'],
        ['统一术语', '把常用的专业词和译法存下来。'],
        ['按需保存译稿', '核对结论和数字，存为可编辑稿。'],
      ],
      points: [
        ['DeepL 的能力', '翻正文和文件，按术语表统一译法。'],
        ['译稿', '整理好的译文，可保存、修改和分享。'],
        ['术语表', '记下专业词和确认后的译法，下次沿用。'],
      ],
      comparison: [
        ['浏览器自带翻译', '原页快速看中文，适合扫读摘要和引言。'],
        ['双语插件', '原文与译文一块看，适合细读。有些插件可以选 DeepL。'],
        ['DeepL 网页版', '整段重译、统一专业词，或把受支持的文件翻成一份可继续审校的稿子。'],
      ],
      example: ['论文例子', 'low-resource languages → 低资源语言。写入译稿时还要核对「未发现……的证据」、数值和单位。'],
      demoLink: '打开字幕术语演示',
      guideLink: ['paper', '查看英文论文案例'],
    },
    paperGuide: {
      routes: [
        ['Chrome / Edge 自带翻译', '直接在当前网页看中文。Chrome 使用 Google 翻译，Edge 使用 Microsoft Translator。打开期刊网页后扫一遍摘要和引言，先判断论文是否值得细读。', [
          ['Chrome 网页翻译', 'https://support.google.com/chrome/answer/173424?hl=zh-Hans'],
          ['Edge 网页翻译', 'https://support.microsoft.com/en-us/edge/use-microsoft-translator-in-microsoft-edge-browser'],
        ]],
        ['沉浸式翻译等双语插件', '把英文和对应的中文放在一起。读方法或结果时，碰到一句可疑的译文，直接回看它上方或旁边的英文。沉浸式翻译可以选择 DeepL，由 DeepL 生成译文，插件负责在网页上呈现。已经选了同一翻译服务，可以先在插件里接着读。', [
          ['沉浸式翻译的双语阅读', 'https://immersivetranslate.com/zh-Hans/docs/'],
          ['沉浸式翻译接入 DeepL', 'https://immersivetranslate.com/zh-Hans/docs/services/deepL/'],
        ]],
        ['DeepL 网页版', '把难句连同前后文一起贴进去重译。反复读同领域论文时，选用已确认的术语表。需要留下中文译稿时，可以翻支持的整份文件，也可以只翻你要保存的章节，再整理进 Word。', [
          ['DeepL 英译简中', 'https://www.deepl.com/en/translator/l/en/zh'],
          ['术语表帮助', 'https://support.deepl.com/hc/en-us/articles/360021634540-About-the-glossary'],
        ]],
      ],
      definitions: [
        ['译稿', '翻完后整理出来的稿子。比如把结果一节的中文放进 Word，保留原文章节和页码，之后还可以修改、标注或发给同事。待校对的第一版也叫译稿。'],
        ['术语表', '你确认过的一组「英文专业词 → 中文译法」。例如把 low-resource languages 记为「低资源语言」，把 confidence interval 记为「置信区间」。在同领域下一篇论文再用，读者能认出是在讲同一个概念。'],
      ],
      sample: {
        original: 'After controlling for model size, we found no evidence that pretraining on synthetic data improved out-of-domain accuracy (Δ = −0.8 percentage points; 95% CI, −2.1 to 0.5). This does not rule out a benefit for low-resource languages.',
        raw: '在控制了模型规模后，我们未发现基于合成数据进行预训练能提高域外准确率的证据（Δ = −0.8 个百分点；95% 置信区间，−2.1 至 0.5）。这并不排除其对资源匮乏语言可能带来的益处。',
        revised: '在控制模型规模后，我们未发现用合成数据预训练能提高域外准确率的证据（Δ = −0.8 个百分点，95% 置信区间为 −2.1 至 0.5）。这并不排除这种预训练对低资源语言有益。',
        note: '原文是自拟的论文式例句。DeepL 网页实测保留了否定和统计数字。译稿节选展示怎样把「资源匮乏语言」统一为「低资源语言」。本例仅实测 DeepL 网页文本，浏览器和插件的功能依据官方资料。',
      },
      checks: [
        ['准备引用结论', '对照英文核对条件、否定、数字和单位。「未发现能提高的证据」描述本次研究找到了什么证据，译成「证实无效」会改变结论。'],
        ['准备使用图表或公式', '扫描质量和字体会影响 PDF 的文字识别。对照原版核查图表行列、公式、符号和图注。遇到识别问题，可以取出相关正文段落单独翻译。'],
      ],
      pdfLink: ['DeepL 的 PDF 翻译说明', 'https://support.deepl.com/hc/en-us/articles/4411308018450-Translate-PDF-files'],
    },
    translationGuide: {
      steps: [
        ['翻普通文字', '打开 Translate text，左边粘贴原文，选择源语言和目标语。本次实测用 English → Chinese (simplified)，译文出现在右边，短句下方还给了几种备选译法。'],
        ['反复用同一套术语', '登录后从 Glossaries 建表，选定语言对，逐条填原词和确认后的译法，再在翻译时选用它。上传或下载 CSV 等功能按套餐查看。'],
        ['翻整份文件', '在 Translate files 上传支持的格式，选语言与可用的术语表，再下载译文。Word、PowerPoint、PDF 等走文件入口，下载后检查版式和关键字段。'],
        ['处理字幕文件', '支持该格式的套餐可以直接翻整份 SRT，官方说明可保留时间码。也可以先取出台词做文本翻译，再放回原片段。两条路线都用字幕检查器核对编号、起止时间、重叠和可读性，最后随视频通看。'],
      ],
      usageLinks: [
        ['DeepL 英译简中', 'https://www.deepl.com/en/translator/l/en/zh'],
        ['创建术语表', 'https://support.deepl.com/hc/en-us/articles/17793927992092-Create-a-glossary'],
        ['文件格式及 SRT 套餐支持', 'https://support.deepl.com/hc/en-us/articles/360020582359-File-formats'],
        ['整文件翻译和时间码说明', 'https://www.deepl.com/en/blog/transform-document-translation-deepl'],
      ],
      comparison: [
        ['怎么给要求', '选语言、粘贴原文，直接拿译文。可以选择已有术语表。', '给原文之外，还能讲清观众、画面、语气、行长和发布渠道。'],
        ['怎么固定术语', '按语言对建术语表，后续任务可复用。', '也能按术语表翻。把词条连同原文一起提供，或让工作流从项目文件读取。'],
        ['怎么处理交付物', '受支持的文件可用专门的上传和下载入口。', '可要求逐句对齐、改短或输出指定格式。用程序检查编号和时间码最容易复验。'],
      ],
      sample: {
        original: 'From your workspace, click Invite members to bring teammates in.',
        raw: '在您的工作区中，点击“邀请成员”以添加团队成员。',
        revised: '在工作区点击「邀请成员」，把同事加进来。',
        terms: [['workspace', '工作区'], ['Invite members', '邀请成员']],
        cues: [
          ['00:00:01,000', '00:00:03,600', '在您的工作区中，点击“邀请成员”', '在工作区点击「邀请成员」'],
          ['00:00:03,600', '00:00:05,600', '以添加团队成员。', '把同事加进来'],
        ],
        prompt: '把这句英文改成简体中文 SaaS 演示字幕，观众要一边看界面一边操作。workspace 固定为「工作区」，Invite members 固定为「邀请成员」。保留原意，拆成两条简短字幕，只输出译文。',
        note: 'DeepL 网页文本实测使用英译简中，术语表未启用。默认译文已经用了两条正确术语。下方的字幕拆分、术语 CSV 和时间码由本地案例提供。整文件与术语表能力依据官方文档。',
      },
    },
    principle: [
      ['确定输入和语言对', '向翻译接口提供原文与目标语言，必要时为短句提供上下文。项目中的按钮、字段和专名提前标成需保持的一致用语。'],
      ['按版本应用术语表', 'DeepL 的翻译 API 可以指定 glossary_id。在使用术语表时按文档指定源语言和目标语言，词条随批准结果更新。'],
      ['按交付格式重新审校', '对照画面、源文和术语检查按钮、数字、否定句及行长。整文件路线与只翻台词路线都要回测字幕时间码。'],
    ],
    mechanism: 'DeepL 将原文、语言对和选定术语表交给专用翻译模型。API 的 context 参数可给短句补背景。文本路线需要把译文装回原时间轴，文件路线则用下载的 SRT 做复核。',
    principleSources: [
      ['DeepL 翻译输入与术语表参数', 'https://developers.deepl.com/api-reference/translate/request-translation'],
      ['DeepL 创建多语术语表', 'https://developers.deepl.com/api-reference/multilingual-glossaries/create-a-glossary'],
    ],
    personal: [
      ['把英文论文读懂、查准', '扫摘要用浏览器，细读用双语插件。用 DeepL 辅助核难段，保存对本领域有用的术语。需要引用或整理成中文笔记时，保留原文章节和页码，方便回查。'],
      ['出海字幕能交付可用文件', '你卖的是可直接检查和上传的简中 SRT。DeepL 可提供一份可对照的初译，工作重心放在界面名、字幕行长和音画对齐。用现有 SRT 工具先查格式和时间问题。'],
      ['同一个客户的译法可以积累', '把客户确认的按钮、产品名、例句和版本放进术语 CSV。遇到下一支视频、帮助文档或落地页，沿用同一套词，减少重复确认。'],
      ['什么时候值得多用一个工具', '偶尔翻一句并顺便讨论语气，你现有的通用 AI 就够用。若同一种格式和词反复交付，拿同一段字幕分别试两种流程，以精确词条、关键含义和人工修改用时衡量收益。'],
    ],
    products: [
      ['双语字幕术语质检工具', '交付外语视频字幕的自由职业者或小团队。', '接收原文、译文、术语表与时间码。输出术语不一致的段落、片段位置及审校建议。', '最小版本先只检查固定专名与按钮。用已知有问题和正确的字幕分别验证漏报与误报。'],
      ['可版本化的翻译工作台', '持续发布更新说明、帮助文档和产品演示的 SaaS 团队。', '任务包含语言对、术语版本与术语审批。初译保存后，审校人只集中看有变动的词和界面字段。', '先做一个客户、两个版本的演示。比较初稿到可发布用时，以及同一术语在交接后是否还要反复确认。'],
    ],
    demoSteps: '在默认 SaaS 样例里先看网页实测译文，再切到按项目术语和语气校对的版本。两版都有「工作区」和「邀请成员」，校对版更适合上屏。导出 SRT 时，固定样例的起止时间保持一致，也可下载词条 CSV。',
    sample: {
      title: 'SaaS 演示字幕审校样板',
      status: '网页文本实测 · 本地字幕校对样例',
      file: 'deepl-saas-subtitle-review.md',
      rows: [
        ['英文旁白', 'From your workspace, click Invite members to bring teammates in.'],
        ['DeepL 网页实测译文', '在您的工作区中，点击“邀请成员”以添加团队成员。'],
        ['客户词条', 'workspace → 工作区，Invite members → 邀请成员。'],
        ['上屏文案', '在工作区点击「邀请成员」／把同事加进来。'],
        ['保留字段', '原 SRT 片段编号、起止时间码、画面按钮和审校状态。'],
        ['验收', '对照画面确认按钮名称，检查编号、起止时间、阅读速度和行长，再用目标播放器通看。'],
      ],
      sources: [
        ['英译简中网页', 'https://www.deepl.com/en/translator/l/en/zh'],
        ['SRT 文件支持', 'https://support.deepl.com/hc/en-us/articles/360020582359-File-formats'],
      ],
    },
  },
  photopea: {
    recap: {
      summary: '临时截一张 Vesper 参考图，用截图就够了。想用同一张背面图出干净版和标注版，或预计还会改箭头和文字，就用 Photopea 把底图、箭头和文字分层，保存成 PSD。',
      headline: '同一张 Vesper 背面图，导出两种版本',
      stages: [
        ['取背面图', '从已有 GLB 取同一张背面渲染。'],
        ['分层加标注', '文字和箭头各自能改。'],
        ['保存 PSD', '把底图和标注一起留作源稿。'],
        ['导出两版 PNG', '关标注给 AI，开标注给人核对。'],
      ],
      points: [
        ['底图层', '保存 Vesper 的背面渲染。'],
        ['箭头层', '指向气瓶和阀轮，可以单独挪动。'],
        ['文字层', '保存两条名称，以后能单独改字。'],
      ],
      comparison: [
        ['截图就够', '临时取当前画面，发给人看或做一次镜头参考。'],
        ['值得用 Photopea', '要改字、挪箭头、局部修图，或反复出干净版和标注版。'],
        ['分层 PSD', '可继续编辑的工程，导出的 PNG 记录当前可见的内容。'],
      ],
      example: ['Vesper 示例', '两版来自同一张背面渲染。标注版指明双联气瓶与橙色阀轮的位置。'],
      demoLink: '试裁切并导出 PNG',
      guideLink: ['reference', '查看背面两版和分层说明'],
    },
    referenceGuide: {
      whenToUse: [
        ['截图就够', '只是把 Vesper 当前的背面发给别人看，或临时截一个部位给 AI 参考，直接截图就能完成。'],
        ['用 Photopea', '需要在背面上标出双联气瓶和阀轮、调亮一个部位，或同一张图要反复导出干净版和标注版。把每项修改存到独立图层，改一处就能重出两版。'],
      ],
      backViews: [
        ['干净版', '给 AI 做背面镜头参考。', 'photopea-vesper-back-clean.png', 'Vesper 背面渲染，双联气瓶和橙色阀轮清晰可见'],
        ['标注版', '给同事核对气瓶和阀轮位置。', 'photopea-vesper-back-annotated.png', '同一张 Vesper 背面图，两组文字和箭头分别指向双联气瓶与橙色阀轮'],
      ],
      layerIntro: '分层 PSD 是一份可继续修改的图片工程。屏幕上看见的是各层叠起来的结果，重新打开 PSD 还能改每一层。用这张背面图举例，可以这样分。',
      layers: [
        ['文字层', '写「双联气瓶」「橙色阀轮」。以后改名字，只动文字。'],
        ['箭头层', '把箭头拖到要讲的位置。要挪箭头时，底图和字都留在原层。'],
        ['底图层', '放 Vesper 背面渲染，保留角色原来的像素。'],
      ],
      layerWorkflow: '在 Photopea 里打开干净版，用文字工具加名称，用形状工具画箭头，然后选 File → Save as PSD。用 File → Export As → PNG 出图，关掉文字和箭头层出干净版，打开这两层出标注版。两份 PNG 示例在本地从同一张背面图制作。',
      layerSources: [
        ['Photopea 图层说明', 'https://www.photopea.com/learn/layers'],
        ['Photopea 保存 PSD 和导出 PNG', 'https://www.photopea.com/learn/opening-saving'],
      ],
      crops: [
        ['整张设定图', 0, 0, 540, 700, 'full'],
        ['头盔与胸部', 130, 100, 280, 270, 'upper'],
        ['肩甲与手臂', 312, 216, 112, 231, 'arm'],
      ],
      steps: [
        ['打开并保留源图', '在 photopea.com 选 File → Open，打开 Vesper 的 540 × 700 px 正面 PNG。用 File → Save as PSD 留一份全身源稿，把原图层命名为「Vesper 正面」。准备特写时，另开同一张原图处理。'],
        ['裁出头盔和胸口', '用工具栏里的 Crop 拖出一个矩形，框住天线、头盔、胸口标识和两侧肩甲，在顶栏确认。页面里的可复现预设是从左上角 (130, 100) 开始，宽 280、高 270 px。留出天线和肩甲边缘，给分镜保留朝向线索。'],
        ['让修改可以撤回', '在 Layer → New Adjustment Layer 里添加亮度/对比度等调整层。用文字或形状单独标注探头、肩甲等细节。要隐藏背景的一角，可以给该层加蒙版，原像素仍留在 PSD 里。'],
        ['给下游出两种图', '用 File → Save as PSD 保存分层特写。关掉标注层后用 File → Export As → PNG 导出干净的模型输入，需要说明时再导出一张带标注的沟通图。需要背面时，打开深潜档案，在 Vesper 的 3D 展台点击「背面」，取图后同样整理。'],
      ],
      editingSources: [
        ['打开文件、保存 PSD 和导出 PNG', 'https://www.photopea.com/learn/opening-saving'],
        ['选框裁切和尺寸', 'https://www.photopea.com/learn/image-size'],
        ['调整图层', 'https://www.photopea.com/learn/other-layers'],
        ['图层蒙版', 'https://www.photopea.com/learn/masks'],
      ],
      comparison: [
        ['怎么开始', '浏览器打开，基础编辑可免费使用。', '桌面版需安装和 Adobe 订阅。Adobe 也提供 Photoshop 网页版。'],
        ['裁切、分层和出图', '能处理这套参考图需要的裁切、调色、蒙版、文字和 PSD／PNG。', '也能完成这套操作。PSD 需要跨软件交接时，拿一份实际源稿复查字体、蒙版、智能对象与图层显示。'],
        ['批量出图', '可录制动作或写 JavaScript 脚本，按图层名和固定尺寸自动处理。页面示例用 JSON 记录裁切范围。', '桌面版也可录制 Actions，配合批处理和已安装的插件。已有 .ATN 动作可以用代表性文件验证迁移结果。'],
        ['复杂修图', '适合这次的参考图整理、局部强调和分层标注。', '桌面版提供 Camera Raw、插件和 Firefly 等工作流。已有相关模板或要做复杂合成时，可继续沿用。'],
      ],
      comparisonSources: [
        ['Photopea 免费与 Premium', 'https://www.photopea.com/api/accounts'],
        ['Photopea 动作面板和 ATN', 'https://www.photopea.com/learn/actions'],
        ['Photopea 脚本', 'https://www.photopea.com/learn/scripts'],
        ['Photoshop 计划', 'https://www.adobe.com/products/photoshop/plans.html'],
        ['Photoshop 网页版与桌面版功能表', 'https://helpx.adobe.com/sg/photoshop/web/get-set-up/learn-the-basics/compare-photoshop-web-and-desktop-features.html'],
        ['Photoshop 桌面动作', 'https://helpx.adobe.com/photoshop/desktop/automate-tasks/automation-settings-and-presets/use-the-actions-panel.html'],
      ],
      outputs: [
        ['正面全身 · 定比例', '用于角色总览和全身镜头。天线、肩甲配色、四肢比例和配件位置都能查回设定图。'],
        ['头盔与胸部 · 定辨识点', '用于近景构图。用独立特写查三枚青色探头、黄铜舷窗、橙色肩甲和胸口标识在试镜后是否还对得上。'],
        ['背面 · 定双气瓶', '用 GLB 的背面核对双气瓶、橙色阀轮和连接关系。角度由三维模型提供，裁图负责去掉界面和多余边缘。'],
      ],
      reuse: '同一张图存分层 PSD、干净 PNG 和裁切记录，把角色名、视角、版本与镜头编号关联。换成 Brine 时可沿用命名和出图尺寸，再按他的头盔和道具位置重选裁切区域。',
    },
    principle: [
      ['用源稿保留编辑结构', 'PSD 能保存图层、蒙版等文档结构。把基底图、修正和标注分开，返工时只改对应元素。'],
      ['把固定操作变成参数', '裁切是明确的源像素矩形。相同尺寸、坐标和命名的动作可脚本化。产品所提供的脚本接口可操作文档和图层。'],
      ['分清源稿和交付品', '设计交接保存 PSD，进入网页或生成工具时导出 PNG 等。Photopea 的嵌入接口也允许外部页面交付二进制文件和运行脚本。'],
    ],
    mechanism: '页面里的本地示例展示「给定矩形 → 读取源图 → 应用亮度和标注 → 导出像素」。Photopea 自身还提供分层文档和脚本能力，两种结果对象分别是 PNG 和可编辑源稿。',
    principleSources: [
      ['Photopea 源稿与导出', 'https://www.photopea.com/learn/opening-saving'],
      ['脚本与图层', 'https://www.photopea.com/learn/scripts'],
      ['嵌入应用的数据交互', 'https://www.photopea.com/api/live'],
    ],
    personal: [
      ['深潜档案的参考图规范', 'Vesper 已有原创正面和真实三维背面。已知视角的设定图用固定矩形裁切，缺失角度从 GLB 渲染。把产物按角色、视角和版本命名，以便与分镜和失败样本对上。'],
      ['给出海商品做可改的交付模板', '如果要给字幕交付包做封面、截图或双语示例，固定标题层、截图层和标记层。以后替换产品截图就能再导出，每单少重复做一遍排版。'],
    ],
    products: [
      ['角色参考图准备工具', '需要反复向视频、三维和设计流程交付参考图的制作者。', '导入一张设定图或几张渲染图，导出全身、头盔和道具特写及规格清单。', '从一个角色、三个预设开始。验收像素尺寸、裁切是否保留目标细节，以及用同参数是否能复现。'],
      ['小团队批量出图模板', '重复制作同构封面、产品图与宣传配图的人。', '用标准 PSD 图层替换文字与图片，输出一组按渠道命名的图片，并保留源稿。', '先跑三张同结构封面，量出第一次搭模板的时间和第 2、3 张的节省。'],
    ],
    demoSteps: '选「头盔与胸部」，先看干净的 280 × 270 裁切。再调亮度或加标注，切换对照。导出 PNG 给下游，或保存 JSON 记录裁切坐标、亮度和产物名称。',
    sample: {
      title: '可复现参考图规格 · Vesper',
      status: '尺寸可由本地演示复现',
      file: 'photopea-vesper-reference-spec.md',
      rows: [
        ['源素材', 'Vesper 正面设定图 540 × 700 px。'],
        ['裁切', '上身预设，以 x=130、y=100 为左上点，宽 280、高 270 px。'],
        ['处理', '亮度 120%，打开 VESPER 参考标注。'],
        ['产物', 'vesper-upper.png，280 × 270 px。另存原稿和裁切参数。'],
        ['验收', '头盔与胸口标识可读，裁切和标注不遮挡要参考的结构。'],
      ],
    },
  },
  desmos: {
    recap: {
      summary: 'Desmos 把已知公式画出来，让你拖参数、取样点、对比结果。用深潜档案的同一条扫描公式实测，Desmos 和自然分析都能画曲线并拖动取样。写论文时，还要给图补上变量含义、适用范围和可复算的来源。',
      headline: '从扫描公式到论文里的图',
      stages: [
        ['录入公式', '两站用同一条 t²(3−2t)。'],
        ['拖动时间', '用滑块带动曲线上的取样点。'],
        ['核对样点', '在 0.25 和 0.75 复核结果。'],
        ['写进论文', '交代变量、条件、图注和复算方法。'],
      ],
      points: [
        ['公式输入', '从可编辑的表达式开始试算。'],
        ['数学可视化', '同一条曲线上拖参数、看取样点。'],
        ['论文里的图', '标清单位、适用区间与数据来源。编号和复算另在写作工具中管理。'],
      ],
      comparison: [
        ['Desmos', '函数定义直接出图，可限制 0–1，并在左栏单独算 f(t)。'],
        ['自然分析', '另加 y=f(x) 出图，点坐标直接给出 f(t)。'],
        ['共同实测结果', 't=0.25 → 0.15625，t=0.75 → 0.84375。'],
      ],
      example: ['项目对应', '总时长 1.08 秒时，t=0.25 对应第 0.27 秒。走了 15.625% 的扫描路程，换算为模型高度约 9.44%。'],
      demoLink: '拖滑块试三种节奏',
      guideLink: ['calculators', '查看两站实测'],
    },
    calculatorGuide: {
      formula: 'f(x)=x^2*(3-2*x)',
      example: '用深潜档案现用的平滑扫描公式。图上的 x 是时间进度，范围为 0–1，f(x) 是走过的扫描路程比例。两站都把取样滑块 t 设为 0–1，依次核对 0.25 和 0.75。',
      images: [
        ['Desmos 官网', 't=0.25 时，左栏单独显示 f(t)=0.15625。', 'desmos-scan-live.jpg', 'Desmos 实测，定义域限制为 0–1，取样点为 (0.25, 0.15625)'],
        ['自然分析官网', '同一时刻，图上的点标出 (0.25, 0.15625)。', 'natanalysis-scan-live.jpg', '自然分析实测，独立绘图行 y=f(x) 和滑块 t，点标签为 (0.25, 0.15625)'],
      ],
      samples: [
        ['t = 0.25 · 0.27 秒', '0.15625（15.625%）', '0.15625（15.625%）'],
        ['t = 0.75 · 0.81 秒', '0.84375（84.375%）', '0.84375（84.375%）'],
      ],
      comparisons: [
        ['录入后怎么出图', '输入 f(x) 的定义后就显示曲线。', '先定义 f(x)，再加一行 y=f(x) 才显示曲线。'],
        ['滑块和读数', '单独输入 t=0.25 生成滑块。加 (t,f(t)) 看点，再单独输入 f(t) 可在左栏直接读数。', '输入 (t,f(t)) 后自动出现自由参数 t 的滑块。点的坐标标签显示结果。用键盘移到 0.75 时，图点已更新，旁边的输入框有一次仍显示旧值。'],
        ['只画有效区间', '实测用花括号限制 0≤x≤1，曲线只画这段。', '把同样的花括号限制粘到 y=f(x) 后报「无法识别的字符」；本次用平移缩放查看有效区间。'],
        ['进一步分析', '官方手册列有表格、回归、置信区间和部分显著性检验。', '官方页面将隐式方程、表格和回归列为暂未支持；可继续用表达式、滑块和坐标点做轻量展示。'],
      ],
      takeaway: '快速画一条曲线并给同事看参数怎么动，两站都够用。要在 0–1 的有效区间叠加多条扫描曲线、盯着同一个时刻读数，Desmos 的区间限制和独立求值更方便。',
      sources: [
        ['Desmos 图形计算器手册', 'https://help.desmos.com/hc/en-us/articles/202529279-Desmos-Graphing-Calculator-User-Guide'],
        ['自然分析函数绘图及支持范围', 'https://natanalysis.com/grapher/'],
      ],
    },
    mathPaperGuide: {
      tasks: [
        ['把公式录进去', '已知公式可以直接输入 Desmos 试算。论文 PDF 里只有图片的公式，可以用 SimpleTex 先转成可编辑的 LaTeX，再对着原图检查括号、上下标和积分范围。正式稿的公式编号和引用由 WPS、LaTeX 或 Quarto 管理。'],
        ['看参数改变了什么', '在同一坐标下拖动参数、读样点、对比多条曲线。几何或物理场景也能用这样的方式展示，比如用点表示落球的位置，时间决定点的高度。Desmos Notebook 可以在同一页放说明、公式、滑块和图，适合做方法演示。'],
        ['说明为什么可信', '公式和图能帮你检查起点、终点和趋势。论文还要写出变量、单位、适用条件，并交代结论来自推导、模拟还是实测。拟合好看也要说明数据如何采集和处理。'],
        ['把结果留到可以重算', '保留公式、参数、采样点和原始数据或绘图脚本。交稿时核对期刊要求的图幅、字号与文件格式。需要正文数字和图一起更新时，可以用 Quarto 等工具执行同一份分析并生成稿件内容。'],
      ],
      example: '把扫描写成论文时，横轴注明 t = 已用秒数 ÷ 总时长，纵轴是扫描路程比例。总时长 T=1.08 秒，第 0.27 秒对应 t=0.25，f(t)=0.15625。如果改用 T=0.90 秒，仍取第 0.27 秒，则 t=0.30，f(t)=0.216。正文数字、图上取样点和图注都要跟着更新。图中曲线是公式算出的，旁边展台帧是项目运行时截图。',
      sources: [
        ['SimpleTex 公式识别', 'https://doc.simpletex.cn/zh/api/api_formula_recognition.html'],
        ['WPS 公式助手', 'https://forum.wps.cn/topic/59321'],
        ['Desmos Notebook 官方指南', 'https://help.desmos.com/hc/en-us/articles/45626526486413-Getting-Started-Desmos-Notebook'],
        ['Quarto 论文与可执行计算', 'https://quarto.org/docs/manuscripts/authoring/jupyterlab.html'],
      ],
    },
    proofreadingGuide: {
      summary: '公式可以录入、试算和画图。论文改版还有一个独立的工作，要核对正文、结果表和图注是否用了同一版数据。两个本地原型把差异定位到 Word 原文和 Excel 源单元格。',
      cases: [
        {
          title: '角色扫描',
          method: '按样例书签定位',
          result: '把 Excel 总时长从 1.08 秒改到 0.90 秒。第 0.27 秒的扫描路程从 15.625% 变为 21.6%，正文、表格和图注共三处旧值被标出。',
          scope: '读取 Word 中预设的三个书签，用 Excel B5、B6 和样例公式复算。点结果可跳回原文，或打开 B10 查看公式。',
          path: 'scan-review/index.html',
          files: [
            ['扫描报告 Word', 'scan-review/outputs/scan-proofing/角色扫描验证报告.docx'],
            ['扫描参数 Excel', 'scan-review/outputs/scan-proofing/角色扫描参数表.xlsx'],
          ],
        },
        {
          title: 'Palmer Penguins 论文',
          method: '按统计口径匹配',
          result: '排除一条观测后，「全部观测」从 344 变为 343，「体重与鳍长均有效」从 342 变为 341。结果是三处差异、一处待确认。',
          scope: 'Word 是按真实论文与公开数据制作的无书签中文摘编。程序从原句、行列标题或图注提取样本量和范围，匹配唯一同口径候选。泛写「样本量为 344 只」的一句留给人工确认。',
          path: 'paper-review/index.html',
          files: [
            ['无书签 Word', 'paper-review/outputs/penguins/企鹅论文核对样例.docx'],
            ['公开数据 Excel', 'paper-review/outputs/penguins/企鹅公开数据.xlsx'],
          ],
        },
      ],
      takeaway: '先确认是在比同一个指标和同一批数据，再比较数字。校对结果要能点回原句、原单元格和公式。论文原型的自动匹配覆盖已支持的样本量写法，Excel 读数以重算并保存的版本为准。',
      neighbors: [
        ['论文结果表', '源数据换版以后，对照正文、表格和图注中的指标与数值。'],
        ['工程和实验报告', '核对仪器导出表、计算结果和交付稿中的单位与数值。'],
        ['供应商报价', '按同一规格、单位和起订量读多份报价，保留每个数字的出处。'],
      ],
      sources: [
        ['Palmer Penguins 论文', 'https://journal.r-project.org/articles/RJ-2022-020/'],
        ['Palmer Penguins 公开数据', 'https://allisonhorst.github.io/palmerpenguins/'],
      ],
    },
    scanGuide: {
      duration: 1.08,
      startHeight: -0.09,
      heightTravel: 1.18,
      smooth: t => t * t * (3 - 2 * t),
      images: [
        ['深潜档案 · 实际扫描', 'Vesper 切到 Brine 时的真实网格扫描帧。', 'desmos-character-scan.png', '三维角色切换中，绿色扫描带分隔 Vesper 和 Brine'],
        ['同一时刻 · 曲线试算', '紫色是线性，绿色是平方缓入，棕色是项目现用曲线。', 'desmos-scan-curves.png', '时间进度 0.25 时，紫色线性、绿色平方缓入和棕色项目平滑插值的路程对比'],
      ],
      scenario: '点 Brine 角色卡时，一条绿色网格扫描带从下往上移动，Brine 在扫描带下方逐步接替 Vesper。假设你觉得起步等待偏久，先把总长固定在项目当前的 1.08 秒，比较不同曲线在前 0.27 秒会走多远。这一步适合用 Desmos。',
      expressions: [
        'y=x{0<=x<=1}',
        'y=x^2{0<=x<=1}',
        'y=x^2(3-2x){0<=x<=1}',
        't=0.25',
        '(t,t)',
        '(t,t^2)',
        '(t,t^2(3-2t))',
      ],
      sliderHelp: '在 Desmos 图形计算器逐行键入，花括号和不等号可以用公式栏键盘录入。将 t 滑块的范围设为 0 到 1，步长设为 0.01。拖到 0.25 或 0.75，三条曲线上的点会同步移动。也可以点滑块播放，观察整段节奏。',
      axes: '0.25 是用掉 25% 的时间，乘 1.08 秒得到 0.27 秒。此时平滑曲线的输出是 0.15625，表示走了 15.625% 的扫描路程。项目把路程再换成扫描线高度，模型脚底为 0，顶部为 1。因为扫描会从模型下方开始并走到顶部以上，15.625% 的路程对应约 9.44% 的模型高度。',
      decisions: [
        ['想让整个切换更快', '保留现有曲线，改 src/app.js 里 MeshScan 的 duration。比如先用同一个动作对比 1.08 秒和 0.90 秒。'],
        ['想让起步更早露出角色', '先保持 1.08 秒，在 Desmos 比较现有平滑曲线和线性。选中方案后，改 src/mesh-scan.js 的 MeshScan.update() 中计算 eased 的一行，保留脚底到顶部的映射。'],
        ['选定后怎样验收', '在深潜档案点 Vesper → Brine，再快速切回。看开头多久出现角色、结尾是否干净，以及中途切换后能否正确停在目标角色。'],
      ],
      sources: [
        ['Desmos 滑块设置与播放', 'https://help.desmos.com/hc/en-us/articles/202529069-Sliders-and-Movable-Points-in-a-Graph'],
        ['Desmos 图形计算器输入说明', 'https://help.desmos.com/hc/en-us/articles/202529279-Desmos-Graphing-Calculator-User-Guide'],
      ],
    },
    principle: [
      ['把公式和自由变量分开', '公式描述输入到输出的关系，滑块给自由变量一个当前值，例如抛物线中改变 a 就能翻转开口。'],
      ['共享一个时间值', '同一个 t 可驱动多条公式。固定在 t=0.25 比较位置，就能区分平方缓入、线性和平滑插值。还可以播放参数观察过程。'],
      ['把归一化结果接回项目', '用 t=经过时间÷总时长，限制到 0–1，再将公式输出映射到像素或三维坐标。初始值、结束值和中途打断都要在真实实现中回归。'],
    ],
    mechanism: '角色展台把经过时间除以 1.08 秒得到 t，再用 t²(3−2t) 求扫描路程，最后按高度 = −0.09 + 1.18 × 路程 映射到模型坐标。本站 Canvas 计算同一组公式，深潜档案用 Three.js 渲染真实切换。',
    principleSources: [
      ['Desmos 滑块及变量共享', 'https://help.desmos.com/hc/en-us/articles/202529069-Sliders-and-Movable-Points-in-a-Graph'],
    ],
    personal: [
      ['网格扫描节奏可以解释和复测', '角色展台实际使用 t²(3−2t) 平滑扫描。用相同的 t 比较线性和平方缓入，可以解释为何起步和结束的观感不同，再调项目里的真实持续时间。'],
      ['把小游戏节奏变成可调参数', '你已有 45 秒货运分拣的方案。用一条曲线预览速度或出货频率，避免开头太快，变化可视化后再用实玩数据检查难度。'],
    ],
    products: [
      ['网页动效预设工作台', '需要在网页、游戏和演示之间复用节奏的前端制作人。', '选择曲线和时间，预览位移并导出公式、持续时间与样点供交接。', '先支持三条既定曲线，检查起终点和 25%、50%、75% 样点。再接现有角色扫描效果核对。'],
      ['小游戏难度调节台', '反复调整一局时间内节奏的独立游戏制作人。', '滑块控制开始速度、结束速度和增长方式。图上显示每一阶段的预期出货节奏。', '用 45 秒回合做三套参数。实际试玩记录首次错分阶段和重开率，再用数据选曲线。'],
    ],
    demoSteps: '默认停在 t = 0.25（第 0.27 秒）。往右拖到 0.75，看三条曲线在前段和后段的位置怎样变化。轨道显示扫描路程，下面另给出项目实际使用的模型高度。',
    sample: {
      title: '动效预设 · 平滑扫描',
      status: '严格可计算 · 现有角色展台使用的插值公式',
      file: 'desmos-scan-presets.md',
      rows: [
        ['输入域', 't=clamp(已过时间÷总时长, 0, 1)。'],
        ['项目当前参数', '总时长 1.08 秒。扫描线高度 = −0.09 + 1.18 × 已走路程，模型脚底为 0，顶部为 1。'],
        ['三条曲线', '线性 t，平方缓入 t²，平滑插值 3t²−2t³。'],
        ['25% 进度', '线性 25.0%，平方缓入 6.25%，平滑插值 15.625%。'],
        ['75% 进度', '线性 75.0%，平方缓入 56.25%，平滑插值 84.375%。'],
        ['验收', '三个公式在 t=0 都输出 0，在 t=1 都输出 1。检查项目中的中断、反向和复位。'],
      ],
    },
  },
  jimeng: {
    principle: [
      ['建立生成条件', '提示词描述主体、动作、摄影机和光线。图生视频另外给起始或主参考图，部分模式还可以使用尾帧或其他参考素材。'],
      ['模型生成一段连续画面', '参考图提供外观和构图约束，模型根据条件生成视频。控制方式和可用时长按具体模型核对，气瓶与阀轮等细部要用输出帧检查。'],
      ['拆镜、验收、组接', '把复杂动作拆成能独立评估的镜头，每段留输入、模型参数、通过和失败结果，之后再组合成短片。'],
    ],
    mechanism: '可以把图片理解为生成的参考条件。对三维直接渲染，背面的物件由同一个 GLB 提供；对生成视频，背面特征需要从首尾帧条件和实际输出判断。两条路线用同一验收表比较。',
    principleSources: [
      ['即梦视频生成能力和参数说明', 'https://jimeng.jianying.com/tools/ai-video-generator'],
      ['短剧画布和参考方式', 'https://jimeng.jianying.com/tutorials/drama-studio/canvas'],
    ],
    personal: [
      ['你的原创角色能作为测试基准', 'Vesper 的气瓶、阀轮和 Brine 的绞盘都是明确的背面验收点。用这类可识别差异检查模型是否稳定，比只看好不好看更有决策价值。'],
      ['缩短宣传片初样的反馈路径', '出海网站或数字商品要做展示时，可用小幅推镜验证构图和氛围。通过的镜头才纳入成片，产品界面和可精确复现的动作可以直接录制或渲染。'],
    ],
    products: [
      ['生成视频试镜验收台', '维护多个角色、需要比较生成服务的小团队。', '用同一张镜头卡记录参考图、模型、耗时和素材消耗，并逐项标出通过帧和变形帧。', '先实测 Vesper 一个短镜头，与三维直渲对照，再替换 Brine。统计每条路线得到第一个可交付镜头的尝试与用时。'],
      ['可复用的短片镜头包', '要快速做角色 PV 或产品短展示的制作者。', '给每个镜头打包输入规格、动作和构图、替代渲染方式、验收要求以及可用样片。', '先做一个推镜、一段静态特写和一个转身。交给另一个角色测试哪些步骤可直接继承。'],
    ],
    demoSteps: '选择转身对照，再打开背面对照，可以看到已有三维模型的气瓶和阀轮。换成 9:16 并播放构图预演，检查这两个部件是否仍在画框内，再导出镜头卡。',
    sample: {
      title: '试镜验收表 · 直渲与图生视频',
      status: '执行样板 · 等待同素材平台实测',
      file: 'jimeng-vesper-shot-benchmark.md',
      rows: [
        ['目标', '同一角色，固定摄影机，四分之三侧面缓慢转到背面。'],
        ['同一验收基准', '气瓶始终为两只，阀轮固定在对应连接处，主体比例和轮廓连续。'],
        ['路线 A', '用既有 GLB 和摄影机直接渲染。记录首个通过版本的耗时及样片。'],
        ['路线 B', '按所选模型支持的参考方式上传视角图并生成。记录设置、重试、积分和样片。'],
        ['落地判断', '各自填写通过项、失败时间点与人工修正时间。两条路线换 Brine 重跑后再作取舍。'],
      ],
    },
  },
};
