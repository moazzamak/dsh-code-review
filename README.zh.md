# @moazzamak/dsh-code-review

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）的代码审阅包。它提供一个 `/review` 命令，用于打开 dsh 的 **“变更”** 页面；并提供一个技能，让 agent（智能体）懂得如何对待你保留或撤销的改动。

> **非官方社区包。** 与 DeepSeek 无隶属关系，未获其背书，也非由其发布。详见[名称与隶属](#名称与隶属)。

[English](README.md) | 中文

## 安装

```sh
dsh plugin --profile web add github:moazzamak/dsh-code-review
```

安装后请重启 `dsh`（或重新加载页面）。移除方式：

```sh
dsh plugin --profile web remove @moazzamak/dsh-code-review
```

安装完成后会出现三处变化：设置中的 **插件** 条目、输入框中的 `/review`，以及 agent 技能列表中的 `dsh-change-review`。

## 你会得到什么

- **`/review`** —— 打开右侧边栏中固定的 **“变更”** 页面：agent 改动过、且仍有你尚未决定的改动的每个文件。会话标题栏中的改动计数打开的是同一个页面。
- **`dsh-change-review` 技能** —— 让 agent 懂得如何对待你的决定。它被告知：你已撤销的改动已经从文件中移除；撤销会连同文件路径与被移除的文本一并回报给它；并且一次工具调用应只承载一个逻辑改动，这样每个改动都能独立判断。

差异、**保留** / **撤销** 按钮、待处理列表，以及 agent 收到的提示都属于 dsh 本身。本包只增加快捷方式与这些说明，别无所加。

## 审阅改动

1. 运行 `/review`，或点击会话标题栏中的改动计数。
2. **“变更”** 页面列出每个被改动的文件，以及它的新增／删除行数与尚未决定的改动数量。点击某一行即可打开该文件；预览会定位到它的第一个未决改动。
3. 在文件中，每个改动块都画在它发生的位置，旁边有 **保留** 与 **撤销**。*改动块* 是 `git add -i` 一路拆分到最后会给出的最小单位：一段连续的改动行。
4. **保留** 记录该决定，文件保持不变。**撤销** 会把该改动块从文件中移除，然后记录该决定；同一文件中的其他改动块不受影响。
5. 页面同样提供整文件与整列表的快捷操作：每一行带该文件的 **保留** / **撤销**，列表下方的横条带 **全部保留** / **全部撤销**。
6. 若文件在你打开它之后又发生了变化，撤销会被拒绝而不是照常执行——**撤销** 会先检查文件版本，因此绝不会撤销你从未看过的编辑。

撤销会回报给 agent。dsh 会加入一条上下文条目，列出被改动的文件与被移除的文本，因此 agent 不再假设自己的编辑仍在文件中，也不会把它加回去。在没有撤销时，该条目不产生任何开销。

## 依赖条件

本包驱动的是 dsh 自身的审阅界面，因此需要包含该界面的 dsh 构建：

| 它使用的内容 | 所属包 |
| --- | --- |
| “变更”页面、逐块差异行与 `changes` 页面类型 | `@deepseek-ai/dsh-client-ui-sidebar-documentpreview` |
| 右侧边栏服务上的 `isMounted()` | `@deepseek-ai/dsh-client-ui-sidebar-right` |
| 已应用改动与审阅决定的记录 | `@deepseek-ai/dsh-api-workspace-files` |
| 技能注册表 | `@deepseek-ai/dsh-skill` |

在本次发布时，上述内容尚未进入已发布的 dsh 构建。在更早的构建上，插件仍会加载——技能会注册、`/review` 也会出现——但没有可供该命令打开的页面。所有 dsh 包都声明为可选 peer 依赖，因此安装本包不会拉入第二份 dsh。

## 名称与隶属

非官方、社区构建：与 DeepSeek 无隶属关系，未获其背书，也非由其发布。本包所驱动的审阅界面是 DeepSeek Harness 自身的代码，与本包一样以 MIT 许可发布，位于 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)——dsh 本身的问题请提交到那里。

npm 上存在相似名称。以下是由其他作者维护、互不相关的包：`dsh-code-review`（只读审阅 agent 预设）、`@michengai/dsh-code-review`、`@dsh-plugin/dsh-code-review`（改动摘要、审阅标签页与带保护的撤销）、`@yangzhe1991/dsh-code-review`（双列 git diff 页面）。本包是 **`@moazzamak/dsh-code-review`**，仅从[本仓库](https://github.com/moazzamak/dsh-code-review)发布。

## 相关链接

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) —— 本包所接入的 harness
- [CHANGELOG.md](CHANGELOG.md) —— 每个版本的变化
- [DEVELOPMENT.md](DEVELOPMENT.md) —— 本仓库如何构建与发布

## 许可

[MIT](LICENSE) © Moazzam Abdullah Khan。DeepSeek Harness 同样以 MIT 许可发布。
