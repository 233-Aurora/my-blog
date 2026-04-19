// =============================================
// main.js - 全局通用功能
// =============================================

(function () {
  // ---- 主题切换 ----
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  function getTheme() {
    return localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  setTheme(getTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ---- 滚动时导航栏样式 ----
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const handleNavScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
  }

  // ---- 移动端菜单 ----
  const navMenuBtn = document.getElementById('navMenuBtn');
  const navMobileMenu = document.getElementById('navMobileMenu');
  if (navMenuBtn && navMobileMenu) {
    navMenuBtn.addEventListener('click', () => {
      navMobileMenu.classList.toggle('open');
    });
  }

  // ---- 回到顶部 ----
  const scrollTop = document.getElementById('scrollTop');
  if (scrollTop) {
    window.addEventListener('scroll', () => {
      scrollTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    scrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- 数字滚动动画 ----
  function animateNumber(el) {
    const target = parseInt(el.getAttribute('data-count') || el.textContent, 10);
    if (isNaN(target)) return;
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statNums = document.querySelectorAll('.stat-num[data-count]');
  if (statNums.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateNumber(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => observer.observe(el));
  }

  // ---- Hero 粒子 ----
  const heroParticles = document.getElementById('heroParticles');
  if (heroParticles) {
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 6 + 3;
      const hue = [60, 90, 150, 200, 240, 270][Math.floor(Math.random() * 6)];
      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        background: hsl(${hue}, 70%, 65%);
        opacity: ${Math.random() * 0.4 + 0.1};
        animation-duration: ${Math.random() * 12 + 8}s;
        animation-delay: ${Math.random() * 8}s;
      `;
      heroParticles.appendChild(p);
    }
  }

  // ---- 页面进入动画 ----
  document.body.classList.add('page-loaded');

})();

// ---- 工具函数（全局） ----
window.BlogUtils = {
  // 格式化日期
  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  },
  // 获取标签样式类
  getTagClass(tag) {
    const map = {
      'JavaScript': 'tag-js',
      'TypeScript': 'tag-js',
      'Python': 'tag-py',
      'React': 'tag-react',
      '算法': 'tag-algo',
      '数据结构': 'tag-algo',
    };
    return map[tag] || 'tag-default';
  },
  // 跳转文章详情
  openArticle(articleId) {
    window.location.href = `article.html?id=${articleId}`;
  }
};
