# @moazzamak/dsh-code-review

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）的代码审阅包。它提供一个 `/review` 命令，用于打开最近一个回合的改动文件并逐个比对；还提供一个技能，告诉 agent（智能体）这份记录覆盖了什么，以及如何让一个回合保持易于审阅。

> **非官方社区包。** 与 DeepSeek 无隶属关系，未获其背书，也非由其发布。详见[名称与隶属](#名称与隶属)。

[English](README.md) | 中文

## 本包驱动哪个 dsh

DeepSeek Harness 在 0.2 系列中更换了它的审阅界面，本包随之跟进。

| 本包 | dsh | `/review` 打开的内容 |
| --- | --- | --- |
| 0.2.x | 0.2 及更高版本 | 所选回合的**改动文件**，每个文件都带并排（side-by-side）或统一（unified）的比对。没有保留／拒绝这一步。 |
| 0.1.x | 0.1.5 | 固定的 **Changes** 页面，逐改动块的保留／拒绝，拒绝会把该改动块还原到工作区。 |

dsh 0.2 彻底移除了保留／拒绝界面：再没有任何东西会在 agent 背后还原改动，拒绝也不会回报给模型，diff 记录是只读的。0.2 的技能把这一点讲清楚了，因为一个被要求期待拒绝通知的 agent，会去等一个永远不会到来的通知。仅在 dsh 0.1.5 构建上才使用 0.1.x。

## 安装

```sh
dsh plugin --profile web add github:moazzamak/dsh-code-review
```

安装后请重启 `dsh`（或重新加载页面）。移除方式：

```sh
dsh plugin --profile web remove @moazzamak/dsh-code-review
```

安装完成后会出现三处变化：设置中的 **插件** 条目、输入框中的 `/review`，以及 agent 技能列表中的 `dsh-change-review`。

### 桌面应用

Electron 桌面构建运行的是同一套 dsh 表层，因此比对视图无需任何插件即可使用。把*本包*加入打包后的桌面应用则是另一步：应用内的 **桌面插件** 窗口用其内置 pnpm 把插件安装到它自己的 profile，且只接受 npm 仓库规格。请把该 bundle 加入该 profile 的 `dsh.profile.bundles` 列表，或从本地检出目录安装。

## 你会得到什么

- **`/review`** —— 在右侧边栏中打开最近一次记录下来的回合的改动文件。每一行是一个文件；打开它会把该文件在回合开始与回合结束时的内容按 hunk 展示，并排或统一，并支持自动换行。`/review` 只有在下面三个条件同时成立时才会出现：比对视图已注册、会话的右栏已挂载，并且该会话拥有一个改动已被记录的回合。一个无处打开页面的命令比一个不存在的命令更糟，因此本包宁可把它隐藏起来，也不提供一个空操作。
- **`dsh-change-review` 技能** —— 那些 agent 无法从工具结果中学到的东西：你审阅的单位是回合，而不是工具调用；只有顶层回合会被记录，因此子 agent（subagent）的编辑永远不会出现在你的 diff 里；Host 重启后重新打开的会话，其更早的回合没有可比对的记录；以及任何东西都不会被还原，因此对某处改动留下评论，意味着这处改动仍然在文件中。
- **优先于内置 diff 卡片** —— 只要本包处于安装状态，dsh 自己那张画在每个回合下方的改动文件卡片就不再出现，于是 `/review` 成为进入某个回合改动的入口，而不是两个入口之一。关于本包唯一不去接管的情形，见[优先级](#优先级)。

记录、比对以及回合末尾卡片都属于 dsh 本身。本包只增加快捷方式、这些说明，以及这份优先级，别无所加。

## 优先级

`/review` 打开的就是 dsh 自己的逐文件比对——它就是内置的 diff 视图，只是改由快捷方式抵达。因此“本包优先”不可能指换一个视图，而是指 dsh 不再提供它的**第二个**入口。那个第二入口，就是 dsh 画在每个已完成回合下方的改动文件卡片，它的标题会打开同一个比对。

只要本包处于安装状态，这张卡片就会被抑制：对话记录回到正文加工具行的样子，而 diff 界面待在右侧边栏里，也就是 `/review` 把它放去的地方。

有两条边界是刻意保留的。

- **用 `present` 工具声明过文件的回合，仍然保留内置卡片。** 卡片与已声明文件行由同一个组件绘制，而本包没有能替代那些行的东西；在那里抑制卡片会把那些行一并删掉。只有当该组件除了卡片再无别的东西可画时，本包才会接管这个回合。
- **优先级属于本包，而不是一项偏好。** 没有需要打开的开关，也没有本包会读取或修改的设置；移除本包，卡片就会回来。

本包不读取也不修改 **Show coding view**（`developerTools`）——即[回合末尾卡片](#回合末尾卡片)一节所说的那个设置——把它关掉，无论本包是否安装，卡片都会照常消失。

## 审阅改动

1. 运行 `/review`。
2. 侧边栏列出最近一个回合的改动文件，每个文件都带新增与删除行数。
3. 选择一个文件。它的比对会打开该回合的第一个改动文件；**split**/**unified** 与 **line wrap** 是视图上的控件。
4. 在回合结束时内容没有变化的文件根本不会被列出；而超出记录器上限的文件会被列出，但不带比对。

### 回合末尾卡片

默认情况下，dsh 还会在对话中每个回合下方画一张改动文件卡片，每张卡片都带一个 **Review this turn's changes in the sidebar** 操作。两者都由同一个设置控制：**Show coding view**（`developerTools`），它还控制 Trajectory 视图与完整的 Agent preset 选择器。

安装本包会在不触碰该设置的前提下抑制这张卡片——见[优先级](#优先级)。把该设置关掉依然照常生效，且无论本包是否安装，卡片都会消失。

## 依赖条件

本包驱动的是 dsh 自身的审阅界面，因此需要包含该界面的 dsh 构建：

| 它使用的内容 | 所属包 |
| --- | --- |
| 比对视图与 `changes-review` 标签页类型 | `@deepseek-ai/dsh-client-ui-deliverables` |
| 内置 diff 卡片所贡献到的回合末尾链路 | `@deepseek-ai/dsh-client-ui-chat` |
| 抑制功能所经由的 slot 渲染器 | `@deepseek-ai/dsh-client-ui-renderer` |
| `openResource`，以及已挂载会话的快照 | `@deepseek-ai/dsh-client-ui-sidebar-right` |
| 会话已加载的事件窗口（`sessions.binding`） | `@deepseek-ai/dsh-api-session-controller` |
| 为每个已记录回合命名的 `workspace/changes` 事件 | `@deepseek-ai/dsh-workspace-changes` |
| 技能注册表 | `@deepseek-ai/dsh-skill` |

标签页类型、链路键、事件以及它打开的地址格式是上述各包私有的，因此本包在单个模块（`src/protocol.ts`）中重述它们，并用测试钉住每一条重述的事实。若某个 dsh 构建重命名了该标签页类型、该链路、该事件或该地址，测试会失败，而不是悄悄让 `/review` 坏掉——或者悄悄丢掉这份优先级，让卡片无声无息地回来。

所有 dsh 包都声明为可选 peer 依赖，因此安装本包不会拉入第二份 dsh。

## 名称与隶属

非官方、社区构建：与 DeepSeek 无隶属关系，未获其背书，也非由其发布。本包所驱动的审阅界面是 DeepSeek Harness 自身的代码，与本包一样以 MIT 许可发布，位于 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)——dsh 本身的问题请提交到那里。

npm 上存在相似名称。以下是由其他作者维护、互不相关的包：`dsh-code-review`（只读审阅 agent 预设）、`@michengai/dsh-code-review`、`@dsh-plugin/dsh-code-review`（改动摘要、审阅标签页与带保护的撤销）、`@yangzhe1991/dsh-code-review`（双列 git diff 页面）。本包是 **`@moazzamak/dsh-code-review`**，仅从[本仓库](https://github.com/moazzamak/dsh-code-review)发布。

## 相关链接

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) —— 本包所接入的 harness
- [CHANGELOG.md](CHANGELOG.md) —— 每个版本的变化
- [DEVELOPMENT.md](DEVELOPMENT.md) —— 本仓库如何构建与发布

## 许可

[MIT](LICENSE) © Moazzam Abdullah Khan。DeepSeek Harness 同样以 MIT 许可发布。
