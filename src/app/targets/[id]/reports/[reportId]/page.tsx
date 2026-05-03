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
    <div className="container report-container">
      <style dangerouslySetInnerHTML={{ __html: `
        .report-container {
          max-width: 840px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          color: #1a202c;
        }
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .report-container { width: 100%; padding: 0; }
          .card { border: 1px solid #e2e8f0 !important; box-shadow: none !important; break-inside: avoid; }
        }
        .report-header {
          border-bottom: 2px solid var(--primary);
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .advice-box {
          background: #f8fafc;
          border-left: 4px solid var(--primary);
          padding: 1.5rem;
          border-radius: 0 8px 8px 0;
          margin-bottom: 2rem;
        }
      `}} />

      <header className="no-print" style={{ marginBottom: '1rem' }}>
        <Link href={`/targets/${id}`} style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>
          ← ターゲット詳細に戻る
        </Link>
      </header>

      <div className="report-header">
        <div>
          <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '0.25rem' }}>採用パートナー診断レポート</div>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{report.targetCompany.name} 様</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>総合評価スコア</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1 }}>
            {report.totalScore}<span style={{ fontSize: '1rem', fontWeight: '400' }}>点</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* 総評セクション */}
        <section>
          <div className="section-title">■ 診断総評</div>
          <p style={{ lineHeight: '1.8', fontSize: '1rem' }}>{report.generalReview}</p>
        </section>

        {/* グラフセクション */}
        <section className="card" style={{ padding: '2rem' }}>
          <div className="section-title">■ 項目別診断結果</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <DiagnosisBarChart items={chartItems.slice(0, 3)} />
            <DiagnosisBarChart items={chartItems.slice(3)} />
          </div>
        </section>

        {/* 改善アドバイス */}
        <section>
          <div className="section-title">■ 具体的な改善アドバイス</div>
          <div className="advice-box">
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', margin: 0 }}>{report.improvementPoints}</p>
          </div>
        </section>

        {/* 解決策の提案 */}
        <section className="card" style={{ padding: '2rem', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
          <div className="section-title" style={{ color: '#0369a1' }}>■ 次の一手：動画と視覚情報の活用</div>
          <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', margin: 0 }}>{report.proposalMessage}</p>
        </section>

        {/* 送付・アクション */}
        <section className="no-print card" style={{ padding: '1.5rem', border: '1px dashed var(--border)' }}>
          <div style={{ fontWeight: '700', marginBottom: '1rem' }}>【社内控】送付用メッセージ</div>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '4px', fontSize: '0.875rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {report.sendingMessage}
            {`\nhttps://example.com/targets/${id}/reports/${report.id}`}
          </div>
        </section>

        <section style={{ textAlign: 'center', padding: '2rem 0', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontWeight: '700', marginBottom: '1rem' }}>本診断の詳細解説や具体的な改善事例を、オンライン(Zoom)にて30分程度でご説明可能です。</p>
          <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => window.print()}>このレポートを印刷/PDF保存する</button>
            <Link href={`/targets/${id}`} className="btn" style={{ border: '1px solid var(--border)' }}>ターゲット詳細に戻る</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
