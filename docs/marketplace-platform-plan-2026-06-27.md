# cuerex Marketplace Platform Plan

Date: 2026-06-27

## Summary

cuerex Marketplace は、`cuerex-editor` の一部ではなく、独立した配布・申請・審査・公開基盤として扱う。

現時点の推奨分離:

```text
cuerex-editor
  - editor本体
  - テンプレートパックURLの取り込み
  - ローカルAPI
  - pack/catalog読み込み仕様

cuerex-marketplace
  - marketplace.cuerex.ai
  - Marketplace UI
  - catalog
  - pack metadata
  - creator upload/submission flow
  - Cloudflare Pages / Workers / R2 / D1 integration

cuerex-marketing
  - cuerex.ai公式サイト
  - LP/SEO/SNS/販売導線
  - marketplace.cuerex.ai への導線
```

`cuerex-marketing` にはMarketplaceの実体を置かず、マーケティング上の導線・説明・告知を置く。

## Domain Strategy

推奨ドメイン:

```text
https://marketplace.cuerex.ai
```

`https://cuerex.ai/marketplace` は公式サイト側の導線またはリダイレクトとして扱う。

将来のAPI:

```text
https://api.cuerex.ai
```

またはMarketplace専用に:

```text
https://marketplace.cuerex.ai/api/*
```

初期は後者でよい。将来、editor cloudや課金APIと統合する段階で `api.cuerex.ai` へ整理する。

## Current Publication State

Marketplaceは現時点では `Coming soon` 状態にする。

```text
catalog.status = "comingSoon"
item.status = "comingSoon"
```

Coming soon中は以下を無効にする:

- pack download
- pack URL copy
- install URL copy
- creator public submission
- purchase flow

UI上ではカタログの形と将来の導線だけ見せる。

## Astro And Cloudflare Pages

正式なMarketplaceとして育てる場合は、Astroを使うのがよい。

理由:

- Pack詳細ページを静的生成できる
- SEO/OGPに強い
- Coming soonから正式公開へ拡張しやすい
- Cloudflare Pagesとの相性がよい
- 将来のCreator DashboardをAstro + Pages Functionsへ拡張できる

初期のCloudflare Pages設定:

```text
Project name: cuerex-marketplace
Build command: npm run build
Build output directory: dist
Custom domain: marketplace.cuerex.ai
```

SSRやCloudflare adapterは、アップロード・認証・審査APIを入れる段階で検討する。

## Storage Design

アップロードされる実ファイルはGitリポジトリに置かない。

役割分担:

```text
D1 = 台帳
  誰が、いつ、どのファイルを、何の申請/パックとしてアップロードしたか

R2 = ファイル実体
  pack.json, preview画像, zip, 添付資料, assets
```

注: ユーザーが言及した「D2」は、おそらくCloudflare R2のこと。CloudflareのDBはD1、オブジェクトストレージはR2。

## R2 Bucket Strategy

最初は private/public の2バケットに分ける。

```text
cuerex-marketplace-private
  - 未審査アップロード
  - creator申請資料
  - draft pack
  - rejected pack

cuerex-marketplace-public
  - 承認済みpack
  - 公開preview
  - 公開catalog
```

R2 key例:

```text
private/applications/{applicationId}/{uploadId}/portfolio.pdf
private/uploads/{userId}/{uploadId}/raw/{filename}
private/submissions/{submissionId}/pack.json
private/submissions/{submissionId}/preview.png

public/packs/{packId}/{version}/pack.json
public/previews/{packId}/{version}/cover.webp
public/catalog/catalog.json
```

ユーザーが直接public bucketへアップロードする設計は避ける。

## Upload Flow

推奨フロー:

```text
1. User logs in
2. User requests upload init
3. Worker creates upload record in D1
4. Worker issues temporary upload URL or handles upload proxy
5. Browser uploads file to R2 private
6. Worker records R2 key, filename, size, content type, checksum
7. User submits creator application or pack submission
8. Worker validates schema and file constraints
9. Submission enters review queue
10. Admin approves/rejects
11. Approved files are copied from R2 private to R2 public
12. D1 pack_version status changes to published
13. catalog is regenerated or API response cache is invalidated
```

## D1 Data Model Draft

Minimum tables:

```sql
users
  id
  auth_provider
  auth_subject
  email
  display_name
  role
  created_at
  updated_at

creators
  id
  user_id
  display_name
  status
  created_at
  approved_at

creator_applications
  id
  user_id
  status
  message
  created_at
  submitted_at
  reviewed_at
  reviewed_by

uploads
  id
  user_id
  application_id
  submission_id
  r2_bucket
  r2_key
  filename
  content_type
  size_bytes
  sha256
  status
  created_at

packs
  id
  creator_id
  slug
  name
  description
  license
  access
  status
  created_at
  updated_at

pack_versions
  id
  pack_id
  version
  status
  private_pack_key
  public_pack_key
  preview_key
  created_at
  published_at

audit_logs
  id
  actor_user_id
  action
  target_type
  target_id
  metadata_json
  created_at
```

Status examples:

```text
creator_applications.status:
  draft, submitted, approved, rejected

uploads.status:
  initialized, uploaded, scanning, accepted, rejected, published

packs.status:
  draft, in_review, approved, published, suspended

pack_versions.status:
  draft, submitted, approved, published, rejected, revoked
```

