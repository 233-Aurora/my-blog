// =============================================
// article.js - 文章详情页逻辑
// 支持读取 localStorage 中用户发布的文章
// =============================================

(function () {
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get('id');
  const author = window.BLOG_DATA.author;

  // ---- 合并默认文章 + 用户发布文章（优先取用户版本）----
  const STORAGE_KEY = 'blog_published_articles';
  function getAllArticles() {
    const defaults = window.BLOG_DATA.articles || [];
    try {
      const userPublished = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const merged = [...userPublished];
      defaults.forEach(d => {
        if (!merged.find(u => u.id === d.id)) merged.push(d);
      });
      return merged;
    } catch {
      return defaults;
    }
  }

  const articles = getAllArticles();
  const layout = document.getElementById('articleLayout');
  const notFound = document.getElementById('article404');

  const article = articles.find(a => a.id === articleId);

  if (!article) {
    notFound.style.display = 'block';
    return;
  }

  layout.style.display = 'grid';
  document.title = `${article.title} - 小唐学编程的记录`;

  // ---- 渲染文章头部 ----
  // Hero Thumbnail
  const heroThumb = document.getElementById('articleHeroThumb');
  if (heroThumb) {
    heroThumb.style.background = article.thumbColor || 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)';
    if (article.thumbEmoji) {
      heroThumb.innerHTML = `<span style="font-size:5rem;position:relative;z-index:1;filter:drop-shadow(0 4px 16px rgba(0,0,0,0.3))">${article.thumbEmoji}</span>`;
    }
  }

  // Tags
  const metaTags = document.getElementById('articleMetaTags');
  if (metaTags && article.tags) {
    metaTags.innerHTML = article.tags.map(t =>
      `<span class="article-meta-tag tag-pill ${window.BlogUtils ? window.BlogUtils.getTagClass(t) : ''}" 
             onclick="window.location.href='tags.html?tag=${encodeURIComponent(t)}'">${t}</span>`
    ).join('');
  }

  // Title / excerpt
  const titleEl   = document.getElementById('articleTitle');
  const excerptEl = document.getElementById('articleExcerpt');
  if (titleEl)   titleEl.textContent   = article.title;
  if (excerptEl) excerptEl.textContent = article.excerpt || '';

  // Meta bar
  const avatarEl = document.getElementById('authorAvatar');
  if (avatarEl) { avatarEl.src = author.avatar; avatarEl.alt = author.name; }
  const nameEl = document.getElementById('authorName');
  if (nameEl) nameEl.textContent = author.nickname;
  const dateEl = document.getElementById('articleDate');
  if (dateEl) dateEl.textContent = window.BlogUtils ? window.BlogUtils.formatDate(article.date) : article.date;
  const rtEl = document.getElementById('readTime');
  if (rtEl) rtEl.textContent = article.readTime;

  // Sidebar author
  const sbAvatar = document.getElementById('sidebarAvatar');
  const sbName   = document.getElementById('sidebarName');
  const sbBio    = document.getElementById('sidebarBio');
  if (sbAvatar) sbAvatar.textContent = '👩‍💻';
  if (sbName)   sbName.textContent   = author.nickname;
  if (sbBio)    sbBio.textContent    = author.bio;

  // Copy link
  const copyBtn = document.getElementById('btnCopyLink');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        copyBtn.textContent = '✓';
        setTimeout(() => copyBtn.textContent = '🔗', 2000);
      });
    });
  }

  // ---- 渲染 Markdown ----
  const contentEl = document.getElementById('articleContent');

  // 配置 marked
  const renderer = new marked.Renderer();
  let headings = [];

  renderer.heading = function (text, level) {
    // marked v9 text 可能是对象
    const rawText = typeof text === 'object' ? text.text : text;
    const id = 'heading-' + rawText.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').toLowerCase();
    headings.push({ id, text: rawText, level });
    return `<h${level} id="${id}">${rawText}</h${level}>`;
  };

  renderer.code = function (code, lang) {
    const rawCode = typeof code === 'object' ? code.text : code;
    const rawLang = typeof code === 'object' ? code.lang : lang;
    const language = rawLang || 'plaintext';
    let highlighted;
    try {
      if (hljs.getLanguage(language)) {
        highlighted = hljs.highlight(rawCode, { language }).value;
      } else {
        highlighted = hljs.highlightAuto(rawCode).value;
      }
    } catch {
      highlighted = rawCode;
    }
    return `
      <div class="code-wrapper" style="position:relative;">
        <div class="code-header">
          <div class="code-dots">
            <span class="code-dot red"></span>
            <span class="code-dot yellow"></span>
            <span class="code-dot green"></span>
          </div>
          <span class="code-lang">${language}</span>
        </div>
        <button class="copy-btn" onclick="copyCode(this)">复制</button>
        <pre><code class="hljs language-${language}">${highlighted}</code></pre>
      </div>`;
  };

  marked.setOptions({ renderer, breaks: true, gfm: true });

  contentEl.innerHTML = marked.parse(article.content || '*（文章内容待补充）*');

  // ---- 目录 ----
  buildTOC(headings);
  setupScrollSpy();

  // ---- 相关推荐 ----
  buildRelated(article);

  // ---- 上一篇 / 下一篇 ----
  buildNavigation(article);

  // ---- 阅读进度 ----
  const progressBar = document.getElementById('readingProgress');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight * 100) : 0;
    progressBar.style.width = progress + '%';
  }, { passive: true });

  // ---- TOC 收起/展开 ----
  const tocToggle = document.getElementById('tocToggle');
  const tocNav = document.getElementById('tocNav');
  tocToggle.addEventListener('click', () => {
    const collapsed = tocNav.style.display === 'none';
    tocNav.style.display = collapsed ? '' : 'none';
    tocToggle.textContent = collapsed ? '收起' : '展开';
  });

  // ======== 辅助函数 ========

  function buildTOC(headings) {
    const tocNav = document.getElementById('tocNav');
    if (headings.length === 0) {
      document.getElementById('tocCard').style.display = 'none';
      return;
    }
    tocNav.innerHTML = headings.map(h => `
      <a href="#${h.id}" class="toc-item level-${h.level}" data-id="${h.id}">
        ${h.text}
      </a>
    `).join('');

    tocNav.querySelectorAll('.toc-item').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(link.dataset.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function setupScrollSpy() {
    const tocLinks = document.querySelectorAll('.toc-item');
    if (!tocLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove('active'));
          const activeLink = document.querySelector(`.toc-item[data-id="${entry.target.id}"]`);
          if (activeLink) {
            activeLink.classList.add('active');
            activeLink.scrollIntoView({ block: 'nearest' });
          }
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });

    document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4')
      .forEach(el => observer.observe(el));
  }

  function buildRelated(current) {
    const related = articles
      .filter(a => a.id !== current.id && a.tags.some(t => current.tags.includes(t)))
      .slice(0, 4);

    const list = document.getElementById('relatedList');
    if (!related.length) {
      document.getElementById('relatedCard').style.display = 'none';
      return;
    }

    list.innerHTML = related.map(a => `
      <div class="related-item" onclick="window.BlogUtils.openArticle('${a.id}')">
        <div class="related-thumb" style="background:${a.thumbColor}">
          ${a.thumbEmoji || '📄'}
        </div>
        <div>
          <div class="related-title">${a.title}</div>
          <div class="related-meta">⏱️ ${a.readTime} 分钟</div>
        </div>
      </div>
    `).join('');
  }

  function buildNavigation(current) {
    const idx = articles.findIndex(a => a.id === current.id);

    // 上一篇（索引更小=日期更新）
    if (idx > 0) {
      const prev = articles[idx - 1];
      const el = document.getElementById('prevArticle');
      el.style.display = 'flex';
      document.getElementById('prevTitle').textContent = prev.title;
      el.href = `article.html?id=${prev.id}`;
    }

    // 下一篇
    if (idx < articles.length - 1) {
      const next = articles[idx + 1];
      const el = document.getElementById('nextArticle');
      el.style.display = 'flex';
      document.getElementById('nextTitle').textContent = next.title;
      el.href = `article.html?id=${next.id}`;
    }
  }

})();

// ---- 全局复制代码 ----
window.copyCode = function (btn) {
  const code = btn.closest('.code-wrapper').querySelector('code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = '已复制 ✓';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '复制';
      btn.classList.remove('copied');
    }, 2000);
  });
};
