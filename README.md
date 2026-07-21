# 仙路服装网站 MVP（小白可维护版）

这是根据你《澳洲仙路服装网站项目总体策划书》搭的**第一版可运行网站**。
技术栈用了策划书推荐的 **Next.js**，但把复杂的数据库/CMS 换成了**文件存储**，
目的是让你这个小白也能在本地跑起来、在网页后台加产品、并学会长期维护。

> 对应策划书阶段：第一阶段 MVP（产品展示、购物车、Stripe 付款、Logo 上传、后台 CMS、SEO 基础）。

---

## 1. 先装两样东西（一次性）

- **Node.js（LTS 版）**：让网站能运行的程序。→ https://nodejs.org （下 LTS，一路下一步）
- **VS Code**：看代码、改文件的编辑器。→ https://code.visualstudio.com

装完后，打开终端（Mac 用"终端"，Windows 用 PowerShell），输入 `node -v` 能看到版本号就成功了。

---

## 2. 把网站跑起来（本地预览）

```bash
cd xianlu-workwear
cp .env.example .env.local      # 先不改也能跑（没配 Stripe 会走"演示模式"）
npm install                     # 安装依赖，第一次较慢
npm run dev                     # 启动
```

然后浏览器打开 **http://localhost:3000** 就能看到网站了。

---

## 3. 逛一遍网站（理解每个页面）

| 地址 | 作用 |
|------|------|
| `/` | 首页：横幅 + 分类入口 + 热门产品 |
| `/products` | 产品列表；`/products?cat=HiVis` 按分类筛选 |
| `/products/xxx` | 产品详情：选颜色/尺码/数量 → 加入购物车 |
| `/cart` | 购物车：改数量、删除 |
| `/checkout` | 结账：填收货信息 + **上传 Logo** + 付款 |
| `/admin` | 后台：登录后新增/编辑/删除产品（口令见下） |

后台口令 = `.env.local` 里的 `ADMIN_PASSWORD`，默认是 `change-me`（上线前务必改复杂）。

---

## 4. 你日常主要做这些维护

- **加 / 改 / 删产品**：浏览器开 `/admin` 登录后操作。数据实际存在 `data/products.json`。
- **换真实产品图**：后台编辑产品时点「📷 选择图片上传」直接选本地照片，自动存到 `public/images/products/`，跟着仓库一起同步给团队。
- **改品牌名 / SEO 文案**：`src/app/layout.tsx`。
- **改主题色**：`tailwind.config.ts` 里的 `brand` 颜色。

---

## 5. 接 Stripe 真实收款（你有 ABN，能注册）

1. 打开 https://dashboard.stripe.com 注册，国家选 **Australia**，填你的 **ABN**。
2. 左侧 **Developers → API keys**，复制 Test 模式的：
   - Publishable key（`pk_test_...`）
   - Secret key（`sk_test_...`）
3. 粘贴进 `.env.local`：
   ```
   STRIPE_SECRET_KEY=sk_test_xxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   ```
4. 重启 `npm run dev`。结账时用**测试卡**：`4242 4242 4242 4242`，日期选未来，CVC 任意。
   （Test 模式不会真扣钱；正式营业再换成 Live key。）

---

## 6. 准备你的素材（来自策划书）

- **产品照片**：`workwear.pdf` 是 39 页画册（图片型，无文字）。把每件衣服截成单品图，
  可用 PDF 预览器逐页截图，或让我帮你用脚本批量导出页面为图片。
- **Logo**：公司标识文件（PNG / SVG）。
- **ABN**：你已具备。
- **Stripe**：见第 5 节。

---

## 7. 上线给别人访问（部署）

推荐 **Vercel**（免费、对 Next.js 最友好）：

1. 把本文件夹推到 GitHub。
2. 在 https://vercel.com 用 GitHub 登录，导入这个仓库。
3. 在 Vercel 后台 **Environment Variables** 里，把 `.env.local` 的每一项原样填进去。
4. 点 Deploy，几秒后得到一个 `xxx.vercel.app` 网址。
   之后每次改完代码推送到 GitHub，Vercel 自动重新部署。

（备选：**Render** + Cloudflare CDN，对应策划书的部署建议。）

---

## 8. 后续升级路线（对齐策划书）

- 现在产品存在 JSON 文件；以后可换 **PostgreSQL + Prisma**（类型安全数据库）。
- 图片可换 **Cloudflare R2**（策划书建议的存储）。
- 后台可升级为 **Headless CMS**（Strapi / Directus）。
- 接 **Stripe Webhook** 确认付款、用 **Resend** 发邮件通知。
- 逐步加 AI：AI 客服、AI 自动报价、AI Logo 预览（策划书第十一节）。

---

## 9. 三人协作与回滚指南（团队共享）

本仓库是**私有仓库**，三位成员（Robin / 仙路 `danjin111` / James `jiangpei555`）都有**写权限**。

### 9.1 第一次拿到项目（克隆）
```bash
git clone https://github.com/robin12300-SnailAI/xianlu-workwear.git
cd xianlu-workwear
cp .env.example .env.local     # 必须自己建 .env.local（含后台口令），它不会随仓库下发
npm install
npm run dev
```
> ⚠️ `.env.local` 含后台口令，**不会**上传到仓库。每人克隆后都要自己 `cp .env.example .env.local` 并填好 `ADMIN_PASSWORD`。

### 9.2 日常改完 → 同步给团队
```bash
git add -A
git commit -m "做了什么改动"
git push origin main
```
其他人拉取你的改动：
```bash
git pull origin main
```

### 9.3 回滚（改错了能撤）
- 看历史：`git log --oneline`
- 撤销某次提交（保留记录，推荐）：`git revert <commit号>` 然后 `git push`
- 整文件回到某个历史版本：`git checkout <commit号> -- 路径/文件名`
- 误删本地未提交文件：`git checkout -- 路径/文件名`

### 9.4 协作约定（避免三人互相覆盖）
- 改之前先 `git pull` 拉最新。
- 产品数据 `data/products.json` 是共享的，**后台改完记得 commit + push**，否则别人看不到你的改动。
- 大图直接后台上传（已自动存进仓库 `public/images/products/`），不用手动传图床。
- 真有冲突时，用 **Pull Request（PR）** 让另一人 review 后再合并，更安全。

---

## 目录结构速览

```
xianlu-workwear/
├── src/app/            # 页面（首页/产品/详情/购物车/结账/后台/API）
├── src/components/     # 可复用组件（购物车、加购、后台等）
├── src/lib/            # 数据读写（products.ts / orders.ts / types.ts）
├── data/
│   ├── products.json   # ★ 你的产品库（后台改的就是它）
│   └── orders.json     # 订单记录
├── public/uploads/     # 顾客上传的 Logo
├── .env.example        # 环境变量模板（复制成 .env.local 填写）
└── README.md
```
