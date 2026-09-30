# @moazzamak/dsh-code-review

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）的**代码审阅包**。它提供 `/review` 快捷方式以显示 dsh 固定的 **“变更”** 页面，并注册 `dsh-change-review` **技能**，让 agent（智能体）理解你的 **保留** / **撤销** 决定意味着什么。

> **非官方社区包。** 与 DeepSeek 无隶属关系，未获其背书，也非由其发布。详见[名称与隶属](#名称与隶属)。

[English](README.md) | 中文

## 它提供什么

- **`/review`** —— 客户端命令，在右侧边栏挂载时提供，用于显示固定的 **“变更”** 页面：仍存在无人决定过的改动的文件列表。它与会话标题栏的改动计数打开的是同一个页面。
- **`dsh-change-review` 技能** —— 作为运行时技能注册在 Host 上，因此在包安装期间会出现在模型的技能目录中。它说明工具结果无法承载的两条规则：被拒绝的改动块已经从文件中撤销；拒绝会作为提示被投影回模型上下文，其中给出路径与被移除的文本。它还要求每次工具调用只做一个逻辑改动，这正是让差异可以逐块决定的关键。

这就是本包的全部内容。差异、逐块的 **保留** / **撤销** 控件、待处理文件列表、撤销端点以及面向模型的拒绝提示都是 **dsh 自身的代码**，而不是本包的——所需构建见[依赖条件](#依赖条件)。

## 安装

本包是一个 dsh **bundle**：一个携带单层组合配置（`cordis.patch.yml`）的 npm 包，其中声明一个插件行。

```sh
# 从本 Git 仓库安装
dsh plugin --profile web add github:moazzamak/dsh-code-review

# ……或从本地检出的副本安装
dsh plugin --profile web add ./dsh-code-review
```

`dsh plugin add` 会链接该包、把它追加到 profile 的 `dsh.profile.bundles`，并在已列出的 bundle 之后启动该层。移除方式：

```sh
dsh plugin --profile web remove @moazzamak/dsh-code-review
```

安装或移除后请重启 `dsh`（至少应重新加载页面）。设置 → 插件中的行、`/review` 命令以及技能目录条目，是它能被看到的三处地方。

> [`cordis.patch.yml`](cordis.patch.yml) 中该行的 `name` 就是安装后的包名。如果你以其他名称发布本包，请同步修改这里的名称。

## 依赖条件

审阅流程由 dsh 提供，本包只是接入它，因此需要同时具备以下能力的 dsh 构建：

| 接缝 | 位置 |
| --- | --- |
| 固定的 **“变更”** 页面与逐块差异行 | `@deepseek-ai/dsh-client-ui-sidebar-documentpreview`（包括它导出的 `CHANGES_KIND`，以及文档渲染器的 `marks` 能力） |
| 右侧边栏服务上的 `isMounted()` | `@deepseek-ai/dsh-client-ui-sidebar-right` |
| Host 侧台账：已应用改动、审阅决定与拒绝提示 | `@deepseek-ai/dsh-api-workspace-files` |
| 可注册的技能注册表 | `@deepseek-ai/dsh-skill` |

撰写本包时，上述内容仍只存在于 `deepseek-harness` 的源码树中，**尚未包含在任何已发布的 dsh 版本里**。在此之前的版本上，该行仍会挂载，有技能注册表时技能也会注册，`/review` 会被提供但没有可打开的页面。本包绝不会自带审阅流程的第二套实现：那会让我在两处决定同一个改动。

它引用的每个 dsh 包都声明为**可选** peer 依赖，因此安装本包既不会拉入第二份 dsh，也不会因版本范围而失败。

## 审阅流程如何运作

本包的两项贡献所指向的内容：

1. **每处已应用的改动都会进入队列。** dsh 从会话完整日志折叠出已应用的改动与已作出的决定，因此队列在刷新后依然存在，并覆盖浏览器从未分页载入的历史。
2. **改动块是 `git add -i` 一路拆分到最后会给出的最小单位**：一段最长的连续改动行，并在改动前后镜像之间对齐。
3. **保留**记录该决定。**撤销**会在你当时看到的文件版本之下，仅反转该改动块，然后记录：因此若文件此后发生过变化，它会被拒绝，而不会在无人审阅过的改动之下执行撤销。
4. **拒绝会抵达 agent。** dsh 把尚未处理的拒绝作为运行时上下文条目 `workspace:change-review` 投影进模型上下文；在有拒绝之前它渲染为空、不产生开销。这正是 agent 不再假设自己所做的改动仍在文件中的原因。
5. **被改动的文件会以能够绘制这些行的渲染器打开**（改动过的 `README.md` 用代码渲染器），纯文本兜底实现同样会绘制，因此被改动的 `.gitignore` 与被改动的源文件一样可审阅。你在渲染器菜单中的选择仍然优先。

## 实现方式

```
package.json          声明 dsh.bundle.patch 与 dsh.client 浏览器半边
cordis.patch.yml      唯一的组合层：插入本包的行
src/index.ts          Host 半边——注册 dsh-change-review 运行时技能
src/skill.ts          技能正文，纯常量（无文件系统、无配置）
src/client/index.ts   浏览器半边——在固定的“变更”页面上注册 /review
src/client/locales.ts 命令文案（以中文为键集来源 + 英文）
lib/                  构建产物，已提交（见 DEVELOPMENT.md）
tests/                两个 spec，在 deepseek-harness 检出中运行
```

Host 半边不接受配置，并通过 `ctx.effect()` 注册技能，因此卸载该行（或 HMR 重载）会将其移除；没有技能注册表的 Host 不会得到贡献，而不是加载失败。浏览器半边声明它绑定的服务（`commandUi`、`locale`、`sidebarRight`），仅在拥有该页面的列挂载时提供 `/review`，并按照注册该页面的包所导出的类型打开页面，而不是重复一个字符串字面量。

## 开发

见 [DEVELOPMENT.md](DEVELOPMENT.md)。简言之：本仓库原样镜像 `deepseek-harness` 单仓库中的 `packages/bundle/code-review`（源码与 spec），并附带构建好的 `lib/`，因此安装时无需构建步骤；重新构建与运行测试需要该检出。

## 名称与隶属

本包是面向 DeepSeek Harness 的**非官方、社区构建**的 bundle。它与 DeepSeek 没有隶属关系，未获其背书，也非由其维护或发布——它所接入的审阅流程是 dsh 自身的代码，与本包一样以 MIT 许可发布。DeepSeek Harness 本身位于 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)；dsh 的问题请提交到那里（上游），而不是这里。

该名称在 npm 上**并不唯一**，若干互不相关的包使用了相似名称：

| 包 | 说明 |
| --- | --- |
| `dsh-code-review` | 只读的代码审阅 **agent 预设**（仅 Host；一个审阅代码的 agent） |
| `@michengai/dsh-code-review` | Codex 风格审阅 agent，支持中英双语报告 |
| `@dsh-plugin/dsh-code-review` | 逐轮改动摘要、审阅标签页与带保护的撤销 |
| `@yangzhe1991/dsh-code-review` | 双列 git diff 审阅页面 |

本包是 **`@moazzamak/dsh-code-review`**，仅从[本仓库](https://github.com/moazzamak/dsh-code-review)发布。如果你安装的是上面其他包之一，那你安装的是别人的插件——请在反馈本包问题之前，先确认 `dsh.profile.bundles` 或组合行中的包名。

## 许可

[MIT](LICENSE) © Moazzam Abdullah Khan。本包所接入的审阅流程属于 DeepSeek Harness，同样以 MIT 许可发布。
