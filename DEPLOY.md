# 📦 「小唐学编程的记录」部署指南

让你的博客公开可访问，任何人都能通过网址打开浏览。

---

## 🚀 方案一：GitHub Pages（免费，推荐）

### 第一步：将博客上传到 GitHub

1. 注册 [GitHub](https://github.com) 账号（已有则跳过）
2. 新建仓库，名称建议：`tangziqi-blog` 或 `my-blog`
3. 将 `blog/` 文件夹里的所有文件上传到仓库根目录

   ```
   index.html
   article.html
   tags.html
   about.html
   admin.html
   styles/
   scripts/
   images/
   ```

   > 提示：可以用 [GitHub Desktop](https://desktop.github.com/) 图形界面操作，无需命令行。

### 第二步：开启 GitHub Pages

1. 进入仓库 → **Settings** → 左侧菜单找 **Pages**
2. Source 选 `Deploy from a branch`
3. Branch 选 `main`，文件夹选 `/ (root)`
4. 点击 **Save**

### 第三步：访问你的博客

GitHub 会给你一个网址，格式为：

```
https://你的用户名.github.io/仓库名/
```

例如：`https://tangziqi.github.io/tangziqi-blog/`

等待约 1-3 分钟生效。

---

## 🌐 方案二：Netlify（更简单，支持拖拽部署）

1. 访问 [netlify.com](https://netlify.com) 并注册账号
2. 点击 **Add new site** → **Deploy manually**
3. **将整个 `blog/` 文件夹拖拽到页面上**
4. 等待约 30 秒，Netlify 自动给你分配一个网址

   例如：`https://silly-panda-123.netlify.app`

5. 可在 **Site settings → Domain management** 自定义域名或修改随机子域名

---

## 🔧 方案三：Vercel（速度快，支持 Git 联动）

1. 访问 [vercel.com](https://vercel.com) 并用 GitHub 账号登录
2. 点击 **New Project** → 导入你的 GitHub 仓库
3. 框架选 **Other**，输出目录留空
4. 点击 **Deploy**，完成！

---

## 📝 博客内容更新方式

### 方式一：通过编辑器发布（最方便）

1. 打开博客首页，点击导航栏 **✏️ 写文章**
2. 在编辑器中写作（支持 Markdown + 代码高亮）
3. 填写标题、标签，点击 **🚀 发布博客**
4. 文章会保存到浏览器 `localStorage`，**立即在首页可见**

> ⚠️ 注意：localStorage 存储在你的浏览器里，换电脑/换浏览器后不可见。若想持久保存，参考下面的「永久保存」方式。

### 方式二：直接修改 `scripts/data.js`（永久保存）

打开 `scripts/data.js`，在 `articles` 数组的最前面添加新文章：

```javascript
{
  id: "my-new-article",          // 唯一 ID（英文+数字+连字符）
  title: "我的新文章标题",
  excerpt: "文章简介，显示在卡片上",
  date: "2026-04-17",            // 发布日期
  readTime: 5,                   // 阅读时间（分钟）
  tags: ["JavaScript", "感悟"], // 标签数组
  thumbnail: null,
  thumbColor: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
  thumbEmoji: "💡",
  featured: false,
  content: `
# 文章标题

这里写正文，支持完整 Markdown 格式。

\`\`\`javascript
// 代码示例
console.log('Hello!');
\`\`\`
  `
},
```

然后把修改后的文件重新上传到 GitHub/Netlify 即可生效。

---

## 🎨 自定义配置

在 `scripts/data.js` 顶部的 `siteConfig` 区域修改博客设置：

```javascript
siteConfig: {
  title: "小唐学编程的记录",   // 博客标题
  subtitle: "用文字记录每一段成长的代码旅程",
  logo: "📖",
},
```

在 `author` 区域修改个人信息：

```javascript
author: {
  name: "唐子琪",
  github: "https://github.com/你的用户名",
  email: "你的邮箱@example.com",
  ...
}
```

---

## ❓ 常见问题

**Q：部署后文章为什么没有更新？**  
A：GitHub Pages 有缓存，通常等待 1-5 分钟即可。强制刷新浏览器（Ctrl+Shift+R）也有帮助。

**Q：手机能正常浏览吗？**  
A：博客全站响应式设计，手机、平板、电脑均适配。

**Q：可以绑定自己的域名吗？**  
A：可以。GitHub Pages 和 Netlify 都支持自定义域名，在各自的域名设置里添加即可。

**Q：如何让所有人都能评论？**  
A：当前评论区为静态演示。若需真实评论，可接入 [Giscus](https://giscus.app/)（基于 GitHub Discussions，免费）或 [Disqus](https://disqus.com/)。

---

*博客版本：v1.0 · 作者：唐子琪 · 构建日期：2026-04-17*
