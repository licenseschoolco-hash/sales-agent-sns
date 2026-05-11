import { createTarget } from "../actions";
import Link from "next/link";
import {
  TARGET_STATUS_VALUES,
  getTargetStatusMeta,
} from "@/lib/constants/statuses";

export default function NewTargetPage() {
  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/targets" style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← ターゲット一覧に戻る
        </Link>
        <h1>ターゲット企業登録</h1>
      </header>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form action={createTarget}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>会社名</label>
              <input name="name" type="text" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>業種</label>
              <input name="industry" type="text" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>地域</label>
              <input name="region" type="text" placeholder="例: 東京都, 大阪府" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>担当者名</label>
              <input name="contactName" type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>SNS URL</label>
            <input name="snsUrl" type="url" placeholder="https://x.com/..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>WebサイトURL</label>
              <input name="website" type="url" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>求人ページURL</label>
              <input name="jobPageUrl" type="url" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>電話番号</label>
              <input name="phone" type="tel" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>メール</label>
              <input name="email" type="email" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>ステータス</label>
            <select name="status" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}>
              {TARGET_STATUS_VALUES.map((v) => {
                const meta = getTargetStatusMeta(v);
                const labelOverrides: Record<string, string> = {
                  dm_ready: "送信準備完了",
                  contacted: "アプローチ済み",
                };
                const label = labelOverrides[v] ?? meta.label;
                return (
                  <option key={v} value={v}>
                    {label} ({v})
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>メモ</label>
            <textarea name="notes" rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit' }}></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Link href="/targets" className="btn" style={{ border: '1px solid var(--border)' }}>キャンセル</Link>
            <button type="submit" className="btn btn-primary">企業を登録する</button>
          </div>
        </form>
      </div>
    </div>
  );
}