## Authentication Strategy

CloudflareにはCloudflare Accessがある。

Cloudflare Accessは、アプリの前段に認証レイヤーを置き、Google/GitHub/OIDC/SAML/OTPなどのIdPでログインさせられる。Accessはリクエストに `Cf-Access-Jwt-Assertion` を付与し、Worker側でJWTを検証できる。

ただしAccessは、一般消費者向けのフル機能アカウント管理というより、保護されたアプリ、管理画面、招待制ユーザー向けに向いている。

## Recommended Auth Phases

### Phase 1: 招待制Creator申請

初期はCloudflare Accessで十分。

```text
Protected paths:
  /creator/*
  /upload/*
  /admin/*

Identity:
  Google
  GitHub
  One-time PIN

App side:
  Worker validates Access JWT
  D1 users に upsert
  D1 creator_applications に申請保存
```

メリット:

- 早い
- Cloudflare内で完結しやすい
- 管理者/招待制Creatorに向く
- パス単位で保護しやすい

制約:

- 一般ユーザー向けプロフィール/購入履歴/販売者管理には弱い
- Marketplace内の細かいUXは作り込みにくい

### Phase 2: 一般登録制

一般ユーザーが自由に登録し、購入履歴やCreatorプロフィールを持つ段階では外部Authを使う。

候補:

```text
Clerk
Auth0
Supabase Auth
Firebase Auth
```

方針:

```text
Auth provider:
  login
  email verification
  OAuth
  session
  MFA if needed

D1:
  user profile
  creator role
  application status
  upload ownership
  purchase/license metadata
```

パスワード認証をD1上に自前実装するのは避ける。

## Creator Application Flow

初期のCreator申請:

```text
1. User accesses /creator/apply
2. Cloudflare Access login
3. Worker validates JWT
4. D1 users upsert
5. User fills application form
6. Optional portfolio files upload to R2 private
7. D1 creator_applications.status = submitted
8. Admin reviews in /admin/applications
9. approved -> creators.status = approved
10. User can submit packs
```

審査項目:

- identity/email
- creator display name
- portfolio URL
- sample pack
- rights confirmation
- payout readiness, later

## Pack Submission Flow

```text
1. Approved creator opens /creator/packs/new
2. Uploads pack.json, preview, optional assets
3. Worker stores files to R2 private
4. Worker validates template-pack schema
5. Worker computes checksum
6. D1 pack_versions.status = submitted
7. Admin review
8. If approved, copy to R2 public
9. Update D1 status
10. Update catalog
```

## Catalog Strategy

Coming soon/MVP:

```text
public/catalog.json
```

After upload system:

```text
D1 is source of truth
Worker generates /api/catalog
Cloudflare cache is used for public reads
Optionally write static catalog snapshot to R2 public
```

Recommended public URL:

```text
https://marketplace.cuerex.ai/catalog.json
```

Long term, this can be backed by Worker-generated JSON rather than a static file.

## Security Notes

- Upload to private R2 only
- Never trust client-provided content type
- Validate JSON schema server-side
- Limit file size by type
- Compute checksum server-side
- Store upload ownership in D1
- Require creator approval before pack submission
- Require admin approval before public copy
- Add Turnstile to public application forms
- Keep audit logs for review actions
- Do not distribute high-value paid prompt bodies

## Paid Template Protection

If the prompt itself is the product value, do not distribute it as a downloadable pack.

Protection levels:

```text
Free:
  downloadable pack

Low-price paid:
  encrypted pack + license checks
  not strong protection

High-value paid:
  cloud application only
  prompt body remains server-side
```

Cloud application model:

```text
User sends:
  templateId
  project JSON

Cloud side:
  loads private template
  applies AI planner

User receives:
  validated edit operations or updated Project JSON
```

## Near-Term Build Order

1. Keep Marketplace public UI in Coming soon.
2. Migrate static UI to Astro.
3. Add D1 schema and migrations.
4. Add R2 private/public buckets.
5. Add Cloudflare Access for `/creator/*` and `/admin/*`.
6. Add Worker/Pages Functions API:
   - `/api/me`
   - `/api/uploads/init`
   - `/api/uploads/complete`
   - `/api/creator/applications`
   - `/api/admin/applications`
7. Add creator application form.
8. Add admin review screen.
9. Add pack submission flow.
10. Add public catalog generation.

## Open Questions

- Which IdP should be used first for Access: Google, GitHub, One-time PIN, or all?
- Should creator applications be invite-only at first?
- Should public catalog be static R2 JSON or Worker-generated JSON?
- Should paid creator payouts be in scope before public creator uploads?
- Which file types are allowed in v1: JSON, PNG/WebP, ZIP?
- Maximum upload size per file and per creator?

## Current Recommendation

Use this stack first:

```text
Frontend:
  Astro on Cloudflare Pages

Auth v1:
  Cloudflare Access for invite-only creator/admin areas

Metadata:
  Cloudflare D1

Files:
  Cloudflare R2 private/public buckets

Bot protection:
  Cloudflare Turnstile on public forms

Uploads:
  Worker/Pages Functions controlled upload flow
```

Move to external Auth only when Marketplace needs open registration, purchase history, creator profiles, and customer-facing account UX.
