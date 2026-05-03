import { prisma } from "@/lib/prisma";
import { saveRecruitmentReport } from "../../../actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function NewReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const target = await prisma.targetCompany.findUnique({ where: { id } });
  if (!target) notFound();

  const products = await prisma.product.findMany({ where: { status: 'active' } });

  const scoreFields = [
    { name: 'scoreJobClarity', label: '求人情報のわかりやすさ', description: '仕事内容や条件が具体的か' },
    { name: 'scoreAtmosphere', label: '職場の雰囲気の伝わりやすさ', description: '写真や動画で社風が伝わるか' },
    { name: 'scoreDailyRoutine', label: '1日の流れの見えやすさ', description: '入社後のイメージが沸くか' },
    { name: 'scoreBeginnerSafety', label: '未経験者への安心材料', description: '研修体制やサポート体制の記載' },
    { name: 'scoreApplicationFlow', label: '応募導線のわかりやすさ', description: '応募ボタンや手順が明確か' },
    { name: 'scoreAppealPower', label: '直接応募につながる訴求力', description: '自社サイトから応募するメリット' },
  ];

  async function handleAction(formData: FormData) {
    "use server";
    await saveRecruitmentReport(id, formData);
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href={`/targets/${id}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← ターゲット詳細に戻る
        </Link>
        <h1>採用導線診断レポートの作成</h1>
        <p style={{ color: 'var(--text-muted)' }}>{target.name} の公開情報に基づき診断スコアを入力してください。</p>
      </header>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form action={handleAction}>
          <input type="hidden" name="companyName" value={target.name} />
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>対象商材</label>
            <select name="productId" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}>
              <option value="">商材を選択してください</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {scoreFields.map(field => (
              <div key={field.name}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.875rem' }}>
                  {field.label}
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{field.description}</p>
                <input 
                  type="number" 
                  name={field.name} 
                  min="1" 
                  max="10" 
                  defaultValue="5" 
                  required 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                />
              </div>
            ))}
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.875rem' }}>
            <p>※ 保存するとスコアに基づき診断文と送付用メッセージが自動生成されます。</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <Link href={`/targets/${id}`} className="btn" style={{ border: '1px solid var(--border)' }}>キャンセル</Link>
            <button type="submit" className="btn btn-primary">
              診断レポートを生成する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
