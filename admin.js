/**
 * admin.js - 博客编辑器核心逻辑
 * 
 * 功能：
 *  1. Markdown 实时预览（使用 marked.js）
 *  2. 代码块高亮（使用 highlight.js）
 *  3. 文章发布到 localStorage（刷新首页后立即可见）
 *  4. 草稿自动保存（每 30 秒 + 失焦时）
 *  5. 文章管理抽屉（查看、编辑、删除已发布/草稿文章）
 *  6. Markdown 工具栏快捷插入
 *  7. 字数统计 & 阅读时间估算
 * 
 * 数据存储：
 *  - 已发布文章：localStorage key = "blog_published_articles"
 *  - 草稿：        localStorage key = "blog_drafts"
 *  - 当前草稿：    localStorage key = "blog_current_draft"
 */

// =============================================
// 配置
// =============================================
const STORAGE_KEY_PUBLISHED  = 'blog_published_articles';  // 已发布文章
const STORAGE_KEY_DRAFTS     = 'blog_drafts';               // 所有草稿
const STORAGE_KEY_DRAFT_CURR = 'blog_current_draft';        // 当前正在编辑的草稿

// =============================================
// 状态
// =============================================
let currentView    = 'edit';   // 'edit' | 'split' | 'preview'
let currentEditId  = null;     // 正在编辑的文章 ID（null = 新建）
let drawerMode     = 'published'; // 抽屉当前显示的 tab
let autoSaveTimer  = null;

// =============================================
// 工具函数
// =============================================

/** 生成唯一 ID */
function generateId(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);
  return `${slug}-${Date.now()}`;
}

/** 估算阅读时间（中文约 300 字/分钟，英文约 200 词/分钟） */
function estimateReadTime(text) {
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const english  = (text.match(/\b[a-zA-Z]+\b/g) || []).length;
  return Math.max(1, Math.round((chinese / 300) + (english / 200)));
}

/** 统计文字数 */
function countWords(text) {
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const english  = (text.match(/\b[a-zA-Z0-9]+\b/g) || []).length;
  return chinese + english;
}

/** 显示 Toast 提示 */
function showToast(msg, type = 'default') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

/** 格式化日期为 YYYY-MM-DD */
function formatDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

/** 从 localStorage 读取 JSON，失败返回默认值 */
function readStorage(key, defaultVal = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? defaultVal;
  } catch {
    return defaultVal;
  }
}

/** 写入 localStorage */
function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// =============================================
// marked.js 配置
// =============================================
function configureMarked() {
  if (typeof marked === 'undefined') return;

  const renderer = new marked.Renderer();

  // 代码块：使用 highlight.js 高亮
  renderer.code = function(code, language) {
    // 兼容 marked v9 可能传对象的情况
    const lang = (typeof language === 'string' ? language : (language?.lang || ''));
    const text = (typeof code === 'string' ? code : (code?.text || ''));

    const validLang = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
    const highlighted = hljs.highlight(text, { language: validLang }).value;
    const langLabel = lang ? `<span class="code-lang-label">${lang}</span>` : '';
    return `<pre class="code-block"><div class="code-header">${langLabel}<button class="copy-code-btn" onclick="copyCode(this)" title="复制代码">复制</button></div><code class="hljs language-${validLang}">${highlighted}</code></pre>`;
  };

  marked.setOptions({
    renderer,
    gfm: true,
    breaks: true,
  });
}

/** 一键复制代码块 */
function copyCode(btn) {
  const code = btn.closest('.code-block').querySelector('code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = '已复制 ✓';
    btn.style.color = '#10b981';
    setTimeout(() => { btn.textContent = '复制'; btn.style.color = ''; }, 2000);
  });
}
window.copyCode = copyCode;

