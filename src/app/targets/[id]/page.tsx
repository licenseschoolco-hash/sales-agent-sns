import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteTarget } from "../actions";

export default async function TargetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const target = await prisma.targetCompany.findUnique({
    where: { id },
    include: {
      accounts: true,
      leadScores: {
        include: { product: true },
        orderBy: { updatedAt: 'desc' }
      },
      dmDrafts: {
        where: { status: 'approved' },
        select: { id: true }
      },
      replies: { orderBy: { repliedAt: 'desc' }, take: 1 },
      appointments: { orderBy: { createdAt: 'desc' }, take: 1 },
      recruitmentReports: { orderBy: { createdAt: 'desc' } },
      sources: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!target) notFound();

  const deleteTargetWithId = deleteTarget.bind(null, id);

  const statuses: Record<string, string> = {
    new: '新規リード',
    researching: '調査中',
    dm_ready: '送信準備完了',
    contacted: 'アプローチ済み',
    replied: '返信あり',
    appointment: 'アポ獲得',
    won: '成約',
    lost: '失注',
    ng: 'NG',
  };

  const priorityColors: Record<string, string> = {
    S: '#ef4444',
    A: '#f59e0b',
    B: '#3b82f6',
    C: '#64748b',
  };

  const approvedDraftsCount = target.dmDrafts.length;
  const latestReply = target.replies[0];
  const latestAppointment = target.appointments[0];

  const sourceStatuses: Record<string, { label: string, color: string }> = {
    sns_only: { label: 'SNSのみ確認', color: '#64748b' },
    official_site_confirmed: { label: '公式サイト確認済', color: '#3b82f6' },
    recruitment_page_confirmed: { label: '採用ページ確認済', color: '#2563eb' },
    job_portal_confirmed: { label: '求人ポータル確認済', color: '#1d4ed8' },
    diagnosis_text_collected: { label: '診断本文取得済', color: '#8b5cf6' },
    human_verified: { label: '人間確認済み', color: '#f59e0b' },
    ready_to_contact: { label: '送信可', color: '#10b981' },
  };

  const sourceTypeLabels: Record<string, string> = {
    official_site: '🌐 公式サイト',
    recruitment_page: '📄 採用ページ',
    job_portal: '📦 求人ポータル',
    instagram: '📸 Instagram',
    x: '🐦 X (Twitter)',
    google_map: '📍 Googleマップ',
    contact_form: '✉️ 問い合わせフォーム',
    other: '🔗 その他',
  };

  const verificationStatusLabels: Record<string, { label: string, color: string }> = {
    pending: { label: '確認待ち', color: '#64748b' },
    verified: { label: '確認済み', color: '#10b981' },
    error: { label: 'エラー', color: '#ef4444' },
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/targets" style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← ターゲット一覧に戻る
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>{target.name}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={`badge badge-${target.status}`}>
                {statuses[target.status] || target.status}
              </span>
              {/* 情報源ステータスバッジ */}
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '0.125rem 0.5rem', 
                borderRadius: '9999px', 
                background: sourceStatuses[target.sourceStatus]?.color || '#64748b',
                color: 'white',
                fontWeight: '600'
              }}>
                {sourceStatuses[target.sourceStatus]?.label || target.sourceStatus}
              </span>
              {approvedDraftsCount > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>
                  ✓ 承認済みDM: {approvedDraftsCount}件
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href={`/targets/${id}/reports/new`} className="btn" style={{ border: '1px solid var(--primary)', color: 'var(--primary)', flex: 1, textAlign: 'center' }}>
                📋 診断レポート作成 (手動)
              </Link>
              <Link href={`/targets/${id}/reports/ai`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                🤖 AI自動診断 (本文貼付)
              </Link>
            </div>
            <Link href={`/targets/${id}/replies`} className="btn" style={{ border: '1px solid #059669', color: '#059669' }}>
              返信・商談管理
            </Link>
            <Link href={`/targets/${id}/dm`} className="btn" style={{ border: '1px solid var(--primary)', color: 'var(--primary)' }}>
              DM管理・作成
            </Link>
            <Link href={`/targets/${id}/score`} className="btn btn-primary">
              スコア判定
            </Link>
            <Link href={`/targets/${id}/edit`} className="btn" style={{ border: '1px solid var(--border)' }}>
              編集
            </Link>
            <form action={deleteTargetWithId}>
              <button type="submit" className="btn" style={{ border: '1px solid #fee2e2', color: '#ef4444' }}>削除</button>
            </form>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* メイン情報 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* スコア一覧 */}
          {target.leadScores.length > 0 && (
            <section className="card">
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>判定済みスコア</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {target.leadScores.map(ls => (
                  <div key={ls.id} style={{ display: 'flex', gap: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', alignItems: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '800', 
                      color: priorityColors[ls.priority] || 'var(--text-main)',
                      width: '40px',
                      textAlign: 'center'
                    }}>{ls.priority}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{ls.product.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{ls.reason}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{ls.totalScore}<span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>点</span></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>次回: {ls.nextAction}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 採用導線診断レポート */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>採用導線診断レポート</h3>
              <Link href={`/targets/${id}/reports/new`} style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                + 新規作成
              </Link>
            </div>
            {target.recruitmentReports.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', padding: '1rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                診断レポートはまだ作成されていません。
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {target.recruitmentReports.map(report => (
                  <Link 
                    key={report.id} 
                    href={`/targets/${id}/reports/${report.id}`}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.75rem 1rem', 
                      background: 'var(--bg-secondary)', 
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9375rem' }}>総合スコア: {report.totalScore}点</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>作成日: {new Date(report.createdAt).toLocaleDateString('ja-JP')}</div>
                    </div>
                    <div style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>レポートを表示 →</div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* 最新の活動状況 */}

          {(latestReply || latestAppointment) && (
            <section className="card">
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>最新の活動状況</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {latestReply && (
                  <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>最新の返信</div>
                    <div style={{ fontWeight: '600' }}>{latestReply.replyType}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(latestReply.repliedAt).toLocaleDateString('ja-JP')}</div>
                  </div>
                )}
                {latestAppointment && (
                  <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>最新の商談結果</div>
                    <div style={{ fontWeight: '600' }}>{latestAppointment.outcome}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{latestAppointment.amount ? `¥${latestAppointment.amount.toLocaleString()}` : '記録なし'}</div>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>解析済み情報源</h3>
              <Link href={`/targets/${id}/sources`} style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600' }}>
                ⚙️ 管理・追加
              </Link>
            </div>
            {target.sources.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', padding: '1rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                登録済みの情報源はまだありません。
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600' }}>ラベル / 種類</th>
                      <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600' }}>URL</th>
                      <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'center' }}>検証</th>
                      <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right' }}>確認日</th>
                    </tr>
                  </thead>
                  <tbody>
                    {target.sources.map(source => (
                      <tr key={source.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <div style={{ fontWeight: '600' }}>{source.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sourceTypeLabels[source.sourceType] || source.sourceType}</div>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <a href={source.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>
                            {source.url.length > 50 ? `${source.url.substring(0, 50)}...` : source.url}
                          </a>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '0.125rem 0.375rem', 
                            borderRadius: '4px', 
                            background: verificationStatusLabels[source.verificationStatus]?.color + '20',
                            color: verificationStatusLabels[source.verificationStatus]?.color,
                            border: `1px solid ${verificationStatusLabels[source.verificationStatus]?.color}40`,
                            whiteSpace: 'nowrap'
                          }}>
                            {verificationStatusLabels[source.verificationStatus]?.label || source.verificationStatus}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {source.lastVerifiedAt ? new Date(source.lastVerifiedAt).toLocaleDateString('ja-JP') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card">
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>企業詳細情報</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>業種</label>
                <p>{target.industry}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>地域</label>
                <p>{target.region || '-'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>担当者名</label>
                <p>{target.contactName || '-'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>電話番号</label>
                <p>{target.phone || '-'}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>メールアドレス</label>
                <p>{target.email || '-'}</p>
              </div>
            </div>
          </section>

          <section className="card">
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>URL・リンク</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Webサイト</label>
                {target.website ? <a href={target.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{target.website}</a> : '-'}
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>SNSプロファイル</label>
                {target.snsUrl ? <a href={target.snsUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{target.snsUrl}</a> : '-'}
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>求人ページ</label>
                {target.jobPageUrl ? <a href={target.jobPageUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{target.jobPageUrl}</a> : '-'}
              </div>
            </div>
          </section>

          <section className="card">
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>備考 / メモ</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{target.notes || '備考はありません。'}</p>
          </section>
        </div>

        {/* サイドバー：関連情報 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section className="card">
            <h3 style={{ marginBottom: '1rem' }}>SNSアカウント</h3>
            {target.accounts.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>連携済みアカウントなし</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {target.accounts.map(acc => (
                  <li key={acc.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: '600' }}>{acc.displayName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.platform}: {acc.accountId}</div>
                  </li>
                ))}
              </ul>
            )}
            <button className="btn" style={{ width: '100%', marginTop: '1rem', border: '1px solid var(--border)', fontSize: '0.875rem' }}>+ アカウントを追加</button>
          </section>

          <section className="card" style={{ background: 'var(--sidebar-bg)', color: 'white' }}>
            <h3 style={{ marginBottom: '1rem' }}>AI分析ステータス</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1rem' }}>
              現在、この企業の詳細解析は未実行です。
            </p>
            <button disabled className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', width: '100%', opacity: 0.5 }}>分析を開始 (近日公開)</button>
          </section>
        </div>
      </div>
    </div>
  );
}
