/* ============================================================
 * 博客配置文件 —— 你要改的东西基本都在这里
 * 改完保存，重新打开页面就生效
 * ============================================================ */
window.SITE_CONFIG = {
  /* ---------- 基本信息 ---------- */
  ownerName: "Cloudier Ace",                 // 网站主名字（开场动画显示的名字）
  siteTitle: "Cloudier Ace 的博客",           // 浏览器标签页标题
  tagline: "Designer & Developer",           // 一句话简介（副标题）
  bio: "一个热爱折腾的开发者，喜欢编程、硬件与一切有趣的东西。", // 个人简介
  email: "",                                 // 联系邮箱（可留空）

  /* ---------- GitHub / 开源 ---------- */
  githubUser: "QAQSAFA",                     // 你的 GitHub 用户名
  githubUrl: "https://github.com/QAQSAFA",   // 你的 GitHub 主页
  /* 你的博客仓库。如果仓库名是 QAQSAFA.github.io 就保持下面这样不用改 */
  githubRepo: "QAQSAFA/QAQSAFA.github.io",

  /* ---------- 开场动画 ---------- */
  introAnimation: {
    enabled: true,          // 设为 false 可关闭开场动画
    durationMs: 2200,       // 动画总时长（毫秒）
  },

  /* ---------- 背景 ---------- */
  background: {
    /* 背景图片：把图片放进 assets/img/ 文件夹，然后这里填相对路径，例如 "assets/img/background.jpg"
     * 留空 "" 则使用纯色/渐变背景 */
    image: "assets/img/my-pg.png",
    /* 背景图透明度压暗，用来保证文字可读性。0~1，越大越暗 */
    overlay: 0.15,
    /* 是否给背景图片加一点高斯模糊（0 = 不模糊） */
    blur: 0.35,
  },
};
