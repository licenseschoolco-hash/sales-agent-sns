/**
 * 採用導線診断 棒グラフコンポーネント (CSSのみ)
 */

interface BarItem {
  label: string;
  score: number; // 1-10
  color?: string;
}

export default function DiagnosisBarChart({ items }: { items: BarItem[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
      {items.map((item, index) => (
        <div key={index}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: '600' }}>{item.label}</span>
            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{item.score} / 10</span>
          </div>
          <div style={{ 
            height: '12px', 
            background: 'var(--bg-secondary)', 
            borderRadius: '6px', 
            overflow: 'hidden',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ 
              height: '100%', 
              width: `${item.score * 10}%`, 
              background: item.score >= 8 ? '#10b981' : item.score >= 5 ? 'var(--primary)' : '#ef4444',
              borderRadius: '6px',
              transition: 'width 1s ease-out'
            }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