// =============================================
// 视图切换（编辑 / 分栏 / 预览）
// =============================================
function setView(mode) {
  currentView = mode;
  const editorPane  = document.getElementById('editorPane');
  const previewPane = document.getElementById('previewPane');
  const toolbar     = document.getElementById('toolbar');

  // 更新按钮激活状态
  ['btnEdit', 'btnSplit', 'btnPreview'].forEach(id => {
    document.getElementById(id)?.classList.remove('active');
  });
  document.getElementById(
    mode === 'edit' ? 'btnEdit' : mode === 'split' ? 'btnSplit' : 'btnPreview'
  )?.classList.add('active');

  if (mode === 'edit') {
    editorPane.style.display  = 'flex';
    previewPane.style.display = 'none';
    editorPane.classList.add('full-width');
    if (toolbar) toolbar.style.display = 'flex';
  } else if (mode === 'preview') {
    editorPane.style.display  = 'none';
    previewPane.style.display = 'block';
    updatePreview();
    if (toolbar) toolbar.style.display = 'none';
  } else {
    // 分栏
    editorPane.style.display  = 'flex';
    previewPane.style.display = 'block';
    editorPane.classList.remove('full-width');
    if (toolbar) toolbar.style.display = 'flex';
    updatePreview();
  }
}
window.setView = setView;

// =============================================
// 实时预览更新
// =============================================
function updatePreview() {
  if (typeof marked === 'undefined') return;
  const md  = document.getElementById('markdownEditor').value;
  const out = document.getElementById('previewContent');
  if (!out) return;

  if (!md.trim()) {
    out.innerHTML = '<p class="preview-placeholder">在左侧开始输入，实时预览将显示在这里……</p>';
    return;
  }
  out.innerHTML = marked.parse(md);
  // 对未被 renderer 处理的 code 元素补充 hljs 高亮
  out.querySelectorAll('pre code').forEach(el => {
    if (!el.classList.contains('hljs')) hljs.highlightElement(el);
  });
}

// =============================================
// 字数统计 & 阅读时间
// =============================================
function updateStats() {
  const text    = document.getElementById('markdownEditor').value;
  const words   = countWords(text);
  const minutes = estimateReadTime(text);
  document.getElementById('wordCount').textContent   = `${words} 字`;
  document.getElementById('readTimeEst').textContent = `约 ${minutes} 分钟阅读`;
}

// =============================================
// Markdown 工具栏快捷插入
// =============================================
function insertMarkdown(type) {
  const textarea = document.getElementById('markdownEditor');
  const start = textarea.selectionStart;
  const end   = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);

  const snippets = {
    bold:      [`**${selected || '加粗文字'}**`,       selected ? 2 : 2],
    italic:    [`*${selected || '斜体文字'}*`,          selected ? 1 : 1],
    h2:        [`\n## ${selected || '二级标题'}\n`,     3],
    h3:        [`\n### ${selected || '三级标题'}\n`,    4],
    code:      [`\`${selected || '代码'}\``,             1],
    codeblock: [`\n\`\`\`javascript\n${selected || '// 在这里写代码'}\n\`\`\`\n`, 16],
    link:      [`[${selected || '链接文字'}](https://)`, selected ? 1 : 1],
    image:     [`![${selected || '图片描述'}](图片URL)`, selected ? 2 : 2],
    ul:        [`\n- ${selected || '列表项'}\n`,         3],
    ol:        [`\n1. ${selected || '列表项'}\n`,        4],
    quote:     [`\n> ${selected || '引用内容'}\n`,       3],
    hr:        [`\n\n---\n\n`,                           0],
  };

  const [snippet] = snippets[type] || ['', 0];
  if (!snippet) return;

  const before = textarea.value.slice(0, start);
  const after  = textarea.value.slice(end);
  textarea.value = before + snippet + after;

  // 重新定位光标
  const newPos = start + snippet.length;
  textarea.setSelectionRange(newPos, newPos);
  textarea.focus();

  updatePreview();
  updateStats();
}
window.insertMarkdown = insertMarkdown;

