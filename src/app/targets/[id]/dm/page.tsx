import { prisma } from "@/lib/prisma";
import { generateAndSaveDraft, updateDraftStatus, deleteDraft } from "./actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DmType } from "@/lib/dm/generator";

export default async function DmManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const target = await prisma.targetCompany.findUnique({
    where: { id },
    include: {
      leadScores: { include: { product: true } },
      dmDrafts: { include: { product: true }, orderBy: { createdAt: 'desc' } }
    }
  });

  if (!target) notFound();

  const dmTypes: { id: DmType; name: string }[] = [
    { id: 'initial', name: '初回DM' },
    { id: 'follow_up', name: '再送・フォロー' },
    { id: 'schedule', name: '日程調整' },
    { id: 'reactivation', name: '掘り起こし' },
  ];

  const statusLabels: Record<string, string> = {
    draft: '下書き',
    approved: '承認済み',
    needs_revision: '要修正',
    used: '送信済み',
    archived: 'アーカイブ',
  };

  async function handleCreate(formData: FormData) {
    "use server";
    const productId = formData.get("productId") as string;
    const type = formData.get("type") as DmType;
    const leadScoreId = formData.get("leadScoreId") as string || undefined;
    await generateAndSaveDraft(id, productId, type, leadScoreId);
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href={`/targets/${id}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← ターゲット詳細に戻る
        </Link>
        <h1>DMドラフト管理</h1>
        <p style={{ color: 'var(--text-muted)' }}>{target.name} 向けの営業文面を作成・管理します。</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* 左側：新規作成 */}
        <aside>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>新しくDMを生成</h3>
            <form action={handleCreate}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.4rem' }}>対象商材・スコア</label>
                <select name="leadScoreId" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'white' }}>
                  {target.leadScores.map(ls => (
                    <option key={ls.id} value={ls.id}>{ls.product.name} (スコア: {ls.totalScore})</option>
                  ))}
                  {target.leadScores.length === 0 && <option value="">まずスコア判定を行ってください</option>}
                </select>
                {/* 隠しフィールドで productId を送る */}
                {target.leadScores.length > 0 && (
                  <input type="hidden" name="productId" value={target.leadScores[0].productId} />
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.4rem' }}>DM種別</label>
                <select name="type" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'white' }}>
                  {dmTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={target.leadScores.length === 0}>
                テンプレートから生成
              </button>
            </form>
          </div>
        </aside>

        {/* 右側：一覧 */}
        <main>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>ドラフト一覧</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {target.dmDrafts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  ドラフトがありません。左のフォームから生成してください。
                </div>
              ) : (
                target.dmDrafts.map(draft => (
                  <div key={draft.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', background: 'var(--primary)', color: 'white', borderRadius: '4px' }}>
                          {dmTypes.find(t => t.id === draft.type)?.name}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{draft.product.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(draft.createdAt).toLocaleDateString('ja-JP')}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)' }}>
                        {statusLabels[draft.status]}
                      </div>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>件名: {draft.subject}</div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: 'var(--text-main)', 
                        whiteSpace: 'pre-wrap',
                        maxHeight: '150px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        {draft.body}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(transparent, white)' }}></div>
                      </div>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Link href={`/targets/${id}/dm/${draft.id}/edit`} className="btn" style={{ fontSize: '0.75rem', border: '1px solid var(--border)' }}>
                        編集する
                      </Link>
                      
                      <form action={async () => { "use server"; await updateDraftStatus(draft.id, id, 'approved'); }}>
                        <button type="submit" className="btn btn-primary" style={{ fontSize: '0.75rem' }}>承認</button>
                      </form>

                      <form action={async () => { "use server"; await deleteDraft(draft.id, id); }}>
                        <button type="submit" className="btn" style={{ fontSize: '0.75rem', border: '1px solid #fee2e2', color: '#ef4444' }}>削除</button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
