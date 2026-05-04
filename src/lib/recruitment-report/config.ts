/**
 * 診断タイプ別設定管理
 */

export type DiagnosisScoreKey =
  | "scoreJobClarity"
  | "scoreAtmosphere"
  | "scoreDailyRoutine"
  | "scoreBeginnerSafety"
  | "scoreApplicationFlow"
  | "scoreAppealPower";

export type DiagnosisType =
  | "recruitment_video"
  | "dental_ai_phone"
  | "sales_os"
  | "website_conversion"
  | "sns_account";

export interface DiagnosisScoreConfig {
  key: DiagnosisScoreKey;
  label: string;
  advice: string;
}

export interface DiagnosisTypeConfig {
  type: DiagnosisType;
  title: string;
  subtitle: string;
  industry: string;
  targetDescription: string;
  scores: DiagnosisScoreConfig[];
  promptRole: string;
  promptFocus: string;
  expressionGuards: string[];
  proposalProduct: string;
  proposalTemplate: string;
  cta: string;
  sendingMessageTemplate: string;
}

/**
 * 共通表現ガードルール
 */
export const COMMON_EXPRESSION_GUARDS = [
  "「ない」「不足している」「弱い」と断定せず、「確認しにくい」「さらに強化できる余地がある」「より伝わりやすくできる可能性がある」と表現すること",
  "SNSのみを根拠に具体的な不足点を断定しないこと",
  "医療・介護・法律系では批判的に見える表現を避けること",
  "相手の努力を認めたうえで改善提案をすること",
  "不明な場合は「本文上では確認しにくい」と表現すること",
];