// 键盘快捷键
function handleEditorKeydown(e) {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'b') { e.preventDefault(); insertMarkdown('bold'); }
    if (e.key === 'i') { e.preventDefault(); insertMarkdown('italic'); }
    if (e.key === 's') { e.preventDefault(); saveDraft(); }
  }
}

// =============================================
// 草稿自动保存
// =============================================
function saveDraft() {
  const title   = document.getElementById('articleTitle').value.trim();
  const content = document.getElementById('markdownEditor').value;
  if (!title && !content) return;

  const draft = {
    id:       currentEditId || `draft-${Date.now()}`,
    title:    title || '（无标题草稿）',
    content,
    tags:     document.getElementById('articleTags').value,
    excerpt:  document.getElementById('articleExcerpt').value,
    featured: document.getElementById('articleFeatured').checked,
    savedAt:  new Date().toISOString(),
    type:     'draft',
  };

  if (!currentEditId) currentEditId = draft.id;

  // 更新或追加
  const drafts = readStorage(STORAGE_KEY_DRAFTS);
  const idx = drafts.findIndex(d => d.id === draft.id);
  if (idx >= 0) drafts[idx] = draft; else drafts.unshift(draft);
  writeStorage(STORAGE_KEY_DRAFTS, drafts);
  writeStorage(STORAGE_KEY_DRAFT_CURR, draft);

  const status = document.getElementById('saveStatus');
  status.textContent = '✅ 草稿已保存';
  status.className = 'save-status saved';
  setTimeout(() => {
    status.textContent = '📄 草稿';
    status.className = 'save-status';
  }, 2000);

  showToast('草稿已保存', 'success');
  renderDrawerList();
}
window.saveDraft = saveDraft;

// =============================================
// 发布文章
// =============================================
function publishArticle() {
  const title   = document.getElementById('articleTitle').value.trim();
  const content = document.getElementById('markdownEditor').value.trim();

  if (!title) {
    showToast('⚠️ 请先填写文章标题', 'error');
    document.getElementById('articleTitle').focus();
    return;
  }
  if (!content) {
    showToast('⚠️ 文章内容不能为空', 'error');
    document.getElementById('markdownEditor').focus();
    return;
  }

  // 处理标签
  const rawTags = document.getElementById('articleTags').value;
  const tags = rawTags
    ? rawTags.split(/[,，]/).map(t => t.trim()).filter(Boolean)
    : ['随笔'];

  // 摘要：手动填写或取正文前 100 字
  let excerpt = document.getElementById('articleExcerpt').value.trim();
  if (!excerpt) {
    excerpt = content.replace(/#+\s/g, '').replace(/[*`_\[\]()]/g, '').slice(0, 100) + '…';
  }

  const readTime = estimateReadTime(content);
  const featured = document.getElementById('articleFeatured').checked;
  const id = currentEditId || generateId(title);

  const article = {
    id,
    title,
    content,
    excerpt,
    tags,
    date:       formatDate(),
    readTime,
    featured,
    thumbnail:  null,
    thumbColor: getTagGradient(tags[0]),
    thumbEmoji: getTagEmoji(tags[0]),
    type:       'published',
    publishedAt: new Date().toISOString(),
  };

  // 保存到已发布
  const published = readStorage(STORAGE_KEY_PUBLISHED);
  const idx = published.findIndex(a => a.id === id);
  if (idx >= 0) published[idx] = article; else published.unshift(article);
  writeStorage(STORAGE_KEY_PUBLISHED, published);

  // 如果有对应草稿，从草稿列表删除
  const drafts = readStorage(STORAGE_KEY_DRAFTS).filter(d => d.id !== id);
  writeStorage(STORAGE_KEY_DRAFTS, drafts);
  localStorage.removeItem(STORAGE_KEY_DRAFT_CURR);

  // 更新状态
  currentEditId = id;
  const status = document.getElementById('saveStatus');
  status.textContent = `🎉 已发布`;
  status.className = 'save-status published';

  showToast('🎉 文章发布成功！', 'success');
  renderDrawerList();

  // 询问是否跳转首页
  setTimeout(() => {
    if (confirm('文章已成功发布！是否前往首页查看？')) {
      window.location.href = 'index.html';
    }
  }, 500);
}
window.publishArticle = publishArticle;

// =============================================
// 根据标签生成缩略图样式
// =============================================
const TAG_GRADIENTS = {
  'javascript': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'python':     'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  'react':      'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  '算法':        'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  '项目复盘':    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  '工具':        'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
  '感悟':        'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
};
const TAG_EMOJIS = {
  'javascript': '⚡', 'python': '🐍', 'react': '⚛️',
  '算法': '🧮', '项目复盘': '🔍', '工具': '🔧', '感悟': '💡',
  'css': '🎨', 'html': '📄', '前端': '🖥️', '后端': '⚙️',
};
function getTagGradient(tag) {
  const key = (tag || '').toLowerCase();
  return TAG_GRADIENTS[key] || 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)';
}
function getTagEmoji(tag) {
  const key = (tag || '').toLowerCase();
  return TAG_EMOJIS[key] || '📝';
}

