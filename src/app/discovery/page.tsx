import { prisma } from "@/lib/prisma";
import { generateSearchUrl } from "@/lib/discovery/url-generator";
import { promoteToTarget, updateCandidateStatus, deleteCandidate } from "./actions";
import Link from "next/link";

export default async function DiscoveryPage() {
  const candidates = await prisma.leadCandidate.findMany({
    include: { product: true, targetCompany: true },
    orderBy: { createdAt: 'desc' }
  });

  const productsWithQueries = await prisma.product.findMany({
    include: { searchQueries: true }
  });

  const PROMOTABLE_TYPES = ['company', 'facility', 'clinic', 'professional', 'association'];

  const typeLabels: Record<string, string> = {
    company: '企業',
    facility: '施設',
    clinic: '病院',
    professional: '専門職',
    influencer: 'インフル',
    media: 'メディア',
    association: '団体',
    referrer: '紹介者',
    unknown: '不明'
  };

  const statusLabels: Record<string, string> = {
    new: '新規',
    researching: '調査中',
    qualified: '有望',
    rejected: 'NG',
    promoted: '昇格済み',
    watchlist: 'ウォッチ'
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>ターゲット発掘</h1>
          <p style={{ color: 'var(--text-muted)' }}>SNSやWebから新しいリード候補を見つけ、選別します。</p>
        </div>
        <Link href="/discovery/new" className="btn btn-primary">+ 手動登録</Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
        {/* 左：検索ポータル */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>調査ポータル</h3>
            {productsWithQueries.map(p => (
              <div key={p.id} style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: '700', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>{p.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {p.searchQueries.map(sq => (
                    <a 
                      key={sq.id} 
                      href={generateSearchUrl(sq.platform, sq.query)} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ 
                        fontSize: '0.8125rem', 
                        color: 'var(--text-main)', 
                        textDecoration: 'none',
                        padding: '0.4rem 0.6rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{sq.label}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sq.platform} ↗</span>
                    </a>
                  ))}
                  {p.searchQueries.length === 0 && (
                    <Link href={`/products/${p.id}/search-queries`} style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>+ クエリを設定</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* 右：候補一覧 */}
        <main>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>リード候補リスト</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>名称 / アカウント</th>
                    <th>商材</th>
                    <th>種別</th>
                    <th>ステータス</th>
                    <th style={{ textAlign: 'right' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {c.platform}: {c.accountId || '-'}
                          {c.profileUrl && <a href={c.profileUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}>[URL ↗]</a>}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>{c.product.name}</td>
                      <td>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '0.1rem 0.4rem', 
                          borderRadius: '4px', 
                          background: '#f3f4f6',
                          color: '#4b5563'
                        }}>
                          {typeLabels[c.type] || c.type}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '600',
                          color: c.status === 'promoted' ? '#059669' : c.status === 'rejected' ? '#ef4444' : 'var(--text-main)'
                        }}>
                          {statusLabels[c.status] || c.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {c.status !== 'promoted' && c.status !== 'rejected' && (
                            <>
                              {PROMOTABLE_TYPES.includes(c.type) && (
                                <form action={promoteToTarget.bind(null, c.id)}>
                                  <button type="submit" className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#059669' }}>昇格</button>
                                </form>
                              )}
                              <form action={updateCandidateStatus.bind(null, c.id, 'rejected')}>
                                <button type="submit" className="btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid #fee2e2', color: '#ef4444' }}>NG</button>
                              </form>
                            </>
                          )}
                          {c.status === 'promoted' && c.targetCompanyId && (
                            <Link href={`/targets/${c.targetCompanyId}`} className="btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', border: '1px solid var(--primary)', color: 'var(--primary)' }}>詳細</Link>
                          )}
                          <form action={deleteCandidate.bind(null, c.id)} onSubmit={(e) => { if(!confirm('削除しますか？')) e.preventDefault(); }}>
                            <button type="submit" style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {candidates.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>候補はまだ登録されていません</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
