# 七个工具入口研究手册

[在线手册](https://yydshly.github.io/1123_codex_project/004-ai-tool-entry-lab/) · [研究摘要与引导图](../README.md)

也可直接用现代浏览器打开 `index.html`。站内演示可离线运行。访问外部官网和出处需要联网。深潜档案案例随手册提供参考图、实拍截图和网页参数试验。

## 研究专题

按 [原帖](https://x.com/AdrianPunk115/status/2123974547565367518) 的回复顺序排列。每项专题从能力与用法开始，接着说明工作原理、对现有项目的意义、两个可扩展产品、效果演示、边界和实测办法。产品分析给出目标人群、输入与交付、最小版本和验收方式。章内导航支持直接分享，例如 `index.html#deepl/effects`。

| 顺序 | 工具 | 演示 | 可下载成果样板 |
| --- | --- | --- | --- |
| 1 | Google NotebookLM | 按所选资料回答预设问题，展开引用证据 | Vesper 转身试镜研究卡 |
| 2 | Perplexity | 拆解 SRT 搜索问题，逐句核查官方出处和本地实测 | SRT 质检查源与复测记录 |
| 3 | Khan Academy | 完成本地练习，通过点击率换数复测检验对分母的理解 | 两渠道点击率练习卡 |
| 4 | DeepL | 对比网页实测译文与项目校对版，导出示例 CSV 与 SRT | SaaS 演示字幕审校样板 |
| 5 | Photopea | 调整裁切、亮度和标注，真实导出 PNG 与 JSON 参数 | 可复现参考图规格 |
| 6 | Desmos | 调节三条曲线，实时看同一时刻的扫描位置 | 平滑扫描预设 |
| 7 | 即梦 AI | 比较构图、调整镜头参数，下载分镜 Markdown 与参考图 | 直渲与图生视频验收表 |

「成果汇总」（`index.html#summary`）汇集七项研究的使用结论、图解、实测案例和原型入口。页内总图与 `assets/tool-research-summary.png` 对照七个工具的价值和产出，并展示参考图、扫描曲线和论文校对的实际画面。「对照与复用」保留工具对照、产品方向、角色制作流程和实测记录方法。

## 证据和演示

专题中的产品描述来自列出的一手资料，核验日期为 2026 年 11 月 22 日。NotebookLM 和 Perplexity 演示采用预先整理的输入和结果。练习、Canvas 图像处理和曲线计算在页面内实际执行。即梦专题的前后视图来自既有角色资产，分镜预览展示画框和推近的构图示意。各工具对本项目耗时、成功率和平台消耗的影响，要用同素材实测验证。

Perplexity 专题的 SRT 案例已对照 YouTube 和 Subtitle Edit 的官方文档，并复跑独立网站子项目的 SRT 样例。网页端停在安全验证，平台现场结果与耗时待测。案例中的问题拆分用于演示查源方法。

Perplexity、Khan Academy、DeepL、Photopea 和 Desmos 的「理解图解」分别整理了查源核验、课程组织与练习、英文论文阅读与译稿整理、Vesper 参考图制作、从角色扫描公式到论文用图。图解文字来自 `deep-dive-data.js`。页面可打开并保存对应的高清 PNG。

Khan Academy 的「课程与讲者」（`index.html#khan/courses`）记录了实际百分数课节的布局与作答反馈、八类学科的官方入口，以及正式课程、内置提示和 Khanmigo 的区别。

DeepL 的「用法与对照」（`index.html#deepl/translation`）记录了英译简中的网页实测译文、按官方资料核对的术语和文件功能，以及通用 AI 的字幕改写方式。字幕拆分、CSV 和 SRT 下载在本地执行。视频文档和三维资产是预设示例。

DeepL 的「论文阅读」（`index.html#deepl/paper`）对照浏览器整页翻译、双语插件和 DeepL 网页版，说明译稿和术语表各有什么用。自拟的论文式段落展示 DeepL 实测初译和校对后的译稿示例，并列出引用前应核对的内容。

Photopea 的「角色参考图」（`index.html#photopea/reference`）说明截图和分层编辑各适用的场景。Vesper 的同一张 GLB 背面渲染有干净版和文字箭头标注版，均可单独打开并保存为 PNG。专题还讲解分层 PSD 的结构、正面头胸裁切和与 Photoshop 桌面版的区别。Photopea 的操作路径依据官方手册。站内 Canvas 演示可导出实际裁切 PNG 和参数 JSON。

Desmos 的「两站实测」（`index.html#desmos/calculators`）用同一条扫描公式对照 Desmos 和自然分析，保留官网截图、滑块取样值及定义域限制的实测结果。「论文中的数学」（`index.html#desmos/paper-math`）说明公式录入、参数试验、图注和复算各该怎么做。

Desmos 的「公式与表格校对」（`index.html#desmos/proofreading`）汇总两套原型的实测结果、定位方法、适用范围和 Word、Excel 源文件。角色扫描原型（`scan-review/index.html`）直接解析 Word 样例书签和 Excel 参数表。应用改动后可定位正文、表格和图注中的数字，以及 Excel 的原单元格和公式。样例内置，可离线运行。重新生成样例时，用工作区依赖中的 Python 执行 `build-report.py <临时目录>`，再用工作区 Node 执行 `build-workbook.mjs <工作区 node_modules> <同一临时目录>`。

「无书签论文」原型（`paper-review/index.html`）用 Palmer Penguins 论文的中文摘编和公开数据展示样本量匹配。它从段落、表头、行名和图注中提取统计范围，只有唯一同口径候选时才比较数值，也支持人工指定 Excel 地址。样例 Excel 保存可复算公式，原型读取其已保存的结果。重建样例时，从 palmerpenguins 的 `inst/extdata/penguins.csv` 获取 CSV 放入临时目录，依次执行 `build-paper.py <临时目录>` 和 `build-data.mjs <工作区 node_modules> <临时目录>`。

「角色扫描」（`index.html#desmos/scan`）记录「深潜档案」实际的 1.08 秒切换与平滑插值，给出可逐行输入 Desmos 的式子。离线演示同步计算三条曲线的路程和实际模型坐标。章节中的扫描帧来自深潜档案的验收截图，旁边曲线在 25% 时间处取样。

Desmos 的「项目试验」（`index.html#desmos/scenes`）能拖动 Vesper 到 Brine 的设定图扫描预览，给 Cargo Switch 的同一串分拣结果试两套连击奖励，或在 Petalwake 尾迹研究启发下用恒定横风模型查看偏移。扫描和计分采用现用项目公式。尾迹采用源代码里的 6.5 秒寿命，飞行速度和稳定横风是演示假设。

Vesper 正面来自同工作区「深潜档案」的原创设定图，背面来自该项目的三维浏览器验收图。为保证直接打开本地文件时可以使用 Canvas 并导出图片，资源以数据 URL 存放在 `assets/vesper-image.js`。

## 维护

- `research-data.js` 保存七项专题的文字、入口、官方来源和成果摘要。
- `deep-dive-data.js` 保存工作原理、个人价值、产品方向和成果样板。
- `demos.js` 实现可操作案例和文件下载。
- `math-scenes.js` 实现 Desmos 专题里的三个本地项目试验。
- `app.js` 管理页面导航、专题及对照表。
- `styles.css` 管理桌面和移动布局。