// =============================================
// 文章管理抽屉
// =============================================
function toggleDrawer() {
  const drawer  = document.getElementById('articlesDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const isOpen  = drawer.classList.contains('open');
  if (isOpen) {
    drawer.classList.remove('open');
    overlay.classList.remove('visible');
  } else {
    drawer.classList.add('open');
    overlay.classList.add('visible');
    renderDrawerList();
  }
}
window.toggleDrawer = toggleDrawer;

function switchDrawerTab(mode, btn) {
  drawerMode = mode;
  document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderDrawerList();
}
window.switchDrawerTab = switchDrawerTab;

function renderDrawerList() {
  const list = document.getElementById('drawerList');
  if (!list) return;

  const items = drawerMode === 'published'
    ? readStorage(STORAGE_KEY_PUBLISHED)
    : readStorage(STORAGE_KEY_DRAFTS);

  if (!items.length) {
    list.innerHTML = `
      <div class="drawer-empty">
        <div class="drawer-empty-icon">${drawerMode === 'published' ? '📭' : '📝'}</div>
        <p>${drawerMode === 'published' ? '还没有发布的文章' : '还没有保存的草稿'}</p>
      </div>`;
    return;
  }

  list.innerHTML = items.map(item => `
    <div class="drawer-item" data-id="${item.id}">
      <div class="drawer-item-title">${item.title || '（无标题）'}</div>
      <div class="drawer-item-meta">
        <span>${item.date || item.savedAt?.slice(0,10) || '未知日期'}</span>
        <span>${item.tags?.join(', ') || ''}</span>
      </div>
      <span class="drawer-item-badge ${drawerMode === 'published' ? 'badge-published' : 'badge-draft'}">
        ${drawerMode === 'published' ? '已发布' : '草稿'}
      </span>
      <div class="drawer-item-actions">
        <button class="drawer-action-btn btn-edit-item" onclick="loadArticleToEditor('${item.id}', '${drawerMode}')">✏️ 编辑</button>
        <button class="drawer-action-btn btn-delete-item" onclick="deleteArticle('${item.id}', '${drawerMode}')">🗑️ 删除</button>
        ${drawerMode === 'published' ? `<button class="drawer-action-btn btn-edit-item" onclick="viewArticle('${item.id}')">👁 查看</button>` : ''}
      </div>
    </div>
  `).join('');
}

/** 加载文章到编辑器 */
function loadArticleToEditor(id, source) {
  const items = readStorage(
    source === 'published' ? STORAGE_KEY_PUBLISHED : STORAGE_KEY_DRAFTS
  );
  const item = items.find(i => i.id === id);
  if (!item) return;

  document.getElementById('articleTitle').value  = item.title || '';
  document.getElementById('markdownEditor').value = item.content || '';
  document.getElementById('articleTags').value    = Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '');
  document.getElementById('articleExcerpt').value = item.excerpt || '';
  document.getElementById('articleFeatured').checked = !!item.featured;

  currentEditId = id;
  updatePreview();
  updateStats();
  toggleDrawer();
  showToast('已加载文章，可以继续编辑', 'success');

  document.getElementById('saveStatus').textContent =
    source === 'published' ? '🎉 已发布（可修改后重新发布）' : '📄 草稿';
}
window.loadArticleToEditor = loadArticleToEditor;

