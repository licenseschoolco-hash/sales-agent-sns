import { prisma } from "@/lib/prisma";
import { runAiDiagnosis, confirmAiReport } from "../../../actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import DiagnosisBarChart from "@/components/DiagnosisBarChart";

import { DIAGNOSIS_CONFIG } from "@/lib/recruitment-report/config";

export default async function AiReportPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ draftId?: string }> 
}) {
  const { id } = await params;
  const { draftId } = await searchParams;
  
  const target = await prisma.targetCompany.findUnique({ where: { id } });
  if (!target) notFound();

  const products = await prisma.product.findMany({ where: { status: 'active' } });
  const apiKeySet = !!process.env.GEMINI_API_KEY;

  // 下書きがある場合は取得
  const draft = draftId ? await prisma.recruitmentReport.findUnique({
    where: { id: draftId },
    include: { product: true }
  }) : null;

  async function handleAnalyze(formData: FormData) {
    "use server";
    await runAiDiagnosis(id, formData);
  }

  async function handleConfirm() {
    "use server";
    if (draftId) await confirmAiReport(draftId, id);
  }

  const diagnosisTypeOptions = Object.values(DIAGNOSIS_CONFIG).map(config => ({
    value: config.type,
    label: config.title
  }));

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href={`/targets/${id}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← ターゲット詳細に戻る
        </Link>
        <h1>AI自動診断レポート生成</h1>
        <p style={{ color: 'var(--text-muted)' }}>求人本文をAIが解析し、診断レポートの下書きを作成します。</p>
      </header>

      {!apiKeySet && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #fecaca' }}>
          <strong>⚠️ AI APIキーが未設定です</strong>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            .env ファイルに <code>GEMINI_API_KEY</code> を設定してください。
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: draft ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        {/* 入力エリア */}
        <section className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>解析用データ入力</h2>
          <form action={handleAnalyze}>
            <input type="hidden" name="companyName" value={target.name} />
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>対象商材 (連携用)</label>
              <select name="productId" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>診断種別 (プロンプト切り替え)</label>
              <select name="diagnosisType" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {diagnosisTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>求人ページURL (任意)</label>
              <input 
                type="url" 
                name="diagnosisUrl" 
                placeholder="https://..." 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} 
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>求人本文 (必須)</label>
              <textarea 
                name="sourceText" 
                required 
                placeholder="求人ページのテキストをここに貼り付けてください..."
                style={{ width: '100%', height: '300px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.875rem' }}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem' }}
              disabled={!apiKeySet}
            >
              AI解析を実行する
            </button>
          </form>
        </section>

        {/* 診断結果プレビュー */}
        {draft && (
          <section className="card" style={{ background: '#f8fafc', border: '2px solid var(--primary)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>診断結果プレビュー</h2>
            <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '1rem', background: 'white', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>AI診断スコア</div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)' }}>{draft.totalScore}</div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>項目別評価</h3>
              <DiagnosisBarChart items={[
                { label: '求人情報のわかりやすさ', score: draft.scoreJobClarity },
                { label: '職場の雰囲気', score: draft.scoreAtmosphere },
                { label: '1日の流れ', score: draft.scoreDailyRoutine },
                { label: '未経験者への安心材料', score: draft.scoreBeginnerSafety },
                { label: '応募導線', score: draft.scoreApplicationFlow },
                { label: '直接応募の訴求力', score: draft.scoreAppealPower },
              ]} />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>AI総評</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.6', background: 'white', padding: '1rem', borderRadius: '8px' }}>
                {draft.generalReview}
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                ※ AIの結果に問題がなければ、以下のボタンを押してレポートを正式に作成・保存してください。
              </p>
              <form action={handleConfirm}>
                <button type="submit" className="btn" style={{ width: '100%', background: 'white', color: 'var(--primary)', fontWeight: '700' }}>
                  この内容でレポートを確定保存する
                </button>
              </form>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              ※ 数値を修正したい場合は、保存後に手入力モードで再編集してください。
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
