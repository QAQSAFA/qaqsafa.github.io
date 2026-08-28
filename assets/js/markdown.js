/* ============================================================
 * 轻量 Markdown 渲染器（无第三方依赖）
 * 支持：标题 / 加粗 / 斜体 / 行内代码 / 代码块 / 链接 / 图片 /
 *       无序列表 / 有序列表 / 引用 / 分割线 / 段落
 * ============================================================ */
window.MD = (function () {

  /* 转义 HTML 特殊字符，防止 XSS */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* 行内格式化：`code` **bold** *italic* [link](url) ![img](url) */
  function inline(str) {
    return escapeHtml(str)
      // 图片 ![alt](src)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
        '<img src="$2" alt="$1" loading="lazy" />')
      // 链接 [text](url)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // 行内代码
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      // 加粗 **text**
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // 斜体 *text*
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
      // 删除线 ~~text~~
      .replace(/~~([^~]+)~~/g, '<del>$1</del>');
  }

  /* 解析 front matter：--- 开头的元信息块 */
  function parseFrontMatter(md) {
    var meta = { title: "", date: "", tags: [], summary: "" };
    var body = md;
    var m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (m) {
      body = md.slice(m[0].length);
      var lines = m[1].split(/\r?\n/);
      var currentKey = null, currentVal = [];
      lines.forEach(function (line) {
        var kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
        if (kv) {
          if (currentKey && currentVal.length) flush();
          currentKey = kv[1];
          currentVal = [kv[2]];
        } else {
          if (currentKey) currentVal.push(line);
        }
      });
      if (currentKey && currentVal.length) flush();
      function flush() {
        var val = currentVal.join("\n").trim();
        if (currentKey === "tags") {
          meta.tags = val.replace(/^\[|\]$/g, "").split(/[,，]/)
            .map(function (s) { return s.trim().replace(/^['"]|['"]$/g, ""); })
            .filter(Boolean);
        } else {
          meta[currentKey] = val;
        }
      }
    }
    return { meta: meta, body: body.trim() };
  }

  /* 渲染整段 Markdown */
  function render(md) {
    var lines = md.replace(/\r\n/g, "\n").split("\n");
    var html = [];
    var i = 0;
    var inCode = false, codeBuf = [], codeLang = "";

    function closeParagraph(buf) {
      if (buf.length) {
        html.push("<p>" + buf.join("<br>") + "</p>");
        buf.length = 0;
      }
    }

    var para = [];
    while (i < lines.length) {
      var line = lines[i];

      // 代码块
      var fence = line.match(/^```([\w+-]*)\s*$/);
      if (fence) {
        closeParagraph(para);
        if (inCode) {
          html.push("<pre><code class=\"code-block\">" + escapeHtml(codeBuf.join("\n")) + "</code></pre>");
          codeBuf = []; inCode = false;
        } else {
          inCode = true; codeLang = fence[1];
        }
        i++; continue;
      }
      if (inCode) { codeBuf.push(line); i++; continue; }

      // 空行
      if (!line.trim()) { closeParagraph(para); i++; continue; }

      // 标题
      var h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        closeParagraph(para);
        var lv = h[1].length;
        html.push("<h" + lv + ">" + inline(h[2]) + "</h" + lv + ">");
        i++; continue;
      }

      // 分割线
      if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        closeParagraph(para);
        html.push("<hr>");
        i++; continue;
      }

      // 引用
      if (/^>\s?/.test(line)) {
        closeParagraph(para);
        var quote = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        html.push("<blockquote><p>" + inline(quote.join(" ")) + "</p></blockquote>");
        continue;
      }

      // 无序列表
      if (/^[-*+]\s+/.test(line)) {
        closeParagraph(para);
        html.push("<ul>");
        while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
          html.push("<li>" + inline(lines[i].replace(/^[-*+]\s+/, "")) + "</li>");
          i++;
        }
        html.push("</ul>");
        continue;
      }

      // 有序列表
      if (/^\d+[.、]\s+/.test(line)) {
        closeParagraph(para);
        html.push("<ol>");
        while (i < lines.length && /^\d+[.、]\s+/.test(lines[i])) {
          html.push("<li>" + inline(lines[i].replace(/^\d+[.、]\s+/, "")) + "</li>");
          i++;
        }
        html.push("</ol>");
        continue;
      }

      // 普通段落行
      para.push(inline(line));
      i++;
    }
    if (inCode) {
      html.push("<pre><code class=\"code-block\">" + escapeHtml(codeBuf.join("\n")) + "</code></pre>");
    }
    closeParagraph(para);
    return html.join("\n");
  }

  /* 日期格式化 */
  function formatDate(str) {
    if (!str) return "";
    var d = new Date(str);
    if (isNaN(d)) return str;
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  return {
    render: render,
    parseFrontMatter: parseFrontMatter,
    escapeHtml: escapeHtml,
    formatDate: formatDate
  };
})();
