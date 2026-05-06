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
    include: {
      appointments: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  // 全ステータスの定義
  const statusDefinitions = [
    { id: 'new', name: '新規リード', color: '#64748b' },
    { id: 'researching', name: '調査中', color: '#94a3b8' },
    { id: 'dm_ready', name: '準備完了', color: '#3b82f6' },
    { id: 'contacted', name: 'アプローチ済', color: '#60a5fa' },
    { id: 'replied', name: '返信あり', color: '#10b981' },
    { id: 'appointment', name: 'アポ獲得', color: '#f59e0b' },
    { id: 'won', name: '成約', color: '#059669' },
    { id: 'lost', name: '失注', color: '#ef4444' },
    { id: 'ng', name: 'NG', color: '#1e293b' },
  ];

  // ステータス別件数サマリーの取得 (フィルタ無しの全件)
  const statusCounts = await Promise.all(
    statusDefinitions.map(async (sd) => ({
      ...sd,
      count: await prisma.targetCompany.count({ where: { status: sd.id } })
    }))
  );
  const totalCount = await prisma.targetCompany.count();

  const industries = Array.from(new Set((await prisma.targetCompany.findMany({ select: { industry: true } })).map(t => t.industry)));

  // 日付判定用
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>ターゲット企業一覧</h1>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/targets/export" className="btn" style={{ border: '1px solid var(--border)' }}>📥 CSVエクスポート</Link>
            <Link href="/targets/import" className="btn" style={{ border: '1px solid var(--border)' }}>📤 CSVインポート</Link>
            <Link href="/targets/new" className="btn btn-primary">+ 新規登録</Link>
          </div>
        </div>

        {/* ステータスサマリー */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Link 
            href="/targets" 
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              padding: '0.75rem', 
              background: !resolvedSearchParams.status ? 'var(--primary-light)' : 'white', 
              borderRadius: '8px', 
              border: '1px solid var(--border)',
              textAlign: 'center',
              boxShadow: !resolvedSearchParams.status ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: '600' }}>すべて</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>{totalCount}</div>
          </Link>
          {statusCounts.map(sc => (
            <Link 
              key={sc.id}
              href={`/targets?status=${sc.id}`}
              style={{ 
                textDecoration: 'none', 
                color: 'inherit',
                padding: '0.75rem', 
                background: resolvedSearchParams.status === sc.id ? 'var(--primary-light)' : 'white', 
                borderRadius: '8px', 
                border: '1px solid var(--border)',
                textAlign: 'center',
                boxShadow: resolvedSearchParams.status === sc.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: sc.color }}>{sc.name}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>{sc.count}</div>
            </Link>
          ))}
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
          {resolvedSearchParams.status && <input type="hidden" name="status" value={resolvedSearchParams.status} />}
          <button type="submit" className="btn" style={{ fontSize: '0.875rem', padding: '0.4rem 1rem', border: '1px solid var(--border)', cursor: 'pointer' }}>絞り込み</button>
        </form>
      </header>

      <div className="card">
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem 0.5rem' }}>会社名 / ステータス</th>
                <th style={{ padding: '1rem 0.5rem' }}>最新商談メモ</th>
                <th style={{ padding: '1rem 0.5rem' }}>次回対応予定日</th>
                <th style={{ padding: '1rem 0.5rem' }}>最終更新</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {targets.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>ターゲットが登録されていません。</td></tr>
              ) : (
                targets.map((t) => {
                  const latestApp = t.appointments[0];
                  let dateLabel = "未設定";
                  let dateColor = "var(--text-muted)";
                  let dateBg = "transparent";

                  if (latestApp?.nextFollowUpDate) {
                    const nextDate = new Date(latestApp.nextFollowUpDate);
                    const nextDateOnly = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
                    
                    if (nextDateOnly < today) {
                      dateLabel = "⚠️ 期限超過";
                      dateColor = "#991b1b";
                      dateBg = "#fef2f2";
                    } else if (nextDateOnly.getTime() === today.getTime()) {
                      dateLabel = "⚡ 本日対応";
                      dateColor = "#92400e";
                      dateBg = "#fffbeb";
                    } else {
                      dateLabel = nextDateOnly.toLocaleDateString('ja-JP');
                      dateColor = "var(--text-main)";
                    }
                  }

                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{t.name}</div>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <span className={`badge badge-${t.status}`} style={{ fontSize: '0.7rem' }}>
                            {statusDefinitions.find(s => s.id === t.status)?.name || t.status}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.industry}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', maxWidth: '300px' }}>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: 'var(--text-dark)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.4'
                        }}>
                          {latestApp?.memo || <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>履歴なし</span>}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600',
                          color: dateColor,
                          background: dateBg,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          {dateLabel}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(t.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <Link href={`/targets/${t.id}`} className="btn" style={{ fontSize: '0.75rem', border: '1px solid var(--border)', background: 'white' }}>
                          詳細表示
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
