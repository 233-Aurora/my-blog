// =============================================
// 博客文章数据
// =============================================

window.BLOG_DATA = {
  // =============================================
  // 博客基础配置 - 修改这里来自定义博客信息
  // =============================================
  siteConfig: {
    title: "小唐学编程的记录",
    subtitle: "用文字记录每一段成长的代码旅程",
    logo: "📖",
    adminPassword: "tangziqi2026", // 管理后台密码（本地演示用，生产环境请换更安全的方案）
  },

  author: {
    name: "唐子琪",
    nickname: "小唐",
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%232563eb'/%3E%3Ctext x='50' y='65' font-size='45' text-anchor='middle' fill='white'%3E👩‍💻%3C/text%3E%3C/svg%3E",
    bio: "编程学习者 · 热爱技术与写作 · 相信持续记录的力量",
    github: "https://github.com",
    email: "tangziqi@example.com",
    location: "广州",
    skills: ["JavaScript", "Python", "React", "Node.js", "SQL", "Git"],
    learningPath: [
      { year: "2022 Q1", milestone: "开始学习编程，入门 HTML/CSS", done: true },
      { year: "2022 Q3", milestone: "掌握 JavaScript 基础", done: true },
      { year: "2023 Q1", milestone: "学习 React，完成第一个项目", done: true },
      { year: "2023 Q3", milestone: "后端入门：Node.js + Express", done: true },
      { year: "2024 Q1", milestone: "学习算法与数据结构", done: true },
      { year: "2024 Q3", milestone: "Python 与数据分析", done: true },
      { year: "2025 Q1", milestone: "深入系统设计", done: false },
      { year: "2025 Q3", milestone: "全栈项目独立交付", done: false },
    ]
  },

  articles: [
    {
      id: "js-closure-deep-dive",
      title: "JavaScript 闭包深度解析：从迷惑到恍然大悟",
      excerpt: "闭包曾经是我最头疼的概念之一。这篇文章记录了我彻底理解闭包的全过程——从最初的困惑，到通过大量实例实验，最终真正掌握它的本质。",
      date: "2026-04-10",
      readTime: 12,
      tags: ["JavaScript", "前端"],
      thumbnail: null,
      thumbColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      thumbEmoji: "🔒",
      featured: true,
      content: `
# JavaScript 闭包深度解析

## 什么是闭包？

闭包（Closure）是指一个函数能够访问其外部作用域中变量的能力，即使外部函数已经执行完毕。

\`\`\`javascript
function createCounter() {
  let count = 0; // 这个变量被闭包"捕获"

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getValue() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
\`\`\`

## 为什么闭包很重要？

闭包有以下几个核心用途：

### 1. 数据封装

通过闭包，我们可以创建私有变量：

\`\`\`javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance; // 私有变量

  return {
    deposit(amount) {
      if (amount > 0) balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > 0 && amount <= balance) {
        balance -= amount;
        return true;
      }
      return false;
    },
    getBalance() {
      return balance;
    }
  };
}

const account = createBankAccount(1000);
account.deposit(500);   // balance = 1500
account.withdraw(200);  // balance = 1300
// 无法直接访问 balance!
\`\`\`

### 2. 函数工厂

\`\`\`javascript
function multiplier(factor) {
  return (number) => number * factor;
}

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
\`\`\`

## 常见陷阱

### 循环中的闭包问题

\`\`\`javascript
// 错误示范
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 输出: 3, 3, 3 (不是期望的 0, 1, 2)

// 正确做法1：使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 输出: 0, 1, 2

// 正确做法2：IIFE
for (var i = 0; i < 3; i++) {
  ((j) => {
    setTimeout(() => console.log(j), 100);
  })(i);
}
\`\`\`

## 总结

理解闭包的关键在于：
> **函数记住了它被创建时的环境**

每次调用外部函数，都会创建一个新的词法环境，返回的函数会对这个环境保持引用。
      `
    },
    {
      id: "react-hooks-guide",
      title: "React Hooks 完全指南：我踩过的那些坑",
      excerpt: "从 Class Component 到 Function Component，Hooks 彻底改变了我写 React 的方式。这篇是我学习 Hooks 一年多来的完整总结，包括最容易出错的地方。",
      date: "2026-03-28",
      readTime: 18,
      tags: ["React", "前端", "JavaScript"],
      thumbnail: null,
      thumbColor: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      thumbEmoji: "⚛️",
      featured: true,
      content: `
# React Hooks 完全指南

## useState：状态管理的基础

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}
\`\`\`

## useEffect：副作用处理

useEffect 是我踩坑最多的 Hook：

\`\`\`jsx
useEffect(() => {
  // 订阅
  const subscription = subscribe(id);

  // 清理函数（卸载时执行）
  return () => {
    subscription.unsubscribe();
  };
}, [id]); // 依赖数组！
\`\`\`

### 依赖数组的三种形式

| 形式 | 含义 |
|------|------|
| 不传 | 每次渲染后都执行 |
| [] | 只在挂载时执行一次 |
| [dep1, dep2] | dep 变化时执行 |

## 自定义 Hook：复用逻辑

\`\`\`jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// 使用
function UserProfile({ userId }) {
  const { data, loading, error } = useFetch(\`/api/users/\${userId}\`);

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <Profile user={data} />;
}
\`\`\`

## 总结

Hooks 让 React 代码更简洁，但需要理解其内部机制才能避免陷阱。
      `
    },
    {
      id: "python-algorithms",
      title: "用 Python 刷了100道算法题的心得体会",
      excerpt: "坚持了三个月，终于刷完了 LeetCode 前100道题。分享我整理的解题思路框架、常用数据结构模板，以及刷题过程中的心理变化。",
      date: "2026-03-15",
      readTime: 15,
      tags: ["Python", "算法", "学习方法"],
      thumbnail: null,
      thumbColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      thumbEmoji: "🧮",
      featured: false,
      content: `# 刷题心得\n\n三个月，100题，以下是我的总结...`
    },
    {
      id: "todo-app-retrospective",
      title: "独立开发一个 Todo App：从设计到上线的全流程复盘",
      excerpt: "这是我第一个独立完成并上线的项目。从需求分析、UI设计、前后端开发，到部署上线，踩了很多坑也学到了很多。完整复盘分享给大家。",
      date: "2026-02-20",
      readTime: 20,
      tags: ["项目复盘", "全栈", "React", "Node.js"],
      thumbnail: null,
      thumbColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      thumbEmoji: "✅",
      featured: true,
      content: `# Todo App 项目复盘\n\n从零到一，完整记录...`
    },
    {
      id: "git-workflow-guide",
      title: "团队协作 Git 工作流：这些命令让我的效率翻倍",
      excerpt: "学会 Git 基础操作很容易，但真正在团队里用好 Git 却需要时间积累。分享我总结的 Git 工作流规范和那些超实用的进阶命令。",
      date: "2026-02-05",
      readTime: 10,
      tags: ["工具", "Git", "效率"],
      thumbnail: null,
      thumbColor: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      thumbEmoji: "🌿",
      featured: false,
      content: `# Git 工作流指南\n\n让协作更顺畅...`
    },
    {
      id: "learning-reflection-2025",
      title: "2025年编程学习年终总结：我是如何从零到全栈的",
      excerpt: "回顾这一年，走过迷茫、经历瓶颈、也迎来突破。不谈技术细节，只聊学习心态和方法论——那些让我坚持下来的东西。",
      date: "2026-01-01",
      readTime: 8,
      tags: ["感悟", "学习方法", "年终总结"],
      thumbnail: null,
      thumbColor: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      thumbEmoji: "🎯",
      featured: false,
      content: `# 2025年终总结\n\n这一年，我学到了...`
    },
    {
      id: "css-grid-flexbox",
      title: "CSS Grid vs Flexbox：我终于搞清楚什么时候用哪个",
      excerpt: "Grid 和 Flexbox 各有所长，但很多人（包括曾经的我）经常搞混。通过大量实例对比，彻底厘清两者的适用场景。",
      date: "2025-12-18",
      readTime: 11,
      tags: ["CSS", "前端"],
      thumbnail: null,
      thumbColor: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
      thumbEmoji: "🎨",
      featured: false,
      content: `# CSS Grid vs Flexbox\n\n布局利器对比...`
    },
    {
      id: "nodejs-event-loop",
      title: "Node.js 事件循环：异步编程终于不再神秘",
      excerpt: "异步编程是 JavaScript 最有趣也最难理解的部分。这篇文章用动画化的方式解释事件循环机制，彻底搞懂 callback、Promise、async/await 的本质。",
      date: "2025-12-01",
      readTime: 16,
      tags: ["Node.js", "JavaScript", "后端"],
      thumbnail: null,
      thumbColor: "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)",
      thumbEmoji: "🔄",
      featured: false,
      content: `# Node.js 事件循环\n\n异步的奥秘...`
    },
    {
      id: "sql-optimization",
      title: "SQL 查询优化实战：让你的查询快10倍的技巧",
      excerpt: "在做项目时遇到了严重的数据库性能问题，逼着我深入学习了 SQL 优化。分享实战中用到的索引策略、查询重写技巧和慢查询分析方法。",
      date: "2025-11-15",
      readTime: 14,
      tags: ["SQL", "数据库", "后端", "性能优化"],
      thumbnail: null,
      thumbColor: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
      thumbEmoji: "🗄️",
      featured: false,
      content: `# SQL 查询优化\n\n性能调优实战...`
    },
    {
      id: "vscode-extensions",
      title: "我的 VSCode 必装插件清单（2025年更新版）",
      excerpt: "好的工具能让编程更愉快。这份插件清单经过我两年的筛选，只留下真正提升效率的那些，每个都附有使用场景说明。",
      date: "2025-11-01",
      readTime: 7,
      tags: ["工具", "VSCode", "效率"],
      thumbnail: null,
      thumbColor: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      thumbEmoji: "🔧",
      featured: false,
      content: `# VSCode 必装插件\n\n效率工具大合集...`
    },
    {
      id: "typescript-beginner",
      title: "TypeScript 入门：为什么我后悔没有早点学",
      excerpt: "在大型项目中踩了太多类型错误的坑之后，我终于开始认真学 TypeScript。这篇文章是我的学习笔记，专注于实用技能，避免过度理论化。",
      date: "2025-10-15",
      readTime: 13,
      tags: ["TypeScript", "JavaScript", "前端"],
      thumbnail: null,
      thumbColor: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      thumbEmoji: "📘",
      featured: false,
      content: `# TypeScript 入门笔记\n\n类型系统的魅力...`
    },
    {
      id: "debugging-mindset",
      title: "调试的艺术：如何系统性地解决 Bug",
      excerpt: "花了5小时找到一个少写了分号的 Bug 之后，我开始认真思考调试方法论。这篇文章分享了一套系统性的调试思维框架。",
      date: "2025-10-01",
      readTime: 9,
      tags: ["感悟", "调试", "思维方法"],
      thumbnail: null,
      thumbColor: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
      thumbEmoji: "🐛",
      featured: false,
      content: `# 调试的艺术\n\n系统性排查 Bug...`
    },
  ],

  tagDescriptions: {
    "JavaScript": "前端世界的核心语言，从 DOM 操作到异步编程的所有笔记",
    "Python": "简洁优雅的语言，算法刷题、数据分析、自动化脚本",
    "React": "现代前端框架，组件化思维与状态管理的深度探索",
    "算法": "数据结构与算法，LeetCode 刷题记录与解题思路总结",
    "项目复盘": "个人项目从0到1的完整开发过程记录与经验教训",
    "工具": "提升效率的开发工具、编辑器配置和快捷技巧",
    "感悟": "学习路上的思考、方法论和心态建设",
    "前端": "HTML/CSS/JS 及前端工程化相关内容",
    "后端": "服务端开发、API 设计、数据库操作",
    "Node.js": "JavaScript 运行时环境，服务端开发实践",
    "CSS": "样式与布局，从基础到高级动效",
    "SQL": "结构化查询语言，数据库操作与性能优化",
    "TypeScript": "JavaScript 的类型超集，大型项目必备",
    "Git": "版本控制最佳实践与团队协作工作流",
    "全栈": "前后端贯通项目的开发经验",
    "学习方法": "高效学习技巧、知识管理与成长方法论",
  }
};
