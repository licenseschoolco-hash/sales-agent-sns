import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import DiagnosisBarChart from "@/components/DiagnosisBarChart";

export default async function ReportViewPage({ params }: { params: Promise<{ id: string, reportId: string }> }) {
  const { id, reportId } = await params;

  const report = await prisma.recruitmentReport.findUnique({
    where: { id: reportId },
    include: { targetCompany: true, product: true }
  });

  if (!report) notFound();

  const chartItems = [
    { label: '求人情報のわかりやすさ', score: report.scoreJobClarity },
    { label: '職場の雰囲気', score: report.scoreAtmosphere },
    { label: '1日の流れ', score: report.scoreDailyRoutine },
    { label: '未経験者への安心材料', score: report.scoreBeginnerSafety },
    { label: '応募導線', score: report.scoreApplicationFlow },
    { label: '直接応募の訴求力', score: report.scoreAppealPower },
  ];

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href={`/targets/${id}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← ターゲット詳細に戻る
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>採用導線診断レポート</h1>
            <p style={{ color: 'var(--text-muted)' }}>対象企業: {report.targetCompany.name}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>総合スコア</div>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1 }}>
              {report.totalScore}<span style={{ fontSize: '1.25rem' }}>/100</span>
            </div>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* 左側：グラフと評価 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>項目別診断</h3>
            <DiagnosisBarChart items={chartItems} />
          </section>

          <section className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>総評</h3>
            <p style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{report.generalReview}</p>
          </section>
        </div>

        {/* 右側：改善策と提案 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section className="card" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>改善ポイントとご提案</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>重点改善項目</div>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9375rem' }}>{report.improvementPoints}</p>
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{report.product.name}による解決策</div>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9375rem', lineHeight: '1.6' }}>{report.proposalMessage}</p>
            </div>
          </section>

          <section className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>送付用メッセージ</h3>
            <div style={{ 
              padding: '1rem', 
              background: '#f8fafc', 
              border: '1px dashed var(--border)', 
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap'
            }}>
              {report.sendingMessage}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              ※ 上記メッセージをコピーしてSNSのDM等で送信してください。
            </p>
          </section>
        </div>
      </div>

      <footer style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem 0', borderTop: '1px solid var(--border)' }}>
        <Link href={`/targets/${id}`} className="btn" style={{ border: '1px solid var(--border)' }}>詳細に戻る</Link>
      </footer>
    </div>
  );
}
