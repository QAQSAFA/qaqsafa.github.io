/* ============================================================
 * 文章加载与渲染
 *
 * 发文章方式：把 .md 文件丢进 content/posts/ 文件夹，推送到 GitHub
 * 即可自动出现在博客上（无需任何构建步骤）。
 *
 * 原理：通过 GitHub API 自动列出 content/posts 下的 .md 文件，
 *       再逐个拉取正文渲染。带本地缓存，避免频繁请求。
 * ============================================================ */
window.POSTS = (function () {
  var CFG = window.SITE_CONFIG;
  var postsDir = "content/posts";
  var CACHE_KEY = "cloudier_blog_posts_v1";
  var CACHE_TTL = 10 * 60 * 1000; // 10 分钟

  /* 内置示例文章：仓库还没建好 / 网络异常时也能看到内容 */
  var fallbackPosts = [
    {
      slug: "hello-world",
      title: "你好，世界",
      date: "2026-08-27",
      tags: ["随笔"],
      summary: "这是我的第一篇博客，欢迎来到 Cloudier Ace 的个人空间。",
      content: "## 欢迎\n\n这是我的博客，使用纯静态方式搭建，部署在 **GitHub Pages** 上。\n\n- 不依赖图床，图片全部放在仓库里\n- 发文章 = 丢一个 `.md` 文件，推送到 GitHub\n\n> 更多内容，等你来写。"
    },
    {
      slug: "how-this-blog-works",
      title: "这个博客是怎么工作的",
      date: "2026-08-27",
      tags: ["教程"],
      summary: "零构建、零图床的静态博客：丢一个 Markdown 文件就是一篇新文章。",
      content: "## 零构建静态博客\n\n整个网站是纯 `HTML + CSS + JS`，没有后端，不需要构建。\n\n1. 文章放在 `content/posts/` 文件夹\n2. 每篇是一个 Markdown 文件，开头用 `---` 写标题、日期、标签\n3. 推送到 GitHub 后，网站自动列出所有文章\n\n```bash\ngit add .\ngit commit -m \"新文章\"\ngit push\n```\n\n搞定，就是这么简单。"
    }
  ];

  /* ---------- 读取本地缓存 ---------- */
  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (Date.now() - obj.time > CACHE_TTL) return null;
      return obj.posts;
    } catch (e) { return null; }
  }
  function writeCache(posts) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), posts: posts }));
    } catch (e) {}
  }

  /* ---------- 从 GitHub API 拉取文章列表 ---------- */
  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error("timeout")); }, ms);
      })
    ]);
  }

  function fetchListFromGitHub() {
    var url = "https://api.github.com/repos/" + CFG.githubRepo + "/contents/" + postsDir;
    return withTimeout(fetch(url), 6000)
      .then(function (res) {
        if (!res.ok) throw new Error("list failed " + res.status);
        return res.json();
      })
      .then(function (items) {
        if (!Array.isArray(items)) throw new Error("bad list");
        return items.filter(function (it) { return /\.md$/i.test(it.name); });
      });
  }

  function fetchMarkdown(downloadUrl) {
    return withTimeout(fetch(downloadUrl), 6000)
      .then(function (res) {
        if (!res.ok) throw new Error("fetch failed " + res.status);
        return res.text();
      });
  }

  function parsePost(fileName, md) {
    var parsed = MD.parseFrontMatter(md);
    var meta = parsed.meta;
    var slug = (meta.slug || fileName.replace(/\.md$/i, "")).trim();
    return {
      slug: slug,
      title: meta.title || slug,
      date: meta.date || "",
      tags: meta.tags || [],
      summary: meta.summary || "",
      content: parsed.body
    };
  }

  /* ---------- 对外主入口 ----------
   * 先立即用缓存/示例文章渲染，避免空白；同时后台拉取 GitHub 真实数据，
   * 拉取成功后通过 onUpdate 回调自动刷新页面。 */
  function load(onUpdate) {
    return new Promise(function (resolve) {
      var cached = readCache();
      if (cached && cached.length) resolve(cached);
      else resolve(fallbackPosts);

      if (!CFG.githubRepo) return;

      fetchListFromGitHub()
        .then(function (files) {
          var fetches = files.map(function (f) {
            return fetchMarkdown(f.download_url).then(function (md) {
              return parsePost(f.name, md);
            });
          });
          return Promise.all(fetches);
        })
        .then(function (posts) {
          if (!posts.length) throw new Error("empty");
          posts.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
          writeCache(posts);
          if (typeof onUpdate === "function") onUpdate(posts);
        })
        .catch(function () {});
    });
  }

  function getBySlug(slug, onUpdate) {
    return load(onUpdate ? function (posts) {
      var p = posts.find(function (x) { return x.slug === slug; }) || null;
      if (p) onUpdate(p);
    } : null).then(function (posts) {
      return posts.find(function (p) { return p.slug === slug; }) || null;
    });
  }

  /* ---------- 渲染文章卡片（列表/网格模式） ---------- */
  function coverColor(seed) {
    var h = 0;
    for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
    return h;
  }

  function cardHtml(post, index) {
    var h = coverColor(post.slug);
    var grad = "linear-gradient(135deg, hsl(" + h + " 70% 45%), hsl(" + ((h + 40) % 360) + " 75% 30%))";
    var tags = (post.tags || []).map(function (t) {
      return '<span class="tag">' + MD.escapeHtml(t) + '</span>';
    }).join("");
    return (
      '<a class="post-card reveal" href="post.html?slug=' + encodeURIComponent(post.slug) + '" data-h="' + h + '">' +
        '<div class="post-card-cover" style="background:' + grad + '">' +
          '<span class="post-card-date">' + MD.formatDate(post.date) + '</span>' +
        '</div>' +
        '<div class="post-card-body">' +
          '<h3 class="post-card-title">' + MD.escapeHtml(post.title) + '</h3>' +
          '<p class="post-card-summary">' + MD.escapeHtml(post.summary || "") + '</p>' +
          '<div class="post-card-meta">' + tags + '</div>' +
        '</div>' +
      '</a>'
    );
  }

  function renderGrid(container, posts) {
    container.innerHTML = posts.map(cardHtml).join("");
    revealIn(container);
  }

  /* 滚动显现动画 */
  function revealIn(root) {
    var els = root.querySelectorAll(".reveal");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  return {
    load: load,
    getBySlug: getBySlug,
    renderGrid: renderGrid,
    coverColor: coverColor,
    cardHtml: cardHtml
  };
})();
