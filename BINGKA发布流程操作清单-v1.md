# BINGKA 发布流程操作清单 v1

## 1. 方案名称与目标

### 方案名称
- `Upstream/Fork 双仓协作 + Cloudflare Pages Preview/Production 双环境发布`

### 目标
- 持续同步官方更新，不丢失 Bingka 定制能力。
- 所有改动先预览、后生产，降低线上风险。
- 对外统一 API 入口，避免前端直连真实后端域名。

---

## 2. 当前仓库角色定义

### Git 远程角色
- `upstream`：官方上游仓库（用于同步官方更新）。
- `origin`：Bingka 自有仓库（用于业务定制与上线发布）。

### 分支角色（建议固定）
- `merge-upstream`：生产稳定基线分支。
- `bingka-theme`：功能开发与 UI 定制分支。

---

## 3. Cloudflare Pages 环境逻辑

### 核心规则
- 顶级域名 `frontend-test1.pages.dev` 只指向 `Production branch`。
- 非生产分支每次 push 会生成独立预览地址（哈希子域名）。

### 这意味着
- 你在 `bingka-theme` 的最新提交会自动出现在 Preview。
- 只有以下两种操作会更新顶级生产域名：
1. 把 `bingka-theme` 合并到生产分支（如 `merge-upstream`）。
2. 把 Cloudflare 的 `Production branch` 改成 `bingka-theme`。

---

## 4. API 接入标准（当前最终版）

### 对外访问路径
- 浏览器统一访问：`/flow/v1/...`

### 边缘转发
- Cloudflare Functions 接口层：`functions/flow/[[path]].ts`
- 转发目标：`API_BASE_URL`（例如 `https://api.bingka.net`）

### 约束
- 不再使用旧的对外 `/v1` 入口。
- 不建议前端继续配置 `VITE_API_BASE_URL=https://api.bingka.net` 直连。

---

## 5. Cloudflare Pages 标准配置（生产与预览都建议一致）

### Build 配置
- `Framework preset`: `None`
- `Build command`: `bun --filter ppanel-user-web build`
- `Build output directory`: `apps/user/dist`
- `Root directory`: 留空（仓库根目录）

### 环境变量
- `API_BASE_URL=https://api.bingka.net`
- `VITE_API_PREFIX=/flow`
- `VITE_CDN_URL=https://cdn.jsdmirror.com`
- `VITE_TUTORIAL_DOCUMENT=true`
- `VITE_SHOW_LANDING_PAGE=true`
- `BUN_VERSION=1.3.1`

### 不应配置
- `VITE_API_BASE_URL=https://api.bingka.net`

---

## 6. 日常开发到上线的标准流程

### A. 开发阶段（Dev）
1. 在 `bingka-theme` 开发、联调和自测。
2. 本地构建验证：`bun --filter ppanel-user-web build`。
3. push 到 `origin/bingka-theme`。

### B. 预览验收阶段（Preview）
1. 打开最新 Preview 子域名。
2. 验证核心页面：首页、登录、我的面板、邀请、套餐购买、订单页。
3. 验证 API 入口：`/flow/v1/common/site/config` 可返回 JSON。

### C. 生产发布阶段（Prod）
1. 方案一（更规范）：将 `bingka-theme` 合并到 `merge-upstream`。
2. 方案二（更快）：Cloudflare 直接把 `Production branch` 改为 `bingka-theme`。
3. 生产发布后立即执行生产验收清单。

### D. 回滚阶段（Rollback）
1. Pages -> Deployments -> 选择上一个稳定部署 -> Rollback。
2. 记录回滚原因与时间点，进入问题修复分支。

---

## 7. 生产验收清单（必须逐项过）

1. 顶级域名打开正常，无空白页。
2. `https://<生产域名>/flow/v1/common/site/config` 返回成功。
3. 未登录访问“我的面板/我的邀请”会提示并跳转登录页。
4. 套餐列表可见，套餐选择与下单流程正常。
5. 订单支付状态页跳转路径正确。
6. 中英文关键文案切换正常（导航、登录、套餐、支付）。
7. 控制台无明显跨域报错与 5xx 高发接口。

---

## 8. 同步官方更新标准流程（Upstream Sync）

1. 拉取官方更新：
   - `git fetch upstream`
2. 切到稳定基线：
   - `git checkout merge-upstream`
3. 合并官方主线（按你实际上游分支替换）：
   - `git merge upstream/main`
4. 解决冲突并构建验证。
5. 合并到 `bingka-theme` 做 Bingka 主题兼容。
6. 走 Preview 验收后再发布生产。

---

## 9. 推荐治理规则（团队版）

- 生产变更必须经过 Preview 验收。
- API 前缀、构建参数、环境变量统一维护在文档，不口头传递。
- 每次上线都要保留“提交号 + 部署号 + 验收记录”。
- 禁止在生产分支直接做未评审实验性改动。

---

## 10. 当前阶段执行计划（你现在就按这个走）

### P0（今天）
1. 用最新 Preview 地址完成一轮全链路验收。
2. 确认是否将 `bingka-theme` 作为生产分支，或走合并发布。
3. 生产环境变量做一次完整核对。

### P1（本周）
1. 完成正式发布与回滚演练各 1 次。
2. 补充 Cloudflare WAF/Rate Limit 基础规则。
3. 形成固定发布模板（提交号、发布人、验收人、结果）。

### P2（下周）
1. 建立上游同步节奏（每周或双周）。
2. 把分支策略写入仓库 README/内部 SOP。
3. 完成一次“上游更新 -> 预览 -> 生产”的闭环演习。

