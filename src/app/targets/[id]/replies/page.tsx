import { prisma } from "@/lib/prisma";
import { createReply, createAppointment } from "./actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  APPOINTMENT_OUTCOME_VALUES,
  getAppointmentOutcomeMeta,
} from "@/lib/constants/statuses";

export default async function SalesProcessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const target = await prisma.targetCompany.findUnique({
    where: { id },
    include: {
      leadScores: { include: { product: true } },
      dmDrafts: { where: { status: 'approved' } },
      replies: { include: { product: true }, orderBy: { repliedAt: 'desc' } },
      appointments: { include: { product: true }, orderBy: { createdAt: 'desc' } }
    }
  });

  if (!target) notFound();

  const replyTypes = [
    { id: 'interested', name: '興味あり' },
    { id: 'detail_requested', name: '詳細希望' },
    { id: 'schedule_requested', name: '日程調整中' },
    { id: 'not_now', name: '時期尚早' },
    { id: 'no_budget', name: '予算なし' },
    { id: 'has_vendor', name: '他社利用中' },
    { id: 'rejected', name: 'お断り' },
    { id: 'no_reply', name: '返信なし' },
  ];

  // 商談結果の定義（statuses.ts から一元生成）
  const outcomes = APPOINTMENT_OUTCOME_VALUES.map((v) => {
    const meta = getAppointmentOutcomeMeta(v);
    return { id: meta.value, name: meta.label };
  });

  async function handleReplySubmit(formData: FormData) {
    "use server";
    await createReply({
      targetCompanyId: id,
      productId: formData.get("productId") as string || undefined,
      dmDraftId: formData.get("dmDraftId") as string || undefined,
      replyType: formData.get("replyType") as string,
      content: formData.get("content") as string,
      nextAction: formData.get("nextAction") as string,
      nextFollowUpDate: formData.get("nextFollowUpDate") as string || undefined,
    });
  }

  async function handleAppointmentSubmit(formData: FormData) {
    "use server";
    await createAppointment({
      targetCompanyId: id,
      productId: formData.get("productId") as string || undefined,
      replyId: formData.get("replyId") as string || undefined,
      scheduledAt: formData.get("scheduledAt") as string || undefined,
      outcome: formData.get("outcome") as string,
      amount: Number(formData.get("amount")) || undefined,
      nextFollowUpDate: formData.get("nextFollowUpDate") as string || undefined,
      memo: formData.get("memo") as string,
    });
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href={`/targets/${id}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← ターゲット詳細に戻る
        </Link>
        <h1>返信・商談管理</h1>
        <p style={{ color: 'var(--text-muted)' }}>{target.name} とのやり取りと進捗を記録します。</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* 左カラム：返信・活動登録 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>返信の記録</h3>
            <form action={handleReplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>商材</label>
                <select name="productId" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'white' }}>
                  <option value="">選択してください</option>
                  {target.leadScores.map(ls => <option key={ls.id} value={ls.productId}>{ls.product.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>返信分類</label>
                <select name="replyType" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'white' }}>
                  {replyTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>返信内容・メモ</label>
                <textarea name="content" rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}></textarea>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>次回アクション</label>
                  <input name="nextAction" type="text" placeholder="例: 資料送付" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>次回追客日</label>
                  <input name="nextFollowUpDate" type="date" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>返信を登録</button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>履歴</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {target.replies.map(r => (
                <div key={r.id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                      {replyTypes.find(t => t.id === r.replyType)?.name}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {new Date(r.repliedAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>{r.content}</div>
                  {r.nextAction && (
                    <div style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>
                      次: {r.nextAction} ({r.nextFollowUpDate ? new Date(r.nextFollowUpDate).toLocaleDateString('ja-JP') : '未定'})
                    </div>
                  )}
                </div>
              ))}
              {target.replies.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>返信の記録はありません</p>}
            </div>
          </div>
        </section>

        {/* 右カラム：商談登録・結果 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>商談・結果の登録</h3>
            <form action={handleAppointmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>商材</label>
                <select name="productId" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'white' }}>
                  <option value="">選択してください</option>
                  {target.leadScores.map(ls => <option key={ls.id} value={ls.productId}>{ls.product.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>商談日</label>
                  <input name="scheduledAt" type="datetime-local" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>ステータス・結果</label>
                  <select name="outcome" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'white' }}>
                    {outcomes.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>成約金額 (円)</label>
                  <input name="amount" type="number" placeholder="例: 100000" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>次回追客日</label>
                  <input name="nextFollowUpDate" type="date" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>メモ・失注理由</label>
                <textarea name="memo" rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', background: '#059669' }}>商談結果を保存</button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>商談履歴</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {target.appointments.map(a => (
                <div key={a.id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', color: a.outcome === 'won' ? '#059669' : 'var(--text-main)' }}>
                      {outcomes.find(o => o.id === a.outcome)?.name}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {a.scheduledAt ? new Date(a.scheduledAt).toLocaleDateString('ja-JP') : '日時未定'}
                    </span>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>{a.memo}</div>
                  {a.amount && (
                    <div style={{ fontWeight: '700', color: '#059669', marginBottom: '0.25rem' }}>
                      成約額: ¥{a.amount.toLocaleString()}
                    </div>
                  )}
                  {a.nextFollowUpDate && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      次回追客: {new Date(a.nextFollowUpDate).toLocaleDateString('ja-JP')}
                    </div>
                  )}
                </div>
              ))}
              {target.appointments.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>商談の記録はありません</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
