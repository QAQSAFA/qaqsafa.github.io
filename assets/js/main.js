/* ============================================================
 * 全局脚本：开场动画 / 背景图片 / 导航 / 滚动显现 / 页脚
 * ============================================================ */
(function () {
  var CFG = window.SITE_CONFIG;

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- 1. 标题与品牌 ---------- */
    if (CFG.siteTitle) document.title = CFG.siteTitle;
    var brand = document.getElementById("navBrand");
    if (brand) brand.textContent = CFG.ownerName;
    var footName = document.getElementById("footName");
    if (footName) footName.textContent = CFG.ownerName;
    var yearEl = document.getElementById("footYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- 2. 背景图片（配置里有就应用，带压暗/模糊，保证 UI 与背景分层清晰） ---------- */
    applyBackground();

    /* ---------- 3. 开场动画（仅首页有 introOverlay） ---------- */
    var intro = document.getElementById("introOverlay");
    if (intro && CFG.introAnimation.enabled !== false) {
      runIntro(intro, CFG.ownerName, CFG.introAnimation.durationMs || 2200);
    } else if (intro) {
      intro.style.display = "none";
    }

    /* ---------- 4. 滚动显现 ---------- */
    setupReveal();

    /* ---------- 5. 导航栏交互 ---------- */
    var navToggle = document.getElementById("navToggle");
    var navMenu = document.getElementById("navMenu");
    if (navToggle && navMenu) {
      navToggle.addEventListener("click", function () {
        navMenu.classList.toggle("open");
      });
    }
  });

  /* ---------- 背景 ---------- */
  function applyBackground() {
    var img = CFG.background && CFG.background.image;
    var wrap = document.getElementById("bgLayer");
    if (!wrap) {
      // 动态创建背景层
      wrap = document.createElement("div");
      wrap.id = "bgLayer";
      wrap.className = "bg-layer";
      document.body.appendChild(wrap);
    }
    if (img) {
      var blur = (CFG.background.blur || 0);
      var overlay = CFG.background.overlay == null ? 0.55 : CFG.background.overlay;
      wrap.innerHTML =
        '<div class="bg-img" style="background-image:url(' + (encodeURI(img).replace(/'/g, "%27")) + ');' +
        'filter:blur(' + blur + 'px)"></div>' +
        '<div class="bg-shade" style="background:rgba(10,12,16,' + overlay + ')"></div>';
      wrap.classList.add("has-image");
      document.body.classList.add("has-bg-image");
    } else {
      wrap.innerHTML = "";
      wrap.classList.remove("has-image");
      document.body.classList.remove("has-bg-image");
    }
  }

  /* ---------- 开场动画：名字逐字出现 → 整屏上滑淡出 ---------- */
  function runIntro(intro, name, durationMs) {
    var textEl = intro.querySelector(".intro-name");
    textEl.textContent = name;
    var chars = name.split("");
    textEl.innerHTML = chars
      .map(function (c) {
        return '<span class="intro-char">' + (c === " " ? "&nbsp;" : MD.escapeHtml(c)) + "</span>";
      })
      .join("");
    var letters = textEl.querySelectorAll(".intro-char");
    var per = 90;
    letters.forEach(function (el, i) {
      el.style.animationDelay = (i * per) + "ms";
    });
    var total = letters.length * per + 700;
    setTimeout(function () {
      intro.classList.add("done");
      document.body.classList.add("intro-done");
      setTimeout(function () {
        intro.style.display = "none";
      }, 900);
    }, total + durationMs * 0.2);
    // 防止内容一开始不可见
    document.body.classList.add("intro-running");
    setTimeout(function () { document.body.classList.remove("intro-running"); }, total + 2000);
  }

  /* ---------- 滚动显现 ---------- */
  function setupReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
  }
})();
