<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## AI開発作業ルール
- **作業手順**: 現状確認 → 計画提示 → 実装 → 検証 → 報告 の順序を厳守する。
- **範囲限定**: 指定された TASK 以外の作業は一切禁止。
- **品質維持**: 既存機能を壊さない。大規模なリファクタリングは行わない。
- **データ安全**: DB 変更・マイグレーションは禁止。
- **秘匿情報**: `.env`、API キー、認証情報には一切触れない。
- **Git操作**: 人間の明示的な承認があるまで `git add` / `git commit` / `git push` は禁止。
- **完了報告**: 作業完了時は、変更内容、変更ファイル、確認コマンド、残課題を詳細に報告する。