export const DIAGNOSIS_CONFIG: Record<DiagnosisType, DiagnosisTypeConfig> = {
  recruitment_video: {
    type: "recruitment_video",
    title: "採用導線・動画活用診断レポート",
    subtitle: "求職者視点での情報量と安心感の可視化",
    industry: "介護・福祉・医療",
    targetDescription: "介護事業所・医療機関の採用担当者様",
    scores: [
      { key: "scoreJobClarity", label: "求人情報のわかりやすさ", advice: "業務範囲や給与体系を具体化すると、ミスマッチが減り応募の質が高まります。" },
      { key: "scoreAtmosphere", label: "職場の雰囲気の伝わりやすさ", advice: "スタッフのストーリーを補足することで、共感を生むページになります。" },
      { key: "scoreDailyRoutine", label: "1日の流れの見えやすさ", advice: "スケジュールに一言添えるだけで、入社後の不安が解消されます。" },
      { key: "scoreBeginnerSafety", label: "未経験者への安心材料", advice: "最初の1ヶ月で何を学ぶかを具体的に示すことが、最も有効な安心材料となります。" },
      { key: "scoreApplicationFlow", label: "応募導線のわかりやすさ", advice: "LINE相談などのカジュアルな入り口を設けることで、潜在層を取りこぼしにくくなります。" },
      { key: "scoreAppealPower", label: "直接応募につながる訴求力", advice: "自社サイトならではの情報を強調することで、直接応募を促せます。" },
    ],
    promptRole: "あなたは介護業界に精通した採用戦略コンサルタントです。",
    promptFocus: "求職者が抱く「自分にできるか」「馴染めるか」という不安の解消度",
    expressionGuards: COMMON_EXPRESSION_GUARDS,
    proposalProduct: "AIアニメ動画",
    proposalTemplate: "「{weakItem}」の可視化には、30秒程度のAIアニメ動画の活用が非常に効果的です。直感的な理解を促し、応募意欲を高めます。",
    cta: "無料の詳細診断・事例紹介（Zoom15分）",
    sendingMessageTemplate: "求職者が抱きやすい「入社後の不安」を解消するための改善案をまとめました。採用活動のヒントとしてご一読ください。",
  },
  dental_ai_phone: {
    type: "dental_ai_phone",
    title: "予約・電話導線診断レポート",
    subtitle: "患者利便性と受付負担軽減の分析",
    industry: "歯科・クリニック",
    targetDescription: "歯科医院・クリニックの院長・事務長様",
    scores: [
      { key: "scoreJobClarity", label: "Web予約導線の使いやすさ", advice: "TOPページから1クリックで予約画面に遷移できるかが重要です。" },
      { key: "scoreAtmosphere", label: "電話番号の視認性", advice: "スマホで見た際に、タップで即座に発信できるアイコン配置を推奨します。" },
      { key: "scoreDailyRoutine", label: "診療時間外の受付体制", advice: "夜間や休診日の電話取りこぼしは、新患獲得の機会損失に直結します。" },
      { key: "scoreBeginnerSafety", label: "スマホ予約の最適化", advice: "スマホユーザーがストレスなく入力できるフォーム設計がCVRを左右します。" },
      { key: "scoreApplicationFlow", label: "LINE/Googleマップ導線", advice: "マップからの予約導線を整えることで、地域密着型の集客が強化されます。" },
      { key: "scoreAppealPower", label: "自費診療への誘導力", advice: "専門性の高い治療への理解を深める解説動画があると、自費率の向上が期待できます。" },
    ],
    promptRole: "あなたは歯科医院経営に精通した増患・DXコンサルタントです。",
    promptFocus: "新患の予約しやすさと、受付スタッフの電話対応負荷のバランス",
    expressionGuards: COMMON_EXPRESSION_GUARDS,
    proposalProduct: "AI電話予約システム",
    proposalTemplate: "「{weakItem}」の課題解決には、24時間365日対応のAI電話が最適です。スタッフの手を止めず、予約の取りこぼしをゼロにします。",
    cta: "AI電話・予約導線改善相談会（Zoom15分）",
    sendingMessageTemplate: "患者様の「予約のしづらさ」と、スタッフ様の「電話対応負荷」を同時に解消するための診断結果をまとめました。",
  },
  sales_os: {
    type: "sales_os",
    title: "営業導線・商談化率診断レポート",
    subtitle: "B2B商談創出プロセスの可視化",
    industry: "B2B・制作・コンサルティング",
    targetDescription: "営業責任者・経営者様",
    scores: [
      { key: "scoreJobClarity", label: "問い合わせ導線の明確さ", advice: "検討フェーズに合わせた複数のCTA（資料請求/無料診断等）が有効です。" },
      { key: "scoreAtmosphere", label: "商材説明のわかりやすさ", advice: "ベネフィットを定量的に示し、顧客が「自社ならどうなるか」をイメージさせることが重要です。" },
      { key: "scoreDailyRoutine", label: "事例・実績の見せ方", advice: "同業他社の成功事例があることで、商談化への信頼が一気に高まります。" },
      { key: "scoreBeginnerSafety", label: "CTAの明確さ", advice: "次に何をすべきか（フォーム入力か、日程調整か）を迷わせない設計が必要です。" },
      { key: "scoreApplicationFlow", label: "リード獲得導線", advice: "ホワイトペーパーやメルマガ登録など、潜在層をリスト化する仕組みが不足している可能性があります。" },
      { key: "scoreAppealPower", label: "営業OS導入適性", advice: "属人的な営業活動をシステム化することで、商談獲得数を倍増させる余地があります。" },
    ],
    promptRole: "あなたはB2Bマーケティングとインサイドセールスに精通した営業戦略顧問です。",
    promptFocus: "リード獲得から商談化までのプロセスのボトルネック特定",
    expressionGuards: COMMON_EXPRESSION_GUARDS,
    proposalProduct: "営業OS（商談創出システム）",
    proposalTemplate: "「{weakItem}」を自動化し、質の高い商談を安定的に創出する「営業OS」の導入により、営業生産性を飛躍的に向上させることが可能です。",
    cta: "商談創出プロセス改善相談（Zoom15分）",
    sendingMessageTemplate: "貴社の営業プロセスにおける商談化率向上のヒントをまとめました。効率的なリード獲得と追客の仕組み作りにご活用ください。",
  },
  website_conversion: {
    type: "website_conversion",
    title: "サイトCV改善診断レポート",
    subtitle: "問い合わせ・予約を増やすための導線分析",
    industry: "全業界",
    targetDescription: "Webサイト運営責任者様",
    scores: [
      { key: "scoreJobClarity", label: "ファーストビューの訴求力", advice: "3秒以内に「誰のどんな課題を解決するか」が伝わるかが勝負です。" },
      { key: "scoreAtmosphere", label: "信頼材料・実績の配置", advice: "証拠となる実績やお客様の声が、最も強力なコンバージョンへの後押しとなります。" },
      { key: "scoreDailyRoutine", label: "CVまでの導線設計", advice: "ユーザーが迷わずゴールに辿り着けるよう、ボタンの配置や導線を再設計する余地があります。" },
      { key: "scoreBeginnerSafety", label: "スマホ最適化の精度", advice: "PC表示以上に、スマホでの操作性と表示速度がCVRに直結します。" },
      { key: "scoreApplicationFlow", label: "フォームの入力負荷", advice: "入力項目を1つ減らすだけで、離脱率が大きく改善されることがあります。" },
      { key: "scoreAppealPower", label: "CV改善余地の大きさ", advice: "現在のアクセスを最大限活かすための、ABテストやLPOの余地を診断しました。" },
    ],
    promptRole: "あなたは数多くのサイトを改善してきたLPO・CVR改善専門家です。",
    promptFocus: "ユーザー心理に基づいた離脱箇所の特定と、行動を促すための施策",
    expressionGuards: COMMON_EXPRESSION_GUARDS,
    proposalProduct: "Webサイト改善コンサル",
    proposalTemplate: "「{weakItem}」の改善により、広告費を変えずにコンバージョン数を増やすことが可能です。具体的なA/Bテスト案をご提案します。",
    cta: "無料CV改善カウンセリング（Zoom15分）",
    sendingMessageTemplate: "貴社サイトの「もったいない離脱」を防ぎ、問い合わせを増やすための改善ポイントをまとめました。",
  },
  sns_account: {
    type: "sns_account",
    title: "SNS商談化導線診断レポート",
    subtitle: "SNSから実商談へつなげるプロフィールの分析",
    industry: "全業界",
    targetDescription: "SNS運用担当者・事業主様",
    scores: [
      { key: "scoreJobClarity", label: "プロフィールの明確さ", advice: "「フォローすると何が得られるか」を言語化し、権威性を短文で示す必要があります。" },
      { key: "scoreAtmosphere", label: "固定投稿の営業導線", advice: "最も見られる固定投稿で、商談や無料診断への入り口を明確に設けることが重要です。" },
      { key: "scoreDailyRoutine", label: "投稿テーマの一貫性", advice: "専門特化した情報を発信し続けることで、ターゲット層からの信頼が蓄積されます。" },
      { key: "scoreBeginnerSafety", label: "見込みフォロワー導線", advice: "質の高いフォロワーを増やすための、価値提供と親近感のバランスを評価しました。" },
      { key: "scoreApplicationFlow", label: "DM・無料診断への誘導", advice: "いきなり商談ではなく、ハードルの低い「無料診断」などへの誘導がSNSでは効果的です。" },
      { key: "scoreAppealPower", label: "SNS商談化導線", advice: "情報発信だけで終わらず、実利（商談）に結びつけるためのダイレクトな訴求力を診断しました。" },
    ],
    promptRole: "あなたはSNSから月間数十件の商談を安定創出させるSNSマーケティング専門家です。",
    promptFocus: "認知（フォロー）から興味（投稿内容）を経て、行動（DM/リンク）に至るフローの整合性",
    expressionGuards: COMMON_EXPRESSION_GUARDS,
    proposalProduct: "SNS営業OS",
    proposalTemplate: "「{weakItem}」を強化し、SNS運用を単なる発信から「自動集客装置」に変えるための具体的な導線設計をご提案可能です。",
    cta: "SNS商談化導線診断会（Zoom15分）",
    sendingMessageTemplate: "SNSを「頑張って発信」するステージから、安定して「商談が生まれる」ステージへ変えるための改善案をまとめました。",
  },
};

/**
 * 診断タイプに対応する設定を取得する。
 * 未定義または不正なタイプの場合は recruitment_video を返す（フォールバック）。
 */
export function getDiagnosisConfig(type?: string): DiagnosisTypeConfig {
  if (!type || !DIAGNOSIS_CONFIG[type as DiagnosisType]) {
    return DIAGNOSIS_CONFIG.recruitment_video;
  }
  return DIAGNOSIS_CONFIG[type as DiagnosisType];
}
