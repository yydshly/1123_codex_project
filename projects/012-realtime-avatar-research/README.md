# 开源实时数字人研究

- **编号** `012`
- **研究基线** 2026 年 11 月 22 日至 23 日查阅的公开原帖、项目说明、配置、模型资料和作者演示
- **Web 演示** 未部署

## 摘要

原帖列出的三个入口对应不同层级。LiveTalking 把口型模型做成可自部署的引擎。赛博小雅和 Gary AI 把 Vidu S2 接到直播业务上，前者让我们自选回复和音色，后者把生成交给 Vidu，重点做弹幕、暖场和推流工作台。选择时先确定谁负责画面、声音和回复，再看我们已有的是人物视频、人物图，还是一套现成的直播流程。 [X 原帖](https://x.com/momoai_daily/status/2124450911141625956)

[![实时数字人引导图，对照三个开源入口的本质、能力和价值，并概括本地单图模型可达到的效果](images/realtime-avatar-projects.png)](images/realtime-avatar-projects.png)

## 三个入口的能力与价值

| 项目 | 本质与依赖 | 要准备什么 | 能力与价值 |
| --- | --- | --- | --- |
| **LiveTalking** | 自部署流式引擎，在自己的显卡上运行 Wav2Lip、MuseTalk 等模型。已有音频可直接驱动口型，文字播报和自动对话可按需接语音合成与大模型。 | 可以先用示例形象。自定义角色通常用一段人物底片，想克隆音色再按所选语音方案准备参考录音。 | 底片提供外观、背景和大部分身体动作，模型实时对口型，支持打断和并发。可复用已有口播素材，接入自有客服、讲解或循环直播。配套 LiveStream 可编排话术与弹幕回复。 [项目 README](https://github.com/lipku/LiveTalking) · [形象生成](https://github.com/lipku/LiveTalking/blob/main/docs/avatar_api.md) · [LiveStream](https://github.com/lipku/livestream) |
| **赛博小雅** | 互动直播舞台。外接大模型生成回复，Windows 主分支用本地 OmniVoice 合成语音，Vidu S2 负责生成口型、表情和动作。真实弹幕由配套采集器或其他接入提供。 | 正脸照或人物视频、人设和音色。可按需加服装或商品参考图、动作配置、歌曲音轨与歌词。使用 Vidu 和所选对话服务的接口。 | 可根据弹幕触发动作，也支持参考图换装或拿商品、点播和录播。点歌播放预先准备的音轨。价值在于保留对人设、音色和互动编排的控制，适合重表演的直播。 [项目 README](https://github.com/cyber-xiaoya/cyber-xiaoya-live) · [动作演示](https://github.com/cyber-xiaoya/cyber-xiaoya-live/releases/tag/v1.0.0) |
| **Gary AI 直播间** | 直播间工作台。Vidu S2 统一生成画面、声音和回复，仓库负责弹幕过滤、排队、暖场、衣柜和 OBS 叠层。真实的抖音弹幕要另外接入。 | 人物底图、人设、开场白和所选音色。每套换装用一张已穿好该套衣服的完整人物图。实际生成画面需要 Vidu API Key。 | 能做坐姿接话、挥手比心、暖场，以及用预制整图切换服装。免费空跑可检验过滤、排队和叠层流程。价值在于减少对话和语音服务的配置，把直播运营放到同一工作台。 [项目 README](https://github.com/garycaogan/gary-ai-live-avatar) |

两套 Vidu 应用的实时画面都按服务时长计费。角色素材决定它长什么样，嘴唇、表情和身体在直播里怎么动，以及动起来能否保持外观一致，主要取决于 Vidu 的渲染。赛博小雅能自选发声服务，Gary AI 则复用 Vidu 的对话和语音能力。 [赛博小雅架构](https://github.com/cyber-xiaoya/cyber-xiaoya-live#1-它到底是怎么跑起来的) · [Gary AI 能力与依赖](https://github.com/garycaogan/gary-ai-live-avatar#现在能做什么)

## 不依赖 Vidu 的单图方案

- **SoulX-FlashHead Lite** 用一张人物图和音频流生成口型、自然表情和轻微头动，适合单机口播和问答。有社区作者在 Windows 11 的 RTX 5070 Laptop 8 GB 上以 512 × 512、25 FPS 运行浏览器演示。 [模型与演示](https://soul-ailab.github.io/soulx-flashhead/) · [Windows 案例](https://github.com/Metrix187/talking-avatar)
- **Ditto** 同样支持单图和流式音频，可以单独调整视线、头部姿态和情绪。适合需要明确控制面部表现的对话角色。 [源码](https://github.com/antgroup/ditto-talkinghead) · [控制演示](https://digital-avatar.github.io/ai/Ditto/)
- **SoulX-LiveAct** 还可以用文字指定表情和肢体动作，官方样例能按时间段安排鞠躬、苦笑或挥手，适合考察指令驱动的直播表演。官方报告双 H100/H200 约 20 FPS，所公布的一次单 RTX 5090 测试约 6 FPS。 [模型与基准](https://github.com/Soul-AILab/SoulX-LiveAct) · [动作样例](https://github.com/Soul-AILab/SoulX-LiveAct/blob/main/examples/example_edit.json)

对我们来说，已有可复用的人物视频时，LiveTalking 能直接利用底片。希望从一张图开始做本地实时口播时，FlashHead Lite 和 Ditto 分别对应自然口播与可控表情。要让观众点名触发肢体动作，现有 Vidu 应用和 LiveAct 可以用来比较效果与算力成本。以上为资料对照，帧率来自公开案例，端到端延迟、画质和长时间稳定性尚待实测。
