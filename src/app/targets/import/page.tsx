"use client";

import { importTargetsFromCsv } from "../actions";
import { useState } from "react";
import Link from "next/link";

export default function ImportPage() {
  const [csvText, setCsvText] = useState("");
  const [status, setStatus] = useState<{ loading: boolean; message: string; type: 'success' | 'error' | 'none' }>({
    loading: false,
    message: "",
    type: 'none'
  });

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    setStatus({ loading: true, message: "インポート中...", type: 'none' });

    try {
      const result = await importTargetsFromCsv(csvText);
      if (result.success) {
        setStatus({ loading: false, message: `${result.count}件の企業をインポートしました。`, type: 'success' });
        setCsvText("");
      } else {
        setStatus({ loading: false, message: result.message || "インポートに失敗しました。", type: 'error' });
      }
    } catch (_error) {
      setStatus({ loading: false, message: "エラーが発生しました。", type: 'error' });
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/targets" style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← 一覧に戻る
        </Link>
        <h1>CSVインポート</h1>
      </header>

      <div className="card">
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.875rem' }}>
          <strong>CSVフォーマット:</strong><br />
          会社名, 業種, 地域, 担当者名, SNS URL, WebサイトURL, 求人ページURL, 電話番号, メール, メモ<br />
          <span style={{ color: 'var(--text-muted)' }}>※ 1行目はヘッダーとして読み飛ばされます。</span>
        </div>

        <form onSubmit={handleImport}>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="ここにCSVの内容を貼り付けてください..."
            rows={15}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border)', 
              fontFamily: 'monospace',
              marginBottom: '1rem'
            }}
          ></textarea>

          {status.type !== 'none' && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              background: status.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: status.type === 'success' ? '#16a34a' : '#dc2626',
              border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}>
              {status.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Link href="/targets" className="btn" style={{ border: '1px solid var(--border)' }}>キャンセル</Link>
            <button 
              type="submit" 
              disabled={status.loading || !csvText.trim()} 
              className="btn btn-primary"
            >
              {status.loading ? "実行中..." : "インポート実行"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
