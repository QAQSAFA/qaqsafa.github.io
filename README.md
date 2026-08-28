# Cloudier Ace 的个人博客

一个零构建、零图床的纯静态个人博客，部署在 **GitHub Pages**，完全免费。

## ✨ 功能

- **开场动画**：显示你的名字（在 `assets/js/config.js` 里改）
- **P 键 iOS 后台堆叠模式**：文章列表页按 `P`，所有文章像 iPhone 后台一样层叠，可鼠标拖拽、方向键切换
- **背景图片**：可在配置里设置背景图（图片放本地，不依赖图床）
- **发文章**：往 `content/posts/` 丢一个 `.md` 文件，推送到 GitHub 就自动发布
- **开源项目页**：在 `data/projects.json` 里维护
- 纯 HTML/CSS/JS，无框架、无构建、无数据库，图片全部本地存储

## 📁 目录结构

```
├── index.html              # 首页（开场动画 + 最新文章 + 开源项目）
├── posts.html              # 文章列表（P 键 iOS 堆叠模式）
├── post.html               # 文章详情
├── projects.html           # 开源项目页
├── 404.html
├── assets/
│   ├── css/style.css       # 样式
│   ├── js/
│   │   ├── config.js       # ⭐ 配置文件：名字 / 动画 / 背景 / GitHub
│   │   ├── markdown.js     # Markdown 渲染
│   │   ├── posts.js        # 文章读取（GitHub API 自动发现）
│   │   ├── stack.js        # P 键 iOS 堆叠模式
│   │   └── main.js         # 开场动画 / 背景 / 导航
│   └── img/                # ⭐ 放你的图片（头像、背景、文章图）
├── content/posts/          # ⭐ 放你的文章（.md 文件）
└── data/projects.json      # 开源项目数据
```

---

## 🚀 部署教程（新手一步一步跟着做）

### 第 1 步：注册 GitHub 并创建仓库

1. 如果没有 GitHub 账号，先去 [github.com](https://github.com) 注册（免费）
2. 登录后，点右上角 **+** → **New repository**（新建仓库）
3. 仓库名字填：**`QAQSAFA.github.io`**（必须一模一样，把 `QAQSAFA` 换成你的用户名）
4. 选择 **Public**（公开）
5. 其他不用管，点 **Create repository**（创建）

### 第 2 步：上传网站文件

现在整个 `cloudier-blog` 文件夹里的**所有内容**都要上传到这个仓库。

> 简单方式（推荐新手）：GitHub 网页端直接传
>
> 1. 打开你刚创建的仓库页面
> 2. 点 **Add file** → **Upload files**
> 3. 把 `index.html`、`posts.html`、`assets` 文件夹、`content` 文件夹、`data` 文件夹等**全部拖进去**
> 4. 点 **Commit changes**（提交）

> 进阶方式（以后用 Git 命令推送）：
> ```bash
> git init
> git add .
> git commit -m "我的博客"
> git branch -M main
> git remote add origin https://github.com/QAQSAFA/QAQSAFA.github.io.git
> git push -u origin main
> ```

### 第 3 步：开启 GitHub Pages（大部分情况会自动开）

1. 在仓库页面点 **Settings**（设置）
2. 左侧菜单点 **Pages**
3. 在 **Branch** 那里选择 `main`，文件夹选 `/ (root)`，点 **Save**
4. 等 1~3 分钟，GitHub 会显示你的网站地址：**`https://qaqsafa.github.io/`**

> 小提示：仓库名是 `用户名.github.io` 时，Pages 通常会自动启用并部署，不需要手动设置。

### 第 4 步：打开你的网站

浏览器访问 **`https://qaqsafa.github.io/`**，大功告成！🎉

> 如果打不开或空白，等 2 分钟再刷新一次（GitHub Pages 首次部署要一点时间）。

---

## ✍️ 怎么发新文章（超简单）

1. 复制 `content/posts/` 里任意一个文件，改个名字，比如 `my-first-post.md`
2. 用记事本/VSCode 打开，按下面的格式写：

```markdown
---
title: 我的第一篇文章
date: 2026-09-01
tags: ["生活", "随笔"]
summary: 这里写一句话摘要，会显示在文章卡片上。
---

这里是文章正文，支持 **加粗**、`代码`、[链接](https://github.com)、列表、图片等 Markdown 语法。
```

3. 文章里要插图：把图片放进 `assets/img/`，正文里写 `![图片说明](assets/img/图片名.jpg)`（图片放在仓库里，不依赖任何图床）
4. 把这个文件上传/推送到仓库，**等 1~2 分钟，文章就自动出现在网站上了**（不需要重新构建）

> 标题、日期、标签都写在文件开头的 `---` 之间，格式不要改。

---

## ⚙️ 常用设置（都在 `assets/js/config.js`）

| 想改什么 | 改哪里 |
|---|---|
| 博客名字 / 开场动画名字 | `ownerName` |
| 副标题 | `tagline` |
| 个人简介 | `bio` |
| 你的 GitHub 主页 | `githubUrl` |
| 关闭 / 调整开场动画 | `introAnimation.enabled` / `durationMs` |
| 背景图片 | `background.image`（填 `assets/img/xxx.jpg`） |
| 背景压暗程度 | `background.overlay`（0~1） |
| 背景模糊程度 | `background.blur` |

**改完保存，重新打开网站就生效。**

### 开源项目页怎么维护

打开 `data/projects.json`，照着现有的格式加一条就行：

```json
{
  "name": "项目名",
  "description": "一句话介绍",
  "githubUrl": "https://github.com/QAQSAFA/项目",
  "demoUrl": "https://项目在线地址",
  "techStack": ["HTML", "JavaScript"],
  "stars": 0
}
```

---

## ❓ 常见问题

**Q：按 P 键没有反应？**
文章列表页（`posts.html`）才支持，首页不行。先进入「文章」页面再按 P。

**Q：添加了文章但网站没显示？**
GitHub Pages 部署有 1~2 分钟延迟，刷新浏览器（可强制刷新 Ctrl+Shift+R）。如果还是没有，检查：文件名是 `.md` 结尾吗？`---` 开头的格式对吗？文件真的推送成功了吗？

**Q：想本地预览看看效果？**
在电脑上装 [Node.js](https://nodejs.org) 后，在项目文件夹打开终端运行：
```bash
npx serve .
```
然后浏览器访问 `http://localhost:3000`。

**Q：图片上传到哪？**
全部放 `assets/img/`，文章里用相对路径引用。图片跟着仓库走，永远不失效、不依赖图床。

---

由 Cloudier Ace 制作，祝使用愉快！
