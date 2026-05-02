import { prisma } from "@/lib/prisma";
import { updateTarget } from "../../actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditTargetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const target = await prisma.targetCompany.findUnique({
    where: { id },
  });

  if (!target) notFound();

  const updateTargetWithId = updateTarget.bind(null, id);

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href={`/targets/${id}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← 詳細に戻る
        </Link>
        <h1>ターゲット情報の編集</h1>
      </header>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form action={updateTargetWithId}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>会社名</label>
              <input name="name" type="text" defaultValue={target.name} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>業種</label>
              <input name="industry" type="text" defaultValue={target.industry} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>地域</label>
              <input name="region" type="text" defaultValue={target.region || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>担当者名</label>
              <input name="contactName" type="text" defaultValue={target.contactName || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>SNS URL</label>
            <input name="snsUrl" type="url" defaultValue={target.snsUrl || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>WebサイトURL</label>
              <input name="website" type="url" defaultValue={target.website || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>求人ページURL</label>
              <input name="jobPageUrl" type="url" defaultValue={target.jobPageUrl || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>電話番号</label>
              <input name="phone" type="tel" defaultValue={target.phone || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>メール</label>
              <input name="email" type="email" defaultValue={target.email || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>ステータス</label>
            <select name="status" defaultValue={target.status} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}>
              <option value="new">新規リード (new)</option>
              <option value="researching">調査中 (researching)</option>
              <option value="dm_ready">送信準備完了 (dm_ready)</option>
              <option value="contacted">アプローチ済み (contacted)</option>
              <option value="replied">返信あり (replied)</option>
              <option value="appointment">アポ獲得 (appointment)</option>
              <option value="won">成約 (won)</option>
              <option value="lost">失注 (lost)</option>
              <option value="ng">NG (ng)</option>
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>メモ</label>
            <textarea name="notes" defaultValue={target.notes || ''} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit' }}></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Link href={`/targets/${id}`} className="btn" style={{ border: '1px solid var(--border)' }}>キャンセル</Link>
            <button type="submit" className="btn btn-primary">変更を保存する</button>
          </div>
        </form>
      </div>
    </div>
  );
}