/** 删除文章 */
function deleteArticle(id, source) {
  if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) return;

  const key = source === 'published' ? STORAGE_KEY_PUBLISHED : STORAGE_KEY_DRAFTS;
  const items = readStorage(key).filter(i => i.id !== id);
  writeStorage(key, items);
  renderDrawerList();
  showToast('已删除', 'default');
}
window.deleteArticle = deleteArticle;

/** 在新标签页预览文章 */
function viewArticle(id) {
  window.open(`article.html?id=${id}`, '_blank');
}
window.viewArticle = viewArticle;

// =============================================
// 新建文章（清空编辑器）
// =============================================
function newArticle() {
  if (document.getElementById('markdownEditor').value.trim()) {
    if (!confirm('当前内容尚未发布，确定要新建文章吗？')) return;
  }
  document.getElementById('articleTitle').value   = '';
  document.getElementById('markdownEditor').value = '';
  document.getElementById('articleTags').value    = '';
  document.getElementById('articleExcerpt').value = '';
  document.getElementById('articleFeatured').checked = false;
  currentEditId = null;
  updatePreview();
  updateStats();
  document.getElementById('saveStatus').textContent = '📄 未保存';
  document.getElementById('saveStatus').className   = 'save-status';
  document.getElementById('articleTitle').focus();
}
window.newArticle = newArticle;

// =============================================
// 恢复上次草稿
// =============================================
function restoreCurrentDraft() {
  const draft = readStorage(STORAGE_KEY_DRAFT_CURR, null);
  if (!draft) return;

  // 只有编辑器当前为空时才自动恢复
  const title   = document.getElementById('articleTitle').value.trim();
  const content = document.getElementById('markdownEditor').value.trim();
  if (title || content) return;

  document.getElementById('articleTitle').value   = draft.title === '（无标题草稿）' ? '' : draft.title;
  document.getElementById('markdownEditor').value = draft.content || '';
  document.getElementById('articleTags').value    = draft.tags || '';
  document.getElementById('articleExcerpt').value = draft.excerpt || '';
  currentEditId = draft.id;
  updateStats();
  document.getElementById('saveStatus').textContent = '📄 草稿（已恢复）';
}

// =============================================
// 初始化
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // 配置 marked
  configureMarked();

  // 恢复上次草稿
  restoreCurrentDraft();

  const editor = document.getElementById('markdownEditor');
  if (!editor) return;

  // 输入时实时预览 + 统计
  editor.addEventListener('input', () => {
    updateStats();
    if (currentView !== 'edit') updatePreview();

    // 防抖自动保存草稿（30秒无操作后保存）
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(saveDraft, 30000);

    // 标记未保存
    document.getElementById('saveStatus').textContent = '📄 未保存';
    document.getElementById('saveStatus').className   = 'save-status';
  });

  // 键盘快捷键
  editor.addEventListener('keydown', handleEditorKeydown);

  // 页面关闭前保存草稿
  window.addEventListener('beforeunload', () => {
    const content = editor.value.trim();
    if (content) saveDraft();
  });

  // 初始化统计
  updateStats();

  // Tab 键缩进
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart;
      const end   = editor.selectionEnd;
      editor.value = editor.value.slice(0, start) + '  ' + editor.value.slice(end);
      editor.setSelectionRange(start + 2, start + 2);
    }
  });
});
