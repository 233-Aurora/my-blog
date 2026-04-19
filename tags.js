// =============================================
// tags.js - 标签页逻辑
// =============================================

(function () {
  const articles = window.BLOG_DATA.articles;
  const tagDescriptions = window.BLOG_DATA.tagDescriptions;

  // ---- 统计各标签文章数 ----
  const tagCount = {};
  articles.forEach(a => {
    a.tags.forEach(t => {
      tagCount[t] = (tagCount[t] || 0) + 1;
    });
  });

  const sortedTags = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]);
  const maxCount = Math.max(...Object.values(tagCount));

  // 标签颜色轮换
  const tagColorMap = {};
  sortedTags.forEach((tag, i) => {
    tagColorMap[tag] = `tag-color-${(i % 8) + 1}`;
  });

  // ---- 渲染标签云 ----
  function getSizeClass(count) {
    const ratio = count / maxCount;
    if (ratio > 0.7) return 'tag-size-lg';
    if (ratio > 0.4) return 'tag-size-md';
    if (ratio > 0.2) return 'tag-size-sm';
    return 'tag-size-xs';
  }

  const tagCloud = document.getElementById('tagCloud');
  // 打乱标签顺序增加视觉趣味
  const shuffled = sortedTags.slice().sort(() => Math.random() - 0.3);

  tagCloud.innerHTML = shuffled.map(tag => `
    <button class="cloud-tag ${tagColorMap[tag]} ${getSizeClass(tagCount[tag])}"
            data-tag="${tag}">
      ${tag}
      <span class="cloud-tag-count">${tagCount[tag]}</span>
    </button>
  `).join('');

  // ---- 渲染分类卡片 ----
  const categoryIcons = {
    'JavaScript': '⚡', 'TypeScript': '📘', 'Python': '🐍',
    'React': '⚛️', 'Vue': '💚', 'Node.js': '🟢',
    '算法': '🧮', '数据结构': '🌳', 'CSS': '🎨',
    '项目复盘': '🔍', '工具': '🔧', '感悟': '💡',
    '前端': '🖥️', '后端': '⚙️', 'SQL': '🗄️',
    'Git': '🌿', '全栈': '🌐', '学习方法': '📚',
  };

  const categoriesGrid = document.getElementById('categoriesGrid');
  const categoryAccents = [
    'linear-gradient(90deg, #6366f1, #8b5cf6)',
    'linear-gradient(90deg, #0ea5e9, #06b6d4)',
    'linear-gradient(90deg, #10b981, #34d399)',
    'linear-gradient(90deg, #f59e0b, #fbbf24)',
    'linear-gradient(90deg, #ec4899, #f472b6)',
    'linear-gradient(90deg, #8b5cf6, #a78bfa)',
    'linear-gradient(90deg, #14b8a6, #2dd4bf)',
    'linear-gradient(90deg, #f97316, #fb923c)',
  ];

  categoriesGrid.innerHTML = sortedTags.map((tag, i) => {
    const tagArticles = articles.filter(a => a.tags.includes(tag));
    const desc = tagDescriptions[tag] || `关于 ${tag} 的所有文章`;
    const icon = categoryIcons[tag] || '📌';
    const accentStyle = `--card-accent: ${categoryAccents[i % categoryAccents.length]};`;

    const previewItems = tagArticles.slice(0, 3).map(a =>
      `<div class="category-article-item">${a.title}</div>`
    ).join('');

    const moreCount = tagArticles.length - 3;

    return `
    <div class="category-card ${tagColorMap[tag]}" 
         data-tag="${tag}" 
         style="${accentStyle}">
      <div class="category-header">
        <div class="category-icon-name">
          <span class="category-icon">${icon}</span>
          <span class="category-name">${tag}</span>
        </div>
        <span class="category-count-badge">${tagCount[tag]} 篇</span>
      </div>
      <p class="category-desc">${desc}</p>
      <div class="category-article-list">
        ${previewItems}
        ${moreCount > 0 ? `<div class="category-more">还有 ${moreCount} 篇文章 →</div>` : ''}
      </div>
    </div>`;
  }).join('');

  // ---- 处理 URL 参数（来自其他页面的标签跳转）----
  const urlParams = new URLSearchParams(window.location.search);
  const initTag = urlParams.get('tag');
  if (initTag && tagCount[initTag]) {
    selectTag(initTag);
  }

  // ---- 标签点击 - 云 ----
  tagCloud.addEventListener('click', (e) => {
    const btn = e.target.closest('.cloud-tag');
    if (!btn) return;
    const tag = btn.dataset.tag;
    const isSelected = btn.classList.contains('selected');
    if (isSelected) {
      clearTag();
    } else {
      selectTag(tag);
    }
  });

  // ---- 标签点击 - 分类卡片 ----
  categoriesGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.category-card');
    if (!card) return;
    selectTag(card.dataset.tag);
  });

  // ---- 清除筛选 ----
  document.getElementById('btnClearTag').addEventListener('click', clearTag);

  function selectTag(tag) {
    // 高亮云标签
    tagCloud.querySelectorAll('.cloud-tag').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.tag === tag);
    });

    // 显示文章列表
    const matched = articles.filter(a => a.tags.includes(tag));
    const section = document.getElementById('tagArticlesSection');
    section.style.display = 'block';
    document.getElementById('activeTagLabel').textContent = `「${tag}」`;

    const grid = document.getElementById('tagArticlesGrid');
    grid.innerHTML = matched.map(a => `
      <div class="tag-article-item" onclick="window.BlogUtils.openArticle('${a.id}')">
        <div class="tag-article-thumb" style="background:${a.thumbColor}">${a.thumbEmoji || '📄'}</div>
        <div class="tag-article-info">
          <div class="tag-article-title">${a.title}</div>
          <div class="tag-article-meta">
            <span>📅 ${window.BlogUtils.formatDate(a.date)}</span>
            <span>⏱️ ${a.readTime} 分钟</span>
          </div>
        </div>
      </div>
    `).join('');

    // 滚动到文章区域
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function clearTag() {
    tagCloud.querySelectorAll('.cloud-tag').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('tagArticlesSection').style.display = 'none';
  }

})();
