import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import DiagnosisBarChart from "@/components/DiagnosisBarChart";

import { getDiagnosisConfig } from "@/lib/recruitment-report/config";

export default async function ReportViewPage({ params }: { params: Promise<{ id: string, reportId: string }> }) {
  const { id, reportId } = await params;

  const report = await prisma.recruitmentReport.findUnique({
    where: { id: reportId },
    include: { targetCompany: true, product: true }
  });

  if (!report) notFound();

  // 診断タイプに応じた設定を取得
  const config = getDiagnosisConfig(report.diagnosisType);

  // 関連する SNS リードを検索
  const socialLead = await prisma.socialLeadCandidate.findFirst({
    where: { targetCompanyId: id }
  });

  // チャート項目の生成 (DBのカラム値を config のラベルでマッピング)
  const chartItems = config.scores.map(s => ({
    label: s.label,
    score: report[s.key as keyof typeof report] as number
  }));

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
          @page { size: A4; margin: 0; }
          body { 
            background: white !important; 
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* 印刷時にレポート本体以外の全ての要素を隠す */
          nav, aside, header.no-print, footer, .sidebar, .navbar {
            display: none !important;
          }

          .report-container { 
            position: absolute;
            top: 0;
            left: 0;
            width: 100% !important; 
            max-width: none !important;
            padding: 15mm !important;
            margin: 0 !important;
            background: white !important;
          }
          
          .no-print { display: none !important; }
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
          <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '0.25rem' }}>{config.title}</div>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{report.targetCompany.name} 様</h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{config.subtitle}</div>
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
          <div className="section-title" style={{ color: '#0369a1' }}>■ 次の一手：{config.proposalProduct}の活用</div>
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
          <p style={{ fontWeight: '700', marginBottom: '1rem' }}>{config.cta}</p>
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.875rem', color: '#475569', fontWeight: '600' }}>
              💡 ブラウザの印刷機能（Ctrl+P / Cmd+P）を使用してPDF保存してください
            </div>
            
            {socialLead && (
              <div style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', maxWidth: '500px', width: '100%' }}>
                <div style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '700', marginBottom: '0.5rem' }}>
                  このレポートをSNSリードへ送る
                </div>
                <p style={{ fontSize: '0.8rem', color: '#166534', marginBottom: '0.75rem' }}>
                  関連するSNSリード詳細へ戻り、PDF送付DMを作成できます。
                </p>
                <Link 
                  href={`/social-leads/${socialLead.id}?fromReportId=${report.id}`} 
                  className="btn btn-primary"
                  style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}
                >
                  SNSリード詳細でPDF送付DMを作成する
                </Link>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href={`/targets/${id}`} className="btn" style={{ border: '1px solid var(--border)' }}>ターゲット詳細に戻る</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
