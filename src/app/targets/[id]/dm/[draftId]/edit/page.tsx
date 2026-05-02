import { prisma } from "@/lib/prisma";
import { updateDraftContent } from "../../actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditDraftPage({ params }: { params: Promise<{ id: string, draftId: string }> }) {
  const { id, draftId } = await params;
  
  const draft = await prisma.dmDraft.findUnique({
    where: { id: draftId },
    include: { product: true }
  });

  if (!draft) notFound();

  async function handleSave(formData: FormData) {
    "use server";
    const subject = formData.get("subject") as string;
    const body = formData.get("body") as string;
    await updateDraftContent(draftId, id, subject, body);
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href={`/targets/${id}/dm`} style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← ドラフト一覧に戻る
        </Link>
        <h1>DM文面の編集</h1>
        <p style={{ color: 'var(--text-muted)' }}>対象商材: {draft.product.name}</p>
      </header>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form action={handleSave}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>件名</label>
            <input 
              name="subject" 
              type="text" 
              defaultValue={draft.subject || ''} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} 
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>本文</label>
            <textarea 
              name="body" 
              rows={15} 
              defaultValue={draft.body} 
              style={{ 
                width: '100%', 
                padding: '1rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border)', 
                fontFamily: 'inherit',
                lineHeight: '1.6'
              }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Link href={`/targets/${id}/dm`} className="btn" style={{ border: '1px solid var(--border)' }}>キャンセル</Link>
            <button type="submit" className="btn btn-primary">変更を保存する</button>
          </div>
        </form>
      </div>
    </div>
  );
}
