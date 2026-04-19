// =============================================
// home.js - 首页文章列表逻辑
// 支持合并 localStorage 中用户发布的文章
// =============================================

(function () {
  // ---- 合并默认文章 + 用户发布的文章 ----
  // 用户发布的文章存储在 localStorage 的 'blog_published_articles' 键
  const STORAGE_KEY = 'blog_published_articles';
  function getAllArticles() {
    const defaults = window.BLOG_DATA.articles || [];
    try {
      const userPublished = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      // 去重：用户文章优先（若 id 重复，以用户版本为准）
      const merged = [...userPublished];
      defaults.forEach(d => {
        if (!merged.find(u => u.id === d.id)) merged.push(d);
      });
      return merged;
    } catch {
      return defaults;
    }
  }

  let articles = getAllArticles();
  let currentTag = 'all';
  let currentSearch = '';
  let currentSort = 'date-desc';
  let visibleCount = 9;

  const grid = document.getElementById('articlesGrid');
  const noResults = document.getElementById('noResults');
  const loadMoreWrapper = document.getElementById('loadMoreWrapper');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const articlesCount = document.getElementById('articlesCount');
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');

  // ---- 过滤 & 排序 ----
  function getFiltered() {
    let list = articles.slice();

    if (currentTag !== 'all') {
      list = list.filter(a => a.tags && a.tags.includes(currentTag));
    }

    if (currentSearch.trim()) {
      const q = currentSearch.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt || '').toLowerCase().includes(q) ||
        (a.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (currentSort === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (currentSort === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (currentSort === 'read-asc') return a.readTime - b.readTime;
      return 0;
    });

    return list;
  }

  // ---- 渲染卡片 ----
  function renderCards() {
    const filtered = getFiltered();
    const visible = filtered.slice(0, visibleCount);

    articlesCount.textContent = `共 ${filtered.length} 篇文章`;

    if (filtered.length === 0) {
      grid.innerHTML = '';
      noResults.style.display = 'block';
      loadMoreWrapper.style.display = 'none';
      return;
    }

    noResults.style.display = 'none';
    loadMoreWrapper.style.display = filtered.length > visibleCount ? 'block' : 'none';

    grid.innerHTML = visible.map((a, i) => buildCard(a, i)).join('');

    // 绑定点击
    grid.querySelectorAll('.article-card').forEach(card => {
      card.addEventListener('click', () => {
        window.BlogUtils.openArticle(card.dataset.id);
      });
    });
  }

  function buildCard(a, index) {
    const tagHtml = a.tags.slice(0, 3).map(t =>
      `<span class="card-tag tag-pill ${window.BlogUtils.getTagClass(t)}">${t}</span>`
    ).join('');

    const thumbStyle = a.thumbnail
      ? `background-image: url(${a.thumbnail}); background-size:cover;`
      : `background: ${a.thumbColor};`;

    return `
    <article class="article-card ${a.featured ? 'featured' : ''}"
             data-id="${a.id}"
             style="animation-delay: ${index * 0.05}s">
      <div class="card-thumbnail">
        <div class="card-thumbnail-bg" style="${thumbStyle}"></div>
        ${a.thumbEmoji ? `<span class="card-thumbnail-emoji">${a.thumbEmoji}</span>` : ''}
      </div>
      <div class="card-body">
        <div class="card-tags">${tagHtml}</div>
        <h2 class="card-title">${a.title}</h2>
        <p class="card-excerpt">${a.excerpt}</p>
        <div class="card-footer">
          <div class="card-meta">
            <span class="card-meta-item">📅 ${window.BlogUtils.formatDate(a.date)}</span>
            <span class="card-meta-item">⏱️ ${a.readTime} 分钟</span>
          </div>
          <span class="card-read-more">阅读 →</span>
        </div>
      </div>
    </article>`;
  }

  // ---- 搜索 ----
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    visibleCount = 9;
    searchClear.classList.toggle('visible', currentSearch.length > 0);
    renderCards();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    currentSearch = '';
    searchClear.classList.remove('visible');
    renderCards();
  });

  // ---- 标签筛选 ----
  document.getElementById('filterTags').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-tag');
    if (!btn) return;
    document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTag = btn.dataset.tag;
    visibleCount = 9;
    renderCards();
  });

  // ---- 排序 ----
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderCards();
  });

  // ---- 加载更多 ----
  loadMoreBtn.addEventListener('click', () => {
    visibleCount += 6;
    renderCards();
  });

  // ---- 全局 resetFilter ----
  window.resetFilter = function () {
    currentTag = 'all';
    currentSearch = '';
    searchInput.value = '';
    searchClear.classList.remove('visible');
    document.querySelectorAll('.filter-tag').forEach((b, i) => {
      b.classList.toggle('active', i === 0);
    });
    renderCards();
  };

  // ---- 初始化 ----
  renderCards();

})();
