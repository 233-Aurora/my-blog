// =============================================
// about.js - 关于页逻辑
// =============================================

(function () {
  const author = window.BLOG_DATA.author;

  // ---- 技术栈数据 ----
  const techStack = [
    {
      category: '前端',
      items: [
        { name: 'HTML5', icon: '🧱' },
        { name: 'CSS3', icon: '🎨' },
        { name: 'JavaScript', icon: '⚡' },
        { name: 'TypeScript', icon: '📘' },
        { name: 'React', icon: '⚛️' },
        { name: 'Vue 3', icon: '💚' },
      ]
    },
    {
      category: '后端',
      items: [
        { name: 'Node.js', icon: '🟢' },
        { name: 'Express', icon: '🚂' },
        { name: 'Python', icon: '🐍' },
        { name: 'FastAPI', icon: '⚡' },
      ]
    },
    {
      category: '数据库',
      items: [
        { name: 'MySQL', icon: '🐬' },
        { name: 'PostgreSQL', icon: '🐘' },
        { name: 'MongoDB', icon: '🍃' },
        { name: 'Redis', icon: '🔴' },
      ]
    },
    {
      category: '工具 & 其他',
      items: [
        { name: 'Git', icon: '🌿' },
        { name: 'Docker', icon: '🐳' },
        { name: 'Linux', icon: '🐧' },
        { name: 'VSCode', icon: '💻' },
      ]
    }
  ];

  // 渲染技术栈
  const techGrid = document.getElementById('techGrid');
  techGrid.innerHTML = techStack.map(cat => `
    <div class="tech-category">
      <div class="tech-category-name">${cat.category}</div>
      <div class="tech-items">
        ${cat.items.map(item => `
          <span class="tech-item">
            <span>${item.icon}</span>
            <span>${item.name}</span>
          </span>
        `).join('')}
      </div>
    </div>
  `).join('');

  // ---- 时间线 ----
  const learningPath = author.learningPath;
  const timeline = document.getElementById('timeline');

  timeline.innerHTML = learningPath.map((item, i) => {
    const isDone = item.done;
    const isLast = !isDone && (i === 0 || learningPath[i - 1].done);
    return `
    <div class="timeline-item ${isDone ? 'done' : ''} ${isLast ? 'current' : ''}" 
         style="animation-delay: ${i * 0.08}s">
      <div class="timeline-dot"></div>
      <div class="timeline-year">${item.year}</div>
      <div class="timeline-milestone">${item.milestone}</div>
      <span class="timeline-badge">
        ${isDone ? '✓ 已完成' : (isLast ? '🔄 进行中' : '⏳ 规划中')}
      </span>
    </div>`;
  }).join('');

  // ---- 技能评分数据 ----
  const skillScores = [
    { name: 'JavaScript', score: 8 },
    { name: 'React', score: 7.5 },
    { name: 'Python', score: 7 },
    { name: 'Node.js', score: 6.5 },
    { name: 'CSS/UI', score: 7.5 },
    { name: 'SQL', score: 6 },
    { name: '算法', score: 6 },
    { name: 'TypeScript', score: 7 },
  ];

  // 渲染进度条
  const skillsBars = document.getElementById('skillsBars');
  skillsBars.innerHTML = skillScores.map(s => `
    <div class="skill-bar-item">
      <div class="skill-bar-header">
        <span class="skill-bar-name">${s.name}</span>
        <span class="skill-bar-score">${s.score}/10</span>
      </div>
      <div class="skill-bar-track">
        <div class="skill-bar-fill" data-score="${s.score}"></div>
      </div>
    </div>
  `).join('');

  // 进度条动画
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
          const score = parseFloat(bar.dataset.score);
          bar.style.width = (score / 10 * 100) + '%';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  if (skillsBars) observer.observe(skillsBars);

  // ---- 雷达图（纯 Canvas 绘制，无需外部库）----
  const canvas = document.getElementById('skillsChart');
  if (canvas && canvas.getContext) {
    drawRadarChart(canvas, skillScores.slice(0, 6));
  }

  function drawRadarChart(canvas, skills) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) / 2 - 40;
    const N = skills.length;

    // 获取当前主题颜色
    function getThemeColors() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      return {
        grid: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        label: isDark ? '#94a3b8' : '#64748b',
        fill: 'rgba(99, 102, 241, 0.2)',
        stroke: 'rgba(99, 102, 241, 0.8)',
        dot: '#6366f1',
      };
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const colors = getThemeColors();

      // 网格
      for (let r = 1; r <= 5; r++) {
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
          const x = cx + (R * r / 5) * Math.cos(angle);
          const y = cy + (R * r / 5) * Math.sin(angle);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 轴线
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
        ctx.strokeStyle = colors.grid;
        ctx.stroke();
      }

      // 数据区域
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
        const val = skills[i].score / 10;
        const x = cx + R * val * Math.cos(angle);
        const y = cy + R * val * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = colors.fill;
      ctx.fill();
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 数据点
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
        const val = skills[i].score / 10;
        const x = cx + R * val * Math.cos(angle);
        const y = cy + R * val * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = colors.dot;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 标签
      ctx.fillStyle = colors.label;
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
        const x = cx + (R + 28) * Math.cos(angle);
        const y = cy + (R + 28) * Math.sin(angle) + 4;
        ctx.fillText(skills[i].name, x, y);
      }
    }

    draw();

    // 主题切换时重绘
    const observer = new MutationObserver(draw);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // ---- 统计数字动画 ----
  const statNums = document.querySelectorAll('.stat-card-num[data-count]');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const duration = 1500;
        const start = performance.now();
        function step(now) {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(ease * target);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => statObserver.observe(el));

})();
