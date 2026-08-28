---
title: 这个博客是怎么工作的
date: 2026-08-27
tags: ["教程", "博客"]
summary: 零构建、零图床的静态博客：丢一个 Markdown 文件就是一篇新文章。
---

## 零构建静态博客

整个网站是纯 `HTML + CSS + JS`，没有后端，不需要构建。

1. 文章放在 `content/posts/` 文件夹
2. 每篇是一个 Markdown 文件，开头用 `---` 写标题、日期、标签
3. 推送到 GitHub 后，网站自动列出所有文章

```bash
git add .
git commit -m "新文章"
git push
```

搞定，就是这么简单。

## 想要自定义？

- 博客名字、开场动画、背景：改 `assets/js/config.js`
- 开源项目：改 `data/projects.json`
- 文章模板：复制 `content/posts/` 里任意一个文件改名即可
