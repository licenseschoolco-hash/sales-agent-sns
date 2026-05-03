import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  createInformationSource, 
  deleteInformationSource, 
  updateTargetSourceStatus 
} from "@/app/targets/actions";

export default async function InformationSourcePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const target = await prisma.targetCompany.findUnique({
    where: { id },
    include: {
      sources: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!target) notFound();

  const createWithId = createInformationSource.bind(null, id);
  const updateStatusWithId = updateTargetSourceStatus.bind(null, id);

  const sourceStatusOptions = [
    { value: 'sns_only', label: 'SNSのみ確認' },
    { value: 'official_site_confirmed', label: '公式サイト確認済' },
    { value: 'recruitment_page_confirmed', label: '採用ページ確認済' },
    { value: 'job_portal_confirmed', label: '求人ポータル確認済' },
    { value: 'diagnosis_text_collected', label: '診断本文取得済' },
    { value: 'human_verified', label: '人間確認済み' },
    { value: 'ready_to_contact', label: '送信可' },
  ];

  const sourceTypeOptions = [
    { value: 'official_site', label: '🌐 公式サイト' },
    { value: 'recruitment_page', label: '📄 採用ページ' },
    { value: 'job_portal', label: '📦 求人ポータル' },
    { value: 'instagram', label: '📸 Instagram' },
    { value: 'x', label: '🐦 X (Twitter)' },
    { value: 'google_map', label: '📍 Googleマップ' },
    { value: 'contact_form', label: '✉️ 問い合わせフォーム' },
    { value: 'other', label: '🔗 その他' },
  ];

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href={`/targets/${id}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← ターゲット詳細に戻る
        </Link>
        <h1>情報源管理: {target.name}</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          {/* 情報源一覧 */}
          <section className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>登録済み情報源</h3>
            {target.sources.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>情報源がまだ登録されていません。</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {target.sources.map(source => (
                  <div key={source.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: '700' }}>{source.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {sourceTypeOptions.find(o => o.value === source.sourceType)?.label || source.sourceType}
                        </div>
                      </div>
                      <form action={deleteInformationSource.bind(null, source.id, id)}>
                        <button type="submit" style={{ fontSize: '0.75rem', color: '#ef4444', border: '1px solid #fee2e2', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'white' }}>
                          削除
                        </button>
                      </form>
                    </div>
                    <div style={{ fontSize: '0.875rem', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                      <a href={source.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{source.url}</a>
                    </div>
                    {source.content && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                        <strong>取得済み本文:</strong> {source.content.substring(0, 100)}{source.content.length > 100 ? '...' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 新規追加フォーム */}
          <section className="card">
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>新規情報源を追加</h3>
            <form action={createWithId} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>種類</label>
                  <select name="sourceType" className="form-control" required defaultValue="official_site">
                    {sourceTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>検証状態</label>
                  <select name="verificationStatus" className="form-control" defaultValue="pending">
                    <option value="pending">確認待ち</option>
                    <option value="verified">確認済み</option>
                    <option value="error">エラー</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>ラベル（表示名）</label>
                <input name="label" type="text" className="form-control" placeholder="例: 公式サイト / Indeed掲載ページ" required />
              </div>
              <div className="form-group">
                <label>URL</label>
                <input name="url" type="url" className="form-control" placeholder="https://..." required />
              </div>
              <div className="form-group">
                <label>本文内容（任意・解析用）</label>
                <textarea name="content" className="form-control" rows={5} placeholder="サイトの本文などを貼り付けてください"></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>情報源を登録</button>
            </form>
          </section>
        </div>

        <div>
          {/* ステータス更新 */}
          <section className="card">
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>情報源ステータス</h3>
            <form action={updateStatusWithId}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <select name="sourceStatus" className="form-control" defaultValue={target.sourceStatus}>
                  {sourceStatusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>ステータスを更新</button>
            </form>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              現在の状態に合わせてステータスを更新してください。
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
