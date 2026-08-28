/* ============================================================
 * iOS 后台（App Switcher）堆叠模式
 * 按 P 键切换：文章卡片像 iPhone 后台一样横向层叠，可鼠标拖拽
 * ============================================================ */
window.STACK = (function () {
  var overlay, inner, dotsEl;
  var posts = [];
  var cards = [];
  var activeIndex = 0;
  var isOpen = false;
  var dragging = false, startX = 0, dragX = 0;
  var step = 150;

  function build(postList) {
    posts = postList || [];
    inner.innerHTML = "";
    cards = [];
    dotsEl.innerHTML = "";
    posts.forEach(function (p, i) {
      var el = document.createElement("a");
      el.className = "stack-card";
      el.href = "post.html?slug=" + encodeURIComponent(p.slug);
      var h = POSTS.coverColor(p.slug);
      var grad = "linear-gradient(135deg, hsl(" + h + " 70% 45%), hsl(" + ((h + 40) % 360) + " 75% 30%))";
      var tags = (p.tags || []).slice(0, 3).map(function (t) {
        return '<span class="mini-tag">' + MD.escapeHtml(t) + "</span>";
      }).join("");
      el.innerHTML =
        '<div class="stack-card-screen" style="background:' + grad + '">' +
          '<div class="stack-card-ghost">' + MD.escapeHtml(p.title) + "</div>" +
          '<div class="stack-card-summary">' + MD.escapeHtml(p.summary || "") + "</div>" +
        "</div>" +
        '<div class="stack-card-info">' +
          '<div class="stack-card-dots-mini">' + tags + "</div>" +
          "<div>" +
            '<span class="stack-card-date">' + MD.formatDate(p.date) + "</span>" +
            '<span class="stack-card-title">' + MD.escapeHtml(p.title) + "</span>" +
          "</div>" +
        "</div>";
      el.addEventListener("click", function (e) {
        // 拖拽后不触发跳转
        if (Math.abs(dragX) > 8) { e.preventDefault(); return; }
      });
      inner.appendChild(el);
      cards.push(el);
      var dot = document.createElement("span");
      dot.className = "dot";
      dot.dataset.i = i;
      dot.addEventListener("click", function () { goTo(i); });
      dotsEl.appendChild(dot);
    });
    activeIndex = 0;
    render();
  }

  function render() {
    cards.forEach(function (card, i) {
      var rel = i - activeIndex;
      var tx, s, o, blur, z;
      if (rel === 0) { tx = 0; s = 1; o = 1; blur = 0; z = 100; }
      else if (rel > 0) {
        tx = rel * step + rel * 55;
        s = Math.max(0.5, 1 - rel * 0.09);
        o = Math.max(0.2, 1 - rel * 0.2);
        blur = Math.min(6, rel * 2);
        z = 100 - rel;
      } else {
        tx = rel * 24;
        s = Math.max(0.6, 1 + rel * 0.05);
        o = 0.3;
        blur = 1.5;
        z = 100 + rel;
      }
      card.style.transform = "translate(-50%,-50%) translateX(" + tx + "px) scale(" + s + ")";
      card.style.opacity = o;
      card.style.filter = "blur(" + blur + "px)";
      card.style.zIndex = z;
    });
    var dots = dotsEl.querySelectorAll(".dot");
    dots.forEach(function (d, i) { d.classList.toggle("active", i === activeIndex); });
  }

  function goTo(i) {
    if (i < 0) i = 0;
    if (i >= cards.length) i = cards.length - 1;
    activeIndex = i;
    render();
  }
  function next() { goTo(activeIndex + 1); }
  function prev() { goTo(activeIndex - 1); }

  function open() {
    if (isOpen) return;
    isOpen = true;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  function toggle() {
    isOpen ? close() : open();
  }

  function bindPointer() {
    overlay.addEventListener("pointerdown", function (e) {
      dragging = true;
      startX = e.clientX;
      dragX = 0;
      inner.style.transition = "none";
      overlay.setPointerCapture(e.pointerId);
    });
    overlay.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      dragX = e.clientX - startX;
      inner.style.transform = "translateX(" + dragX + "px)";
    });
    overlay.addEventListener("pointerup", function (e) {
      if (!dragging) return;
      dragging = false;
      inner.style.transition = "transform .45s cubic-bezier(.22,1,.36,1)";
      inner.style.transform = "";
      if (dragX < -70) next();
      else if (dragX > 70) prev();
      dragX = 0;
      setTimeout(function () { inner.style.transition = ""; }, 460);
    });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
  }

  function bindKeys() {
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      else if (e.key === "Escape") { close(); }
    });
  }

  /* 初始化：挂载 DOM + 全局 P 键 + 按钮 */
  function init() {
    overlay = document.getElementById("stackOverlay");
    if (!overlay) return;
    inner = overlay.querySelector(".stack-inner");
    dotsEl = overlay.querySelector(".stack-dots");
    bindPointer();
    bindKeys();

    // 全局 P 键
    document.addEventListener("keydown", function (e) {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key.toLowerCase() === "p") {
        toggle();
      }
    });

    // 切换按钮
    var btn = document.getElementById("stackToggleBtn");
    if (btn) btn.addEventListener("click", toggle);
  }

  return { init: init, open: open, close: close, toggle: toggle, build: build, goTo: goTo };
})();
