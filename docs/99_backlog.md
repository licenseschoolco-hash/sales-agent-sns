# プロジェクト・バックログ (技術的負債・運用方針)

本プロジェクトの開発過程で発生した暫定対応や、今後の運用に関する決定事項を記録します。

## 1. 技術的負債と今後の修正予定

### ターゲット一覧のフィルタ機能 (src/app/targets/page.tsx)
- **現状**: Server Component 内で `select` の `onChange` に文字列 JS を注入しており、TypeScript エラー回避のために `any` キャストと `eslint-disable-next-line` を使用しています。
- **修正案**: 
    - ターゲット管理の本格実装時に、標準的な HTML `form` による submit 方式、または `use client` を使用した Client Component による `useRouter` 方式で正式に修正する。

### データベースファイルの管理 (prisma/dev.db)
- **現状**: `prisma/dev.db` がコミットに含まれています。
- **対応検討**: 小規模なローカル検証用としては便利ですが、今後のチーム開発やデプロイを考慮し、`.gitignore` に追加して管理から外すか検討が必要です。

## 2. 運用・検証ルール

### 検証プロセスの変更
- **ブラウザ自動検証の禁止**: ブラウザエージェントによる自動操作（Playwright等）は Waiting 状態になりやすく、効率が低下するため、今後は**禁止**とします。
- **標準検証フロー**: 
    - `npm run lint`
    - `npm run build`
    - `npx prisma validate`
    - `npx prisma generate`
    - これらのコマンドによる静的解析とコンパイル確認を必須とします。

### データベース操作の安全性
- **破壊的操作の事前確認**: 以下の操作を行う際は、開発初期であっても必ず実行前にユーザーの確認を取ること。
    - `DELETE FROM` / `DROP TABLE` 等のSQL実行
    - `npx prisma migrate reset`
    - `rm prisma/dev.db` 等の物理削除
    - `seed` による既存データの上書き・リセット
- **理由**: 開発中のテストデータであっても、勝手に削除されると検証作業に支障が出るため。

## 3. 環境構成の固定
- **Prisma バージョン**: 安定性の理由から **v6.2.1** を使用しています。
- **Prisma Config**: `prisma.config.ts` は v6 と競合するため、`.bak` として退避済みです。
