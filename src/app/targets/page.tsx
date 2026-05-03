import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TargetListPage({ searchParams }: { searchParams: Promise<{ industry?: string; status?: string }> }) {
  const resolvedSearchParams = await searchParams;
  
  const where: { industry?: string; status?: string } = {};
  if (resolvedSearchParams.industry) where.industry = resolvedSearchParams.industry;
  if (resolvedSearchParams.status) where.status = resolvedSearchParams.status;

  const targets = await prisma.targetCompany.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const industries = Array.from(new Set((await prisma.targetCompany.findMany({ select: { industry: true } })).map(t => t.industry)));
  const statuses = [
    { id: 'new', name: '新規リード' },
    { id: 'researching', name: '調査中' },
    { id: 'dm_ready', name: '準備完了' },
    { id: 'contacted', name: 'アプローチ済' },
    { id: 'replied', name: '返信あり' },
    { id: 'appointment', name: 'アポ獲得' },
  ];

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>ターゲット企業一覧</h1>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/targets/export" className="btn" style={{ border: '1px solid var(--border)' }}>📥 CSVエクスポート</Link>
            <Link href="/targets/import" className="btn" style={{ border: '1px solid var(--border)' }}>📤 CSVインポート</Link>
            <Link href="/targets/new" className="btn btn-primary">+ 新規登録</Link>
          </div>
        </div>

        <form method="GET" action="/targets" className="card" style={{ padding: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>業種:</span>
            <select 
              name="industry"
              defaultValue={resolvedSearchParams.industry || ''}
              style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'white' }}
            >
              <option value="">すべて</option>
              {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>ステータス:</span>
            <select 
              name="status"
              defaultValue={resolvedSearchParams.status || ''}
              style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'white' }}
            >
              <option value="">すべて</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn" style={{ fontSize: '0.875rem', padding: '0.4rem 1rem', border: '1px solid var(--border)', cursor: 'pointer' }}>絞り込み</button>
        </form>
      </header>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>会社名 / 担当者</th>
                <th>業種 / 地域</th>
                <th>ステータス</th>
                <th>連絡先 / SNS</th>
                <th>登録日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {targets.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>ターゲットが登録されていません。</td></tr>
              ) : (
                targets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{t.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t.contactName || '-'}</div>
                    </td>
                    <td>
                      <div>{t.industry}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t.region || '-'}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${t.status}`}>
                        {statuses.find(s => s.id === t.status)?.name || t.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>{t.email || '-'}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                        {t.snsUrl ? <a href={t.snsUrl} target="_blank" rel="noreferrer">SNS 🔗</a> : '-'}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {new Date(t.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td>
                      <Link href={`/targets/${t.id}`} className="btn" style={{ fontSize: '0.75rem', border: '1px solid var(--border)' }}>
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
