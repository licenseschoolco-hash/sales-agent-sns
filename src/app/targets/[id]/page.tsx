import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TargetDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await prisma.targetAccount.findUnique({
    where: { id },
    include: {
      company: true,
      leadScores: {
        include: { product: true }
      },
      dmDrafts: {
        include: { product: true },
        orderBy: { createdAt: 'desc' }
      },
      outreachLogs: {
        include: { product: true },
        orderBy: { createdAt: 'desc' }
      },
      replies: {
        orderBy: { repliedAt: 'desc' }
      }
    }
  });

  if (!account) notFound();

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/targets" style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← ターゲット一覧に戻る
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>{account.displayName}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{account.company.name} ・ {account.platform}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a href={account.profileUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ border: '1px solid var(--border)' }}>
              SNSプロフィールを開く
            </a>
            <button className="btn btn-primary">DMを生成する</button>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <aside>
          <div className="card">
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>アカウント情報</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>バイオ</label>
              <p style={{ fontSize: '0.875rem' }}>{account.bio || '未設定'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>フォロワー数</label>
                <p>{account.followersCount?.toLocaleString() || '-'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>役職</label>
                <p>{account.role || '-'}</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>商材別スコアリング</h3>
            {account.leadScores.map((score) => (
              <div key={score.id} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600' }}>{score.product.name}</span>
                  <span style={{ fontWeight: '700', color: score.totalScore >= 80 ? 'var(--success)' : 'inherit' }}>{score.totalScore}点</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {score.scoreReason}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.7rem' }}>
                  <div>Profile: {score.profileScore}</div>
                  <div>Engagement: {score.engagementScore}</div>
                  <div>Need: {score.needScore}</div>
                  <div>Timing: {score.timingScore}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>DM・アウトリーチ履歴</h3>
            
            {account.dmDrafts.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>履歴がありません</p>
            )}

            {account.dmDrafts.map((draft) => (
              <div key={draft.id} style={{ marginBottom: '2rem', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--bg-main)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="badge badge-neutral" style={{ marginRight: '0.5rem' }}>v{draft.version}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{draft.product.name}</span>
                  </div>
                  <span className={`badge ${
                    draft.status === 'sent' ? 'badge-success' : 
                    draft.status === 'approved' ? 'badge-warning' : 'badge-neutral'
                  }`}>
                    {draft.status === 'sent' ? '送信済み' : 
                     draft.status === 'approved' ? '承認済み・待機' : '下書き'}
                  </span>
                </div>
                <div style={{ padding: '1rem', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                  {draft.body}
                </div>
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>生成: {draft.generatedBy} ({new Date(draft.createdAt).toLocaleDateString('ja-JP')})</span>
                  {draft.approvedAt && <span>承認: {new Date(draft.approvedAt).toLocaleDateString('ja-JP')}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>アポイント・返信</h3>
            {account.replies.map((reply) => (
              <div key={reply.id} style={{ marginBottom: '1rem', padding: '1rem', borderLeft: `4px solid ${reply.replyType === 'positive' ? 'var(--success)' : 'var(--border)'}`, background: 'var(--bg-main)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge badge-success">{reply.replyType}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(reply.repliedAt).toLocaleDateString('ja-JP')}</span>
                </div>
                <p style={{ fontSize: '0.9rem' }}>{reply.content}</p>
                {reply.nextAction && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary)' }}>
                    次回アクション: {reply.nextAction}
                  </div>
                )}
              </div>
            ))}
            {account.replies.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>返信履歴はありません</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
