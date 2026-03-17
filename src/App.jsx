import { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════
// PERSISTENT STORAGE HELPER (#3)
// ═══════════════════════════════════════════
const store = {
  async get(key) { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(key, val) { try { await window.storage.set(key, JSON.stringify(val)); } catch {} },
};

// ═══════════════════════════════════════════
// EXPORT MODAL SYSTEM
// 아티팩트 sandbox iframe에서는 clipboard API, <a download>,
// blob URL, data URI, window.open 전부 차단됨.
// 유일한 해결: textarea에 표시하여 사용자가 직접 Ctrl+A → Ctrl+C
// ═══════════════════════════════════════════
let _showExportFn = null;
function showExport(content, filename) {
  if (_showExportFn) _showExportFn({ content, filename });
}


// ═══════════════════════════════════════════
// WORKFLOW URL SHARING (Feature 5)
// ═══════════════════════════════════════════
async function shareWorkflow(wf) {
  const id = "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  try {
    await window.storage.set("shared:wf:" + id, JSON.stringify(wf), true);
    return id;
  } catch { return null; }
}
async function loadSharedWorkflow(id) {
  try {
    const r = await window.storage.get("shared:wf:" + id, true);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}

// Generate a random valid seed
function randomSeed() { return Math.floor(Math.random() * 2147483647); }

// ═══════════════════════════════════════════
// THEME SYSTEM (#12)
// ═══════════════════════════════════════════
const THEMES = {
  dark: { bg: "#040404", bg2: "#0a0a09", bg3: "#0e0e0c", bg4: "#141412", border: "rgba(255,255,255,0.06)", border2: "rgba(255,255,255,0.1)", text: "#e8e4dc", text2: "#9a9689", text3: "#a09a90", text4: "#7a756c", accent: "#9caf7c", accent2: "#7a9458", glow: "rgba(156,175,124,0.08)" },
  light: { bg: "#f6f5f0", bg2: "#ffffff", bg3: "#efede6", bg4: "#e5e3da", border: "rgba(0,0,0,0.15)", border2: "rgba(0,0,0,0.22)", text: "#1a1918", text2: "#3d3a34", text3: "#5a5750", text4: "#7a7670", accent: "#4a7a2e", accent2: "#3d6420", glow: "rgba(74,122,46,0.08)" },
};


// ═══════════════════════════════════════════
// i18n — 4 LANGUAGES (ko/en/zh/ja)
// ═══════════════════════════════════════════
const LANG = {
  ko: {
    // Nav
    navWorkflow: "워크플로우", navModels: "모델", navNodes: "노드", navTutorials: "강의", navInstall: "설치",
    // Modes
    modeManual: "수동", modeAI: "AI 자동", modePrompt: "🎨 프롬프트", modeDebug: "🔍 디버거", modeImprove: "🔧 개선",
    // Generator
    genTitle: "워크플로우 생성", genDesc: "간편하게 ComfyUI 워크플로우를 만들어보세요.",
    genReady: "바로 사용 가능한 워크플로우 생성 →", genModelRequired: "⚠ 모델 파일명을 먼저 입력하세요",
    genBack: "← 뒤로", genNew: "새 워크플로우",
    // Categories
    catT2I: "Text → Image", catI2I: "Image → Image", catInpaint: "Inpainting", catUpscale: "Upscale",
    catT2V: "Text → Video", catI2V: "Image → Video", catCN: "ControlNet", catLora: "LoRA", catBatch: "Batch",
    // Config
    cfgModelLabel: "모델 파일명", cfgModelRequired: "(필수 입력)",
    cfgModelPlaceholder: "예: realvisxlV50_v50BakedVAE.safetensors",
    cfgModelHelp: "ComfyUI models/checkpoints/ 폴더의 실제 파일명을 입력하세요.",
    cfgModelCheck: "파일명 확인: ComfyUI 실행 → 왼쪽 패널 → Load Checkpoint → 드롭다운 목록",
    cfgSampler: "샘플러", cfgPrompt: "프롬프트", cfgParams: "파라미터", cfgResPreset: "해상도 프리셋",
    cfgSeedHelp: "🎲 새 랜덤 시드 생성 · ↻ 랜덤 시드 재생성 · 동일 시드 = 동일 결과",
    // Preset banner
    presetApplied: "권장 설정 적용됨", presetModelHint: "모델을 클릭하면 최적 설정으로 변경됩니다",
    presetModelWarn: "모델 파일명을 입력해주세요", presetModelWarnDesc: '아래 "모델 파일명" 필드에 ComfyUI checkpoints 폴더의 실제 파일명을 입력하세요',
    // Result
    resultTitle: "바로 사용 가능한 워크플로우", resultApplied: "권장 설정 적용됨",
    resultCopy: "📋 복사", resultDownload: "📋 다운로드", resultShare: "공유",
    resultSettings: "적용된 설정", resultModel: "모델", resultRes: "해상도",
    resultUsage: "사용법: JSON 다운로드 → ComfyUI → Manager → Run",
    tabGraph: "그래프", tabJSON: "JSON", tabAPI: "API Format", tabSpec: "권장 사양",
    // Models page
    modTitle: "Civitai 추천 모델", modFilter: "기준", modApply: "워크플로우에 적용",
    modDownCivitai: "↓ Civitai에서 다운로드", modDownHF: "↓ HuggingFace에서 다운로드",
    modViewExamples: "예시 이미지 보기", modRecommended: "Civitai 추천 모델",
    modVramLow: "⚠ VRAM 부족", modCustomTitle: "추천 커스텀 노드", modCustomDesc: "ComfyUI Manager에서 검색하여 설치하세요",
    // Node ref
    refTitle: "노드 레퍼런스", refDesc: "ComfyUI 핵심 노드의 입출력과 사용법", refSearch: "노드 검색...", refAll: "전체",
    // Tutorials
    tutTitle: "ComfyUI 강의", tutDesc: "슬라이드 강의 + 퀴즈 + AI 질문",
    tutExTitle: "예제 워크플로우", tutExDesc: "다운로드하여 ComfyUI에 바로 적용 가능",
    // Install
    instTitle: "ComfyUI 설치 가이드", instQuickStart: "빠른 시작", instDesktop: "Desktop App으로 쉽게 시작하기",
    instFolder: "폴더 구조", instScripts: "설치 스크립트",
    // Prompt builder
    promptTitle: "프롬프트 빌더", promptDesc: "태그를 클릭하여 조합하거나 템플릿을 선택하세요",
    promptTemplates: "템플릿", promptTags: "태그 (클릭하여 추가)", promptResult: "프롬프트",
    promptOptimize: "✨ AI 최적화", promptOptimizing: "최적화 중...", promptApply: "프롬프트 적용하기",
    // Debugger
    debugTitle: "워크플로우 디버거", debugDesc: "에러 메시지를 붙여넣으세요",
    debugPlaceholder: "ComfyUI 에러 메시지를 여기에 붙여넣으세요...",
    debugWfPlaceholder: "(선택) 워크플로우 JSON도 붙여넣으면 더 정확한 진단이 가능합니다",
    debugAutoResult: "자동 진단 결과", debugAIBtn: "🤖 AI 심층 분석", debugAILoading: "AI 분석 중...",
    debugAIDiagnosis: "AI 진단", debugPrevention: "예방",
    // Improver
    improveTitle: "워크플로우 개선", improveDesc: "기존 워크플로우를 첨부하고 개선 요청을 입력하세요",
    improveStep1: "① 워크플로우 JSON", improveStep2: "② 개선 요청",
    improveUpload: "📁 JSON 파일 업로드", improveLoaded: "✓ JSON 로드됨",
    improveParsed: "분석 완료", improveInvalid: "유효한 JSON이 아닙니다",
    improveBtn: "🔧 워크플로우 개선하기", improveAnalyzing: "AI 분석 중...",
    improveResultTitle: "AI 분석 결과", improveChanges: "변경 사항",
    improveBefore: "Before", improveAfter: "After",
    improveImproved: "개선된 워크플로우", improveRetry: "← 다시 개선하기",
    improveChain: "결과에서 추가 개선", improveView: "워크플로우 탭에서 보기",
    // Quickstart commands
    qcQuality: "품질 최적화 (steps/CFG 조정)", qcLora: "LoRA 추가로 디테일 강화",
    qcUpscale: "업스케일 노드 추가", qcLowVram: "저사양 최적화 (VRAM 절약)", qcPrompt: "프롬프트 개선",
    // Export modal
    exportCopyMethod: "복사 방법", exportStep1: "1. 아래 텍스트 박스를 클릭하세요",
    exportStep2: "2. Ctrl+A (전체 선택) → Ctrl+C (복사)", exportStep3: "3. 메모장 또는 ComfyUI에 Ctrl+V (붙여넣기)",
    exportClose: "✕ 닫기",
    // Spec
    specRecommended: "권장 사양",
    // History
    historyTitle: "최근 워크플로우",
    // Onboarding
    onboardWelcome: "ComfyUI Workflow Studio에 오신 것을 환영합니다!",
    // Misc
    close: "닫기", all: "전체", apply: "적용", or: "또는",
    modelAlert: "⚠ 모델 파일명을 입력해주세요.\n\nComfyUI의 models/checkpoints/ 폴더에 있는 실제 파일명을 입력하세요.\n예: realvisxlV50_v50BakedVAE.safetensors",

    // Tutorial UI
    tutProgress: "학습 진도", tutSlides: "슬라이드", tutQuiz: "퀴즈", tutQuizTitle: "퀴즈",
    tutPrev: "← 이전", tutNext: "다음 →", tutQuizStart: "퀴즈 풀기 →",
    tutCorrect: "정답", tutPerfect: "완벽합니다!", tutReview: "틀린 문제를 복습해보세요",
    tutDetail: "📖 상세 설명", tutClose: "닫기", tutStart: "시작하기",
    tutComplete: "완료", tutDownloadScripts: "⬇ 설치 스크립트 바로 다운로드",
    tutExTitle: "예제 워크플로우", tutExDesc: "강의 내용을 바로 실습할 수 있는 JSON 다운로드",
    tutDesc: "슬라이드 강의 + 퀴즈 + AI 질문",
    lvAll: "전체", lvBeginner: "입문", lvIntermediate: "중급", lvAdvanced: "고급",
    lvBeginnerIcon: "🌱 입문", lvIntermediateIcon: "🌿 중급", lvAdvancedIcon: "🌳 고급",

    // Spec engine
    specVramWarn: "현재 VRAM으로는 FP8/GGUF 필수", specFP8: "FP8로 VRAM 30-40% 절약", specGGUF: "GGUF로 대형 모델 구동",
    specTeaCache: "TeaCache로 3배 속도 향상", specUpscaleRec: "480p→업스케일 추천", specWeightStream: "Weight Streaming으로 RAM 활용",
    // Validation
    valNoNodes: "워크플로우에 노드가 없습니다", valNoLink: "입력이 연결되지 않았습니다",
    valNoKS: "KSampler 노드가 없습니다", valNoSave: "Save 노드가 없습니다",
    valStructErr: "구조 오류", valSpaceModel: "모델 파일명에 공백", valSpaceWarn: "파일명에 공백이 있으면 오류가 발생합니다. 공백 없는 파일명으로 변경하세요.",
    valJsonErr: "JSON 파싱 오류", valJsonWarn: "유효한 ComfyUI 워크플로우 JSON이 아닙니다.",
    // InstallDownloads
    idTitle: "설치 스크립트 다운로드", idDesc: "배치파일/셸 스크립트로 ComfyUI를 쉽게 설치하세요",
    idCollapse: "접기", idExpand: "코드 보기", idDownload: "↓ 다운로드", idUsage: "사용 방법",
    idWinUsage: ".bat 다운로드 → 우클릭 → 관리자 권한으로 실행",
    idMacUsage: "터미널에서", idJsonDl: "↓ JSON 다운로드",
    idJsonUsage: "JSON을 ComfyUI에 드래그 앤 드롭 → Manager가 자동 설치 안내",
    // Prompt builder (sub strings)
    pbDesc: "태그를 클릭하여 조합하거나 템플릿을 선택하세요", pbTemplates: "템플릿",
    pbTags: "태그 (클릭하여 추가)", pbPromptLabel: "프롬프트",
    pbOptimizing: "최적화 중...", pbOptimize: "✨ AI 최적화",
    // Debugger (sub strings)
    dbDesc: "에러 메시지를 붙여넣으세요", dbPlaceholder: "ComfyUI 에러 메시지를 여기에 붙여넣으세요...",
    dbWfPlaceholder: "(선택) 워크플로우 JSON도 붙여넣으면 더 정확한 진단이 가능합니다",
    dbAILoading: "AI 분석 중...", dbAIBtn: "🤖 AI 심층 분석",
    dbAIDiagnosis: "AI 진단", dbPrevention: "예방",
    dbAIFail: "AI 분석 실패", dbMoreDetail: "에러 메시지를 더 자세히 입력해주세요",
    // Node ref (sub)
    nrDesc: "ComfyUI 핵심 노드의 입출력과 사용법", nrSearch: "노드 검색...",
    // Custom nodes (sub)
    cnDesc: "ComfyUI Manager에서 검색하여 설치하세요",
    // AI generate
    aiPlaceholder: "예: 실사풍 제품 배경 교체, 4K 업스케일",
    aiExamples: "실사 인물 사진,제품 배경 교체,이미지→비디오,애니메이션",
    aiAnalyzing: "분석 중...", aiGenerate: "생성 →", aiFail: "AI 분석 실패",
    aiJsonFail: "유효한 JSON 파일이 아닙니다", aiJsonInvalid: "유효한 JSON이 아닙니다",
    // Improver (sub)
    impDesc: "기존 워크플로우를 첨부하고 개선 요청을 입력하세요",
    impStep1: "① 워크플로우 JSON", impStep2: "② 개선 요청",
    impLoaded: "✓ JSON 로드됨", impUpload: "📁 JSON 파일 업로드", impOr: "또는",
    impPasteHint: "ComfyUI 워크플로우 JSON을 여기에 붙여넣으세요...",
    impReqPlaceholder: "예시:\n• 품질을 높이기 위해 steps와 CFG를 최적화해줘\n• LoRA를 추가하고 디테일을 강화해줘",
    impAnalyzing: "AI 분석 중...", impAnalyzingDesc: "워크플로우 구조 파악 → 개선안 생성",
    impBtn: "🔧 워크플로우 개선하기", impFail: "AI 개선 분석 실패",
    impRetryMsg: "다시 시도해주세요", impUnit: "개", impConn: "연결",
    // Spec panel
    spSpeed: "속도", spExpected: "예상", spOwned: "보유",
    // Result page (sub)
    rsLinked: "링크 복사됨!", rsShare: "공유",
    rsModel: "모델", rsDefault: "기본", rsResolution: "해상도",
    rsUsage: "사용법: JSON 다운로드 → ComfyUI → Manager → Run",
    // Models page (sub)
    mpTitle: "카테고리별 최적 모델", mpFilter: "기준",
    mpVramLow: "⚠ VRAM 부족", mpFP8Req: "⚠ FP8/GGUF 필요",
    mpApply: "설정 적용", mpNoTrigger: "트리거 워드 불필요", mpTrigger: "트리거 워드",
    mpUsage: "용도", mpDlCivitai: "↓ Civitai에서 다운로드", mpDlHF: "↓ HuggingFace에서 다운로드",
    mpViewEx: "예시 이미지 보기", mpApplyWf: "워크플로우에 적용",
    // Install page
    ipTitle: "ComfyUI 설치", ipDesc: "배치파일/셸 스크립트로 원클릭 설치",
    ipQuickStart: "빠른 시작 가이드",
    ipStep1: "스크립트 다운로드", ipStep1d: "OS에 맞는 설치 파일",
    ipStep2: "실행", ipStep2d: "관리자 권한 실행",
    ipStep3: "모델 설치", ipStep3d: "체크포인트 다운로드",
    ipStep4: "생성 시작!", ipStep4d: "브라우저 접속",
    ipDesktop: "Desktop App (가장 쉬움)", ipDesktopDesc: "스크립트 대신 공식 앱 사용",
    ipDesktopDl: "comfy.org 다운로드 →",
    ipFolder: "설치 후 폴더 구조",
    ipCheckpoint: "체크포인트", ipUpscaler: "업스케일러", ipCustomNode: "커스텀 노드",
    ipOutput: "생성 결과", ipMain: "실행 파일",
    // External resources
    extResources: "외부 리소스", extDocs: "ComfyUI 공식 문서", extExamples: "공식 예제",
    // Export modal (sub)
    exClose: "✕ 닫기",
    exStep1: "1. 아래 텍스트 박스를 클릭하세요",
    exStep2: "2. Ctrl+A (전체 선택) → Ctrl+C (복사)",
    exStep3: "3. 메모장 또는 ComfyUI에 Ctrl+V (붙여넣기)",
    // Preset banner
    pbModelWarn: "모델 파일명을 입력해주세요",
    pbModelWarnDesc: "아래 모델 파일명 필드에 ComfyUI checkpoints 폴더의 실제 파일명을 입력하세요",
    pbApplied: "권장 설정 적용됨", pbModelHint: "모델을 클릭하면 최적 설정으로 변경됩니다",
    // Config model field
    cfgModelTitle: "모델 파일명", cfgRequired: "(필수 입력)",
    cfgModelPH: "예: realvisxlV50_v50BakedVAE.safetensors",
    cfgModelHelp: "ComfyUI models/checkpoints/ 폴더의 실제 파일명을 입력하세요.",
    cfgModelCheck: "파일명 확인: ComfyUI 실행 → 왼쪽 패널 → Load Checkpoint → 드롭다운 목록",
    cfgNewSeed: "새 랜덤 시드",
    nodes: "노드", connections: "연결",
  },
  en: {
    navWorkflow: "Workflow", navModels: "Models", navNodes: "Nodes", navTutorials: "Tutorials", navInstall: "Install",
    modeManual: "Manual", modeAI: "AI Auto", modePrompt: "🎨 Prompt", modeDebug: "🔍 Debug", modeImprove: "🔧 Improve",
    genTitle: "Generate Workflow", genDesc: "Easily create ComfyUI workflows.",
    genReady: "Generate Ready-to-Use Workflow →", genModelRequired: "⚠ Enter model filename first",
    genBack: "← Back", genNew: "New Workflow",
    catT2I: "Text → Image", catI2I: "Image → Image", catInpaint: "Inpainting", catUpscale: "Upscale",
    catT2V: "Text → Video", catI2V: "Image → Video", catCN: "ControlNet", catLora: "LoRA", catBatch: "Batch",
    cfgModelLabel: "Model Filename", cfgModelRequired: "(required)",
    cfgModelPlaceholder: "e.g. realvisxlV50_v50BakedVAE.safetensors",
    cfgModelHelp: "Enter the actual filename from ComfyUI models/checkpoints/ folder.",
    cfgModelCheck: "Check filename: Run ComfyUI → Left panel → Load Checkpoint → Dropdown list",
    cfgSampler: "Sampler", cfgPrompt: "Prompt", cfgParams: "Parameters", cfgResPreset: "Resolution Presets",
    cfgSeedHelp: "🎲 New random seed · ↻ Regenerate · Same seed = Same result",
    presetApplied: "Recommended settings applied", presetModelHint: "Click a model to apply optimal settings",
    presetModelWarn: "Please enter a model filename", presetModelWarnDesc: 'Enter the actual filename from your ComfyUI checkpoints folder below',
    resultTitle: "Ready-to-Use Workflow", resultApplied: "Recommended settings applied",
    resultCopy: "📋 Copy", resultDownload: "📋 Download", resultShare: "Share",
    resultSettings: "Applied Settings", resultModel: "Model", resultRes: "Resolution",
    resultUsage: "Usage: Download JSON → Drag into ComfyUI → Install models via Manager → Run",
    tabGraph: "Graph", tabJSON: "JSON", tabAPI: "API Format", tabSpec: "Recommended Specs",
    modTitle: "Civitai Recommended Models", modFilter: "Filter", modApply: "Apply to Workflow",
    modDownCivitai: "↓ Download from Civitai", modDownHF: "↓ Download from HuggingFace",
    modViewExamples: "View Examples", modRecommended: "Civitai Recommended",
    modVramLow: "⚠ Low VRAM", modCustomTitle: "Recommended Custom Nodes", modCustomDesc: "Search and install via ComfyUI Manager",
    refTitle: "Node Reference", refDesc: "Inputs, outputs and usage of core ComfyUI nodes", refSearch: "Search nodes...", refAll: "All",
    tutTitle: "ComfyUI Tutorials", tutDesc: "Slide lessons + Quizzes + AI Q&A",
    tutExTitle: "Example Workflows", tutExDesc: "Download and apply directly to ComfyUI",
    instTitle: "ComfyUI Installation Guide", instQuickStart: "Quick Start", instDesktop: "Easy start with Desktop App",
    instFolder: "Folder Structure", instScripts: "Install Scripts",
    promptTitle: "Prompt Builder", promptDesc: "Click tags to combine or choose a template",
    promptTemplates: "Templates", promptTags: "Tags (click to add)", promptResult: "Prompt",
    promptOptimize: "✨ AI Optimize", promptOptimizing: "Optimizing...", promptApply: "Apply Prompt",
    debugTitle: "Workflow Debugger", debugDesc: "Paste ComfyUI error messages here",
    debugPlaceholder: "Paste ComfyUI error messages here...",
    debugWfPlaceholder: "(Optional) Paste workflow JSON for more accurate diagnosis",
    debugAutoResult: "Auto Diagnosis", debugAIBtn: "🤖 AI Deep Analysis", debugAILoading: "AI analyzing...",
    debugAIDiagnosis: "AI Diagnosis", debugPrevention: "Prevention",
    improveTitle: "Improve Workflow", improveDesc: "Upload your workflow and describe improvements",
    improveStep1: "① Workflow JSON", improveStep2: "② Improvement Request",
    improveUpload: "📁 Upload JSON", improveLoaded: "✓ JSON Loaded",
    improveParsed: "Parsed", improveInvalid: "Invalid JSON",
    improveBtn: "🔧 Improve Workflow", improveAnalyzing: "AI analyzing...",
    improveResultTitle: "AI Analysis Result", improveChanges: "Changes",
    improveBefore: "Before", improveAfter: "After",
    improveImproved: "Improved Workflow", improveRetry: "← Try Again",
    improveChain: "Continue Improving", improveView: "View in Workflow Tab",
    qcQuality: "Optimize quality (steps/CFG)", qcLora: "Add LoRA for detail",
    qcUpscale: "Add upscale node", qcLowVram: "Low VRAM optimization", qcPrompt: "Improve prompt",
    exportCopyMethod: "How to Copy", exportStep1: "1. Click the text box below",
    exportStep2: "2. Ctrl+A (Select All) → Ctrl+C (Copy)", exportStep3: "3. Ctrl+V (Paste) in Notepad or ComfyUI",
    exportClose: "✕ Close",
    specRecommended: "Recommended Specs",
    historyTitle: "Recent Workflows",
    onboardWelcome: "Welcome to ComfyUI Workflow Studio!",
    close: "Close", all: "All", apply: "Apply", or: "or",
    modelAlert: "⚠ Please enter the model filename.\n\nEnter the actual filename from ComfyUI models/checkpoints/ folder.\nExample: realvisxlV50_v50BakedVAE.safetensors",

    tutProgress: "Learning Progress", tutSlides: "slides", tutQuiz: "quiz", tutQuizTitle: "Quiz",
    tutPrev: "← Previous", tutNext: "Next →", tutQuizStart: "Take Quiz →",
    tutCorrect: "correct", tutPerfect: "Perfect!", tutReview: "Review the wrong answers",
    tutDetail: "📖 Details", tutClose: "Close", tutStart: "Start",
    tutComplete: "complete", tutDownloadScripts: "⬇ Download Install Scripts",
    tutExTitle: "Example Workflows", tutExDesc: "Download ready-to-use JSON workflows",
    tutDesc: "Slide lessons + Quizzes + AI Q&A",
    lvAll: "All", lvBeginner: "Beginner", lvIntermediate: "Intermediate", lvAdvanced: "Advanced",
    lvBeginnerIcon: "🌱 Beginner", lvIntermediateIcon: "🌿 Intermediate", lvAdvancedIcon: "🌳 Advanced",

    specVramWarn: "FP8/GGUF required for current VRAM", specFP8: "FP8 saves 30-40% VRAM", specGGUF: "GGUF enables large models",
    specTeaCache: "TeaCache 3x speedup", specUpscaleRec: "480p→upscale recommended", specWeightStream: "Weight Streaming uses RAM",
    valNoNodes: "No nodes in workflow", valNoLink: "input not connected",
    valNoKS: "No KSampler node", valNoSave: "No Save node",
    valStructErr: "Structure error", valSpaceModel: "Space in model filename", valSpaceWarn: "Spaces in filename cause errors. Rename without spaces.",
    valJsonErr: "JSON parse error", valJsonWarn: "Not a valid ComfyUI workflow JSON.",
    idTitle: "Install Script Downloads", idDesc: "Easily install ComfyUI with batch/shell scripts",
    idCollapse: "Collapse", idExpand: "View Code", idDownload: "↓ Download", idUsage: "How to Use",
    idWinUsage: "Download .bat → Right-click → Run as Administrator",
    idMacUsage: "In terminal:", idJsonDl: "↓ JSON Download",
    idJsonUsage: "Drag JSON into ComfyUI → Manager auto-installs missing models",
    pbDesc: "Click tags to combine or choose a template", pbTemplates: "Templates",
    pbTags: "Tags (click to add)", pbPromptLabel: "Prompt",
    pbOptimizing: "Optimizing...", pbOptimize: "✨ AI Optimize",
    dbDesc: "Paste error messages here", dbPlaceholder: "Paste ComfyUI error messages here...",
    dbWfPlaceholder: "(Optional) Paste workflow JSON for more accurate diagnosis",
    dbAILoading: "AI analyzing...", dbAIBtn: "🤖 AI Deep Analysis",
    dbAIDiagnosis: "AI Diagnosis", dbPrevention: "Prevention",
    dbAIFail: "AI analysis failed", dbMoreDetail: "Please provide more error details",
    nrDesc: "Inputs, outputs and usage of core nodes", nrSearch: "Search nodes...",
    cnDesc: "Search and install via ComfyUI Manager",
    aiPlaceholder: "e.g. Realistic product background swap, 4K upscale",
    aiExamples: "Realistic portrait,Background swap,Image→Video,Animation",
    aiAnalyzing: "Analyzing...", aiGenerate: "Generate →", aiFail: "AI analysis failed",
    aiJsonFail: "Not a valid JSON file", aiJsonInvalid: "Invalid JSON",
    impDesc: "Upload your workflow and describe improvements",
    impStep1: "① Workflow JSON", impStep2: "② Improvement Request",
    impLoaded: "✓ JSON Loaded", impUpload: "📁 Upload JSON", impOr: "or",
    impPasteHint: "Paste ComfyUI workflow JSON here...",
    impReqPlaceholder: "Examples:\n• Optimize steps and CFG for quality\n• Add LoRA for detail",
    impAnalyzing: "AI analyzing...", impAnalyzingDesc: "Analyzing workflow → Generating improvements",
    impBtn: "🔧 Improve Workflow", impFail: "AI improvement failed",
    impRetryMsg: "Please try again", impUnit: "", impConn: "connections",
    spSpeed: "Speed", spExpected: "Expected", spOwned: "Owned",
    rsLinked: "Link copied!", rsShare: "Share",
    rsModel: "Model", rsDefault: "Default", rsResolution: "Resolution",
    rsUsage: "Usage: Download JSON → Drag into ComfyUI → Install models via Manager → Run",
    mpTitle: "Best Models by Category", mpFilter: "Filter",
    mpVramLow: "⚠ Low VRAM", mpFP8Req: "⚠ FP8/GGUF Required",
    mpApply: "Apply Settings", mpNoTrigger: "No trigger word needed", mpTrigger: "Trigger word",
    mpUsage: "Usage", mpDlCivitai: "↓ Download from Civitai", mpDlHF: "↓ Download from HuggingFace",
    mpViewEx: "View sample images", mpApplyWf: "Apply to Workflow",
    ipTitle: "ComfyUI Install", ipDesc: "One-click install with batch/shell scripts",
    ipQuickStart: "Quick Start Guide",
    ipStep1: "Download Script", ipStep1d: "Install file for your OS",
    ipStep2: "Run", ipStep2d: "Run as admin",
    ipStep3: "Install Models", ipStep3d: "Download checkpoints",
    ipStep4: "Start Creating!", ipStep4d: "Open browser",
    ipDesktop: "Desktop App (Easiest)", ipDesktopDesc: "Use official app instead of scripts",
    ipDesktopDl: "comfy.org Download →",
    ipFolder: "Folder Structure After Install",
    ipCheckpoint: "Checkpoints", ipUpscaler: "Upscalers", ipCustomNode: "Custom Nodes",
    ipOutput: "Generated Output", ipMain: "Main Script",
    extResources: "External Resources", extDocs: "ComfyUI Official Docs", extExamples: "Official Examples",
    exClose: "✕ Close",
    exStep1: "1. Click the text box below",
    exStep2: "2. Ctrl+A (Select All) → Ctrl+C (Copy)",
    exStep3: "3. Ctrl+V (Paste) in Notepad or ComfyUI",
    pbModelWarn: "Please enter a model filename",
    pbModelWarnDesc: "Enter the actual filename from your ComfyUI checkpoints folder below",
    pbApplied: "Recommended settings applied", pbModelHint: "Click a model to apply optimal settings",
    cfgModelTitle: "Model Filename", cfgRequired: "(required)",
    cfgModelPH: "e.g. realvisxlV50_v50BakedVAE.safetensors",
    cfgModelHelp: "Enter actual filename from ComfyUI models/checkpoints/.",
    cfgModelCheck: "Check: Run ComfyUI → Left panel → Load Checkpoint → Dropdown",
    cfgNewSeed: "New random seed",
    nodes: "nodes", connections: "connections",
  },
  zh: {
    navWorkflow: "工作流", navModels: "模型", navNodes: "节点", navTutorials: "教程", navInstall: "安装",
    modeManual: "手动", modeAI: "AI 自动", modePrompt: "🎨 提示词", modeDebug: "🔍 调试", modeImprove: "🔧 优化",
    genTitle: "生成工作流", genDesc: "轻松创建ComfyUI工作流。",
    genReady: "生成可直接使用的工作流 →", genModelRequired: "⚠ 请先输入模型文件名",
    genBack: "← 返回", genNew: "新工作流",
    catT2I: "文生图", catI2I: "图生图", catInpaint: "局部重绘", catUpscale: "超分辨率",
    catT2V: "文生视频", catI2V: "图生视频", catCN: "ControlNet", catLora: "LoRA", catBatch: "批量生成",
    cfgModelLabel: "模型文件名", cfgModelRequired: "(必填)",
    cfgModelPlaceholder: "例: realvisxlV50_v50BakedVAE.safetensors",
    cfgModelHelp: "请输入 ComfyUI models/checkpoints/ 文件夹中的实际文件名。",
    cfgModelCheck: "确认文件名：运行 ComfyUI → 左侧面板 → Load Checkpoint → 下拉列表",
    cfgSampler: "采样器", cfgPrompt: "提示词", cfgParams: "参数", cfgResPreset: "分辨率预设",
    cfgSeedHelp: "🎲 新随机种子 · ↻ 重新生成 · 相同种子 = 相同结果",
    presetApplied: "已应用推荐设置", presetModelHint: "点击模型应用最佳设置",
    presetModelWarn: "请输入模型文件名", presetModelWarnDesc: '请在下方"模型文件名"字段中输入ComfyUI checkpoints文件夹的实际文件名',
    resultTitle: "可直接使用的工作流", resultApplied: "已应用推荐设置",
    resultCopy: "📋 复制", resultDownload: "📋 下载", resultShare: "分享",
    resultSettings: "已应用设置", resultModel: "模型", resultRes: "分辨率",
    resultUsage: "使用方法：下载JSON → 拖入ComfyUI → 通过Manager安装模型 → 运行",
    tabGraph: "图表", tabJSON: "JSON", tabAPI: "API 格式", tabSpec: "推荐配置",
    modTitle: "Civitai 推荐模型", modFilter: "筛选", modApply: "应用到工作流",
    modDownCivitai: "↓ 从Civitai下载", modDownHF: "↓ 从HuggingFace下载",
    modViewExamples: "查看示例", modRecommended: "Civitai 推荐",
    modVramLow: "⚠ 显存不足", modCustomTitle: "推荐自定义节点", modCustomDesc: "通过ComfyUI Manager搜索安装",
    refTitle: "节点参考", refDesc: "ComfyUI核心节点的输入输出和用法", refSearch: "搜索节点...", refAll: "全部",
    tutTitle: "ComfyUI 教程", tutDesc: "幻灯片课程 + 测验 + AI问答",
    tutExTitle: "示例工作流", tutExDesc: "下载后直接在ComfyUI中使用",
    instTitle: "ComfyUI 安装指南", instQuickStart: "快速开始", instDesktop: "通过桌面应用轻松开始",
    instFolder: "文件夹结构", instScripts: "安装脚本",
    promptTitle: "提示词构建器", promptDesc: "点击标签组合或选择模板",
    promptTemplates: "模板", promptTags: "标签（点击添加）", promptResult: "提示词",
    promptOptimize: "✨ AI优化", promptOptimizing: "优化中...", promptApply: "应用提示词",
    debugTitle: "工作流调试器", debugDesc: "粘贴ComfyUI错误信息",
    debugPlaceholder: "在此粘贴ComfyUI错误信息...",
    debugWfPlaceholder: "（可选）粘贴工作流JSON以获得更准确的诊断",
    debugAutoResult: "自动诊断结果", debugAIBtn: "🤖 AI深度分析", debugAILoading: "AI分析中...",
    debugAIDiagnosis: "AI诊断", debugPrevention: "预防",
    improveTitle: "优化工作流", improveDesc: "上传工作流并描述改进需求",
    improveStep1: "① 工作流JSON", improveStep2: "② 改进请求",
    improveUpload: "📁 上传JSON", improveLoaded: "✓ JSON已加载",
    improveParsed: "解析完成", improveInvalid: "JSON格式无效",
    improveBtn: "🔧 优化工作流", improveAnalyzing: "AI分析中...",
    improveResultTitle: "AI分析结果", improveChanges: "更改内容",
    improveBefore: "优化前", improveAfter: "优化后",
    improveImproved: "优化后的工作流", improveRetry: "← 重新优化",
    improveChain: "继续优化", improveView: "在工作流标签中查看",
    qcQuality: "优化质量 (steps/CFG)", qcLora: "添加LoRA增强细节",
    qcUpscale: "添加超分辨率节点", qcLowVram: "低显存优化", qcPrompt: "改进提示词",
    exportCopyMethod: "复制方法", exportStep1: "1. 点击下方文本框",
    exportStep2: "2. Ctrl+A（全选）→ Ctrl+C（复制）", exportStep3: "3. 在记事本或ComfyUI中 Ctrl+V（粘贴）",
    exportClose: "✕ 关闭",
    specRecommended: "推荐配置",
    historyTitle: "最近的工作流",
    onboardWelcome: "欢迎使用 ComfyUI Workflow Studio！",
    close: "关闭", all: "全部", apply: "应用", or: "或",
    modelAlert: "⚠ 请输入模型文件名。\n\n请输入ComfyUI models/checkpoints/文件夹中的实际文件名。\n示例: realvisxlV50_v50BakedVAE.safetensors",

    tutProgress: "学习进度", tutSlides: "幻灯片", tutQuiz: "测验", tutQuizTitle: "测验",
    tutPrev: "← 上一页", tutNext: "下一页 →", tutQuizStart: "开始测验 →",
    tutCorrect: "正确", tutPerfect: "完美！", tutReview: "复习错题吧",
    tutDetail: "📖 详细说明", tutClose: "关闭", tutStart: "开始",
    tutComplete: "完成", tutDownloadScripts: "⬇ 下载安装脚本",
    tutExTitle: "示例工作流", tutExDesc: "下载可直接使用的JSON工作流",
    tutDesc: "幻灯片课程 + 测验 + AI问答",
    lvAll: "全部", lvBeginner: "入门", lvIntermediate: "中级", lvAdvanced: "高级",
    lvBeginnerIcon: "🌱 入门", lvIntermediateIcon: "🌿 中级", lvAdvancedIcon: "🌳 高级",

    specVramWarn: "当前VRAM需要FP8/GGUF", specFP8: "FP8节省30-40% VRAM", specGGUF: "GGUF运行大模型",
    specTeaCache: "TeaCache 3倍加速", specUpscaleRec: "480p→超分推荐", specWeightStream: "Weight Streaming利用RAM",
    valNoNodes: "工作流中没有节点", valNoLink: "输入未连接",
    valNoKS: "没有KSampler节点", valNoSave: "没有Save节点",
    valStructErr: "结构错误", valSpaceModel: "模型文件名有空格", valSpaceWarn: "文件名空格会导致错误，请重命名。",
    valJsonErr: "JSON解析错误", valJsonWarn: "不是有效的ComfyUI工作流JSON。",
    idTitle: "安装脚本下载", idDesc: "用批处理/Shell脚本轻松安装ComfyUI",
    idCollapse: "收起", idExpand: "查看代码", idDownload: "↓ 下载", idUsage: "使用方法",
    idWinUsage: "下载.bat → 右键 → 以管理员身份运行",
    idMacUsage: "在终端中:", idJsonDl: "↓ JSON下载",
    idJsonUsage: "将JSON拖入ComfyUI → Manager自动安装缺少的模型",
    pbDesc: "点击标签组合或选择模板", pbTemplates: "模板",
    pbTags: "标签（点击添加）", pbPromptLabel: "提示词",
    pbOptimizing: "优化中...", pbOptimize: "✨ AI优化",
    dbDesc: "粘贴错误信息", dbPlaceholder: "在此粘贴ComfyUI错误信息...",
    dbWfPlaceholder: "（可选）粘贴工作流JSON以获得更准确的诊断",
    dbAILoading: "AI分析中...", dbAIBtn: "🤖 AI深度分析",
    dbAIDiagnosis: "AI诊断", dbPrevention: "预防",
    dbAIFail: "AI分析失败", dbMoreDetail: "请提供更多错误信息",
    nrDesc: "核心节点的输入输出和用法", nrSearch: "搜索节点...",
    cnDesc: "通过ComfyUI Manager搜索安装",
    aiPlaceholder: "例：实景产品背景替换，4K超分",
    aiExamples: "实景人像,产品背景替换,图→视频,动画",
    aiAnalyzing: "分析中...", aiGenerate: "生成 →", aiFail: "AI分析失败",
    aiJsonFail: "不是有效的JSON文件", aiJsonInvalid: "无效的JSON",
    impDesc: "上传工作流并描述改进需求",
    impStep1: "① 工作流JSON", impStep2: "② 改进请求",
    impLoaded: "✓ JSON已加载", impUpload: "📁 上传JSON", impOr: "或",
    impPasteHint: "在此粘贴ComfyUI工作流JSON...",
    impReqPlaceholder: "示例：\n• 优化steps和CFG提高质量\n• 添加LoRA增强细节",
    impAnalyzing: "AI分析中...", impAnalyzingDesc: "分析工作流 → 生成改进方案",
    impBtn: "🔧 优化工作流", impFail: "AI优化分析失败",
    impRetryMsg: "请重试", impUnit: "个", impConn: "连接",
    spSpeed: "速度", spExpected: "预期", spOwned: "拥有",
    rsLinked: "链接已复制!", rsShare: "分享",
    rsModel: "模型", rsDefault: "默认", rsResolution: "分辨率",
    rsUsage: "使用：下载JSON → 拖入ComfyUI → Manager安装模型 → 运行",
    mpTitle: "分类最佳模型", mpFilter: "筛选",
    mpVramLow: "⚠ 显存不足", mpFP8Req: "⚠ 需要FP8/GGUF",
    mpApply: "应用设置", mpNoTrigger: "无需触发词", mpTrigger: "触发词",
    mpUsage: "用途", mpDlCivitai: "↓ 从Civitai下载", mpDlHF: "↓ 从HuggingFace下载",
    mpViewEx: "查看示例图片", mpApplyWf: "应用到工作流",
    ipTitle: "ComfyUI 安装", ipDesc: "批处理/Shell脚本一键安装",
    ipQuickStart: "快速开始指南",
    ipStep1: "下载脚本", ipStep1d: "适合您OS的安装文件",
    ipStep2: "运行", ipStep2d: "以管理员运行",
    ipStep3: "安装模型", ipStep3d: "下载检查点",
    ipStep4: "开始创作!", ipStep4d: "打开浏览器",
    ipDesktop: "桌面应用（最简单）", ipDesktopDesc: "用官方应用代替脚本",
    ipDesktopDl: "comfy.org 下载 →",
    ipFolder: "安装后文件夹结构",
    ipCheckpoint: "检查点", ipUpscaler: "超分模型", ipCustomNode: "自定义节点",
    ipOutput: "生成结果", ipMain: "主脚本",
    extResources: "外部资源", extDocs: "ComfyUI官方文档", extExamples: "官方示例",
    exClose: "✕ 关闭",
    exStep1: "1. 点击下方文本框",
    exStep2: "2. Ctrl+A（全选）→ Ctrl+C（复制）",
    exStep3: "3. 在记事本或ComfyUI中Ctrl+V（粘贴）",
    pbModelWarn: "请输入模型文件名",
    pbModelWarnDesc: "在下方输入ComfyUI checkpoints文件夹的实际文件名",
    pbApplied: "已应用推荐设置", pbModelHint: "点击模型应用最佳设置",
    cfgModelTitle: "模型文件名", cfgRequired: "(必填)",
    cfgModelPH: "例: realvisxlV50_v50BakedVAE.safetensors",
    cfgModelHelp: "输入ComfyUI models/checkpoints/的实际文件名。",
    cfgModelCheck: "确认：运行ComfyUI → 左面板 → Load Checkpoint → 下拉列表",
    cfgNewSeed: "新随机种子",
    nodes: "节点", connections: "连接",
  },
  ja: {
    navWorkflow: "ワークフロー", navModels: "モデル", navNodes: "ノード", navTutorials: "チュートリアル", navInstall: "インストール",
    modeManual: "手動", modeAI: "AI 自動", modePrompt: "🎨 プロンプト", modeDebug: "🔍 デバッグ", modeImprove: "🔧 改善",
    genTitle: "ワークフロー生成", genDesc: "簡単にComfyUIワークフローを作成しましょう。",
    genReady: "すぐ使えるワークフローを生成 →", genModelRequired: "⚠ モデルファイル名を先に入力してください",
    genBack: "← 戻る", genNew: "新しいワークフロー",
    catT2I: "テキスト→画像", catI2I: "画像→画像", catInpaint: "インペイント", catUpscale: "アップスケール",
    catT2V: "テキスト→動画", catI2V: "画像→動画", catCN: "ControlNet", catLora: "LoRA", catBatch: "バッチ",
    cfgModelLabel: "モデルファイル名", cfgModelRequired: "(必須)",
    cfgModelPlaceholder: "例: realvisxlV50_v50BakedVAE.safetensors",
    cfgModelHelp: "ComfyUI models/checkpoints/ フォルダの実際のファイル名を入力してください。",
    cfgModelCheck: "ファイル名確認：ComfyUI起動 → 左パネル → Load Checkpoint → ドロップダウン",
    cfgSampler: "サンプラー", cfgPrompt: "プロンプト", cfgParams: "パラメータ", cfgResPreset: "解像度プリセット",
    cfgSeedHelp: "🎲 新しいランダムシード · ↻ 再生成 · 同じシード = 同じ結果",
    presetApplied: "推奨設定を適用済み", presetModelHint: "モデルをクリックすると最適な設定が適用されます",
    presetModelWarn: "モデルファイル名を入力してください", presetModelWarnDesc: '下の「モデルファイル名」欄にComfyUIのcheckpointsフォルダの実際のファイル名を入力してください',
    resultTitle: "すぐ使えるワークフロー", resultApplied: "推奨設定を適用済み",
    resultCopy: "📋 コピー", resultDownload: "📋 ダウンロード", resultShare: "共有",
    resultSettings: "適用された設定", resultModel: "モデル", resultRes: "解像度",
    resultUsage: "使い方：JSONダウンロード → ComfyUIにドラッグ → Managerでモデルインストール → 実行",
    tabGraph: "グラフ", tabJSON: "JSON", tabAPI: "API形式", tabSpec: "推奨スペック",
    modTitle: "Civitai おすすめモデル", modFilter: "フィルター", modApply: "ワークフローに適用",
    modDownCivitai: "↓ Civitaiからダウンロード", modDownHF: "↓ HuggingFaceからダウンロード",
    modViewExamples: "サンプル画像を見る", modRecommended: "Civitai おすすめ",
    modVramLow: "⚠ VRAM不足", modCustomTitle: "おすすめカスタムノード", modCustomDesc: "ComfyUI Managerで検索してインストール",
    refTitle: "ノードリファレンス", refDesc: "ComfyUIの主要ノードの入出力と使い方", refSearch: "ノード検索...", refAll: "すべて",
    tutTitle: "ComfyUI チュートリアル", tutDesc: "スライド講座 + クイズ + AI質問",
    tutExTitle: "サンプルワークフロー", tutExDesc: "ダウンロードしてComfyUIにそのまま適用可能",
    instTitle: "ComfyUI インストールガイド", instQuickStart: "クイックスタート", instDesktop: "デスクトップアプリで簡単に始める",
    instFolder: "フォルダ構造", instScripts: "インストールスクリプト",
    promptTitle: "プロンプトビルダー", promptDesc: "タグをクリックして組み合わせるかテンプレートを選択",
    promptTemplates: "テンプレート", promptTags: "タグ（クリックして追加）", promptResult: "プロンプト",
    promptOptimize: "✨ AI最適化", promptOptimizing: "最適化中...", promptApply: "プロンプトを適用",
    debugTitle: "ワークフローデバッガー", debugDesc: "ComfyUIのエラーメッセージを貼り付けてください",
    debugPlaceholder: "ComfyUIのエラーメッセージをここに貼り付けてください...",
    debugWfPlaceholder: "（任意）ワークフローJSONも貼り付けるとより正確な診断が可能です",
    debugAutoResult: "自動診断結果", debugAIBtn: "🤖 AI詳細分析", debugAILoading: "AI分析中...",
    debugAIDiagnosis: "AI診断", debugPrevention: "予防",
    improveTitle: "ワークフロー改善", improveDesc: "ワークフローをアップロードして改善内容を入力してください",
    improveStep1: "① ワークフローJSON", improveStep2: "② 改善リクエスト",
    improveUpload: "📁 JSONアップロード", improveLoaded: "✓ JSON読み込み済み",
    improveParsed: "解析完了", improveInvalid: "無効なJSONです",
    improveBtn: "🔧 ワークフロー改善", improveAnalyzing: "AI分析中...",
    improveResultTitle: "AI分析結果", improveChanges: "変更点",
    improveBefore: "改善前", improveAfter: "改善後",
    improveImproved: "改善されたワークフロー", improveRetry: "← やり直す",
    improveChain: "結果をさらに改善", improveView: "ワークフロータブで表示",
    qcQuality: "品質最適化 (steps/CFG)", qcLora: "LoRAでディテール強化",
    qcUpscale: "アップスケールノード追加", qcLowVram: "低VRAMの最適化", qcPrompt: "プロンプト改善",
    exportCopyMethod: "コピー方法", exportStep1: "1. 下のテキストボックスをクリック",
    exportStep2: "2. Ctrl+A（全選択）→ Ctrl+C（コピー）", exportStep3: "3. メモ帳またはComfyUIで Ctrl+V（貼り付け）",
    exportClose: "✕ 閉じる",
    specRecommended: "推奨スペック",
    historyTitle: "最近のワークフロー",
    onboardWelcome: "ComfyUI Workflow Studioへようこそ！",
    close: "閉じる", all: "すべて", apply: "適用", or: "または",
    modelAlert: "⚠ モデルファイル名を入力してください。\n\nComfyUI models/checkpoints/ フォルダの実際のファイル名を入力してください。\n例: realvisxlV50_v50BakedVAE.safetensors",

    tutProgress: "学習進捗", tutSlides: "スライド", tutQuiz: "クイズ", tutQuizTitle: "クイズ",
    tutPrev: "← 前へ", tutNext: "次へ →", tutQuizStart: "クイズに挑戦 →",
    tutCorrect: "正解", tutPerfect: "完璧です！", tutReview: "間違えた問題を復習しましょう",
    tutDetail: "📖 詳細説明", tutClose: "閉じる", tutStart: "始める",
    tutComplete: "完了", tutDownloadScripts: "⬇ インストールスクリプトをダウンロード",
    tutExTitle: "サンプルワークフロー", tutExDesc: "ダウンロードしてComfyUIにそのまま適用可能",
    tutDesc: "スライド講座 + クイズ + AI質問",
    lvAll: "すべて", lvBeginner: "入門", lvIntermediate: "中級", lvAdvanced: "上級",
    lvBeginnerIcon: "🌱 入門", lvIntermediateIcon: "🌿 中級", lvAdvancedIcon: "🌳 上級",

    specVramWarn: "現在のVRAMにはFP8/GGUF必須", specFP8: "FP8でVRAM 30-40%節約", specGGUF: "GGUFで大型モデル実行",
    specTeaCache: "TeaCacheで3倍高速化", specUpscaleRec: "480p→アップスケール推奨", specWeightStream: "Weight StreamingでRAM活用",
    valNoNodes: "ワークフローにノードがありません", valNoLink: "入力が接続されていません",
    valNoKS: "KSamplerノードがありません", valNoSave: "Saveノードがありません",
    valStructErr: "構造エラー", valSpaceModel: "モデルファイル名にスペース", valSpaceWarn: "ファイル名のスペースはエラーの原因になります。",
    valJsonErr: "JSON解析エラー", valJsonWarn: "有効なComfyUIワークフローJSONではありません。",
    idTitle: "インストールスクリプト", idDesc: "バッチ/シェルスクリプトで簡単インストール",
    idCollapse: "折りたたむ", idExpand: "コード表示", idDownload: "↓ ダウンロード", idUsage: "使い方",
    idWinUsage: ".batダウンロード → 右クリック → 管理者として実行",
    idMacUsage: "ターミナルで:", idJsonDl: "↓ JSONダウンロード",
    idJsonUsage: "JSONをComfyUIにドラッグ → Managerが自動インストール",
    pbDesc: "タグをクリックして組み合わせるかテンプレートを選択", pbTemplates: "テンプレート",
    pbTags: "タグ（クリックで追加）", pbPromptLabel: "プロンプト",
    pbOptimizing: "最適化中...", pbOptimize: "✨ AI最適化",
    dbDesc: "エラーメッセージを貼り付けてください", dbPlaceholder: "ComfyUIのエラーメッセージをここに...",
    dbWfPlaceholder: "（任意）ワークフローJSONも貼り付けると正確な診断が可能",
    dbAILoading: "AI分析中...", dbAIBtn: "🤖 AI詳細分析",
    dbAIDiagnosis: "AI診断", dbPrevention: "予防",
    dbAIFail: "AI分析失敗", dbMoreDetail: "エラー情報をもっと詳しく入力してください",
    nrDesc: "コアノードの入出力と使い方", nrSearch: "ノード検索...",
    cnDesc: "ComfyUI Managerで検索してインストール",
    aiPlaceholder: "例：リアル製品背景差替え、4Kアップスケール",
    aiExamples: "リアル人物,背景差替え,画像→動画,アニメ",
    aiAnalyzing: "分析中...", aiGenerate: "生成 →", aiFail: "AI分析失敗",
    aiJsonFail: "有効なJSONファイルではありません", aiJsonInvalid: "無効なJSON",
    impDesc: "ワークフローをアップロードして改善内容を入力",
    impStep1: "① ワークフローJSON", impStep2: "② 改善リクエスト",
    impLoaded: "✓ JSON読込済", impUpload: "📁 JSONアップロード", impOr: "または",
    impPasteHint: "ComfyUIワークフローJSONをここに貼り付け...",
    impReqPlaceholder: "例：\n• stepsとCFGを最適化\n• LoRA追加でディテール強化",
    impAnalyzing: "AI分析中...", impAnalyzingDesc: "ワークフロー解析 → 改善案生成",
    impBtn: "🔧 ワークフロー改善", impFail: "AI改善分析失敗",
    impRetryMsg: "再試行してください", impUnit: "個", impConn: "接続",
    spSpeed: "速度", spExpected: "予想", spOwned: "所有",
    rsLinked: "リンクコピー済!", rsShare: "共有",
    rsModel: "モデル", rsDefault: "デフォルト", rsResolution: "解像度",
    rsUsage: "使い方：JSONダウンロード → ComfyUIにドラッグ → Managerでモデルインストール → 実行",
    mpTitle: "カテゴリ別おすすめモデル", mpFilter: "フィルター",
    mpVramLow: "⚠ VRAM不足", mpFP8Req: "⚠ FP8/GGUF必要",
    mpApply: "設定適用", mpNoTrigger: "トリガーワード不要", mpTrigger: "トリガーワード",
    mpUsage: "用途", mpDlCivitai: "↓ Civitaiからダウンロード", mpDlHF: "↓ HuggingFaceからダウンロード",
    mpViewEx: "サンプル画像を見る", mpApplyWf: "ワークフローに適用",
    ipTitle: "ComfyUI インストール", ipDesc: "バッチ/シェルスクリプトでワンクリックインストール",
    ipQuickStart: "クイックスタートガイド",
    ipStep1: "スクリプトダウンロード", ipStep1d: "OS用インストールファイル",
    ipStep2: "実行", ipStep2d: "管理者として実行",
    ipStep3: "モデルインストール", ipStep3d: "チェックポイントDL",
    ipStep4: "生成開始!", ipStep4d: "ブラウザアクセス",
    ipDesktop: "Desktop App（最も簡単）", ipDesktopDesc: "スクリプト代わりに公式アプリ",
    ipDesktopDl: "comfy.org ダウンロード →",
    ipFolder: "インストール後のフォルダ構造",
    ipCheckpoint: "チェックポイント", ipUpscaler: "アップスケーラー", ipCustomNode: "カスタムノード",
    ipOutput: "生成結果", ipMain: "メインスクリプト",
    extResources: "外部リソース", extDocs: "ComfyUI公式ドキュメント", extExamples: "公式サンプル",
    exClose: "✕ 閉じる",
    exStep1: "1. 下のテキストボックスをクリック",
    exStep2: "2. Ctrl+A（全選択）→ Ctrl+C（コピー）",
    exStep3: "3. メモ帳またはComfyUIでCtrl+V（貼り付け）",
    pbModelWarn: "モデルファイル名を入力してください",
    pbModelWarnDesc: "下のモデルファイル名欄にcheckpointsフォルダの実際のファイル名を入力",
    pbApplied: "推奨設定適用済み", pbModelHint: "モデルクリックで最適設定適用",
    cfgModelTitle: "モデルファイル名", cfgRequired: "(必須)",
    cfgModelPH: "例: realvisxlV50_v50BakedVAE.safetensors",
    cfgModelHelp: "ComfyUI models/checkpoints/の実際ファイル名を入力。",
    cfgModelCheck: "確認：ComfyUI起動 → 左パネル → Load Checkpoint → ドロップダウン",
    cfgNewSeed: "新しいランダムシード",
    nodes: "ノード", connections: "接続",
  },
};
const FONT = "'DM Sans',-apple-system,'Pretendard',sans-serif";
const SERIF = "'Source Serif 4','Georgia',serif";
const MONO = "'JetBrains Mono','Fira Code',monospace";

const GEMINI_KEY = "AIzaSyD-iMG8Qcz8b0Gm9T74O_xWcMi971bR-T0";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
async function callGemini(prompt, systemInstruction) {
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };
  body.generationConfig = { temperature: 0.7, maxOutputTokens: 4096 };
  const r = await fetch(GEMINI_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.error?.message || `Gemini API error: ${r.status}`); }
  const d = await r.json();
  const parts = d.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find(p => p.text !== undefined);
  return textPart?.text || "";
}

const LANG_LABELS = { ko: "한국어", en: "English", zh: "中文", ja: "日本語" };

// ═══════════════════════════════════════════
// SPEC ENGINE - improved with model base (#16)
// ═══════════════════════════════════════════
function getSpec(category, config, userVram, lang) {
  const t = (key) => (LANG[lang] || LANG.ko)[key] || (LANG.ko)[key] || key;
  const px = (config.width || 1024) * (config.height || 1024);
  const isV = ["t2v", "i2v"].includes(category);
  const base = config.modelBase || "SDXL";
  // Model base affects VRAM needs
  const baseVram = { "SD15": 4, "SDXL": 7, "Flux": 14, "Wan": 18, "Hunyuan": 26 };
  const modelVram = baseVram[base] || 7;
  const resMulti = px > 1024 * 1024 ? 1.5 : px > 512 * 512 ? 1.0 : 0.6;
  const batchMulti = category === "batch" ? 2.0 : 1.0;
  const extraVram = (category === "lora" ? 0.5 : 0) + (category === "controlnet" ? 1.5 : 0);
  const totalVram = Math.round((modelVram * resMulti * batchMulti + extraVram) * 10) / 10;

  let tier = "mid";
  if (totalVram > 24) tier = "ultra";
  else if (totalVram > 16) tier = "high";
  else if (totalVram > 10) tier = "mid";
  else tier = "low";
  if (isV && tier === "mid") tier = "high";
  if (category === "i2v") tier = "ultra";

  const S = {
    low: { level: "Entry", color: "#4ade80", gpu: "RTX 3060 (12GB)", vram: "6-8 GB", ram: "16 GB DDR4", cpu: "i5-12400 / R5 5600X", storage: "NVMe 512GB+", time: "10-20초/img", budget: "80-120만원", minVram: 6 },
    mid: { level: "Standard", color: "#60a5fa", gpu: "RTX 4070 Ti (16GB)", vram: "12-16 GB", ram: "32 GB DDR5", cpu: "i5-13600K / R7 7700X", storage: "NVMe 1TB+", time: "5-15초/img", budget: "150-200만원", minVram: 12 },
    high: { level: "Professional", color: "#fbbf24", gpu: "RTX 4090 (24GB)", vram: "24 GB", ram: "64 GB DDR5", cpu: "i7-14700K / R9 7900X", storage: "NVMe 2TB+", time: isV ? "1-3분/vid" : "2-8초/img", budget: "300-400만원", minVram: 24 },
    ultra: { level: "Studio", color: "#f472b6", gpu: "RTX 5090 (32GB)", vram: "32 GB+", ram: "128 GB DDR5", cpu: "i9-14900K / TR", storage: "NVMe 4TB+", time: "30s-2min/vid", budget: "500만원+", minVram: 32 },
  };
  const spec = S[tier];
  const tips = [];
  if (userVram && totalVram > userVram) tips.push(`${t("specVramWarn")} (${userVram}GB)`);
  if (tier === "low" || tier === "mid") { tips.push(t("specFP8")); tips.push(t("specGGUF")); }
  if (isV) { tips.push(t("specTeaCache")); tips.push(t("specUpscaleRec")); }
  tips.push(t("specWeightStream"));
  const cloud = isV || tier === "ultra" ? { prov: "Comfy Cloud", gpu: "A100 80GB", cost: "$1.5-4/hr" } : null;
  return { ...spec, tier, tips, cloud, estimatedVram: totalVram };
}

// ═══════════════════════════════════════════
// RESOLUTION PRESETS (#9)
// ═══════════════════════════════════════════
const RES_PRESETS = {
  SDXL: [
    { label: "Square", w: 1024, h: 1024 }, { label: "Portrait", w: 896, h: 1152 },
    { label: "Landscape", w: 1152, h: 896 }, { label: "Wide", w: 1216, h: 832 },
  ],
  Flux: [
    { label: "Square", w: 1024, h: 1024 }, { label: "Portrait", w: 832, h: 1216 },
    { label: "Landscape", w: 1216, h: 832 },
  ],
  SD15: [
    { label: "Square", w: 512, h: 512 }, { label: "Portrait", w: 512, h: 768 },
    { label: "Landscape", w: 768, h: 512 },
  ],
  Video: [
    { label: "480p", w: 832, h: 480 }, { label: "720p", w: 1280, h: 720 },
  ],
};

// ═══════════════════════════════════════════
// CIVITAI MODELS (with model base tag for #4 #16)
// ═══════════════════════════════════════════
const CVM = {
  t2i: {
    realistic: [
      { name: "RealVisXL V5.0", id: "139562", base: "SDXL", vram: 8, desc: "초현실적 인물/풍경 — 피부 텍스처, 조명, 자연스러운 표정이 뛰어남", rating: 4.9, dl: "2.1M", sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 28, cfg: 4.5, style: "linear-gradient(135deg,#2a1a0a,#4a2a1a,#1a2a3a)", sampleDesc: "실사 인물, 풍경, 제품 사진", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/aeba5afe-8bde-41d2-9150-8eea2eeda9a4/width=450/aeba5afe-8bde-41d2-9150-8eea2eeda9a4.jpeg" },
      { name: "Jib Mix Flux v12", id: "686814", base: "Flux", vram: 12, desc: "Flux 기반 최고 실사 체크포인트 — 해부학 정확도, 자연스러운 피부", rating: 4.8, dl: "1.5M", sampler: "dpmpp_2m", scheduler: "sgm_uniform", steps: 25, cfg: 3.5, style: "linear-gradient(135deg,#1a1a2a,#2a3a4a,#0a1a2a)", sampleDesc: "포트레이트, 전신, 패션", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/3e1a4255-1c01-4781-99bc-b9454cbf7dd4/original=true/106313102.jpeg" },
    ],
    anime: [
      { name: "AAM XL AnimeMix", id: "248024", base: "SDXL", vram: 8, desc: "SDXL 최고 애니메이션 — 선명한 선화, 생동감 있는 컬러", rating: 4.9, dl: "1.8M", sampler: "euler_ancestral", scheduler: "normal", steps: 25, cfg: 7, style: "linear-gradient(135deg,#1a0a2a,#3a1a4a,#0a2a3a)", sampleDesc: "애니 캐릭터, 일러스트", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/50447032-1af6-4492-89c0-9c19cd69da43/original=true/5626297.jpeg" },
      { name: "Pony Diffusion V6", id: "257749", base: "SDXL", vram: 8, desc: "다재다능 애니/일러스트 — 다양한 화풍 소화 가능", rating: 4.7, dl: "2.3M", sampler: "euler_ancestral", scheduler: "normal", steps: 28, cfg: 7, style: "linear-gradient(135deg,#2a1a3a,#4a2a4a,#1a1a2a)", sampleDesc: "만화, 일러스트, 팬아트", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/4790674c-e16d-4dc7-b384-af4381fcfa3f/original=true/5706937.jpeg" },
    ],
    artistic: [
      { name: "Juggernaut XL v9", id: "133005", base: "SDXL", vram: 8, desc: "만능형 고품질 — 실사+일러스트+개념 아트 모두 가능", rating: 4.9, dl: "3.2M", sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 30, cfg: 4.5, style: "linear-gradient(135deg,#0a1a1a,#1a3a2a,#2a1a1a)", sampleDesc: "풍경, 판타지, 개념 아트", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/7b7b5c59-e975-4a3d-babe-b29aa577d237/width=450/7b7b5c59-e975-4a3d-babe-b29aa577d237.jpeg" },
    ],
  },
  t2v: { recommended: [
    { name: "Wan 2.2 T2V", id: "wan22", base: "Wan", vram: 16, desc: "최신 오픈소스 T2V — 프롬프트 충실도와 시간적 일관성 우수", rating: 4.8, dl: "520K", sampler: "euler", scheduler: "normal", steps: 30, cfg: 6, style: "linear-gradient(135deg,#0a0a1a,#1a1a3a,#0a2a2a)", sampleDesc: "3-10초 비디오 클립", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/9fd7e6dd-f91f-44b8-b2b2-12a1dbf30515/original=true/72289903.jpeg" },
    { name: "LTX-Video 2.3", id: "ltx", base: "LTX", vram: 12, desc: "NVIDIA 최적화 빠른 비디오 — RTX 50에서 NVFP4 지원", rating: 4.6, dl: "380K", sampler: "euler", scheduler: "normal", steps: 25, cfg: 5, style: "linear-gradient(135deg,#1a1a0a,#2a2a1a,#1a1a2a)", sampleDesc: "빠른 비디오 생성", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/9a000f2f-bc8d-4338-9e44-34edb5a5bb6b/original=true/61909869.jpeg" },
  ] },
  i2v: { recommended: [
    { name: "HunyuanVideo I2V", id: "hunyuan", base: "Hunyuan", vram: 24, desc: "13B 파라미터 — 정지 이미지를 고품질 비디오로 변환", rating: 4.9, dl: "290K", sampler: "euler", scheduler: "normal", steps: 30, cfg: 6, style: "linear-gradient(135deg,#1a0a1a,#3a1a2a,#1a0a2a)", sampleDesc: "이미지→비디오 변환", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/9fd7e6dd-f91f-44b8-b2b2-12a1dbf30515/original=true/72289903.jpeg" },
  ] },
  i2i: { recommended: [{ name: "RealVisXL V5.0", id: "139562", base: "SDXL", vram: 8, desc: "스타일 변환 최적 — denoise 조절로 변환 강도 제어", rating: 4.9, dl: "2.1M", sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 20, cfg: 4.5, style: "linear-gradient(135deg,#2a1a0a,#4a2a1a,#1a2a3a)", sampleDesc: "스타일 변환, 이미지 개선", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/aeba5afe-8bde-41d2-9150-8eea2eeda9a4/width=450/aeba5afe-8bde-41d2-9150-8eea2eeda9a4.jpeg" }] },
  controlnet: { recommended: [{ name: "FLUX.1 CN Canny", id: "flux-cn", base: "Flux", vram: 12, desc: "Flux 전용 엣지 감지 ControlNet — 형태 유지하며 스타일 변환", rating: 4.7, dl: "680K", sampler: "euler", scheduler: "normal", steps: 25, cfg: 3.5, style: "linear-gradient(135deg,#0a1a0a,#1a2a1a,#0a1a2a)", sampleDesc: "엣지 기반 생성", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/77c8a3fe-09b4-48ac-9c4f-d0385e2633c8/original=true/41335598.jpeg" }] },
  lora: {
    detail: [
      { name: "Detail Tweaker XL", id: "122359", base: "SDXL", vram: 0, desc: "디테일 강도 조절 — 양수=세밀함↑, 음수=부드러움↑. 가장 인기 있는 유틸 LoRA", rating: 4.9, dl: "4.2M", sampler: "N/A", scheduler: "N/A", steps: 0, cfg: 0, strength: "0.5~1.5", trigger: "없음", style: "linear-gradient(135deg,#1a2a1a,#2a3a2a,#1a3a1a)", sampleDesc: "디테일 강화/완화", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a5a1f21c-03d2-4dfe-bf22-5765f4aeceee/width=450/a5a1f21c-03d2-4dfe-bf22-5765f4aeceee.jpeg" },
      { name: "FaeTastic Details", id: "134338", base: "SDXL", vram: 0, desc: "마법같은 디테일+채도 강화 — 판타지/일러스트에 특히 효과적", rating: 4.8, dl: "320K", sampler: "N/A", scheduler: "N/A", steps: 0, cfg: 0, strength: "0.6~0.8", trigger: "faetastic", style: "linear-gradient(135deg,#2a1a3a,#3a2a4a,#1a2a3a)", sampleDesc: "판타지 디테일 강화", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/88c88742-1c02-4c56-8a23-e7ef24eb3e1b/width=450/88c88742-1c02-4c56-8a23-e7ef24eb3e1b.jpeg" },
    ],
    style: [
      { name: "Pixel Art XL", id: "120096", base: "SDXL", vram: 0, desc: "픽셀아트 스타일 변환 — 레트로 게임 그래픽 느낌", rating: 4.8, dl: "580K", sampler: "N/A", scheduler: "N/A", steps: 0, cfg: 0, strength: "0.7~1.0", trigger: "pixel art", style: "linear-gradient(135deg,#0a2a1a,#1a4a2a,#0a3a1a)", sampleDesc: "픽셀아트 스타일", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/0770e5fc-4260-4e3c-a0ee-bf2253028e9f/original=true/1918193.jpeg" },
      { name: "Vintage Magazine", id: "141048", base: "SDXL", vram: 0, desc: "빈티지 잡지/포스터 스타일 — 레트로 광고 느낌", rating: 4.7, dl: "210K", sampler: "N/A", scheduler: "N/A", steps: 0, cfg: 0, strength: "0.6~0.9", trigger: "VintageMagStyle", style: "linear-gradient(135deg,#3a2a0a,#4a3a1a,#2a2a0a)", sampleDesc: "빈티지 포스터", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/810f120d-d19d-49aa-9810-9d43a3b15a27/original=true/2379098.jpeg" },
      { name: "DreamyVibes Artstyle", id: "129988", base: "SDXL", vram: 0, desc: "몽환적 일러스트 스타일 — 부드러운 색감과 분위기", rating: 4.7, dl: "195K", sampler: "N/A", scheduler: "N/A", steps: 0, cfg: 0, strength: "0.6~0.8", trigger: "dreamyvibes artstyle", style: "linear-gradient(135deg,#2a1a2a,#3a2a3a,#2a1a3a)", sampleDesc: "몽환적 일러스트", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/eceec0cf-c814-464f-aaea-fef00a727f51/original=true/5196439.jpeg" },
    ],
    realism: [
      { name: "Add More Details", id: "82098", base: "SDXL", vram: 0, desc: "실사 디테일 극대화 — 피부/질감/배경 미세 디테일 강화", rating: 4.8, dl: "1.8M", sampler: "N/A", scheduler: "N/A", steps: 0, cfg: 0, strength: "0.5~1.0", trigger: "없음", style: "linear-gradient(135deg,#2a1a0a,#3a2a1a,#2a2a1a)", sampleDesc: "실사 디테일 강화", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c1697174-7c8d-4bde-b053-7b1ec0692b64/original=true/995787.jpeg" },
      { name: "FilmGrain", id: "173531", base: "SDXL", vram: 0, desc: "필름 그레인+시네마틱 톤 — 아날로그 카메라 느낌 부여", rating: 4.7, dl: "420K", sampler: "N/A", scheduler: "N/A", steps: 0, cfg: 0, strength: "0.4~0.8", trigger: "film grain", style: "linear-gradient(135deg,#1a1a0a,#2a2a1a,#1a1a0a)", sampleDesc: "필름 그레인 효과", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/5ef5ed30-feca-46e4-b6b4-6b41ef2ed9f7/original=true/2424581.jpeg" },
    ],
    speed: [
      { name: "LCM LoRA SDXL", id: "195519", base: "SDXL", vram: 0, desc: "4-8 steps만으로 빠른 생성 — 프로토타이핑에 최적", rating: 4.6, dl: "890K", sampler: "lcm", scheduler: "normal", steps: 6, cfg: 1.5, strength: "1.0", trigger: "없음", style: "linear-gradient(135deg,#0a1a2a,#1a2a3a,#0a2a2a)", sampleDesc: "초고속 생성", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e333ea36-cf4f-4124-a8a9-1a44f0824382/original=true/9026062.jpeg" },
      { name: "Hyper-SDXL 8step", id: "261973", base: "SDXL", vram: 0, desc: "8 steps에 최적화 — LCM보다 품질↑, CFG 5 사용", rating: 4.7, dl: "620K", sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 8, cfg: 5, strength: "1.0", trigger: "없음", style: "linear-gradient(135deg,#1a0a2a,#2a1a3a,#1a1a2a)", sampleDesc: "고속 고품질 생성", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/987fbbce-2b17-47d3-befa-f85bc4a0a477/original=true/11187972.jpeg" },
    ],
  },
  upscale: { recommended: [{ name: "4x-UltraSharp", id: "up1", base: "Upscaler", vram: 4, desc: "가장 인기 있는 4x 업스케일러 — 선명하고 디테일 보존", rating: 4.9, dl: "5M+", sampler: "N/A", scheduler: "N/A", steps: 0, cfg: 0, style: "linear-gradient(135deg,#0a1a0a,#1a3a1a,#0a2a0a)", sampleDesc: "4배 업스케일", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/d4d08e88-ac22-4cd7-9e64-d292ef522357/original=true/1720944.jpeg" }] },
  inpaint: { recommended: [{ name: "RealVisXL Inpaint", id: "139562", base: "SDXL", vram: 8, desc: "자연스러운 인페인팅 — 경계선 없이 매끄러운 수정", rating: 4.8, dl: "1.2M", sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 25, cfg: 4, style: "linear-gradient(135deg,#2a1a1a,#3a2a1a,#1a1a2a)", sampleDesc: "부분 수정, 오브젝트 교체", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/aeba5afe-8bde-41d2-9150-8eea2eeda9a4/width=450/aeba5afe-8bde-41d2-9150-8eea2eeda9a4.jpeg" }] },
  batch: { recommended: [{ name: "Juggernaut XL v9", id: "133005", base: "SDXL", vram: 8, desc: "배치 안정성 최고 — 대량 생성 시 일관된 품질", rating: 4.9, dl: "3.2M", sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 30, cfg: 4.5, style: "linear-gradient(135deg,#0a1a1a,#1a3a2a,#2a1a1a)", sampleDesc: "대량 일괄 생성", img: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/7b7b5c59-e975-4a3d-babe-b29aa577d237/width=450/7b7b5c59-e975-4a3d-babe-b29aa577d237.jpeg" }] },
};

const SAMPLERS = ["euler", "euler_ancestral", "dpmpp_2m", "dpmpp_2m_sde", "dpmpp_3m_sde", "uni_pc", "ddim"];
const SCHEDULERS = ["normal", "karras", "exponential", "sgm_uniform", "simple", "ddim_uniform", "beta"];
const CATS = [
  { id: "t2i", label: "Text → Image", icon: "✦" }, { id: "i2i", label: "Image → Image", icon: "◐" },
  { id: "inpaint", label: "Inpainting", icon: "◧" }, { id: "upscale", label: "Upscale", icon: "⬡" },
  { id: "t2v", label: "Text → Video", icon: "▶" }, { id: "i2v", label: "Image → Video", icon: "◉" },
  { id: "controlnet", label: "ControlNet", icon: "◈" }, { id: "lora", label: "LoRA", icon: "⊕" },
  { id: "batch", label: "Batch", icon: "⊞" },
];

// ═══════════════════════════════════════════
// CATEGORY PRESETS — 카테고리 선택 시 즉시 적용되는 권장값
// ═══════════════════════════════════════════
const CAT_PRESETS = {
  t2i: {
    model: "", modelBase: "SDXL",
    sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 28, cfg: 4.5,
    width: 1024, height: 1024,
    prompt: "a beautiful landscape with dramatic lighting, detailed textures, volumetric clouds, golden hour, photorealistic, masterpiece, 8K",
    negPrompt: "(worst quality, low quality, illustration, 3d, 2d, painting, cartoons, sketch), blurry, watermark, distorted",
  },
  i2i: {
    model: "", modelBase: "SDXL",
    sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 20, cfg: 4.5,
    width: 1024, height: 1024,
    prompt: "oil painting style, impressionist, vibrant brushstrokes, artistic masterpiece, detailed",
    negPrompt: "blurry, low quality, distorted, watermark",
  },
  inpaint: {
    model: "", modelBase: "SDXL",
    sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 25, cfg: 4.0,
    width: 1024, height: 1024,
    prompt: "seamless blend, natural lighting, matching style and texture, high quality, detailed",
    negPrompt: "blurry, visible seam, mismatched colors, low quality, artifacts",
  },
  upscale: {
    model: "", modelBase: "SDXL",
    sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 20, cfg: 5.0,
    width: 1024, height: 1024,
    prompt: "high resolution, ultra detailed, sharp focus, enhanced textures, 8K",
    negPrompt: "blurry, noise, artifacts, compression, pixelated",
  },
  t2v: {
    model: "", modelBase: "Wan",
    sampler: "euler", scheduler: "normal", steps: 30, cfg: 6.0,
    width: 832, height: 480,
    prompt: "A cat slowly walks across a sunlit room, warm golden light beams streaming through the window, dust particles floating in the air, cinematic quality, smooth motion",
    negPrompt: "blurry, static image, low quality, watermark, distorted, flickering",
  },
  i2v: {
    model: "", modelBase: "Hunyuan",
    sampler: "euler", scheduler: "normal", steps: 30, cfg: 6.0,
    width: 832, height: 480,
    prompt: "gentle camera movement, smooth animation, natural motion, cinematic, high quality video",
    negPrompt: "static, blurry, flickering, low quality, distorted",
  },
  controlnet: {
    model: "", modelBase: "SDXL",
    sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 28, cfg: 5.0,
    width: 1024, height: 1024,
    prompt: "architectural visualization, modern glass building, cinematic lighting, professional render, ultra detailed, 4K",
    negPrompt: "blurry, low quality, sketch, draft, distorted",
  },
  lora: {
    model: "", modelBase: "SDXL",
    sampler: "euler", scheduler: "normal", steps: 25, cfg: 7.0,
    width: 1024, height: 1024,
    prompt: "masterpiece, best quality, detailed illustration, vibrant colors, professional artwork",
    negPrompt: "low quality, blurry, distorted, ugly, deformed",
  },
  batch: {
    model: "", modelBase: "SDXL",
    sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 30, cfg: 4.5,
    width: 1024, height: 1024,
    prompt: "fantasy landscape, dramatic sky, volumetric lighting, concept art, masterpiece, best quality",
    negPrompt: "blurry, low quality, amateur, distorted, watermark",
  },
};

// Model-specific recommended prompts (applied when model card clicked)
const MODEL_PROMPTS = {
  "RealVisXL V5.0": { prompt: "RAW photo, portrait of a young woman, natural skin texture, soft studio lighting, shallow depth of field, 85mm lens, professional photography, 4K, masterpiece", neg: "(worst quality, low quality, illustration, 3d, 2d, painting, cartoons, sketch), open mouth, blurry, deformed, ugly, bad anatomy, extra fingers" },
  "Jib Mix Flux v12": { prompt: "A beautiful woman in a cafe, natural window light, bokeh background, photorealistic, film grain, magazine quality photography", neg: "blurry, distorted, deformed, low quality, illustration, cartoon" },
  "AAM XL AnimeMix": { prompt: "masterpiece, best quality, 1girl, beautiful anime girl with long flowing hair, detailed eyes, school uniform, cherry blossom background, soft lighting, amazing shading, Detailed Illustration, anime style", neg: "worst quality, low quality, bad anatomy, extra fingers, blurry, 3d, photorealistic" },
  "Pony Diffusion V6": { prompt: "score_9, score_8_up, score_7_up, 1girl, solo, fantasy warrior, detailed armor, magical aura, dramatic lighting, vibrant colors, illustration", neg: "score_4, score_3, score_2, worst quality, low quality, blurry" },
  "Juggernaut XL v9": { prompt: "cinematic photo of a majestic mountain landscape at golden hour, dramatic clouds, lake reflection, volumetric fog, ultra detailed, 8K resolution, masterpiece", neg: "blurry, low quality, oversaturated, cartoon, illustration, amateur" },
  "Wan 2.2 T2V": { prompt: "A cat slowly walks across a sunlit room, warm golden light beams, dust particles floating, smooth cinematic camera movement, high quality video", neg: "blurry, static, low quality, watermark, flickering, distorted" },
  "LTX-Video 2.3": { prompt: "Aerial drone shot slowly flying over a coastal city at sunset, waves crashing, golden light, cinematic quality, smooth motion", neg: "blurry, shaky, low quality, watermark, static" },
  "HunyuanVideo I2V": { prompt: "gentle zoom in with subtle parallax motion, natural ambient lighting, smooth animation, cinematic quality, high detail video", neg: "static, blurry, flickering, low quality, distorted, jumpy" },
  "FLUX.1 CN Canny": { prompt: "architectural photography, modern glass skyscraper, dramatic sky, golden hour, ultra detailed facade, cinematic composition, 4K", neg: "blurry, low quality, sketch, distorted, cartoon" },
  "Detail Tweaker XL": { prompt: "masterpiece, best quality, ultra detailed, intricate details, sharp focus, professional photography, 8K resolution", neg: "blurry, low quality, soft, sketch, amateur" },
  "Add More Details": { prompt: "RAW photo, hyperrealistic close-up, intricate skin texture, every pore visible, professional macro photography, 8K", neg: "blurry, smooth, low quality, plastic skin, illustration" },
  "LCM LoRA SDXL": { prompt: "beautiful landscape, mountain lake, sunset, volumetric clouds, masterpiece", neg: "blurry, low quality" },
  "Pixel Art XL": { prompt: "pixel art, retro game screenshot, 16-bit RPG style, fantasy castle, detailed pixel scenery, vibrant palette", neg: "blurry, photorealistic, 3d render, smooth" },
  "RealVisXL Inpaint": { prompt: "seamless blend, natural lighting, matching surrounding style and colors, high quality texture", neg: "visible seam, mismatched colors, blurry, artifacts" },
  "4x-UltraSharp": { prompt: "ultra sharp, high resolution, enhanced details, crystal clear, 8K upscaled", neg: "blurry, noise, artifacts, pixelated" },
  "FaeTastic Details": { prompt: "masterpiece, best quality, magical forest scene, glowing particles, ethereal atmosphere, intricate details, vibrant colors, fantasy illustration", neg: "blurry, low quality, dull colors, flat" },
  "FilmGrain": { prompt: "RAW photo, cinematic film still, warm color grading, film grain, analog photography, 35mm, Kodak Portra 400, natural lighting", neg: "digital look, clean, smooth, illustration, 3d" },
  "Vintage Magazine": { prompt: "VintageMagStyle, retro magazine advertisement, 1960s style, bold typography, vibrant vintage colors, classic design", neg: "modern, digital, minimalist, blurry" },
  "DreamyVibes Artstyle": { prompt: "dreamyvibes artstyle, soft pastel colors, dreamy atmosphere, ethereal lighting, gentle bokeh, artistic illustration", neg: "harsh, dark, photorealistic, sharp contrast" },
  "Hyper-SDXL 8step": { prompt: "beautiful mountain landscape, crystal clear lake, dramatic sunset, volumetric clouds, masterpiece, ultra detailed", neg: "blurry, low quality, distorted" },
};


// ═══════════════════════════════════════════
// PROMPT LIBRARY & TAG BUILDER
// ═══════════════════════════════════════════
const PROMPT_TAGS = {
  quality: ["masterpiece", "best quality", "ultra detailed", "8K", "HDR", "professional", "sharp focus", "RAW photo"],
  style: ["photorealistic", "cinematic", "anime", "oil painting", "watercolor", "concept art", "pixel art", "3d render", "illustration", "sketch"],
  lighting: ["golden hour", "dramatic lighting", "soft studio lighting", "rim light", "volumetric fog", "neon glow", "natural sunlight", "backlit"],
  camera: ["close-up", "wide angle", "85mm lens", "macro", "bird's eye view", "low angle", "bokeh", "depth of field", "panoramic"],
  mood: ["serene", "dramatic", "ethereal", "moody", "vibrant", "dark", "whimsical", "epic", "cozy", "mysterious"],
  subject: ["portrait", "landscape", "architecture", "still life", "fantasy", "sci-fi", "nature", "urban", "underwater", "space"],
  negative: ["blurry", "low quality", "distorted", "watermark", "ugly", "deformed", "bad anatomy", "extra fingers", "oversaturated", "noise"],
};
const PROMPT_TEMPLATES = [
  { id: "portrait-real", cat: "인물 실사", prompt: "RAW photo, portrait of a {subject}, natural skin texture, {lighting}, shallow depth of field, {camera}, professional photography, 4K", neg: "(worst quality, low quality, illustration, 3d, 2d), blurry, deformed, ugly", tags: ["SDXL", "인물"] },
  { id: "landscape", cat: "풍경", prompt: "breathtaking {subject} landscape, {lighting}, {mood} atmosphere, ultra detailed, 8K resolution, masterpiece", neg: "blurry, low quality, oversaturated, cartoon, watermark", tags: ["SDXL", "풍경"] },
  { id: "anime-char", cat: "애니 캐릭터", prompt: "masterpiece, best quality, 1girl, {subject}, detailed eyes, {lighting}, amazing shading, Detailed Illustration, anime style", neg: "worst quality, low quality, bad anatomy, extra fingers, 3d, photorealistic", tags: ["SDXL", "애니"] },
  { id: "product", cat: "제품 사진", prompt: "professional product photography of {subject}, {lighting}, clean white background, sharp focus, commercial quality, 8K", neg: "blurry, shadow, dirty background, low quality, watermark", tags: ["Flux", "제품"] },
  { id: "concept-art", cat: "컨셉 아트", prompt: "concept art of {subject}, {style}, {lighting}, {mood}, artstation trending, ultra detailed", neg: "blurry, amateur, low quality, distorted", tags: ["SDXL", "아트"] },
  { id: "architecture", cat: "건축", prompt: "architectural visualization of {subject}, {lighting}, cinematic composition, professional render, ultra detailed, 4K", neg: "blurry, sketch, distorted, cartoon, low quality", tags: ["SDXL", "건축"] },
  { id: "video-scene", cat: "비디오 씬", prompt: "{subject} moving smoothly through the scene, {lighting}, cinematic camera movement, high quality video, smooth motion", neg: "blurry, static, flickering, low quality, distorted, jumpy", tags: ["Wan", "비디오"] },
  { id: "fantasy", cat: "판타지", prompt: "epic fantasy {subject}, {lighting}, {mood} atmosphere, magical particles, volumetric rays, masterpiece, ultra detailed", neg: "blurry, low quality, modern, mundane, amateur", tags: ["SDXL", "판타지"] },
];

// ═══════════════════════════════════════════
// WORKFLOW DEBUGGER ERROR PATTERNS
// ═══════════════════════════════════════════
const ERROR_PATTERNS = [
  { pattern: "Prompt outputs failed validation", cause: "노드 연결 누락", fix: "모든 필수 입력(model, clip, positive, negative, latent)이 연결되었는지 확인하세요.", category: "connection" },
  { pattern: "Cannot find model", cause: "모델 파일 없음", fix: "models/checkpoints/ 폴더에 .safetensors 파일이 있는지 확인하세요. ComfyUI Manager에서 모델을 검색하여 설치할 수 있습니다.", category: "model" },
  { pattern: "CUDA out of memory", cause: "VRAM 부족", fix: "해상도를 줄이거나, --lowvram 플래그로 실행하거나, FP8/GGUF 모델을 사용하세요.", category: "vram" },
  { pattern: "RuntimeError.*expected.*got", cause: "데이터 타입 불일치", fix: "같은 색상(타입)의 포트끼리 연결했는지 확인하세요. MODEL↔MODEL, CLIP↔CLIP 등.", category: "type" },
  { pattern: "No such file", cause: "파일 경로 오류", fix: "이미지/마스크 파일 경로가 ComfyUI input/ 폴더에 있는지 확인하세요.", category: "file" },
  { pattern: "ControlNet.*not found", cause: "ControlNet 모델 없음", fix: "models/controlnet/ 폴더에 ControlNet 모델을 다운로드하세요.", category: "model" },
  { pattern: "LoRA.*not found", cause: "LoRA 파일 없음", fix: "models/loras/ 폴더에 LoRA .safetensors 파일을 넣으세요.", category: "model" },
  { pattern: "VAE.*error|NaN", cause: "VAE 디코딩 오류", fix: "별도 VAE를 다운로드하여 VAELoader에 연결하세요. (sdxl_vae.safetensors 권장)", category: "model" },
  { pattern: "size mismatch|shape", cause: "해상도/텐서 크기 불일치", fix: "해상도가 8의 배수(비디오는 16의 배수)인지 확인하세요. SD1.5는 512, SDXL은 1024 권장.", category: "config" },
  { pattern: "black image|all black", cause: "검은 이미지 출력", fix: "VAE가 올바른지, CFG가 너무 높지 않은지(SDXL 3-7 권장), 프롬프트가 비어있지 않은지 확인하세요.", category: "config" },
];

// ═══════════════════════════════════════════
// NODE REFERENCE DATA
// ═══════════════════════════════════════════
const NODE_REF = [
  { type: "CheckpointLoaderSimple", cat: "loader", desc: "체크포인트 모델 파일을 로드합니다.", inputs: [], outputs: [{ name: "MODEL", type: "MODEL" }, { name: "CLIP", type: "CLIP" }, { name: "VAE", type: "VAE" }], params: ["ckpt_name: 모델 파일명 (.safetensors)"], tips: "처음 실행 시 모델 로딩에 시간이 걸리며, 이후에는 캐시됩니다.", color: "#2dd4a8" },
  { type: "CLIPTextEncode", cat: "conditioning", desc: "텍스트 프롬프트를 CONDITIONING 벡터로 변환합니다.", inputs: [{ name: "clip", type: "CLIP" }], outputs: [{ name: "CONDITIONING", type: "CONDITIONING" }], params: ["text: 프롬프트 텍스트"], tips: "Positive와 Negative 두 개를 만들어 KSampler에 연결하세요.", color: "#fbbf24" },
  { type: "KSampler", cat: "sampling", desc: "노이즈 제거를 수행하여 이미지를 생성합니다. 핵심 노드.", inputs: [{ name: "model", type: "MODEL" }, { name: "positive", type: "CONDITIONING" }, { name: "negative", type: "CONDITIONING" }, { name: "latent_image", type: "LATENT" }], outputs: [{ name: "LATENT", type: "LATENT" }], params: ["seed: 랜덤 시드", "steps: 반복 횟수 (20-30)", "cfg: 프롬프트 가이던스 (3-8)", "sampler: 알고리즘", "scheduler: 스케줄러", "denoise: 디노이즈 강도 (i2i용)"], tips: "CFG가 너무 높으면 과채도, 너무 낮으면 프롬프트 무시.", color: "#f87171" },
  { type: "EmptyLatentImage", cat: "latent", desc: "빈 잠재 이미지를 생성합니다. t2i의 시작점.", inputs: [], outputs: [{ name: "LATENT", type: "LATENT" }], params: ["width: 가로 (8의 배수)", "height: 세로 (8의 배수)", "batch_size: 동시 생성 수"], tips: "SDXL은 1024x1024, SD1.5는 512x512 권장.", color: "#22d3ee" },
  { type: "VAEDecode", cat: "latent", desc: "잠재 공간 데이터를 픽셀 이미지로 변환합니다.", inputs: [{ name: "samples", type: "LATENT" }, { name: "vae", type: "VAE" }], outputs: [{ name: "IMAGE", type: "IMAGE" }], params: [], tips: "체크포인트 내장 VAE 또는 별도 VAE를 사용할 수 있습니다.", color: "#fb923c" },
  { type: "VAEEncode", cat: "latent", desc: "픽셀 이미지를 잠재 공간으로 인코딩합니다. i2i의 시작점.", inputs: [{ name: "pixels", type: "IMAGE" }, { name: "vae", type: "VAE" }], outputs: [{ name: "LATENT", type: "LATENT" }], params: [], tips: "img2img 시 LoadImage → VAEEncode → KSampler 순서로 연결.", color: "#fb923c" },
  { type: "SaveImage", cat: "output", desc: "생성된 이미지를 파일로 저장합니다.", inputs: [{ name: "images", type: "IMAGE" }], outputs: [], params: ["filename_prefix: 파일명 접두사"], tips: "output/ 폴더에 PNG로 저장됩니다. 워크플로우 메타데이터가 포함됩니다.", color: "#4ade80" },
  { type: "LoadImage", cat: "loader", desc: "이미지 파일을 로드합니다.", inputs: [], outputs: [{ name: "IMAGE", type: "IMAGE" }, { name: "MASK", type: "MASK" }], params: ["image: 파일명 (input/ 폴더)"], tips: "MASK 출력은 알파 채널입니다. 별도 마스크는 ImageToMask를 사용하세요.", color: "#38bdf8" },
  { type: "LoraLoader", cat: "loader", desc: "LoRA 파일을 로드하여 모델에 적용합니다.", inputs: [{ name: "model", type: "MODEL" }, { name: "clip", type: "CLIP" }], outputs: [{ name: "MODEL", type: "MODEL" }, { name: "CLIP", type: "CLIP" }], params: ["lora_name: LoRA 파일명", "strength_model: 모델 영향도 (0.5-1.0)", "strength_clip: CLIP 영향도 (0.5-1.0)"], tips: "체인 연결로 여러 LoRA를 동시에 적용할 수 있습니다.", color: "#e879f9" },
  { type: "ControlNetLoader", cat: "loader", desc: "ControlNet 모델을 로드합니다.", inputs: [], outputs: [{ name: "CONTROL_NET", type: "CONTROL_NET" }], params: ["control_net_name: ControlNet 파일명"], tips: "Canny/Depth/OpenPose 등 타입에 맞는 모델을 선택하세요.", color: "#94a3b8" },
  { type: "ControlNetApplyAdvanced", cat: "conditioning", desc: "ControlNet 조건을 적용합니다.", inputs: [{ name: "positive", type: "CONDITIONING" }, { name: "negative", type: "CONDITIONING" }, { name: "control_net", type: "CONTROL_NET" }, { name: "image", type: "IMAGE" }], outputs: [{ name: "positive", type: "CONDITIONING" }, { name: "negative", type: "CONDITIONING" }], params: ["strength: 제어 강도 (0-1)", "start_percent: 시작 (0)", "end_percent: 종료 (1)"], tips: "strength 0.5로 시작하여 조절. start/end로 초반만 구도 잡기 가능.", color: "#94a3b8" },
  { type: "UpscaleModelLoader", cat: "loader", desc: "업스케일 모델을 로드합니다.", inputs: [], outputs: [{ name: "UPSCALE_MODEL", type: "UPSCALE_MODEL" }], params: ["model_name: 업스케일 모델명"], tips: "4x-UltraSharp, ESRGAN_4x 등을 models/upscale_models/에 넣으세요.", color: "#a3e635" },
  { type: "ImageUpscaleWithModel", cat: "image", desc: "업스케일 모델로 이미지를 확대합니다.", inputs: [{ name: "upscale_model", type: "UPSCALE_MODEL" }, { name: "image", type: "IMAGE" }], outputs: [{ name: "IMAGE", type: "IMAGE" }], params: [], tips: "4x 모델은 1024→4096으로 확대합니다. VRAM 주의.", color: "#a3e635" },
  { type: "SetLatentNoiseMask", cat: "latent", desc: "잠재 이미지에 노이즈 마스크를 적용합니다. 인페인팅용.", inputs: [{ name: "samples", type: "LATENT" }, { name: "mask", type: "MASK" }], outputs: [{ name: "LATENT", type: "LATENT" }], params: [], tips: "흰색=수정 영역, 검정색=보존 영역.", color: "#22d3ee" },
  { type: "ImageToMask", cat: "image", desc: "이미지를 마스크로 변환합니다.", inputs: [{ name: "image", type: "IMAGE" }], outputs: [{ name: "MASK", type: "MASK" }], params: ["channel: red/green/blue/alpha"], tips: "흑백 이미지의 red 채널을 마스크로 사용하는 것이 일반적.", color: "#e2e8f0" },
];

// ═══════════════════════════════════════════
// CUSTOM NODE RECOMMENDATIONS
// ═══════════════════════════════════════════
const CUSTOM_NODES = [
  { name: "ComfyUI Manager", id: "cm", desc: "필수 — 노드/모델 원클릭 설치 관리자", url: "https://github.com/ltdrdata/ComfyUI-Manager", cat: "essential", vram: 0, tags: ["필수", "관리"] },
  { name: "Impact Pack", id: "ip", desc: "얼굴 감지/복원, 세그멘테이션, 디테일러", url: "https://github.com/ltdrdata/ComfyUI-Impact-Pack", cat: "essential", vram: 1, tags: ["필수", "얼굴"] },
  { name: "IPAdapter Plus", id: "ipa", desc: "참조 이미지 스타일/구도 전이", url: "https://github.com/cubiq/ComfyUI_IPAdapter_plus", cat: "style", vram: 2, tags: ["스타일", "참조"] },
  { name: "ReActor", id: "reactor", desc: "얼굴 교체(Face Swap)", url: "https://github.com/Gourieff/comfyui-reactor-node", cat: "face", vram: 2, tags: ["얼굴", "교체"] },
  { name: "AnimateDiff Evolved", id: "animdiff", desc: "이미지를 짧은 애니메이션으로 변환", url: "https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved", cat: "video", vram: 4, tags: ["비디오", "애니메이션"] },
  { name: "WAS Node Suite", id: "was", desc: "이미지 처리/텍스트/수학 유틸 200+ 노드", url: "https://github.com/WASasquatch/was-node-suite-comfyui", cat: "utility", vram: 0, tags: ["유틸", "만능"] },
  { name: "Efficiency Nodes", id: "eff", desc: "워크플로우 간소화 — KSampler+VAE+Save 통합", url: "https://github.com/jags111/efficiency-nodes-comfyui", cat: "utility", vram: 0, tags: ["유틸", "효율"] },
  { name: "ControlNet Aux", id: "cnaux", desc: "엣지/깊이/포즈 등 전처리기 모음", url: "https://github.com/Fannovel16/comfyui_controlnet_aux", cat: "controlnet", vram: 1, tags: ["ControlNet", "전처리"] },
  { name: "ELLA", id: "ella", desc: "긴 프롬프트 이해력 향상", url: "https://github.com/TencentQQGYLab/ComfyUI-ELLA", cat: "prompt", vram: 1, tags: ["프롬프트", "텍스트"] },
  { name: "Segment Anything", id: "sam", desc: "자동 세그멘테이션 — 클릭으로 마스크 생성", url: "https://github.com/storyicon/comfyui_segment_anything", cat: "mask", vram: 2, tags: ["마스크", "세그멘트"] },
  { name: "Frame Interpolation", id: "rife", desc: "RIFE 프레임 보간 — 비디오 프레임 증가", url: "https://github.com/Fannovel16/ComfyUI-Frame-Interpolation", cat: "video", vram: 2, tags: ["비디오", "보간"] },
  { name: "InstantID", id: "iid", desc: "얼굴 ID 보존 — 동일 인물 일관성", url: "https://github.com/cubiq/ComfyUI_InstantID", cat: "face", vram: 3, tags: ["얼굴", "일관성"] },
];

// ═══════════════════════════════════════════
// WORKFLOW GENERATOR - ALL 9 CATEGORIES (#1)
// ═══════════════════════════════════════════
function genWF(c) {
  const { category: cat, model, sampler, scheduler, steps, cfg, width, height, seed, prompt, negPrompt } = c;
  let ns = [], ls = [], lid = 1, nid = 1;
  const N = (type, title, pos, wv, ins = [], outs = []) => {
    const id = nid++;
    ns.push({ id, type, title, pos, size: [320, 160], flags: {}, order: id - 1, mode: 0, inputs: ins, outputs: outs, properties: { "Node name for S&R": type }, widgets_values: wv });
    return id;
  };
  const L = (si, ss, di, ds, tp) => { const id = lid++; ls.push([id, si, ss, di, ds, tp]); return id; };
  const mkOut = (name, type, slot = 0) => ({ name, type, links: [], slot_index: slot });
  const mkIn = (name, type) => ({ name, type, link: null });
  const s = (seed && seed > 0) ? seed : randomSeed();
  const isV = ["t2v", "i2v"].includes(cat);

  // === Standard checkpoint loader ===
  let ckId, clipSrc, clipSlot, modSrc, modSlot;
  if (isV) {
    ckId = N("UNETLoader", "Load Diffusion Model", [50, 100], [model || "YOUR_MODEL.safetensors", "default"], [], [mkOut("MODEL", "MODEL")]);
    const clipId = N("DualCLIPLoader", "Load CLIP", [50, 320], ["clip_l.safetensors", "umt5_xxl_fp8.safetensors", "wan"], [], [mkOut("CLIP", "CLIP")]);
    N("VAELoader", "Load VAE", [50, 520], ["wan_2.1_vae.safetensors"], [], [mkOut("VAE", "VAE")]);
    clipSrc = clipId; clipSlot = 0; modSrc = ckId; modSlot = 0;
  } else {
    ckId = N("CheckpointLoaderSimple", "Load Checkpoint", [50, 100], [model || "YOUR_MODEL.safetensors"], [], [
      { name: "MODEL", type: "MODEL", links: [], slot_index: 0 },
      { name: "CLIP", type: "CLIP", links: [], slot_index: 1 },
      { name: "VAE", type: "VAE", links: [], slot_index: 2 },
    ]);
    clipSrc = ckId; clipSlot = 1; modSrc = ckId; modSlot = 0;
  }

  // === LoRA branch ===
  if (cat === "lora") {
    const loId = N("LoraLoader", "Load LoRA", [50, 360], ["your_lora.safetensors", 0.8, 0.8],
      [mkIn("model", "MODEL"), mkIn("clip", "CLIP")],
      [{ name: "MODEL", type: "MODEL", links: [], slot_index: 0 }, { name: "CLIP", type: "CLIP", links: [], slot_index: 1 }]);
    L(ckId, 0, loId, 0, "MODEL"); L(ckId, 1, loId, 1, "CLIP");
    modSrc = loId; modSlot = 0; clipSrc = loId; clipSlot = 1;
  }

  // === Text encoding ===
  const posId = N("CLIPTextEncode", "Positive Prompt", [450, 100], [prompt || "masterpiece, best quality, detailed"], [mkIn("clip", "CLIP")], [mkOut("CONDITIONING", "CONDITIONING")]);
  L(clipSrc, clipSlot, posId, 0, "CLIP");
  const negId = N("CLIPTextEncode", "Negative Prompt", [450, 320], [negPrompt || "blurry, low quality, distorted"], [mkIn("clip", "CLIP")], [mkOut("CONDITIONING", "CONDITIONING")]);
  L(clipSrc, clipSlot, negId, 0, "CLIP");

  let posSrc = posId, negSrc = negId;

  // === ControlNet branch (#1 fix) ===
  if (cat === "controlnet") {
    const cnLoadId = N("ControlNetLoader", "Load ControlNet", [50, 580], ["diffusers_xl_canny_full.safetensors"], [], [mkOut("CONTROL_NET", "CONTROL_NET")]);
    const cnImgId = N("LoadImage", "Control Image", [50, 760], ["control_image.png"], [], [mkOut("IMAGE", "IMAGE"), { name: "MASK", type: "MASK", links: [], slot_index: 1 }]);
    const cnApplyId = N("ControlNetApplyAdvanced", "Apply ControlNet", [450, 560], [1.0, 0.0, 1.0],
      [mkIn("positive", "CONDITIONING"), mkIn("negative", "CONDITIONING"), mkIn("control_net", "CONTROL_NET"), mkIn("image", "IMAGE")],
      [{ name: "positive", type: "CONDITIONING", links: [], slot_index: 0 }, { name: "negative", type: "CONDITIONING", links: [], slot_index: 1 }]);
    L(posId, 0, cnApplyId, 0, "CONDITIONING"); L(negId, 0, cnApplyId, 1, "CONDITIONING");
    L(cnLoadId, 0, cnApplyId, 2, "CONTROL_NET"); L(cnImgId, 0, cnApplyId, 3, "IMAGE");
    posSrc = cnApplyId; negSrc = cnApplyId;
  }

  // === Latent source ===
  let latentSrc, latentSlot = 0;
  if (cat === "i2i" || cat === "inpaint") {
    const imgId = N("LoadImage", "Load Input Image", [450, 560], ["input.png"], [], [mkOut("IMAGE", "IMAGE"), { name: "MASK", type: "MASK", links: [], slot_index: 1 }]);
    const vaeEncId = N("VAEEncode", "VAE Encode", [450, 740], [], [mkIn("pixels", "IMAGE"), mkIn("vae", "VAE")], [mkOut("LATENT", "LATENT")]);
    L(imgId, 0, vaeEncId, 0, "IMAGE"); L(ckId, 2, vaeEncId, 1, "VAE");
    latentSrc = vaeEncId;
    if (cat === "inpaint") {
      const maskImgId = N("LoadImage", "Load Mask", [250, 700], ["mask.png"], [], [mkOut("IMAGE", "IMAGE"), { name: "MASK", type: "MASK", links: [], slot_index: 1 }]);
      const toMaskId = N("ImageToMask", "Convert to Mask", [450, 780], ["red"], [mkIn("image", "IMAGE")], [mkOut("MASK", "MASK")]);
      L(maskImgId, 0, toMaskId, 0, "IMAGE");
      const setMaskId = N("SetLatentNoiseMask", "Set Noise Mask", [650, 780], [], [mkIn("samples", "LATENT"), mkIn("mask", "MASK")], [mkOut("LATENT", "LATENT")]);
      L(vaeEncId, 0, setMaskId, 0, "LATENT"); L(toMaskId, 0, setMaskId, 1, "MASK");
      latentSrc = setMaskId;
    }
  } else if (cat === "i2v") {
    // Image-to-Video: load reference image + encode to latent via VAELoader
    const i2vImgId = N("LoadImage", "Reference Image", [450, 560], ["input.png"], [], [mkOut("IMAGE", "IMAGE"), { name: "MASK", type: "MASK", links: [], slot_index: 1 }]);
    const vaeNode = ns.find(n => n.type === "VAELoader");
    const i2vEncId = N("VAEEncode", "VAE Encode", [450, 740], [], [mkIn("pixels", "IMAGE"), mkIn("vae", "VAE")], [mkOut("LATENT", "LATENT")]);
    L(i2vImgId, 0, i2vEncId, 0, "IMAGE");
    if (vaeNode) L(vaeNode.id, 0, i2vEncId, 1, "VAE");
    latentSrc = i2vEncId;
  } else {
    const batchSize = cat === "batch" ? 4 : (isV ? 16 : 1); // video needs frame count
    const emptyId = N("EmptyLatentImage", "Empty Latent", [450, 560], [width || 1024, height || 1024, batchSize], [], [mkOut("LATENT", "LATENT")]);
    latentSrc = emptyId;
  }

  // === KSampler ===
  const denoise = (cat === "i2i") ? 0.65 : (cat === "inpaint") ? 0.85 : (cat === "i2v") ? 0.75 : 1.0;
  const ksId = N("KSampler", "KSampler", [850, 200], [s, "randomize", steps || 25, cfg || 7, sampler || "euler", scheduler || "normal", denoise],
    [mkIn("model", "MODEL"), mkIn("positive", "CONDITIONING"), mkIn("negative", "CONDITIONING"), mkIn("latent_image", "LATENT")],
    [mkOut("LATENT", "LATENT")]);
  L(modSrc, modSlot, ksId, 0, "MODEL");
  L(posSrc, 0, ksId, 1, "CONDITIONING");
  L(negSrc, cat === "controlnet" ? 1 : 0, ksId, 2, "CONDITIONING");
  L(latentSrc, latentSlot, ksId, 3, "LATENT");

  // === VAE Decode ===
  const vdId = N("VAEDecode", "VAE Decode", [1250, 200], [], [mkIn("samples", "LATENT"), mkIn("vae", "VAE")], [mkOut("IMAGE", "IMAGE")]);
  L(ksId, 0, vdId, 0, "LATENT");
  if (!isV) L(ckId, 2, vdId, 1, "VAE");
  else { const vaeNode = ns.find(n => n.type === "VAELoader"); if (vaeNode) L(vaeNode.id, 0, vdId, 1, "VAE"); }

  // === Upscale branch (#1 fix) ===
  let finalImgSrc = vdId;
  if (cat === "upscale") {
    const upModelId = N("UpscaleModelLoader", "Load Upscale Model", [1250, 440], ["4x-UltraSharp.pth"], [], [mkOut("UPSCALE_MODEL", "UPSCALE_MODEL")]);
    const upImgId = N("ImageUpscaleWithModel", "Upscale Image", [1550, 320], [], [mkIn("upscale_model", "UPSCALE_MODEL"), mkIn("image", "IMAGE")], [mkOut("IMAGE", "IMAGE")]);
    L(upModelId, 0, upImgId, 0, "UPSCALE_MODEL"); L(vdId, 0, upImgId, 1, "IMAGE");
    finalImgSrc = upImgId;
  }

  // === Save ===
  const saveType = isV ? "SaveAnimatedWEBP" : "SaveImage";
  const saveWv = isV ? ["ComfyUI", 24, "default", 85] : ["ComfyUI"];
  const svId = N(saveType, isV ? "Save Video" : "Save Image", [1800, 200], saveWv, [mkIn("images", "IMAGE")], []);
  L(finalImgSrc, 0, svId, 0, "IMAGE");

  // === Fix link references (O(n) with Map) ===
  const nodeMap = new Map(ns.map(n => [n.id, n]));
  ls.forEach(l => {
    const [i, si, ss, di, ds] = l;
    const sn = nodeMap.get(si);
    const dn = nodeMap.get(di);
    if (sn?.outputs?.[ss] && !sn.outputs[ss].links.includes(i)) sn.outputs[ss].links.push(i);
    if (dn?.inputs?.[ds]) dn.inputs[ds].link = i;
  });

  return { last_node_id: nid - 1, last_link_id: lid - 1, nodes: ns, links: ls, groups: [], config: {}, extra: { ds: { scale: 1, offset: [0, 0] } }, version: 0.4 };
}

// ═══════════════════════════════════════════
// WORKFLOW VALIDATION (#17)
// ═══════════════════════════════════════════
function validateWF(wf, lang) {
  const t = (key) => (LANG[lang] || LANG.ko)[key] || (LANG.ko)[key] || key;
  const issues = [];
  if (!wf?.nodes?.length) return [t("valNoNodes")];
  wf.nodes.forEach(node => {
    node.inputs?.forEach((inp, idx) => {
      if (inp.link === null && ["model", "positive", "negative", "latent_image", "samples", "vae", "clip", "images"].includes(inp.name)) {
        issues.push(`${node.title}: "${inp.name}" ${t("valNoLink")}`);
      }
    });
  });
  const hasKS = wf.nodes.some(n => n.type === "KSampler");
  const hasSave = wf.nodes.some(n => n.type === "SaveImage" || n.type === "SaveAnimatedWEBP");
  if (!hasKS) issues.push(t("valNoKS"));
  if (!hasSave) issues.push(t("valNoSave"));
  return issues;
}

// ═══════════════════════════════════════════
// API FORMAT CONVERTER (#11)
// ═══════════════════════════════════════════
function toAPIFormat(wf) {
  const api = {};
  wf.nodes.forEach(node => {
    const inputs = {};
    node.widgets_values?.forEach((val, idx) => {
      const paramNames = {
        CheckpointLoaderSimple: ["ckpt_name"],
        CLIPTextEncode: ["text"],
        EmptyLatentImage: ["width", "height", "batch_size"],
        KSampler: ["seed", "control_after_generate", "steps", "cfg", "sampler_name", "scheduler", "denoise"],
        SaveImage: ["filename_prefix"],
        SaveAnimatedWEBP: ["filename_prefix", "fps", "lossless", "quality"],
        UNETLoader: ["unet_name", "weight_dtype"],
        DualCLIPLoader: ["clip_name1", "clip_name2", "type"],
        VAELoader: ["vae_name"],
        LoraLoader: ["lora_name", "strength_model", "strength_clip"],
        LoadImage: ["image"],
        ControlNetLoader: ["control_net_name"],
        ControlNetApplyAdvanced: ["strength", "start_percent", "end_percent"],
        UpscaleModelLoader: ["model_name"],
        SetLatentNoiseMask: [],
        ImageToMask: ["channel"],
        VAEEncode: [],
        VAEDecode: [],
        ImageUpscaleWithModel: [],
      };
      const names = paramNames[node.type];
      if (names && names[idx]) inputs[names[idx]] = val;
    });
    node.inputs?.forEach(inp => {
      if (inp.link !== null) {
        const link = wf.links.find(l => l[0] === inp.link);
        if (link) inputs[inp.name] = [String(link[1]), link[2]];
      }
    });
    api[String(node.id)] = { class_type: node.type, inputs };
  });
  return api;
}

// ═══════════════════════════════════════════
// INSTALL SCRIPTS DATA
// ═══════════════════════════════════════════
const INSTALL_SCRIPTS = [
  {
    id: "win-auto",
    name: "Windows 원클릭 설치",
    filename: "comfyui_install_windows.bat",
    icon: "🪟",
    os: "Windows",
    desc: "Python, Git, ComfyUI, Manager를 자동 설치합니다. 관리자 권한으로 실행하세요.",
    tags: ["자동설치", "초보자용"],
    content: `@echo off
chcp 65001 >nul
title ComfyUI 원클릭 설치 스크립트
color 0A

echo ╔══════════════════════════════════════════════╗
echo ║     ComfyUI 원클릭 설치 스크립트 v2.0       ║
echo ║     Windows 10/11 전용                       ║
echo ╚══════════════════════════════════════════════╝
echo.

:: ── 설치 경로 설정 ──
set "INSTALL_DIR=%USERPROFILE%\\ComfyUI"
echo [INFO] 설치 경로: %INSTALL_DIR%
echo.

:: ── Python 확인 ──
echo [1/6] Python 확인 중...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Python이 설치되지 않았습니다.
    echo [INFO] Python 3.11 다운로드 중...
    curl -L -o python_installer.exe https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe
    echo [INFO] Python 설치 중... (PATH 자동 추가)
    python_installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    del python_installer.exe
    echo [OK] Python 설치 완료. 터미널을 재시작 후 다시 실행해주세요.
    pause
    exit /b
) else (
    echo [OK] Python 발견됨
)

:: ── Git 확인 ──
echo [2/6] Git 확인 중...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Git이 설치되지 않았습니다.
    echo [INFO] Git 다운로드 중...
    curl -L -o git_installer.exe https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/Git-2.47.1-64-bit.exe
    echo [INFO] Git 설치 중...
    git_installer.exe /VERYSILENT /NORESTART /SP-
    del git_installer.exe
    set "PATH=%PATH%;C:\\Program Files\\Git\\bin"
    echo [OK] Git 설치 완료
) else (
    echo [OK] Git 발견됨
)

:: ── ComfyUI 클론 ──
echo [3/6] ComfyUI 다운로드 중...
if exist "%INSTALL_DIR%" (
    echo [INFO] 기존 설치 발견. 업데이트 중...
    cd /d "%INSTALL_DIR%"
    git pull
) else (
    git clone https://github.com/comfyanonymous/ComfyUI.git "%INSTALL_DIR%"
    cd /d "%INSTALL_DIR%"
)
echo [OK] ComfyUI 다운로드 완료

:: ── 가상 환경 생성 ──
echo [4/6] Python 가상 환경 생성 중...
python -m venv venv
call venv\\Scripts\\activate
echo [OK] 가상 환경 활성화 완료

:: ── 의존성 설치 ──
echo [5/6] PyTorch 및 의존성 설치 중... (시간이 걸릴 수 있습니다)
pip install --upgrade pip
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
pip install -r requirements.txt
echo [OK] 의존성 설치 완료

:: ── ComfyUI Manager 설치 ──
echo [6/6] ComfyUI Manager 설치 중...
cd custom_nodes
if not exist "ComfyUI-Manager" (
    git clone https://github.com/ltdrdata/ComfyUI-Manager.git
)
cd ..
echo [OK] Manager 설치 완료

:: ── 실행 스크립트 생성 ──
echo @echo off > run_comfyui.bat
echo cd /d "%INSTALL_DIR%" >> run_comfyui.bat
echo call venv\\Scripts\\activate >> run_comfyui.bat
echo python main.py --listen >> run_comfyui.bat

echo.
echo ╔══════════════════════════════════════════════╗
echo ║        설치 완료!                            ║
echo ║                                              ║
echo ║  실행: run_comfyui.bat 더블클릭              ║
echo ║  접속: http://127.0.0.1:8188                 ║
echo ║                                              ║
echo ║  모델 폴더: models\\checkpoints\\              ║
echo ║  LoRA 폴더: models\\loras\\                    ║
echo ╚══════════════════════════════════════════════╝
echo.
pause`,
  },
  {
    id: "win-run",
    name: "Windows 실행 스크립트",
    filename: "run_comfyui.bat",
    icon: "▶️",
    os: "Windows",
    desc: "설치된 ComfyUI를 실행합니다. 자동으로 브라우저가 열립니다.",
    tags: ["실행", "매일 사용"],
    content: `@echo off
chcp 65001 >nul
title ComfyUI 실행
color 0B

set "COMFY_DIR=%USERPROFILE%\\ComfyUI"
cd /d "%COMFY_DIR%"

echo [INFO] ComfyUI 실행 중...
echo [INFO] 브라우저에서 http://127.0.0.1:8188 접속하세요
echo [INFO] 종료하려면 Ctrl+C 를 누르세요
echo.

call venv\\Scripts\\activate

:: GPU 자동 감지
nvidia-smi >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] NVIDIA GPU 감지됨 — CUDA 모드 실행
    python main.py --listen --preview-method auto
) else (
    echo [WARN] NVIDIA GPU 없음 — CPU 모드 실행 (느림)
    python main.py --listen --cpu
)

pause`,
  },
  {
    id: "win-update",
    name: "Windows 업데이트",
    filename: "update_comfyui.bat",
    icon: "🔄",
    os: "Windows",
    desc: "ComfyUI와 Manager를 최신 버전으로 업데이트합니다.",
    tags: ["업데이트", "유지보수"],
    content: `@echo off
chcp 65001 >nul
title ComfyUI 업데이트
color 0E

set "COMFY_DIR=%USERPROFILE%\\ComfyUI"
cd /d "%COMFY_DIR%"

echo ╔══════════════════════════════════╗
echo ║     ComfyUI 업데이트 스크립트    ║
echo ╚══════════════════════════════════╝
echo.

echo [1/4] ComfyUI 코어 업데이트 중...
git pull
echo [OK] 코어 업데이트 완료

echo [2/4] 가상 환경 활성화...
call venv\\Scripts\\activate

echo [3/4] 의존성 업데이트 중...
pip install -r requirements.txt --upgrade
echo [OK] 의존성 업데이트 완료

echo [4/4] ComfyUI Manager 업데이트 중...
cd custom_nodes\\ComfyUI-Manager
git pull
cd ..\\..

echo.
echo [OK] 모든 업데이트 완료!
echo [INFO] run_comfyui.bat 으로 실행하세요
pause`,
  },
  {
    id: "mac-linux",
    name: "Mac / Linux 설치",
    filename: "comfyui_install.sh",
    icon: "🐧",
    os: "Mac / Linux",
    desc: "macOS 및 Linux에서 ComfyUI를 자동 설치합니다. 터미널에서 실행하세요.",
    tags: ["자동설치", "Mac", "Linux"],
    content: `#!/bin/bash
# ComfyUI 원클릭 설치 스크립트 — Mac / Linux
# 실행: chmod +x comfyui_install.sh && ./comfyui_install.sh

set -e

GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
RED='\\033[0;31m'
NC='\\033[0m'

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║     ComfyUI 설치 스크립트 v2.0               ║"
echo "║     macOS / Linux                            ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

INSTALL_DIR="$HOME/ComfyUI"

# ── Python 확인 ──
echo -e "\${YELLOW}[1/5] Python 확인...\${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "\${RED}[ERROR] Python3이 설치되지 않았습니다.\${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Homebrew로 설치: brew install python@3.11"
    else
        echo "apt: sudo apt install python3 python3-pip python3-venv"
    fi
    exit 1
fi
echo -e "\${GREEN}[OK] Python3 발견: $(python3 --version)\${NC}"

# ── Git 확인 ──
echo -e "\${YELLOW}[2/5] Git 확인...\${NC}"
if ! command -v git &> /dev/null; then
    echo -e "\${RED}[ERROR] Git이 설치되지 않았습니다.\${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "설치: xcode-select --install"
    else
        echo "설치: sudo apt install git"
    fi
    exit 1
fi
echo -e "\${GREEN}[OK] Git 발견\${NC}"

# ── ComfyUI 다운로드 ──
echo -e "\${YELLOW}[3/5] ComfyUI 다운로드...\${NC}"
if [ -d "$INSTALL_DIR" ]; then
    echo "기존 설치 발견. 업데이트 중..."
    cd "$INSTALL_DIR"
    git pull
else
    git clone https://github.com/comfyanonymous/ComfyUI.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi
echo -e "\${GREEN}[OK] ComfyUI 다운로드 완료\${NC}"

# ── 가상 환경 ──
echo -e "\${YELLOW}[4/5] 가상 환경 설정...\${NC}"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip

# PyTorch 설치 (OS별)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "macOS 감지 — MPS 가속 PyTorch 설치..."
    pip install torch torchvision torchaudio
else
    # NVIDIA GPU 확인
    if command -v nvidia-smi &> /dev/null; then
        echo "NVIDIA GPU 감지 — CUDA PyTorch 설치..."
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
    else
        echo "CPU 전용 PyTorch 설치..."
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
    fi
fi
pip install -r requirements.txt
echo -e "\${GREEN}[OK] 의존성 설치 완료\${NC}"

# ── ComfyUI Manager ──
echo -e "\${YELLOW}[5/5] ComfyUI Manager 설치...\${NC}"
cd custom_nodes
if [ ! -d "ComfyUI-Manager" ]; then
    git clone https://github.com/ltdrdata/ComfyUI-Manager.git
fi
cd ..
echo -e "\${GREEN}[OK] Manager 설치 완료\${NC}"

# ── 실행 스크립트 생성 ──
cat > run_comfyui.sh << 'RUNEOF'
#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
echo "ComfyUI 실행 중... http://127.0.0.1:8188"
python main.py --listen --preview-method auto
RUNEOF
chmod +x run_comfyui.sh

echo ""
echo -e "\${GREEN}╔══════════════════════════════════════════════╗\${NC}"
echo -e "\${GREEN}║        설치 완료!                            ║\${NC}"
echo -e "\${GREEN}║                                              ║\${NC}"
echo -e "\${GREEN}║  실행: ./run_comfyui.sh                      ║\${NC}"
echo -e "\${GREEN}║  접속: http://127.0.0.1:8188                 ║\${NC}"
echo -e "\${GREEN}║                                              ║\${NC}"
echo -e "\${GREEN}║  모델: models/checkpoints/                   ║\${NC}"
echo -e "\${GREEN}║  LoRA: models/loras/                         ║\${NC}"
echo -e "\${GREEN}╚══════════════════════════════════════════════╝\${NC}"`,
  },
  {
    id: "model-dl",
    name: "추천 모델 다운로드",
    filename: "download_models.bat",
    icon: "📦",
    os: "Windows",
    desc: "SDXL, RealVisXL, VAE 등 필수 모델을 자동 다운로드합니다.",
    tags: ["모델", "다운로드"],
    content: `@echo off
chcp 65001 >nul
title ComfyUI 모델 다운로더
color 0D

set "COMFY_DIR=%USERPROFILE%\\ComfyUI"
set "CKPT_DIR=%COMFY_DIR%\\models\\checkpoints"
set "VAE_DIR=%COMFY_DIR%\\models\\vae"
set "LORA_DIR=%COMFY_DIR%\\models\\loras"
set "UP_DIR=%COMFY_DIR%\\models\\upscale_models"

echo ╔══════════════════════════════════════════════╗
echo ║     ComfyUI 모델 다운로더                    ║
echo ║     필수 모델을 자동 다운로드합니다           ║
echo ╚══════════════════════════════════════════════╝
echo.

:: 폴더 생성
mkdir "%CKPT_DIR%" 2>nul
mkdir "%VAE_DIR%" 2>nul
mkdir "%LORA_DIR%" 2>nul
mkdir "%UP_DIR%" 2>nul

echo 다운로드할 모델을 선택하세요:
echo.
echo [1] SDXL Base 1.0 (6.9GB) — 기본 범용 모델
echo [2] RealVisXL V5.0 (6.5GB) — 실사 인물/풍경
echo [3] SDXL VAE (335MB) — 이미지 품질 향상
echo [4] 4x-UltraSharp Upscaler (64MB) — 업스케일러
echo [5] 전부 다운로드
echo [0] 취소
echo.
set /p choice="선택 (0-5): "

if "%choice%"=="0" exit /b
if "%choice%"=="5" goto :all

if "%choice%"=="1" goto :sdxl
if "%choice%"=="2" goto :realvis
if "%choice%"=="3" goto :vae
if "%choice%"=="4" goto :upscale

:all
:sdxl
echo.
echo [다운로드] SDXL Base 1.0...
curl -L -o "%CKPT_DIR%\\sd_xl_base_1.0.safetensors" "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors"
echo [OK] SDXL Base 다운로드 완료
if not "%choice%"=="5" goto :done

:realvis
echo.
echo [다운로드] RealVisXL V5.0... (Civitai에서 수동 다운로드 필요)
echo [INFO] 브라우저에서 다운로드 페이지를 엽니다...
start https://civitai.com/models/139562/realvisxl-v50
echo [INFO] 다운로드 후 %CKPT_DIR% 에 저장하세요
if not "%choice%"=="5" goto :done

:vae
echo.
echo [다운로드] SDXL VAE...
curl -L -o "%VAE_DIR%\\sdxl_vae.safetensors" "https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors"
echo [OK] VAE 다운로드 완료
if not "%choice%"=="5" goto :done

:upscale
echo.
echo [다운로드] 4x-UltraSharp...
curl -L -o "%UP_DIR%\\4x-UltraSharp.pth" "https://huggingface.co/uwg/upscaler/resolve/main/ESRGAN/4x-UltraSharp.pth"
echo [OK] 업스케일러 다운로드 완료

:done
echo.
echo ╔══════════════════════════════════════════════╗
echo ║        모델 다운로드 완료!                   ║
echo ║  모델 위치: %CKPT_DIR%                       ║
echo ╚══════════════════════════════════════════════╝
pause`,
  },
  {
    id: "model-dl-sh",
    name: "추천 모델 다운로드",
    filename: "download_models.sh",
    icon: "📦",
    os: "Mac / Linux",
    desc: "SDXL, VAE, 업스케일러 등 필수 모델을 자동 다운로드합니다.",
    tags: ["모델", "다운로드", "Mac", "Linux"],
    content: `#!/bin/bash
# ComfyUI 모델 다운로더 — Mac / Linux
# 실행: chmod +x download_models.sh && ./download_models.sh

COMFY_DIR="$HOME/ComfyUI"
CKPT_DIR="$COMFY_DIR/models/checkpoints"
VAE_DIR="$COMFY_DIR/models/vae"
UP_DIR="$COMFY_DIR/models/upscale_models"

mkdir -p "$CKPT_DIR" "$VAE_DIR" "$UP_DIR"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   ComfyUI 모델 다운로더              ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "[1] SDXL Base 1.0 (6.9GB)"
echo "[2] SDXL VAE (335MB)"
echo "[3] 4x-UltraSharp (64MB)"
echo "[4] 전부 다운로드"
echo "[0] 취소"
echo ""
read -p "선택 (0-4): " choice

download_sdxl() {
    echo "SDXL Base 다운로드 중..."
    curl -L -o "$CKPT_DIR/sd_xl_base_1.0.safetensors" \\
        "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors"
    echo "[OK] SDXL 완료"
}

download_vae() {
    echo "VAE 다운로드 중..."
    curl -L -o "$VAE_DIR/sdxl_vae.safetensors" \\
        "https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors"
    echo "[OK] VAE 완료"
}

download_upscale() {
    echo "업스케일러 다운로드 중..."
    curl -L -o "$UP_DIR/4x-UltraSharp.pth" \\
        "https://huggingface.co/uwg/upscaler/resolve/main/ESRGAN/4x-UltraSharp.pth"
    echo "[OK] 업스케일러 완료"
}

case $choice in
    1) download_sdxl ;;
    2) download_vae ;;
    3) download_upscale ;;
    4) download_sdxl; download_vae; download_upscale ;;
    0) echo "취소됨"; exit 0 ;;
esac

echo ""
echo "[OK] 다운로드 완료! 모델 위치: $CKPT_DIR"`,
  },
  {
    id: "win-lowvram",
    name: "저사양 실행 (8GB↓)",
    filename: "run_lowvram.bat",
    icon: "💾",
    os: "Windows",
    desc: "VRAM 8GB 이하 GPU용 최적화 실행. lowvram + FP8 자동 설정.",
    tags: ["저사양", "8GB이하"],
    content: `@echo off
chcp 65001 >nul
title ComfyUI 저사양 실행
color 0C

set "COMFY_DIR=%USERPROFILE%\\ComfyUI"
cd /d "%COMFY_DIR%"
call venv\\Scripts\\activate

echo ╔══════════════════════════════════════════════╗
echo ║     ComfyUI 저사양 모드 실행                 ║
echo ║     VRAM 4-8GB GPU 최적화                    ║
echo ╚══════════════════════════════════════════════╝
echo.
echo [INFO] --lowvram 모드로 실행합니다
echo [INFO] FP8/GGUF 모델을 권장합니다
echo [INFO] 접속: http://127.0.0.1:8188
echo.

python main.py --listen --lowvram --preview-method auto --force-fp16

pause`,
  },
];

// Install Scripts Download Component
function InstallDownloads({ theme, compact, lang }) {
  const t = (key) => (LANG[lang] || LANG.ko)[key] || (LANG.ko)[key] || key;
  const T = THEMES[theme] || THEMES.dark;
  const [osFilter, setOsFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const downloadFile = (script) => {
    const blob = new Blob([script.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = script.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filtered = osFilter === "all" ? INSTALL_SCRIPTS : INSTALL_SCRIPTS.filter(s => s.os.toLowerCase().includes(osFilter));

  return (
    <div style={{ marginTop: compact ? 16 : 28 }}>
      {!compact && (
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4, fontFamily: SERIF }}>{t("idTitle")}</h2>
          <p style={{ fontSize: 11, color: T.text4 }}>{t("idDesc")}</p>
        </div>
      )}
      {/* OS filter */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {[{ id: "all", l: t("lvAll") }, { id: "windows", l: "🪟 Windows" }, { id: "mac", l: "🐧 Mac/Linux" }].map(os => (
          <button key={os.id} onClick={() => setOsFilter(os.id)} style={{ padding: "6px 14px", borderRadius: 7, border: `1px solid ${osFilter === os.id ? T.accent : T.border}`, background: osFilter === os.id ? `${T.accent}15` : "transparent", color: osFilter === os.id ? T.accent : T.text3, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{os.l}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(script => (
          <div key={script.id} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
            {/* Card content */}
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>{script.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{script.name}</div>
                  <div style={{ fontSize: 10, color: T.text3, lineHeight: 1.4 }}>{script.desc}</div>
                </div>
              </div>
              {/* Tags */}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{ padding: "2px 8px", borderRadius: 4, background: `${T.accent}15`, fontSize: 9, color: T.accent, fontWeight: 600 }}>{script.os}</span>
                {script.tags.map(tag => <span key={tag} style={{ padding: "2px 8px", borderRadius: 4, background: T.bg4, fontSize: 9, color: T.text4 }}>{tag}</span>)}
              </div>
              {/* Action buttons - always full width on mobile */}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setExpanded(expanded === script.id ? null : script.id)} style={{ flex: "0 0 auto", background: "transparent", border: `1px solid ${T.border2}`, borderRadius: 7, padding: "8px 12px", color: T.text3, cursor: "pointer", fontSize: 11 }}>
                  {expanded === script.id ? t("idCollapse") : t("idExpand")}
                </button>
                <button onClick={() => downloadFile(script)} style={{ flex: 1, background: T.accent, border: "none", borderRadius: 7, padding: "8px 12px", color: "#050505", cursor: "pointer", fontSize: 12, fontWeight: 700, textAlign: "center" }}>
                  {t("idDownload")}
                </button>
              </div>
              <div style={{ fontSize: 9, color: T.text4, marginTop: 6, fontFamily: "'JetBrains Mono',monospace" }}>{script.filename}</div>
            </div>
            {/* Code preview */}
            {expanded === script.id && (
              <div style={{ borderTop: `1px solid ${T.border}` }}>
                <pre style={{ margin: 0, padding: "12px 14px", background: T.bg, fontSize: 10, color: T.text3, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6, maxHeight: 260, overflowY: "auto", overflowX: "auto", whiteSpace: "pre", WebkitOverflowScrolling: "touch" }}>
                  {script.content}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Usage guide */}
      <div style={{ marginTop: 12, padding: "12px 14px", background: theme === "dark" ? "#0a0a14" : "#f0f0ff", borderRadius: 10, border: `1px solid ${theme === "dark" ? "#14143a" : "#d0d0ff"}` }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 6 }}>{t("idUsage")}</div>
        <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.8 }}>
          <strong style={{ color: T.text }}>Windows:</strong> {t("idWinUsage")}<br/>
          <strong style={{ color: T.text }}>Mac/Linux:</strong> {t("idMacUsage")} <code style={{ background: T.bg4, padding: "1px 5px", borderRadius: 3, fontSize: 10 }}>chmod +x *.sh && ./*.sh</code>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// EXAMPLE WORKFLOWS (downloadable from tutorial page)
// ═══════════════════════════════════════════
const EXAMPLE_WORKFLOWS = [
  { id: "ex-t2i-basic", title: "기본 Text-to-Image", level: "beginner", desc: "SDXL 기본 워크플로우. 5개 노드 구성.", tags: ["SDXL", "입문"], icon: "✦",
    config: { category: "t2i", model: "", sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 25, cfg: 5, width: 1024, height: 1024, prompt: "a majestic mountain landscape at golden hour, dramatic clouds, photorealistic, 8K, masterpiece", negPrompt: "blurry, low quality, distorted, watermark" } },
  { id: "ex-portrait", title: "실사 인물 포트레이트", level: "beginner", desc: "프롬프트 구조와 CFG 조절 연습.", tags: ["SDXL", "인물"], icon: "🧑",
    config: { category: "t2i", model: "YOUR_MODEL.safetensors", sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 30, cfg: 4.5, width: 896, height: 1152, prompt: "portrait of a young woman, soft studio lighting, shallow depth of field, professional photography, 4K", negPrompt: "blurry, deformed, ugly, bad anatomy, extra fingers" } },
  { id: "ex-lora", title: "LoRA 스타일 적용", level: "intermediate", desc: "LoRA로 스타일을 변경하는 워크플로우.", tags: ["SDXL", "LoRA"], icon: "🎨",
    config: { category: "lora", model: "", sampler: "euler", scheduler: "normal", steps: 25, cfg: 7, width: 1024, height: 1024, prompt: "anime style illustration of a magical forest, glowing mushrooms, fairy lights, vibrant colors", negPrompt: "photorealistic, blurry" } },
  { id: "ex-i2i", title: "Image-to-Image 변환", level: "intermediate", desc: "denoise로 변환 강도 제어.", tags: ["SDXL", "img2img"], icon: "◐",
    config: { category: "i2i", model: "", sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 20, cfg: 5, width: 1024, height: 1024, prompt: "oil painting style, impressionist, vibrant brushstrokes", negPrompt: "photorealistic, sharp" } },
  { id: "ex-cn", title: "ControlNet 엣지 제어", level: "intermediate", desc: "ControlNet Canny로 형태를 유지하며 변환.", tags: ["ControlNet", "Canny"], icon: "◈",
    config: { category: "controlnet", model: "", sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 28, cfg: 5, width: 1024, height: 1024, prompt: "architectural visualization, modern building, glass facade, cinematic lighting, 4K", negPrompt: "blurry, low quality, sketch" } },
  { id: "ex-upscale", title: "4x 업스케일", level: "intermediate", desc: "UltraSharp 업스케일러로 고해상도 변환.", tags: ["업스케일"], icon: "⬡",
    config: { category: "upscale", model: "", sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 20, cfg: 5, width: 1024, height: 1024, prompt: "detailed landscape, high resolution, sharp", negPrompt: "blurry, noise" } },
  { id: "ex-inpaint", title: "Inpainting 부분 수정", level: "intermediate", desc: "마스크로 지정한 영역만 자연스럽게 수정.", tags: ["인페인트"], icon: "◧",
    config: { category: "inpaint", model: "", sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 25, cfg: 5, width: 1024, height: 1024, prompt: "beautiful garden with blooming flowers, natural sunlight", negPrompt: "blurry, distorted" } },
  { id: "ex-t2v", title: "Text-to-Video (Wan 2.2)", level: "advanced", desc: "텍스트로 비디오 생성. 16GB+ VRAM 필요.", tags: ["Wan 2.2", "비디오"], icon: "▶",
    config: { category: "t2v", model: "", sampler: "euler", scheduler: "normal", steps: 30, cfg: 6, width: 832, height: 480, prompt: "A cat slowly walks across a sunlit room, golden light, dust particles", negPrompt: "blurry, static, watermark" } },
  { id: "ex-batch", title: "배치 4장 동시 생성", level: "advanced", desc: "동일 설정으로 4장을 한 번에 생성.", tags: ["배치", "비교"], icon: "⊞",
    config: { category: "batch", model: "", sampler: "dpmpp_2m_sde", scheduler: "karras", steps: 25, cfg: 5, width: 1024, height: 1024, prompt: "fantasy castle on a floating island, dramatic sky, concept art, masterpiece", negPrompt: "blurry, low quality" } },
];

function ExampleWorkflows({ theme, lang }) {
  const t = (key) => (LANG[lang] || LANG.ko)[key] || (LANG.ko)[key] || key;
  const T = THEMES[theme] || THEMES.dark;
  const [filter, setFilter] = useState("all");
  const mono = MONO;
  const filtered = filter === "all" ? EXAMPLE_WORKFLOWS : EXAMPLE_WORKFLOWS.filter(w => w.level === filter);
  const downloadWF = (ex) => {
    const wf = genWF(ex.config);
    showExport(JSON.stringify(wf, null, 2), `example_${ex.id}.json`);
  };
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4, fontFamily: SERIF }}>{t("tutExTitle")}</h2>
        <p style={{ fontSize: 11, color: T.text4 }}>{t("tutExDesc")}</p>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {[{ id: "all", l: t("lvAll") }, { id: "beginner", l: t("lvBeginner") }, { id: "intermediate", l: t("lvIntermediate") }, { id: "advanced", l: t("lvAdvanced") }].map(lv => (
          <button key={lv.id} onClick={() => setFilter(lv.id)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${filter === lv.id ? T.accent : T.border}`, background: filter === lv.id ? `${T.accent}15` : "transparent", color: filter === lv.id ? T.accent : T.text3, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{lv.l}</button>
        ))}
      </div>
      <div className="g-ex-wf" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8 }}>
        {filtered.map(ex => (
          <div key={ex.id} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{ex.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{ex.title}</div>
                <div style={{ display: "flex", gap: 3, marginTop: 3, flexWrap: "wrap" }}>
                  <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 8, fontWeight: 600, background: { beginner: "#0a1a0a", intermediate: "#1a1a08", advanced: "#1a0a0a" }[ex.level], color: { beginner: "#4ade80", intermediate: "#fbbf24", advanced: "#f87171" }[ex.level] }}>{{ beginner: t("lvBeginner"), intermediate: t("lvIntermediate"), advanced: t("lvAdvanced") }[ex.level]}</span>
                  {ex.tags.map(tag => <span key={tag} className="tag" style={{ color: T.text4 }}>{tag}</span>)}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: T.text3, lineHeight: 1.5, marginBottom: 8, flex: 1 }}>{ex.desc}</div>
            <div style={{ fontSize: 9, color: T.text4, fontFamily: mono, marginBottom: 8, padding: "5px 8px", background: T.bg3, borderRadius: 6, overflowX: "auto" }}>
              {ex.config.sampler}/{ex.config.scheduler} · s:{ex.config.steps} · cfg:{ex.config.cfg} · {ex.config.width}×{ex.config.height}
            </div>
            <button onClick={() => downloadWF(ex)} style={{ width: "100%", background: T.accent, border: "none", borderRadius: 8, padding: "9px", color: "#050505", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              {t("idJsonDl")}
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, padding: "10px 14px", background: T.bg3, borderRadius: 8, fontSize: 10, color: T.text3 }}>
        <strong style={{ color: T.text }}>{t("idUsage")}:</strong> {t("idJsonUsage")}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════
// PROMPT LIBRARY COMPONENT (Feature 1)
// ═══════════════════════════════════════════
function PromptBuilder({ theme, onApply, lang }) {
  const t = (key) => (LANG[lang] || LANG.ko)[key] || (LANG.ko)[key] || key;
  const T = THEMES[theme] || THEMES.dark;
  const mono = MONO;
  const [selTags, setSelTags] = useState({});
  const [template, setTemplate] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [optimizing, setOptimizing] = useState(false);

  const toggleTag = (cat, tag) => {
    setSelTags(prev => {
      const curr = prev[cat] || [];
      return { ...prev, [cat]: curr.includes(tag) ? curr.filter(t => t !== tag) : [...curr, tag] };
    });
  };

  const buildPrompt = () => {
    const parts = [];
    Object.values(selTags).forEach(tags => parts.push(...tags));
    return parts.join(", ");
  };

  const optimizeWithAI = async () => {
    const current = customPrompt || buildPrompt();
    if (!current) return;
    setOptimizing(true);
    try {
      const improved = (await callGemini(`ComfyUI prompt optimizer. Improve this prompt for SDXL model. Keep the same intent but make it more detailed and effective. Return ONLY the improved prompt text, nothing else.\nOriginal: ${current}`)).trim();
      if (improved) setCustomPrompt(improved);
    } catch {}
    setOptimizing(false);
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>🎨</span>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{t("promptTitle")}</div><div style={{ fontSize: 11, color: T.text4 }}>{t("pbDesc")}</div></div>
        </div>

        {/* Templates */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, marginBottom: 6 }}>{t("pbTemplates")}</div>
          <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 4 }}>
            {PROMPT_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => { setTemplate(t); setCustomPrompt(t.prompt); }} style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${template?.id === t.id ? T.accent : T.border}`, background: template?.id === t.id ? `${T.accent}15` : "transparent", color: template?.id === t.id ? T.accent : T.text3, fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{t.cat}</button>
            ))}
          </div>
        </div>

        {/* Tag cloud */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, marginBottom: 6 }}>{t("pbTags")}</div>
          {Object.entries(PROMPT_TAGS).map(([cat, tags]) => (
            <div key={cat} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: T.text4, textTransform: "uppercase", marginBottom: 4 }}>{cat}</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {tags.map(tag => { const sel = (selTags[cat] || []).includes(tag); return (
                  <button key={tag} onClick={() => toggleTag(cat, tag)} style={{ padding: "3px 8px", borderRadius: 5, border: `1px solid ${sel ? T.accent : T.border}`, background: sel ? `${T.accent}15` : "transparent", color: sel ? T.accent : T.text3, fontSize: 10, cursor: "pointer" }}>{tag}</button>
                ); })}
              </div>
            </div>
          ))}
        </div>

        {/* Result */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.text3 }}>{t("pbPromptLabel")}</span>
            <button onClick={optimizeWithAI} disabled={optimizing} style={{ padding: "3px 10px", borderRadius: 5, background: `${T.accent}15`, border: `1px solid ${T.accent}33`, color: T.accent, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{optimizing ? t("pbOptimizing") : t("pbOptimize")}</button>
          </div>
          <textarea className="inp" rows={3} value={customPrompt || buildPrompt()} onChange={e => setCustomPrompt(e.target.value)} style={{ resize: "vertical", lineHeight: 1.5, fontFamily: mono, fontSize: 11 }} />
        </div>

        <button className="bp" style={{ width: "100%" }} onClick={() => onApply && onApply(customPrompt || buildPrompt(), template?.neg || PROMPT_TAGS.negative.slice(0, 5).join(", "))}>
          {t("promptApply")}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// WORKFLOW DEBUGGER COMPONENT (Feature 2)
// ═══════════════════════════════════════════
function WorkflowDebugger({ theme, lang }) {
  const t = (key) => (LANG[lang] || LANG.ko)[key] || (LANG.ko)[key] || key;
  const T = THEMES[theme] || THEMES.dark;
  const [errorMsg, setErrorMsg] = useState("");
  const [debugWf, setDebugWf] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const quickDiagnose = () => {
    const issues = [];
    // Pattern matching
    ERROR_PATTERNS.forEach(ep => {
      if (new RegExp(ep.pattern, "i").test(errorMsg)) {
        issues.push(ep);
      }
    });
    // WF structure check
    if (debugWf.trim()) {
      try {
        const wf = JSON.parse(debugWf);
        const vIssues = validateWF(wf, lang);
        vIssues.forEach(v => issues.push({ cause: t("valStructErr"), fix: v, category: "connection" }));
        // Check model filenames
        wf.nodes?.forEach(n => {
          if (n.type === "CheckpointLoaderSimple" && n.widgets_values?.[0]?.includes(" ")) {
            issues.push({ cause: t("valSpaceModel"), fix: `"${n.widgets_values[0]}" — ${t("valSpaceWarn")}`, category: "model" });
          }
        });
      } catch { issues.push({ cause: t("valJsonErr"), fix: t("valJsonWarn"), category: "config" }); }
    }
    return issues;
  };

  const aiDiagnose = async () => {
    setLoading(true);
    try {
      const sysLang = lang === "ko" ? "한국어" : lang === "zh" ? "中文" : lang === "ja" ? "日本語" : "English";
      const raw = await callGemini(`에러: ${errorMsg}\n\n워크플로우: ${debugWf.slice(0, 5000)}`, "ComfyUI troubleshooting expert. Analyze user error messages and workflow. Respond in " + sysLang + ". JSON response: {\"diagnosis\": \"cause\", \"fixes\": [\"fix 1\", \"fix 2\"], \"prevention\": \"tip\"}");
      const text = raw.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(text));
    } catch { setResult({ diagnosis: t("dbAIFail"), fixes: [t("dbMoreDetail")], prevention: "" }); }
    setLoading(false);
  };

  const quickResults = errorMsg.length > 3 ? quickDiagnose() : [];
  const catColors = { connection: "#f87171", model: "#fbbf24", vram: "#f472b6", type: "#a78bfa", config: "#60a5fa", file: "#22d3ee" };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>🔍</span>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{t("debugTitle")}</div><div style={{ fontSize: 11, color: T.text4 }}>{t("dbDesc")}</div></div>
        </div>

        <textarea className="inp" rows={3} value={errorMsg} onChange={e => { setErrorMsg(e.target.value); setResult(null); }} placeholder={t("dbPlaceholder")} style={{ resize: "vertical", marginBottom: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }} />
        <textarea className="inp" rows={2} value={debugWf} onChange={e => setDebugWf(e.target.value)} placeholder={t("dbWfPlaceholder")} style={{ resize: "vertical", marginBottom: 12, fontSize: 11 }} />

        {/* Quick pattern matches */}
        {quickResults.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 8 }}>{t("debugAutoResult")}</div>
            {quickResults.map((issue, i) => (
              <div key={i} style={{ padding: "10px 12px", background: T.bg3, borderRadius: 8, border: `1px solid ${catColors[issue.category] || T.border}22`, marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: catColors[issue.category] || T.text4 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{issue.cause}</span>
                </div>
                <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.6 }}>{issue.fix}</div>
              </div>
            ))}
          </div>
        )}

        <button className="bp" style={{ width: "100%" }} onClick={aiDiagnose} disabled={loading || !errorMsg.trim()}>
          {loading ? t("dbAILoading") : t("dbAIBtn")}
        </button>

        {/* AI result */}
        {result && (
          <div style={{ marginTop: 14, padding: "14px 16px", background: `${T.accent}08`, borderRadius: 10, border: `1px solid ${T.accent}22` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>{t("dbAIDiagnosis")}</div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.7, marginBottom: 10 }}>{result.diagnosis}</div>
            {result.fixes?.map((fix, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                <span style={{ color: T.accent, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontSize: 11, color: T.text2 }}>{fix}</span>
              </div>
            ))}
            {result.prevention && <div style={{ marginTop: 8, fontSize: 10, color: T.text3 }}>{`💡 ${t("dbPrevention")}: ${result.prevention}`}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// NODE REFERENCE COMPONENT (Feature 3)
// ═══════════════════════════════════════════
function NodeReference({ theme, lang }) {
  const t = (key) => (LANG[lang] || LANG.ko)[key] || (LANG.ko)[key] || key;
  const T = THEMES[theme] || THEMES.dark;
  const mono = MONO;
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [catFilter, setCatFilter] = useState("all");

  const cats = [...new Set(NODE_REF.map(n => n.cat))];
  const filtered = NODE_REF.filter(n => {
    if (catFilter !== "all" && n.cat !== catFilter) return false;
    if (search && !n.type.toLowerCase().includes(search.toLowerCase()) && !n.desc.includes(search)) return false;
    return true;
  });

  return (
    <div style={{ animation: "fi .35s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4, fontFamily: SERIF, letterSpacing: "-0.03em", color: T.text }}>{t("refTitle")}</h1>
        <p style={{ color: T.text4, fontSize: 12 }}>{t("nrDesc")}</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="inp" value={search} onChange={e => setSearch(e.target.value)} placeholder={t("nrSearch")} style={{ flex: 1, minWidth: 150, fontSize: 12 }} />
        <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
          {["all", ...cats].map(ct => (
            <button key={ct} onClick={() => setCatFilter(ct)} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${catFilter === ct ? T.accent : T.border}`, background: catFilter === ct ? `${T.accent}15` : "transparent", color: catFilter === ct ? T.accent : T.text3, fontSize: 10, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{ct === "all" ? t("lvAll") : ct}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
        {filtered.map(node => (
          <div key={node.type} onClick={() => setSelected(selected?.type === node.type ? null : node)} style={{ background: T.bg2, border: `1px solid ${selected?.type === node.type ? node.color + "66" : T.border}`, borderRadius: 16, padding: "16px 18px", cursor: "pointer", transition: "border-color .2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: node.color }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: mono }}>{node.type}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.5, marginBottom: 8 }}>{node.desc}</div>

            {/* Ports */}
            <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
              {node.inputs.length > 0 && <div>
                <div style={{ fontSize: 8, color: T.text4, marginBottom: 3 }}>INPUTS</div>
                {node.inputs.map(p => <div key={p.name} style={{ fontSize: 9, color: LCOL[p.type] || T.text3, fontFamily: mono }}>● {p.name}</div>)}
              </div>}
              {node.outputs.length > 0 && <div>
                <div style={{ fontSize: 8, color: T.text4, marginBottom: 3 }}>OUTPUTS</div>
                {node.outputs.map(p => <div key={p.name} style={{ fontSize: 9, color: LCOL[p.type] || T.text3, fontFamily: mono }}>○ {p.name}</div>)}
              </div>}
            </div>

            {/* Expanded detail */}
            {selected?.type === node.type && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                {node.params.length > 0 && <div style={{ marginBottom: 6 }}><div style={{ fontSize: 9, color: T.text4, marginBottom: 3 }}>PARAMETERS</div>{node.params.map((p, i) => <div key={i} style={{ fontSize: 10, color: T.text2, lineHeight: 1.5 }}>• {p}</div>)}</div>}
                <div style={{ fontSize: 10, color: T.accent, lineHeight: 1.5 }}>💡 {node.tips}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// CUSTOM NODE SECTION (Feature 4 — in models page)
// ═══════════════════════════════════════════
function CustomNodeSection({ theme, userVram, lang }) {
  const t = (key) => (LANG[lang] || LANG.ko)[key] || (LANG.ko)[key] || key;
  const T = THEMES[theme] || THEMES.dark;
  const [cnCat, setCnCat] = useState("all");
  const cats = ["all", ...new Set(CUSTOM_NODES.map(n => n.cat))];
  const filtered = cnCat === "all" ? CUSTOM_NODES : CUSTOM_NODES.filter(n => n.cat === cnCat);

  return (
    <div style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4, fontFamily: SERIF }}>{t("modCustomTitle")}</h2>
      <p style={{ fontSize: 11, color: T.text4, marginBottom: 12 }}>{t("cnDesc")}</p>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, overflowX: "auto" }}>
        {cats.map(ct => <button key={ct} onClick={() => setCnCat(ct)} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${cnCat === ct ? T.accent : T.border}`, background: cnCat === ct ? `${T.accent}15` : "transparent", color: cnCat === ct ? T.accent : T.text3, fontSize: 10, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{ct === "all" ? t("lvAll") : ct}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
        {filtered.map(cn => (
          <div key={cn.id} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 3 }}>{cn.name}</div>
            <div style={{ fontSize: 10, color: T.text2, marginBottom: 6, lineHeight: 1.4 }}>{cn.desc}</div>
            <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
              {cn.tags.map(t => <span key={t} className="tag" style={{ color: T.text3 }}>{t}</span>)}
              {cn.vram > 0 && <span className="tag" style={{ color: userVram && cn.vram > userVram ? "#f87171" : T.text4 }}>+{cn.vram}GB</span>}
            </div>
            <a href={cn.url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, background: T.bg3, border: `1px solid ${T.border}`, color: T.accent, fontSize: 10, fontWeight: 600, textDecoration: "none" }}>GitHub →</a>
          </div>
        ))}
      </div>
    </div>
  );
}


const TUTORIALS_DATA_ALL = {
  ko: [
  { id: "basics", title: "ComfyUI 완전 입문", icon: "🌱", level: "beginner",
    slides: [
      { title: "ComfyUI란?", body: "ComfyUI는 **노드 기반** AI 이미지/비디오 생성 도구입니다.\n**레고 블록처럼 연결**하여 파이프라인을 구축합니다.", points: ["오픈소스 (무료)", "변경 노드만 재실행", "JSON 워크플로우 공유", "커스텀 노드 확장"], flow: ["Load Model", "Text Encode", "KSampler", "Decode", "Save"], flowC: ["#2dd4a8", "#fbbf24", "#f87171", "#fb923c", "#4ade80"], detail: "◆ 효율성 — 변경된 노드만 재실행\n◆ 투명성 — 데이터 흐름을 시각적으로 확인\n◆ 재현성 — JSON+PNG 메타데이터로 워크플로우 복원\n◆ 확장성 — 수천 개 커스텀 노드" },
      { title: "설치 방법", body: "세 가지 방법 중 선택하세요.", installMethods: [{ name: "Desktop App", diff: "쉬움", time: "5분", icon: "💻", desc: "comfy.org에서 다운로드\n모든 의존성 자동 설치" }, { name: "수동 설치", diff: "보통", time: "20분", icon: "⌨️", desc: "git clone → pip install\n→ python main.py" }, { name: "Comfy Cloud", diff: "쉬움", time: "2분", icon: "☁️", desc: "GPU 없이 RTX 4090급 사용\n시간당 $1-4" }], detail: "◆ Desktop App — 초보자 추천. 원클릭 설치.\n◆ 수동 — Python 3.10+ & Git 필요.\n◆ Cloud — 로컬 GPU 불필요." },
      { title: "하드웨어", body: "GPU VRAM이 가장 중요합니다.", hwTiers: [{ name: "Entry", gpu: "RTX 3060 12GB", ram: "16GB", use: "SD1.5/SDXL", color: "#4ade80" }, { name: "Standard", gpu: "RTX 4070Ti 16GB", ram: "32GB", use: "Flux 1024px", color: "#60a5fa" }, { name: "Pro", gpu: "RTX 4090 24GB", ram: "64GB", use: "Flux+비디오", color: "#fbbf24" }, { name: "Studio", gpu: "RTX 5090 32GB", ram: "128GB", use: "Hunyuan 13B", color: "#f472b6" }], detail: "◆ VRAM: SD1.5 ~4GB, SDXL ~7GB, Flux ~14GB, Wan ~18GB\n◆ 절약: GGUF 60%, FP8 30%, --lowvram" },
    ],
    quiz: [{ q: "ComfyUI에서 변경된 노드만 재실행하는 이유는?", opts: ["속도 최적화", "메모리 절약", "버그 방지", "보안"], ans: 0 }, { q: "SDXL 모델의 권장 VRAM은?", opts: ["4GB", "6-8GB", "16GB", "32GB"], ans: 1 }],
  },
  { id: "nodes", title: "노드 이해", icon: "🔲", level: "beginner",
    slides: [
      { title: "데이터 타입 & 컬러", body: "같은 색상 포트끼리만 연결 가능합니다.", colorCodes: [{ type: "MODEL", color: "#f87171", desc: "AI 모델", em: "🔴" }, { type: "CLIP", color: "#a78bfa", desc: "텍스트 인코더", em: "🟣" }, { type: "VAE", color: "#f472b6", desc: "이미지 변환기", em: "💗" }, { type: "CONDITIONING", color: "#fbbf24", desc: "프롬프트 조건", em: "🟡" }, { type: "LATENT", color: "#22d3ee", desc: "잠재 공간 데이터", em: "🩵" }, { type: "IMAGE", color: "#4ade80", desc: "픽셀 이미지", em: "🟢" }], detail: "◆ MODEL — UNet/DiT 노이즈 예측기\n◆ CLIP — 텍스트→벡터 변환\n◆ VAE — 이미지↔잠재공간 변환" },
      { title: "KSampler 파라미터", body: "이미지 품질의 핵심 노드입니다.", paramList: [{ name: "seed", desc: "랜덤 시드", range: "0~2³²", tip: "동일=동일 결과" }, { name: "steps", desc: "반복 횟수", range: "10-50", tip: "20↓미리보기, 30+최종" }, { name: "cfg", desc: "프롬프트 가이던스", range: "1-20", tip: "Flux 1-4, SDXL 4-7" }, { name: "sampler", desc: "알고리즘", range: "euler 등", tip: "dpmpp_2m_sde 디테일↑" }, { name: "denoise", desc: "강도(i2i용)", range: "0-1", tip: "0.3-0.7 원본+변환" }], detail: "◆ Steps: 10-15 미리보기, 20-25 일반, 30+ 고품질\n◆ CFG: Flux 1-4, SDXL 4-7, SD1.5 7-12" },
    ],
    quiz: [{ q: "CFG 값이 너무 높으면?", opts: ["과채도/왜곡 발생", "속도 향상", "해상도 증가", "VRAM 절약"], ans: 0 }, { q: "Flux 모델의 권장 CFG 범위는?", opts: ["7-12", "4-7", "1-4", "15-20"], ans: 2 }],
  },
  { id: "lora-cn", title: "LoRA & ControlNet", icon: "🎨", level: "intermediate",
    slides: [
      { title: "LoRA 활용", body: "가벼운 파일로 스타일/캐릭터를 변경합니다.", flow: ["Checkpoint", "LoRA", "CLIP Encode"], flowC: ["#2dd4a8", "#e879f9", "#fbbf24"], points: ["체크포인트 교체 없이 스타일 변경", "strength 0.7-0.8 시작", "3개+ 동시 사용 시 품질↓", "models/loras/ 폴더에 저장"], detail: "◆ 원리: 모델 1-5% 크기 어댑터\n◆ 인기: Detail Tweaker, LCM LoRA" },
      { title: "ControlNet", body: "조건 이미지로 정밀 제어합니다.", cnTypes: [{ name: "Canny", desc: "엣지 감지", color: "#60a5fa", str: "0.5-1.0" }, { name: "Depth", desc: "깊이맵", color: "#22d3ee", str: "0.4-0.8" }, { name: "OpenPose", desc: "인체 포즈", color: "#4ade80", str: "0.6-1.0" }, { name: "Scribble", desc: "스케치", color: "#fbbf24", str: "0.3-0.7" }], detail: "◆ strength: 0.3(느슨) ~ 1.0(완전 제어)\n◆ Multi-ControlNet: Canny+OpenPose 동시 적용" },
    ],
    quiz: [{ q: "LoRA 3개+ 사용 시 권장 strength는?", opts: ["1.0", "0.8", "0.4-0.6", "2.0"], ans: 2 }],
  },
  { id: "video-adv", title: "비디오 & 고급", icon: "🎬", level: "advanced",
    slides: [
      { title: "비디오 생성", body: "Wan 2.2, HunyuanVideo, LTX-Video를 지원합니다.", flow: ["UNET", "DualCLIP", "KSampler", "Decode", "Save"], flowC: ["#60a5fa", "#a78bfa", "#f87171", "#fb923c", "#4ade80"], points: ["Wan 2.2: 16GB, 균형 T2V", "HunyuanVideo: 24GB+, 최고 품질", "해상도 16배수 필수", "TeaCache 3배 가속"], detail: "◆ T2V: steps=30, cfg=6, euler\n◆ VRAM 절약: FP8, GGUF, 480p→업스케일" },
      { title: "최적화 & App Mode", body: "성능 극대화와 2026년 신기능.", points: ["FP8: 30-40% VRAM 절약", "GGUF: 60% 절약", "NVFP4: RTX 50 2.5배↑", "App Mode: 노드→앱 UI", "URL 워크플로우 공유"], detail: "◆ 최적화: 512px 테스트 → seed 고정 → 1024px → 업스케일\n◆ App Mode: 입출력만 노출, URL 공유" },
    ],
    quiz: [{ q: "NVFP4 사용 가능 GPU는?", opts: ["RTX 30", "RTX 40", "RTX 50", "모든 NVIDIA"], ans: 2 }],
  }],
  en: [
  { id: "basics", title: "ComfyUI Beginner Guide", icon: "🌱", level: "beginner",
    slides: [
      { title: "What is ComfyUI?", body: "ComfyUI is a **node-based** AI image/video generation tool.\n**Connect like LEGO blocks** to build pipelines.", points: ["Open source (free)", "Re-runs only changed nodes", "Share workflows via JSON", "Extensible with custom nodes"], flow: ["Load Model", "Text Encode", "KSampler", "Decode", "Save"], flowC: ["#2dd4a8", "#fbbf24", "#f87171", "#fb923c", "#4ade80"], detail: "◆ Efficiency — Only re-runs changed nodes\n◆ Transparency — Visually track data flow\n◆ Reproducibility — Restore from JSON+PNG\n◆ Extensibility — Thousands of custom nodes" },
      { title: "Installation", body: "Choose from three methods.", installMethods: [{ name: "Desktop App", diff: "Easy", time: "5 min", icon: "💻", desc: "Download from comfy.org\nAll deps auto-installed" }, { name: "Manual Install", diff: "Medium", time: "20 min", icon: "⌨️", desc: "git clone → pip install\n→ python main.py" }, { name: "Comfy Cloud", diff: "Easy", time: "2 min", icon: "☁️", desc: "RTX 4090-level without GPU\n$1-4 per hour" }], detail: "◆ Desktop App — Recommended for beginners.\n◆ Manual — Requires Python 3.10+ & Git.\n◆ Cloud — No local GPU needed." },
      { title: "Hardware", body: "GPU VRAM is the most important factor.", hwTiers: [{ name: "Entry", gpu: "RTX 3060 12GB", ram: "16GB", use: "SD1.5/SDXL", color: "#4ade80" }, { name: "Standard", gpu: "RTX 4070Ti 16GB", ram: "32GB", use: "Flux 1024px", color: "#60a5fa" }, { name: "Pro", gpu: "RTX 4090 24GB", ram: "64GB", use: "Flux+Video", color: "#fbbf24" }, { name: "Studio", gpu: "RTX 5090 32GB", ram: "128GB", use: "Hunyuan 13B", color: "#f472b6" }], detail: "◆ VRAM: SD1.5 ~4GB, SDXL ~7GB, Flux ~14GB, Wan ~18GB\n◆ Savings: GGUF 60%, FP8 30%, --lowvram" },
    ],
    quiz: [{ q: "Why does ComfyUI only re-run changed nodes?", opts: ["Speed optimization", "Memory saving", "Bug prevention", "Security"], ans: 0 }, { q: "Recommended VRAM for SDXL?", opts: ["4GB", "6-8GB", "16GB", "32GB"], ans: 1 }],
  },
  { id: "nodes", title: "Understanding Nodes", icon: "🔲", level: "beginner",
    slides: [
      { title: "Data Types & Colors", body: "Only same-color ports can be connected.", colorCodes: [{ type: "MODEL", color: "#f87171", desc: "AI Model", em: "🔴" }, { type: "CLIP", color: "#a78bfa", desc: "Text Encoder", em: "🟣" }, { type: "VAE", color: "#f472b6", desc: "Image Converter", em: "💗" }, { type: "CONDITIONING", color: "#fbbf24", desc: "Prompt Condition", em: "🟡" }, { type: "LATENT", color: "#22d3ee", desc: "Latent Space", em: "🩵" }, { type: "IMAGE", color: "#4ade80", desc: "Pixel Image", em: "🟢" }], detail: "◆ MODEL — UNet/DiT noise predictor\n◆ CLIP — Text→vector\n◆ VAE — Image↔latent conversion" },
      { title: "KSampler Parameters", body: "The core node for image quality.", paramList: [{ name: "seed", desc: "Random seed", range: "0~2³²", tip: "Same=same result" }, { name: "steps", desc: "Iterations", range: "10-50", tip: "20↓preview, 30+final" }, { name: "cfg", desc: "Prompt guidance", range: "1-20", tip: "Flux 1-4, SDXL 4-7" }, { name: "sampler", desc: "Algorithm", range: "euler etc", tip: "dpmpp_2m_sde detail↑" }, { name: "denoise", desc: "Strength (i2i)", range: "0-1", tip: "0.3-0.7 blend" }], detail: "◆ Steps: 10-15 preview, 20-25 normal, 30+ HQ\n◆ CFG: Flux 1-4, SDXL 4-7, SD1.5 7-12" },
    ],
    quiz: [{ q: "What happens when CFG is too high?", opts: ["Oversaturation/distortion", "Faster speed", "Higher resolution", "VRAM saving"], ans: 0 }, { q: "Recommended CFG for Flux?", opts: ["7-12", "4-7", "1-4", "15-20"], ans: 2 }],
  },
  { id: "lora-cn", title: "LoRA & ControlNet", icon: "🎨", level: "intermediate",
    slides: [
      { title: "Using LoRA", body: "Change styles/characters with lightweight files.", flow: ["Checkpoint", "LoRA", "CLIP Encode"], flowC: ["#2dd4a8", "#e879f9", "#fbbf24"], points: ["Change style without swapping checkpoints", "Start with strength 0.7-0.8", "Quality drops with 3+ LoRAs", "Save to models/loras/"], detail: "◆ How: 1-5% size adapter matrix\n◆ Popular: Detail Tweaker, LCM LoRA" },
      { title: "ControlNet", body: "Precise control with condition images.", cnTypes: [{ name: "Canny", desc: "Edge detection", color: "#60a5fa", str: "0.5-1.0" }, { name: "Depth", desc: "Depth map", color: "#22d3ee", str: "0.4-0.8" }, { name: "OpenPose", desc: "Body pose", color: "#4ade80", str: "0.6-1.0" }, { name: "Scribble", desc: "Sketch", color: "#fbbf24", str: "0.3-0.7" }], detail: "◆ strength: 0.3(loose) ~ 1.0(full)\n◆ Multi-ControlNet: Canny+OpenPose" },
    ],
    quiz: [{ q: "Recommended strength for 3+ LoRAs?", opts: ["1.0", "0.8", "0.4-0.6", "2.0"], ans: 2 }],
  },
  { id: "video-adv", title: "Video & Advanced", icon: "🎬", level: "advanced",
    slides: [
      { title: "Video Generation", body: "Supports Wan 2.2, HunyuanVideo, LTX-Video.", flow: ["UNET", "DualCLIP", "KSampler", "Decode", "Save"], flowC: ["#60a5fa", "#a78bfa", "#f87171", "#fb923c", "#4ade80"], points: ["Wan 2.2: 16GB, balanced T2V", "HunyuanVideo: 24GB+, top quality", "Resolution must be ×16", "TeaCache 3x speedup"], detail: "◆ T2V: steps=30, cfg=6, euler\n◆ Save VRAM: FP8, GGUF, 480p→upscale" },
      { title: "Optimization & App Mode", body: "Maximize performance with 2026 features.", points: ["FP8: 30-40% VRAM saving", "GGUF: 60% saving", "NVFP4: RTX 50 2.5x↑", "App Mode: Nodes→App UI", "Share workflows via URL"], detail: "◆ Optimize: 512px test → fix seed → 1024px → upscale\n◆ App Mode: Expose I/O only, URL sharing" },
    ],
    quiz: [{ q: "Which GPU supports NVFP4?", opts: ["RTX 30", "RTX 40", "RTX 50", "All NVIDIA"], ans: 2 }],
  }],
  zh: [
  { id: "basics", title: "ComfyUI 入门指南", icon: "🌱", level: "beginner",
    slides: [
      { title: "什么是ComfyUI？", body: "ComfyUI是**基于节点**的AI图像/视频生成工具。\n**像乐高积木一样连接**来构建管线。", points: ["开源（免费）", "仅重新运行更改的节点", "通过JSON共享工作流", "自定义节点扩展"], flow: ["Load Model", "Text Encode", "KSampler", "Decode", "Save"], flowC: ["#2dd4a8", "#fbbf24", "#f87171", "#fb923c", "#4ade80"], detail: "◆ 高效 — 仅重新运行更改的节点\n◆ 透明 — 可视化数据流\n◆ 可复现 — JSON+PNG恢复\n◆ 可扩展 — 数千自定义节点" },
      { title: "安装方法", body: "从三种方法中选择。", installMethods: [{ name: "桌面应用", diff: "简单", time: "5分钟", icon: "💻", desc: "从comfy.org下载\n自动安装依赖" }, { name: "手动安装", diff: "中等", time: "20分钟", icon: "⌨️", desc: "git clone → pip install\n→ python main.py" }, { name: "Comfy Cloud", diff: "简单", time: "2分钟", icon: "☁️", desc: "无需GPU\n每小时$1-4" }], detail: "◆ 桌面应用 — 新手推荐。\n◆ 手动 — 需Python 3.10+ & Git。\n◆ Cloud — 无需本地GPU。" },
      { title: "硬件要求", body: "GPU VRAM最重要。", hwTiers: [{ name: "入门", gpu: "RTX 3060 12GB", ram: "16GB", use: "SD1.5/SDXL", color: "#4ade80" }, { name: "标准", gpu: "RTX 4070Ti 16GB", ram: "32GB", use: "Flux 1024px", color: "#60a5fa" }, { name: "专业", gpu: "RTX 4090 24GB", ram: "64GB", use: "Flux+视频", color: "#fbbf24" }, { name: "工作室", gpu: "RTX 5090 32GB", ram: "128GB", use: "Hunyuan 13B", color: "#f472b6" }], detail: "◆ VRAM: SD1.5 ~4GB, SDXL ~7GB, Flux ~14GB, Wan ~18GB\n◆ 节省: GGUF 60%, FP8 30%, --lowvram" },
    ],
    quiz: [{ q: "ComfyUI为什么只重新运行更改的节点？", opts: ["速度优化", "节省内存", "防Bug", "安全"], ans: 0 }, { q: "SDXL推荐多少VRAM？", opts: ["4GB", "6-8GB", "16GB", "32GB"], ans: 1 }],
  },
  { id: "nodes", title: "理解节点", icon: "🔲", level: "beginner",
    slides: [
      { title: "数据类型与颜色", body: "只有相同颜色的端口才能连接。", colorCodes: [{ type: "MODEL", color: "#f87171", desc: "AI模型", em: "🔴" }, { type: "CLIP", color: "#a78bfa", desc: "文本编码器", em: "🟣" }, { type: "VAE", color: "#f472b6", desc: "图像转换器", em: "💗" }, { type: "CONDITIONING", color: "#fbbf24", desc: "提示词条件", em: "🟡" }, { type: "LATENT", color: "#22d3ee", desc: "潜空间数据", em: "🩵" }, { type: "IMAGE", color: "#4ade80", desc: "像素图像", em: "🟢" }], detail: "◆ MODEL — UNet/DiT噪声预测器\n◆ CLIP — 文本→向量\n◆ VAE — 图像↔潜空间" },
      { title: "KSampler参数", body: "控制图像质量的核心节点。", paramList: [{ name: "seed", desc: "随机种子", range: "0~2³²", tip: "相同=相同结果" }, { name: "steps", desc: "迭代次数", range: "10-50", tip: "20↓预览, 30+最终" }, { name: "cfg", desc: "提示词引导", range: "1-20", tip: "Flux 1-4, SDXL 4-7" }, { name: "sampler", desc: "算法", range: "euler等", tip: "dpmpp_2m_sde 细节↑" }, { name: "denoise", desc: "强度(i2i)", range: "0-1", tip: "0.3-0.7 混合" }], detail: "◆ Steps: 10-15预览, 20-25普通, 30+高质量\n◆ CFG: Flux 1-4, SDXL 4-7, SD1.5 7-12" },
    ],
    quiz: [{ q: "CFG过高会怎样？", opts: ["过饱和/失真", "速度提升", "分辨率增加", "节省VRAM"], ans: 0 }, { q: "Flux推荐CFG范围？", opts: ["7-12", "4-7", "1-4", "15-20"], ans: 2 }],
  },
  { id: "lora-cn", title: "LoRA & ControlNet", icon: "🎨", level: "intermediate",
    slides: [
      { title: "LoRA使用", body: "用轻量文件更改风格/角色。", flow: ["Checkpoint", "LoRA", "CLIP Encode"], flowC: ["#2dd4a8", "#e879f9", "#fbbf24"], points: ["无需更换检查点", "strength从0.7-0.8开始", "3个+同时使用质量↓", "保存到models/loras/"], detail: "◆ 原理: 1-5%大小适配器\n◆ 热门: Detail Tweaker, LCM LoRA" },
      { title: "ControlNet", body: "通过条件图像精确控制。", cnTypes: [{ name: "Canny", desc: "边缘检测", color: "#60a5fa", str: "0.5-1.0" }, { name: "Depth", desc: "深度图", color: "#22d3ee", str: "0.4-0.8" }, { name: "OpenPose", desc: "人体姿势", color: "#4ade80", str: "0.6-1.0" }, { name: "Scribble", desc: "草图", color: "#fbbf24", str: "0.3-0.7" }], detail: "◆ strength: 0.3(宽松) ~ 1.0(完全控制)\n◆ 多ControlNet: Canny+OpenPose" },
    ],
    quiz: [{ q: "3个+LoRA推荐strength？", opts: ["1.0", "0.8", "0.4-0.6", "2.0"], ans: 2 }],
  },
  { id: "video-adv", title: "视频与高级", icon: "🎬", level: "advanced",
    slides: [
      { title: "视频生成", body: "支持Wan 2.2、HunyuanVideo、LTX-Video。", flow: ["UNET", "DualCLIP", "KSampler", "Decode", "Save"], flowC: ["#60a5fa", "#a78bfa", "#f87171", "#fb923c", "#4ade80"], points: ["Wan 2.2: 16GB, 均衡T2V", "HunyuanVideo: 24GB+, 最高质量", "分辨率须为16倍数", "TeaCache 3倍加速"], detail: "◆ T2V: steps=30, cfg=6, euler\n◆ 节省VRAM: FP8, GGUF, 480p→超分" },
      { title: "优化与App Mode", body: "性能最大化与2026年新功能。", points: ["FP8: 30-40% VRAM节省", "GGUF: 60%节省", "NVFP4: RTX 50 2.5倍↑", "App Mode: 节点→应用UI", "URL分享工作流"], detail: "◆ 优化: 512px测试 → 固定seed → 1024px → 超分\n◆ App Mode: 仅暴露输入输出, URL分享" },
    ],
    quiz: [{ q: "哪款GPU支持NVFP4？", opts: ["RTX 30", "RTX 40", "RTX 50", "全部NVIDIA"], ans: 2 }],
  }],
  ja: [
  { id: "basics", title: "ComfyUI 入門ガイド", icon: "🌱", level: "beginner",
    slides: [
      { title: "ComfyUIとは？", body: "ComfyUIは**ノードベース**のAI画像/動画生成ツールです。\n**レゴブロックのように接続**してパイプラインを構築します。", points: ["オープンソース（無料）", "変更ノードのみ再実行", "JSONでワークフロー共有", "カスタムノード拡張"], flow: ["Load Model", "Text Encode", "KSampler", "Decode", "Save"], flowC: ["#2dd4a8", "#fbbf24", "#f87171", "#fb923c", "#4ade80"], detail: "◆ 効率性 — 変更ノードのみ再実行\n◆ 透明性 — データフロー視覚化\n◆ 再現性 — JSON+PNGで復元\n◆ 拡張性 — 数千のカスタムノード" },
      { title: "インストール", body: "3つの方法から選択。", installMethods: [{ name: "デスクトップアプリ", diff: "簡単", time: "5分", icon: "💻", desc: "comfy.orgからダウンロード\n依存関係自動インストール" }, { name: "手動インストール", diff: "普通", time: "20分", icon: "⌨️", desc: "git clone → pip install\n→ python main.py" }, { name: "Comfy Cloud", diff: "簡単", time: "2分", icon: "☁️", desc: "GPUなしでRTX 4090級\n$1-4/時間" }], detail: "◆ デスクトップ — 初心者推奨。\n◆ 手動 — Python 3.10+ & Git必要。\n◆ Cloud — ローカルGPU不要。" },
      { title: "ハードウェア", body: "GPU VRAMが最重要です。", hwTiers: [{ name: "Entry", gpu: "RTX 3060 12GB", ram: "16GB", use: "SD1.5/SDXL", color: "#4ade80" }, { name: "Standard", gpu: "RTX 4070Ti 16GB", ram: "32GB", use: "Flux 1024px", color: "#60a5fa" }, { name: "Pro", gpu: "RTX 4090 24GB", ram: "64GB", use: "Flux+動画", color: "#fbbf24" }, { name: "Studio", gpu: "RTX 5090 32GB", ram: "128GB", use: "Hunyuan 13B", color: "#f472b6" }], detail: "◆ VRAM: SD1.5 ~4GB, SDXL ~7GB, Flux ~14GB, Wan ~18GB\n◆ 節約: GGUF 60%, FP8 30%, --lowvram" },
    ],
    quiz: [{ q: "変更ノードのみ再実行する理由は？", opts: ["速度最適化", "メモリ節約", "バグ防止", "セキュリティ"], ans: 0 }, { q: "SDXLの推奨VRAMは？", opts: ["4GB", "6-8GB", "16GB", "32GB"], ans: 1 }],
  },
  { id: "nodes", title: "ノードの理解", icon: "🔲", level: "beginner",
    slides: [
      { title: "データ型とカラー", body: "同じ色のポート同士のみ接続可能。", colorCodes: [{ type: "MODEL", color: "#f87171", desc: "AIモデル", em: "🔴" }, { type: "CLIP", color: "#a78bfa", desc: "テキストエンコーダ", em: "🟣" }, { type: "VAE", color: "#f472b6", desc: "画像変換器", em: "💗" }, { type: "CONDITIONING", color: "#fbbf24", desc: "プロンプト条件", em: "🟡" }, { type: "LATENT", color: "#22d3ee", desc: "潜在空間", em: "🩵" }, { type: "IMAGE", color: "#4ade80", desc: "ピクセル画像", em: "🟢" }], detail: "◆ MODEL — UNet/DiTノイズ予測器\n◆ CLIP — テキスト→ベクトル\n◆ VAE — 画像↔潜在空間" },
      { title: "KSamplerパラメータ", body: "画像品質の核心ノード。", paramList: [{ name: "seed", desc: "ランダムシード", range: "0~2³²", tip: "同じ=同じ結果" }, { name: "steps", desc: "反復回数", range: "10-50", tip: "20↓プレビュー, 30+最終" }, { name: "cfg", desc: "ガイダンス", range: "1-20", tip: "Flux 1-4, SDXL 4-7" }, { name: "sampler", desc: "アルゴリズム", range: "euler等", tip: "dpmpp_2m_sde 詳細↑" }, { name: "denoise", desc: "強度(i2i)", range: "0-1", tip: "0.3-0.7 ブレンド" }], detail: "◆ Steps: 10-15プレビュー, 20-25通常, 30+高品質\n◆ CFG: Flux 1-4, SDXL 4-7, SD1.5 7-12" },
    ],
    quiz: [{ q: "CFG高すぎるとどうなる？", opts: ["過飽和/歪み", "速度向上", "解像度増加", "VRAM節約"], ans: 0 }, { q: "Flux推奨CFG範囲は？", opts: ["7-12", "4-7", "1-4", "15-20"], ans: 2 }],
  },
  { id: "lora-cn", title: "LoRA & ControlNet", icon: "🎨", level: "intermediate",
    slides: [
      { title: "LoRA活用", body: "軽量ファイルでスタイル/キャラ変更。", flow: ["Checkpoint", "LoRA", "CLIP Encode"], flowC: ["#2dd4a8", "#e879f9", "#fbbf24"], points: ["チェックポイント交換不要", "strength 0.7-0.8から", "3個+で品質↓", "models/loras/に保存"], detail: "◆ 原理: 1-5%アダプター行列\n◆ 人気: Detail Tweaker, LCM LoRA" },
      { title: "ControlNet", body: "条件画像で精密制御。", cnTypes: [{ name: "Canny", desc: "エッジ検出", color: "#60a5fa", str: "0.5-1.0" }, { name: "Depth", desc: "深度マップ", color: "#22d3ee", str: "0.4-0.8" }, { name: "OpenPose", desc: "ポーズ", color: "#4ade80", str: "0.6-1.0" }, { name: "Scribble", desc: "スケッチ", color: "#fbbf24", str: "0.3-0.7" }], detail: "◆ strength: 0.3(緩い) ~ 1.0(完全制御)\n◆ マルチCN: Canny+OpenPose同時" },
    ],
    quiz: [{ q: "LoRA3個+の推奨strengthは？", opts: ["1.0", "0.8", "0.4-0.6", "2.0"], ans: 2 }],
  },
  { id: "video-adv", title: "動画 & 上級", icon: "🎬", level: "advanced",
    slides: [
      { title: "動画生成", body: "Wan 2.2、HunyuanVideo、LTX-Videoをサポート。", flow: ["UNET", "DualCLIP", "KSampler", "Decode", "Save"], flowC: ["#60a5fa", "#a78bfa", "#f87171", "#fb923c", "#4ade80"], points: ["Wan 2.2: 16GB, バランスT2V", "HunyuanVideo: 24GB+, 最高品質", "解像度×16必須", "TeaCache 3倍高速化"], detail: "◆ T2V: steps=30, cfg=6, euler\n◆ VRAM節約: FP8, GGUF, 480p→アップスケール" },
      { title: "最適化 & App Mode", body: "パフォーマンス最大化と2026年新機能。", points: ["FP8: 30-40% VRAM節約", "GGUF: 60%節約", "NVFP4: RTX 50 2.5倍↑", "App Mode: ノード→アプリUI", "URLワークフロー共有"], detail: "◆ 最適化: 512pxテスト → seed固定 → 1024px → アップスケール\n◆ App Mode: I/Oのみ公開, URL共有" },
    ],
    quiz: [{ q: "NVFP4対応GPUは？", opts: ["RTX 30", "RTX 40", "RTX 50", "全NVIDIA"], ans: 2 }],
  }],
};
function getTutorials(lang) { return TUTORIALS_DATA_ALL[lang] || TUTORIALS_DATA_ALL.ko; }

// ═══════════════════════════════════════════
// NODE GRAPH RENDERER
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// CIVITAI PREVIEW IMAGE COMPONENT
// Dual-layer: tries img tag first, falls back to rich CSS card
// ═══════════════════════════════════════════
function CivitaiPreview({ img, fallbackStyle, size = 80, wide, label, base }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);
  const w = wide ? "100%" : size;
  const h = wide ? "100%" : size;
  const minH = wide ? 52 : size;

  // Color palette by model base
  const basePalettes = {
    SDXL: ["#e879f9", "#a78bfa", "#818cf8"],
    Flux: ["#38bdf8", "#22d3ee", "#2dd4bf"],
    Wan: ["#f472b6", "#fb923c", "#fbbf24"],
    Hunyuan: ["#f87171", "#e879f9", "#a78bfa"],
    LTX: ["#fbbf24", "#f59e0b", "#fb923c"],
    Upscaler: ["#4ade80", "#22d3ee", "#2dd4bf"],
    default: ["#64748b", "#94a3b8", "#475569"],
  };
  const pal = basePalettes[base] || basePalettes.default;
  const bg = fallbackStyle || `linear-gradient(135deg, ${pal[0]}18, ${pal[1]}25, ${pal[2]}18)`;
  const borderCol = `${pal[0]}40`;

  // Rich CSS fallback card
  const Fallback = () => (
    <div style={{ width: w, height: h, minHeight: minH, borderRadius: wide ? 0 : 10, overflow: "hidden", flexShrink: 0, background: bg, position: "relative", border: wide ? "none" : `1px solid ${borderCol}` }}>
      {/* Decorative pattern */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><pattern id={`p-${(label||"x").replace(/\s/g,"").slice(0,6)}-${size}`} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="white"/></pattern></defs>
        <rect width="100" height="100" fill={`url(#p-${(label||"x").replace(/\s/g,"").slice(0,6)}-${size})`}/>
      </svg>
      {/* Icon + label */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <div style={{ width: wide ? 20 : Math.max(18, size * 0.25), height: wide ? 20 : Math.max(18, size * 0.25), borderRadius: 6, background: `${pal[0]}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={wide ? 12 : Math.max(10, size * 0.15)} height={wide ? 12 : Math.max(10, size * 0.15)} viewBox="0 0 24 24" fill="none">
            <rect x="2" y="3" width="20" height="18" rx="3" stroke={pal[0]} strokeWidth="2"/>
            <circle cx="8.5" cy="9.5" r="2" stroke={pal[0]} strokeWidth="1.5"/>
            <path d="M2 17l5-5 3 3 4-4 8 8" stroke={pal[0]} strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        {!wide && size >= 70 && label && <div style={{ fontSize: 7, color: pal[0], fontWeight: 700, opacity: 0.6, textAlign: "center", maxWidth: size - 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>}
      </div>
    </div>
  );

  if (!img) return <Fallback />;

  return (
    <div style={{ width: w, height: h, minHeight: minH, borderRadius: wide ? 0 : 10, overflow: "hidden", flexShrink: 0, position: "relative", background: bg }}>
      {!loaded && !err && <Fallback />}
      {!err && (
        <img
          src={img}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
          style={{ position: loaded ? "relative" : "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", display: loaded ? "block" : "block", opacity: loaded ? 1 : 0, transition: "opacity .3s" }}
        />
      )}
      {err && <Fallback />}
    </div>
  );
}

const NCOL = { CheckpointLoaderSimple: "#2dd4a8", UNETLoader: "#60a5fa", DualCLIPLoader: "#a78bfa", VAELoader: "#f472b6", CLIPTextEncode: "#fbbf24", EmptyLatentImage: "#22d3ee", KSampler: "#f87171", VAEDecode: "#fb923c", VAEEncode: "#fb923c", SaveImage: "#4ade80", SaveAnimatedWEBP: "#4ade80", LoraLoader: "#e879f9", LoadImage: "#38bdf8", ControlNetLoader: "#94a3b8", ControlNetApplyAdvanced: "#94a3b8", UpscaleModelLoader: "#a3e635", ImageUpscaleWithModel: "#a3e635", SetLatentNoiseMask: "#22d3ee", ImageToMask: "#e2e8f0" };
const LCOL = { MODEL: "#f87171", CLIP: "#a78bfa", VAE: "#f472b6", CONDITIONING: "#fbbf24", LATENT: "#22d3ee", IMAGE: "#4ade80", CONTROL_NET: "#94a3b8", MASK: "#e2e8f0", UPSCALE_MODEL: "#a3e635" };

const NODE_PARAMS = {
  CheckpointLoaderSimple: ["ckpt_name"],
  UNETLoader: ["unet_name"],
  DualCLIPLoader: ["clip_name1", "clip_name2"],
  CLIPTextEncode: ["text"],
  EmptyLatentImage: ["width", "height", "batch_size"],
  KSampler: ["seed", "control_after_generate", "steps", "cfg", "sampler_name", "scheduler", "denoise"],
  SaveImage: ["filename_prefix"],
  SaveAnimatedWEBP: ["filename_prefix", "fps", "lossless", "quality", "method"],
  LoraLoader: ["lora_name", "strength_model", "strength_clip"],
  VAELoader: ["vae_name"],
  ControlNetLoader: ["control_net_name"],
  ImageUpscaleWithModel: [],
  UpscaleModelLoader: ["model_name"],
};

function getNodeDisplayValues(node) {
  const params = NODE_PARAMS[node.type];
  if (!params || !node.widgets_values) return [];
  const result = [];
  params.forEach((name, idx) => {
    if (idx < node.widgets_values.length && node.widgets_values[idx] != null) {
      const val = node.widgets_values[idx];
      const display = typeof val === "string" && val.length > 28 ? val.slice(0, 28) + "…" : val;
      result.push({ name, value: display });
    }
  });
  return result;
}

function NodeGraph({ workflow: wf, theme }) {
  const [pan, setPan] = useState({ x: 40, y: 10 }); const [zoom, setZoom] = useState(0.38); const [drag, setDrag] = useState(false); const ref = useRef({ x: 0, y: 0 });
  if (!wf?.nodes?.length) return null;
  const mx = Math.min(...wf.nodes.map(n => n.pos[0])), my = Math.min(...wf.nodes.map(n => n.pos[1]));
  const T = THEMES[theme] || THEMES.dark;
  return (
    <div style={{ width: "100%", height: "min(340px, 50vh)", background: T.bg, borderRadius: 12, overflow: "hidden", cursor: drag ? "grabbing" : "grab", position: "relative", border: `1px solid ${T.border}`, touchAction: "none" }}
      onWheel={e => { e.preventDefault(); setZoom(z => Math.max(0.12, Math.min(2, z + (e.deltaY > 0 ? -0.04 : 0.04)))); }}
      onMouseDown={e => { setDrag(true); ref.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; }}
      onMouseMove={e => drag && setPan({ x: e.clientX - ref.current.x, y: e.clientY - ref.current.y })}
      onMouseUp={() => setDrag(false)} onMouseLeave={() => setDrag(false)}
      onTouchStart={e => { if (e.touches.length === 1) { setDrag(true); ref.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y }; } }}
      onTouchMove={e => { if (drag && e.touches.length === 1) setPan({ x: e.touches[0].clientX - ref.current.x, y: e.touches[0].clientY - ref.current.y }); }}
      onTouchEnd={() => setDrag(false)}>
      <div style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: "0 0", position: "relative" }}>
        <svg style={{ position: "absolute", width: 2400, height: 1400, pointerEvents: "none", overflow: "visible" }}>
          {wf.links.map((link, i) => { const [, si, ss, di, ds, tp] = link; const sn = wf.nodes.find(n => n.id === si), dn = wf.nodes.find(n => n.id === di); if (!sn || !dn) return null; const sx = sn.pos[0] - mx + 310, sy = sn.pos[1] - my + 42 + ss * 24, dx = dn.pos[0] - mx + 10, dy = dn.pos[1] - my + 42 + ds * 24; return <path key={i} d={`M${sx} ${sy}C${(sx + dx) / 2} ${sy},${(sx + dx) / 2} ${dy},${dx} ${dy}`} stroke={LCOL[tp] || "#333"} strokeWidth={2} fill="none" opacity={0.5} />; })}
        </svg>
        {wf.nodes.map(node => { const c = NCOL[node.type] || "#555"; const vals = getNodeDisplayValues(node); const nodeH = 42 + Math.max(vals.length * 16, 0); return (
          <div key={node.id} style={{ position: "absolute", left: node.pos[0] - mx, top: node.pos[1] - my, width: 290, background: `${c}0a`, border: `1.5px solid ${c}55`, borderRadius: 8, fontSize: 10 }}>
            <div style={{ padding: "6px 10px", borderBottom: `1px solid ${c}22`, fontWeight: 700, fontSize: 10, color: c, fontFamily: "'JetBrains Mono',monospace" }}>{node.title}</div>
            <div style={{ padding: "3px 10px 2px", fontSize: 8, color: T.text4, fontFamily: "monospace" }}>{node.type}</div>
            {vals.length > 0 && <div style={{ padding: "2px 10px 6px" }}>
              {vals.map((v, vi) => <div key={vi} style={{ fontSize: 8, fontFamily: "monospace", color: T.text3 || "#999", lineHeight: 1.6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                <span style={{ color: T.text4 || "#666" }}>{v.name}:</span> {String(v.value)}
              </div>)}
            </div>}
            {node.inputs?.map((_, idx) => <div key={`i${idx}`} style={{ position: "absolute", left: -4, top: 34 + idx * 24, width: 8, height: 8, borderRadius: "50%", background: c, border: `2px solid ${T.bg}` }} />)}
            {node.outputs?.map((_, idx) => <div key={`o${idx}`} style={{ position: "absolute", right: -4, top: 34 + idx * 24, width: 8, height: 8, borderRadius: "50%", background: c, border: `2px solid ${T.bg}` }} />)}
          </div>); })}
      </div>
      <div style={{ position: "absolute", bottom: 8, right: 12, color: T.text4, fontSize: 9, fontFamily: "monospace" }}>{Math.round(zoom * 100)}%</div>
    </div>
  );
}

// ═══════════════════════════════════════════
// GUIDE SECTION
// ═══════════════════════════════════════════
function GuideSection({ theme, lang }) {
  const T = THEMES[theme] || THEMES.dark;
  const [guideTab, setGuideTab] = useState(0);
  const isKo = lang === "ko";
  const guideSteps = [
    { icon: "1", text: isKo ? "화면 상단의 메뉴에서 원하는 작업 방식(수동, AI 자동, 프롬프트, 디버거 등)을 선택하세요." : "Select your preferred work mode (Manual, AI Auto, Prompt, Debugger, etc.) from the top menu." },
    { icon: "2", text: isKo ? "생성하고자 하는 결과물에 맞춰 Text to Image, ControlNet 등의 패널을 클릭합니다." : "Click the panel that matches your desired output, such as Text to Image, ControlNet, etc." },
    { icon: "3", text: isKo ? "상세 설정 창에서 프롬프트를 입력하고, 필요에 따라 모델(Model)이나 VRAM 설정을 내 PC 환경에 맞게 조정합니다." : "Enter your prompt in the settings panel, and adjust Model or VRAM settings to match your PC environment." },
    { icon: "4", text: isKo ? "생성된 워크플로우를 저장하거나 즉시 실행하여 나만의 AI 아트를 완성해 보세요!" : "Save your generated workflow or run it immediately to create your own AI art!" },
  ];
  const articles = [
    { title: isKo ? "ComfyUI Studio 시작하기: 누구나 쉽게 만드는 AI 아트 워크플로우" : "Getting Started with ComfyUI Studio", body: isKo ? "ComfyUI는 노드(Node) 기반으로 강력한 AI 이미지 생성 환경을 제공하지만, 초보자가 처음 접근하기에는 진입 장벽이 높은 편입니다. ComfyUI Studio는 복잡한 노드 연결 과정을 생략하고, 직관적이고 깔끔한 사용자 인터페이스(UI)를 통해 누구나 손쉽게 최적화된 워크플로우를 생성할 수 있도록 돕는 웹 기반 플랫폼입니다." : "ComfyUI provides a powerful node-based AI image generation environment, but has a steep learning curve for beginners. ComfyUI Studio is a web-based platform that lets anyone easily create optimized workflows through an intuitive UI." },
    { title: isKo ? "다양한 AI 생성 기능을 한곳에서 경험하세요" : "Experience diverse AI generation features in one place", body: isKo ? "텍스트를 이미지로 변환하는 기본적인 Text to Image부터, 원본 이미지를 변형하는 Image to Image, 특정 부분만 수정하는 Inpainting 기술까지 모두 지원합니다. 또한, 저해상도 이미지를 고화질로 변환하는 Upscale 기능과 이미지에 생동감을 불어넣는 Video 생성 기능까지, 창작자의 의도를 완벽하게 구현할 수 있는 필수 도구들을 제공합니다." : "From Text to Image, Image to Image, and Inpainting to Upscale and Video generation \u2014 all the essential tools to bring your creative vision to life." },
    { title: isKo ? "정교한 제어를 위한 ControlNet과 LoRA" : "ControlNet and LoRA for precise control", body: isKo ? "단순한 이미지 생성을 넘어, 전문가 수준의 디테일을 원하신다면 ControlNet과 LoRA 워크플로우를 활용해 보세요. ControlNet을 통해 캐릭터의 정확한 포즈나 배경의 원근감을 세밀하게 제어할 수 있으며, LoRA를 적용하여 특정 일러스트레이터의 화풍이나 캐릭터 디자인을 일관되게 유지할 수 있습니다. 반복적인 작업이 필요할 때는 Batch(일괄 처리) 기능을 통해 작업 효율을 극대화할 수 있습니다." : "For expert-level detail, use ControlNet to precisely control poses and perspectives, and LoRA to maintain consistent art styles. The Batch feature maximizes efficiency for repetitive tasks." },
  ];
  const tabLabels = [isKo ? "활용 가이드" : "Quick Guide", isKo ? "상세 소개" : "Learn More"];
  return (
    <div style={{ marginTop: 48, padding: "32px 0", borderTop: `1px solid ${T.border}` }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 6, color: T.text }}>{isKo ? "ComfyUI Studio 활용 가이드" : "ComfyUI Studio Guide"}</h2>
      <p style={{ textAlign: "center", fontSize: 12, color: T.text4, marginBottom: 20 }}>{isKo ? "AI 이미지 생성을 위한 워크플로우를 간편하게 만들고 관리하세요." : "Easily create and manage workflows for AI image generation."}</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 24 }}>
        {tabLabels.map((lb, ti) => (
          <button key={ti} onClick={() => setGuideTab(ti)} style={{ padding: "8px 20px", borderRadius: 20, border: `1px solid ${guideTab === ti ? T.accent : T.border}`, background: guideTab === ti ? T.accent : "transparent", color: guideTab === ti ? "#fff" : T.text3, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>{lb}</button>
        ))}
      </div>
      {guideTab === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
          {guideSteps.map((s, si) => (
            <div key={si} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{s.icon}</div>
              <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.7, margin: 0 }}>{s.text}</p>
            </div>
          ))}
        </div>
      )}
      {guideTab === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {articles.map((a, ai) => (
            <div key={ai} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 22px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 10, lineHeight: 1.5 }}>{a.title}</h3>
              <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.8, margin: 0 }}>{a.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// SPEC PANEL
// ═══════════════════════════════════════════
function SpecPanel({ category, config, theme, userVram, lang }) {
  const t = (key) => (LANG[lang] || LANG.ko)[key] || (LANG.ko)[key] || key;
  const sp = getSpec(category, config, userVram, lang);
  const T = THEMES[theme] || THEMES.dark;
  const mono = MONO;
  return (
    <div style={{ background: T.bg2, border: `1px solid ${sp.color}22`, borderRadius: 14, padding: 18, marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: sp.color }} /><h3 style={{ fontSize: 12, fontWeight: 700, color: sp.color }}>{sp.level} {t("specRecommended")}</h3></div>
        <span style={{ fontSize: 10, color: T.text4, padding: "3px 10px", background: T.bg3, borderRadius: 5 }}>{sp.budget}</span>
      </div>
      <div className="spec-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 10 }}>
        {[{ ic: "🎮", lb: "GPU", vl: sp.gpu }, { ic: "💾", lb: "VRAM", vl: sp.vram }, { ic: "🧠", lb: "RAM", vl: sp.ram }, { ic: "⚡", lb: "CPU", vl: sp.cpu }, { ic: "💿", lb: "SSD", vl: sp.storage }, { ic: "⏱️", lb: t("spSpeed"), vl: sp.time }].map(x => (
          <div key={x.lb} style={{ padding: "8px 10px", background: T.bg3, borderRadius: 7, border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}><span style={{ fontSize: 10 }}>{x.ic}</span><span style={{ fontSize: 8, color: T.text4, fontWeight: 600 }}>{x.lb}</span></div>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.text2, fontFamily: mono }}>{x.vl}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 8, padding: "6px 10px", background: T.bg3, borderRadius: 6, fontSize: 9, color: T.text3 }}>{t("spExpected")} VRAM: <strong style={{ color: sp.estimatedVram > (userVram || 999) ? "#f87171" : "#4ade80" }}>{sp.estimatedVram} GB</strong>{userVram ? ` / ${t("spOwned")}: ${userVram}GB` : ""}</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {sp.tips.slice(0, 3).map((tip, i) => <span key={i} style={{ padding: "3px 8px", borderRadius: 5, background: T.bg4, fontSize: 8, color: T.text3 }}>💡 {tip}</span>)}
      </div>
      {sp.cloud && <div style={{ marginTop: 8, padding: "6px 10px", background: "#050a14", borderRadius: 6, fontSize: 9, color: "#60a5fa" }}>☁️ {sp.cloud.prov} — {sp.cloud.gpu} — {sp.cloud.cost}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════
// SLIDE VIEWER with quiz & progress (#6 #7 #8)
// ═══════════════════════════════════════════
function SlideViewer({ tutorial, onClose, theme, progress, onProgress, lang }) {
  const t = (key) => (LANG[lang] || LANG.ko)[key] || (LANG.ko)[key] || key;
  const [slideIdx, setSlideIdx] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const T = THEMES[theme] || THEMES.dark;
  const mono = MONO;
  const slide = tutorial.slides[slideIdx];
  const total = tutorial.slides.length;

  useEffect(() => { setDetailOpen(false); }, [slideIdx]);
  useEffect(() => {
    // Mark slide as viewed (#8)
    const key = `${tutorial.id}-${slideIdx}`;
    if (onProgress && !progress?.[key]) onProgress({ ...progress, [key]: true });
  }, [slideIdx, tutorial.id]);

  const renderBold = (text) => text?.split("\n").map((line, i) => {
    if (line.includes("**")) { const ps = line.split(/(\*\*.*?\*\*)/g); return <div key={i}>{ps.map((p, k) => p.startsWith("**") ? <strong key={k} style={{ color: T.text }}>{p.replace(/\*\*/g, "")}</strong> : p)}</div>; }
    return <div key={i}>{line}</div>;
  });

  // Quiz renderer
  if (quizMode && tutorial.quiz) {
    const allAnswered = tutorial.quiz.every((_, i) => quizAnswers[i] !== undefined);
    const correct = tutorial.quiz.filter((q, i) => quizAnswers[i] === q.ans).length;
    return (
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{t("tutQuizTitle")}: {tutorial.title}</span>
          <button onClick={() => { setQuizMode(false); onClose(); }} style={{ background: "transparent", border: `1px solid ${T.border2}`, borderRadius: 6, padding: "4px 12px", color: T.text3, cursor: "pointer", fontSize: 10 }}>{t("tutClose")}</button>
        </div>
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {tutorial.quiz.map((q, qi) => (
            <div key={qi} style={{ padding: 16, background: T.bg3, borderRadius: 10, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 10 }}>{qi + 1}. {q.q}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {q.opts.map((opt, oi) => {
                  const selected = quizAnswers[qi] === oi;
                  const isCorrect = q.ans === oi;
                  const showResult = quizAnswers[qi] !== undefined;
                  let bg = T.bg; let border = T.border2; let color = T.text2;
                  if (showResult && isCorrect) { bg = "#0a1a0a"; border = "#2dd4a855"; color = "#4ade80"; }
                  if (showResult && selected && !isCorrect) { bg = "#1a0a0a"; border = "#f8717155"; color = "#f87171"; }
                  if (!showResult && selected) { bg = T.bg4; border = T.accent; color = T.text; }
                  return (
                    <button key={oi} onClick={() => !showResult && setQuizAnswers(p => ({ ...p, [qi]: oi }))}
                      style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${border}`, background: bg, color, fontSize: 12, cursor: showResult ? "default" : "pointer", textAlign: "left" }}>
                      {opt} {showResult && isCorrect && " ✓"} {showResult && selected && !isCorrect && " ✗"}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {allAnswered && (
            <div style={{ padding: 16, background: correct === tutorial.quiz.length ? "#0a1a0a" : "#1a1a08", borderRadius: 10, border: `1px solid ${correct === tutorial.quiz.length ? "#2dd4a833" : "#fbbf2433"}`, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{correct === tutorial.quiz.length ? "🎉" : "📝"}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{correct}/{tutorial.quiz.length} {t("tutCorrect")}</div>
              <div style={{ fontSize: 12, color: T.text3, marginTop: 4 }}>{correct === tutorial.quiz.length ? t("tutPerfect") : t("tutReview")}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>{tutorial.icon}</span><span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{tutorial.title}</span></div>
        <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${T.border2}`, borderRadius: 6, padding: "4px 12px", color: T.text3, cursor: "pointer", fontSize: 10 }}>{t("tutClose")}</button>
      </div>
      {/* Progress - hidden */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{slide.title}</h3>
          <span style={{ fontSize: 10, color: T.text4, fontFamily: mono }}>{slideIdx + 1}/{total}</span>
        </div>
        <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.8, marginBottom: 14 }}>{renderBold(slide.body)}</div>

        {slide.flow && <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "10px 0", overflowX: "auto", marginBottom: 10 }}>{slide.flow.map((label, i) => <div key={i} style={{ display: "flex", alignItems: "center" }}><div style={{ padding: "8px 12px", borderRadius: 7, background: `${slide.flowC[i]}12`, border: `1.5px solid ${slide.flowC[i]}44`, fontSize: 10, fontWeight: 600, color: slide.flowC[i], fontFamily: mono, whiteSpace: "nowrap" }}>{label}</div>{i < slide.flow.length - 1 && <div style={{ width: 24, height: 2, background: T.border2 }} />}</div>)}</div>}
        {slide.points && <div className="points-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>{slide.points.map((p, i) => <div key={i} style={{ padding: "8px 10px", background: T.bg3, borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 10, color: T.text2 }}>◆ {p}</div>)}</div>}
        {slide.installMethods && <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>{slide.installMethods.map((m, i) => <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: T.bg3, borderRadius: 8, border: `1px solid ${T.border}` }}><span style={{ fontSize: 20 }}>{m.icon}</span><div><div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{m.name} <span style={{ fontSize: 9, color: T.text4 }}>{m.diff} · {m.time}</span></div><div style={{ fontSize: 10, color: T.text2, whiteSpace: "pre-wrap" }}>{m.desc}</div></div></div>)}</div>}
        {/* Quick download buttons on install slide */}
        {slide.installMethods && (
          <div style={{ padding: "12px 14px", background: `${T.accent}08`, borderRadius: 10, border: `1px solid ${T.accent}22`, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, marginBottom: 8 }}>{t("tutDownloadScripts")}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {INSTALL_SCRIPTS.filter(s => ["win-auto", "mac-linux"].includes(s.id)).map(script => (
                <button key={script.id} onClick={() => { showExport(script.content, script.filename); }}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: T.bg3, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 11, fontWeight: 600, color: T.text }}>
                  <span>{script.icon}</span> {script.filename}
                </button>
              ))}
            </div>
          </div>
        )}
        {slide.hwTiers && <div className="hw-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 10 }}>{slide.hwTiers.map(tier => <div key={tier.name} style={{ padding: 10, background: T.bg3, borderRadius: 8, border: `1px solid ${tier.color}22`, textAlign: "center" }}><div style={{ fontSize: 11, fontWeight: 700, color: tier.color, marginBottom: 4 }}>{tier.name}</div><div style={{ fontSize: 9, color: T.text2, fontFamily: mono }}>{tier.gpu}</div><div style={{ fontSize: 8, color: T.text4 }}>RAM: {tier.ram}</div><div style={{ fontSize: 8, color: T.text4 }}>{tier.use}</div></div>)}</div>}
        {slide.colorCodes && <div className="color-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>{slide.colorCodes.map(cc => <div key={cc.type} style={{ padding: "8px 10px", background: T.bg3, borderRadius: 6, border: `1px solid ${cc.color}22`, display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 14 }}>{cc.em}</span><div><div style={{ fontSize: 10, fontWeight: 700, color: cc.color, fontFamily: mono }}>{cc.type}</div><div style={{ fontSize: 8, color: T.text3 }}>{cc.desc}</div></div></div>)}</div>}
        {slide.paramList && <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>{slide.paramList.map((p, i) => <div key={i} style={{ padding: "8px 12px", background: T.bg3, borderRadius: 7, border: `1px solid ${T.border}` }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span style={{ fontSize: 11, fontWeight: 700, color: T.text, fontFamily: mono }}>{p.name}</span><span style={{ fontSize: 8, color: T.text4 }}>{p.range}</span></div><div style={{ fontSize: 10, color: T.text2 }}>{p.desc}</div><div style={{ fontSize: 9, color: "#fbbf24", opacity: 0.7, marginTop: 2 }}>💡 {p.tip}</div></div>)}</div>}
        {slide.cnTypes && <div className="cn-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>{slide.cnTypes.map(cn => <div key={cn.name} style={{ padding: "8px 10px", background: T.bg3, borderRadius: 7, border: `1px solid ${cn.color}22` }}><div style={{ fontSize: 11, fontWeight: 700, color: cn.color }}>{cn.name}</div><div style={{ fontSize: 9, color: T.text2 }}>{cn.desc}</div><div style={{ fontSize: 8, color: T.text4, fontFamily: mono }}>strength: {cn.str}</div></div>)}</div>}

        {/* Detail toggle */}
        {slide.detail && <div style={{ marginTop: 12 }}>
          <button onClick={() => setDetailOpen(!detailOpen)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "transparent", border: `1px solid ${T.border2}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", color: T.text2, fontSize: 11, fontWeight: 600 }}>
            <span>{t("tutDetail")}</span><span style={{ transform: detailOpen ? "rotate(180deg)" : "", transition: "transform .2s" }}>▾</span>
          </button>
          {detailOpen && <div style={{ marginTop: 8, padding: "14px 16px", background: T.bg3, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 12, color: T.text2, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
            {slide.detail.split("\n").map((line, i) => {
              if (line.startsWith("◆")) return <div key={i} style={{ fontWeight: 700, color: T.text, marginTop: 10, marginBottom: 2 }}>{line}</div>;
              if (line.startsWith("•")) return <div key={i} style={{ paddingLeft: 14 }}>· {line.slice(2)}</div>;
              return <div key={i}>{line}</div>;
            })}
          </div>}
        </div>}
      </div>
      {/* Nav */}
      <div style={{ padding: "10px 20px 16px", display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => setSlideIdx(Math.max(0, slideIdx - 1))} disabled={slideIdx === 0} style={{ background: "transparent", border: `1px solid ${T.border2}`, borderRadius: 8, padding: "7px 16px", color: slideIdx === 0 ? T.border : T.text2, cursor: slideIdx === 0 ? "default" : "pointer", fontSize: 11, fontWeight: 600 }}>{t("tutPrev")}</button>
        {slideIdx === total - 1 && tutorial.quiz ? (
          <button onClick={() => { setQuizMode(true); setQuizAnswers({}); }} style={{ background: "#fbbf24", border: "none", borderRadius: 8, padding: "7px 16px", color: "#050505", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>{t("tutQuizStart")}</button>
        ) : (
          <button onClick={() => setSlideIdx(Math.min(total - 1, slideIdx + 1))} disabled={slideIdx === total - 1} style={{ background: slideIdx === total - 1 ? "transparent" : T.text, border: slideIdx === total - 1 ? `1px solid ${T.border2}` : "none", borderRadius: 8, padding: "7px 16px", color: slideIdx === total - 1 ? T.border : T.bg, cursor: slideIdx === total - 1 ? "default" : "pointer", fontSize: 11, fontWeight: 600 }}>{t("tutNext")}</button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ONBOARDING OVERLAY (#13)
// ═══════════════════════════════════════════
function Onboarding({ onDone, theme, lang }) {
  const [step, setStep] = useState(0);
  const T = THEMES[theme] || THEMES.dark;
  const t = (key) => (LANG[lang] || LANG.ko)[key] || (LANG.ko)[key] || key;
  const steps = [
    { title: t("navWorkflow"), desc: lang === "ko" ? "카테고리를 선택하거나 AI에게 설명하여 워크플로우를 생성합니다." : lang === "en" ? "Choose a category or describe to AI to generate workflows." : lang === "zh" ? "选择类型或向AI描述需求来生成工作流。" : "カテゴリを選択するかAIに説明してワークフローを生成。", emoji: "✦" },
    { title: t("navModels"), desc: lang === "ko" ? "Civitai 추천 모델을 탐색하고 파라미터를 적용합니다." : lang === "en" ? "Browse Civitai recommended models and apply settings in one click." : lang === "zh" ? "浏览Civitai推荐模型并一键应用参数。" : "Civitaiおすすめモデルを閲覧し、ワンクリックで設定を適用。", emoji: "🎨" },
    { title: t("navTutorials"), desc: lang === "ko" ? "슬라이드 강의로 ComfyUI를 단계별로 마스터하세요." : lang === "en" ? "Master ComfyUI step by step with slide lessons and quizzes." : lang === "zh" ? "通过幻灯片课程逐步掌握ComfyUI。" : "スライド講座でComfyUIをステップバイステップでマスター。", emoji: "📖" },
  ];
  const s = steps[step];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px", maxWidth: 400, width: "calc(100% - 32px)", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{s.emoji}</div>
        <div style={{ fontSize: 8, color: T.text4, marginBottom: 8 }}>{step + 1} / {steps.length}</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>{s.title}</h3>
        <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.7, marginBottom: 20 }}>{s.desc}</p>
        <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 16 }}>{steps.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === step ? T.accent : T.border }} />)}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button onClick={onDone} style={{ background: "transparent", border: `1px solid ${T.border2}`, borderRadius: 8, padding: "8px 16px", color: T.text3, cursor: "pointer", fontSize: 11 }}>{lang === "ko" ? "건너뛰기" : lang === "en" ? "Skip" : lang === "zh" ? "跳过" : "スキップ"}</button>
          <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onDone()} style={{ background: T.accent, border: "none", borderRadius: 8, padding: "8px 20px", color: "#050505", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>{step < steps.length - 1 ? t("tutNext") : t("tutStart")}</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [lang, setLang] = useState("ko");
  const t = (key) => (LANG[lang] || LANG.ko)[key] || (LANG.ko)[key] || key;
  const [page, setPage] = useState("gen");
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState(null);
  const [config, setConfig] = useState({ model: "", sampler: "euler", scheduler: "normal", steps: 25, cfg: 7.0, width: 1024, height: 1024, seed: Math.floor(Math.random() * 2147483646) + 1, prompt: "", negPrompt: "", modelBase: "SDXL" });
  const [workflow, setWorkflow] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [aiMode, setAiMode] = useState("manual"); // "manual" | "ai" | "improve"
  const [aiInput, setAiInput] = useState("");
  // Export modal replaces clipboard/download
  const [exportModal, setExportModal] = useState(null);
  useEffect(() => { _showExportFn = setExportModal; return () => { _showExportFn = null; }; }, []);
  const [resultTab, setResultTab] = useState("visual");
  const [mf, setMf] = useState("t2i");
  const [ms, setMs] = useState("realistic");
  const [tutFilter, setTutFilter] = useState("all");
  const [activeTut, setActiveTut] = useState(null);
  const [theme, setTheme] = useState("light");
  const [userVram, setUserVram] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [wfHistory, setWfHistory] = useState([]);
  const [tutProgress, setTutProgress] = useState({});
  const [validation, setValidation] = useState([]);
  // Workflow Improver states
  const [improveJson, setImproveJson] = useState("");
  const [improveCmd, setImproveCmd] = useState("");
  const [improveResult, setImproveResult] = useState(null); // { analysis, improvedWf, changes }
  const [improveOriginal, setImproveOriginal] = useState(null);
  const [shareId, setShareId] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const T = THEMES[theme];
  const catObj = CATS.find(c => c.id === cat);
  const font = FONT;
  const serif = SERIF;
  const mono = MONO;

  // Load persistent data (#3)
  useEffect(() => {
    (async () => {
      const savedLang = await store.get("user:lang");
      if (savedLang && LANG[savedLang]) setLang(savedLang);
      const savedTheme = await store.get("user:theme");
      const savedVram = await store.get("user:vram");
      const savedHistory = await store.get("wf:history");
      const savedProgress = await store.get("tut:progress");
      const sawOnboarding = await store.get("user:onboarded");
      if (savedTheme) setTheme(savedTheme);
      if (savedVram) setUserVram(savedVram);
      if (savedHistory) setWfHistory(savedHistory);
      if (savedProgress) setTutProgress(savedProgress);
      if (!sawOnboarding) setShowOnboarding(true);
      // Feature 5: Load shared workflow from URL
      const params = new URLSearchParams(window.location.search);
      const sharedId = params.get("wf");
      if (sharedId) {
        const sharedWf = await loadSharedWorkflow(sharedId);
        if (sharedWf) { setWorkflow(sharedWf); setValidation(validateWF(sharedWf, "ko")); setCat("t2i"); setStep(2); }
      }
    })();
  }, []);

  // Ref to latest doGenerate to avoid stale closures in keyboard handler
  const doGenerateRef = useRef(null);

  // Keyboard shortcuts (#14) — uses ref to avoid stale closure
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "Enter") { if (step === 1 && cat && doGenerateRef.current) doGenerateRef.current(); }
      if (e.key === "Escape") { if (activeTut) setActiveTut(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, cat, activeTut]);

  const doGenerate = () => {
    if (!config.model || config.model === "YOUR_MODEL.safetensors" || !config.model.trim()) {
      alert(t("modelAlert"));
      return;
    }
    const actualSeed = (config.seed && config.seed > 0) ? config.seed : randomSeed();
    const finalConfig = { ...config, seed: actualSeed, category: cat };
    setConfig(prev => ({ ...prev, seed: actualSeed }));
    const wf = genWF(finalConfig);
    const issues = validateWF(wf, lang);
    setValidation(issues);
    setWorkflow(wf);
    setStep(2);
  };
  doGenerateRef.current = doGenerate;

  // Fixed AI generate (#2)
  const doAIGenerate = async () => {
    if (!aiInput.trim()) return;
    setGenerating(true);
    try {
      const aiRaw = await callGemini(`ComfyUI expert. User:"${aiInput}"\nJSON only:\n{"category":"t2i|i2i|inpaint|upscale|t2v|i2v|controlnet|lora|batch","sampler":"...","scheduler":"...","steps":25,"cfg":7,"width":1024,"height":1024,"prompt":"optimized","negPrompt":"optimized","modelBase":"SD15|SDXL|Flux|Wan|Hunyuan"}`);
      const parsed = JSON.parse(aiRaw.replace(/```json|```/g, "").trim());
      // Fix #2: Use parsed directly, not stale config
      const newConfig = { ...config, ...parsed };
      setCat(parsed.category);
      setConfig(newConfig);
      const wf = genWF({ ...newConfig, category: parsed.category });
      setValidation(validateWF(wf, lang));
      setWorkflow(wf);
      const entry = { id: Date.now(), cat: parsed.category, nodeCount: wf.nodes.length, date: new Date().toLocaleDateString(), model: newConfig.model, sampler: newConfig.sampler };
      setWfHistory(prev => [entry, ...prev].slice(0, 20));
      setGenerating(false);
      setStep(2);
    } catch { setGenerating(false); alert(t("aiFail")); }
  };

  // ═══ WORKFLOW IMPROVER ═══
  const handleWfUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        JSON.parse(text); // validate
        setImproveJson(text);
      } catch { alert(t("aiJsonFail")); }
    };
    reader.readAsText(file);
  };

  const doImprove = async () => {
    if (!improveJson.trim() || !improveCmd.trim()) return;
    setGenerating(true);
    setImproveResult(null);
    try {
      let parsedOriginal;
      try { parsedOriginal = JSON.parse(improveJson); } catch { setGenerating(false); alert(t("aiJsonInvalid")); return; }
      setImproveOriginal(parsedOriginal);

      // Summarize the original workflow for the AI
      const nodesSummary = (parsedOriginal.nodes || []).map(n =>
        `[${n.id}] ${n.type} "${n.title || ""}" widgets:${JSON.stringify(n.widgets_values || [])}`
      ).join("\n");
      const linksSummary = (parsedOriginal.links || []).map(l => `${l[1]}:${l[2]} → ${l[3]}:${l[4]} (${l[5]})`).join(", ");

      const systemPrompt = `You are a ComfyUI workflow expert. The user will provide their existing ComfyUI workflow and an improvement request.

Your job:
1. Analyze the current workflow (nodes, connections, parameters)
2. Understand what the user wants to improve
3. Return a JSON response with:
   - "analysis": Brief Korean explanation of the current workflow (2-3 sentences)
   - "changes": Array of change descriptions in ${lang === "ko" ? "Korean" : lang === "zh" ? "Chinese" : lang === "ja" ? "Japanese" : "English"}, each item is a string like "KSampler steps를 20→30으로 증가"
   - "improved": The complete improved ComfyUI workflow JSON (same format as input, version 0.4)

CRITICAL RULES:
- Keep all existing node IDs and links intact unless specifically removing/adding nodes
- Only modify what the user requested
- If adding nodes, use IDs higher than the current max
- If changing parameters, update widgets_values array
- Return ONLY valid JSON, no markdown fences
- The "improved" field must be a valid ComfyUI workflow object`;

      const userMsg = `## Current Workflow
Nodes:
${nodesSummary}

Links: ${linksSummary}

## Full JSON
${improveJson.slice(0, 12000)}

## Improvement Request
${improveCmd}`;

      const rawImprove = await callGemini(userMsg, systemPrompt);
      const raw = rawImprove.replace(/```json|```/g, "").trim();
      const result = JSON.parse(raw);

      if (result.improved && result.analysis) {
        setImproveResult({
          analysis: result.analysis,
          changes: result.changes || [],
          improvedWf: result.improved,
        });
      } else {
        throw new Error("Invalid response format");
      }
      setGenerating(false);
    } catch (err) {
      setGenerating(false);
      alert(t("impFail") + ": " + (err.message || t("impRetryMsg")));
    }
  };

  const applyModel = (mdl) => {
    const mp = MODEL_PROMPTS[mdl.name];
    // Auto-set resolution based on model base
    const baseRes = { Wan: { width: 832, height: 480 }, Hunyuan: { width: 832, height: 480 }, LTX: { width: 832, height: 480 }, Flux: { width: 1024, height: 1024 }, SDXL: { width: 1024, height: 1024 } };
    const res = baseRes[mdl.base] || {};
    setConfig(prev => ({
      ...prev,
      model: mdl.name.replace(/\s/g, "_") + ".safetensors",
      modelBase: mdl.base,
      ...(mdl.sampler !== "N/A" ? { sampler: mdl.sampler, scheduler: mdl.scheduler, steps: mdl.steps, cfg: mdl.cfg } : {}),
      ...(mp ? { prompt: mp.prompt, negPrompt: mp.neg } : {}),
      ...(res.width ? res : {}),
    }));
  };
  const selectCategory = (catId) => {
    setCat(catId);
    const preset = CAT_PRESETS[catId];
    if (preset) {
      setConfig(prev => ({ ...prev, ...preset, seed: Math.floor(Math.random() * 2147483646) + 1 }));
    }
    setStep(1);
  };
  const resetAll = () => { setStep(0); setCat(null); setWorkflow(null); setValidation([]); setImproveResult(null); setImproveOriginal(null); setImproveJson(""); setImproveCmd(""); setConfig({ model: "", sampler: "euler", scheduler: "normal", steps: 25, cfg: 7.0, width: 1024, height: 1024, seed: Math.floor(Math.random() * 2147483646) + 1, prompt: "", negPrompt: "", modelBase: "SDXL" }); };
  const toggleTheme = () => { const next = theme === "dark" ? "light" : "dark"; setTheme(next); store.set("user:theme", next); };
  const setVram = (v) => { setUserVram(v); store.set("user:vram", v); };
  const saveTutProgress = (p) => { setTutProgress(p); store.set("tut:progress", p); };

  const cm = CVM[mf]; const msc = cm ? Object.keys(cm) : [];
  const tutorials = getTutorials(lang);
  const filteredTuts = tutFilter === "all" ? tutorials : tutorials.filter(t => t.level === tutFilter);
  const civUrl = (id) => !["up1", "wan22", "ltx", "hunyuan", "flux-cn"].includes(id) ? `https://civitai.com/models/${id}` : null;
  // Model filter by VRAM (#4)
  const filterByVram = (models) => userVram ? models.map(m => ({ ...m, compatible: m.vram <= userVram })) : models.map(m => ({ ...m, compatible: true }));
  // Resolution presets for current model base
  const resPresets = RES_PRESETS[["t2v", "i2v"].includes(cat) ? "Video" : config.modelBase] || RES_PRESETS.SDXL;
  // Tutorial progress stats (#8)
  const totalSlides = tutorials.reduce((a, t) => a + t.slides.length, 0);
  const completedSlides = Object.keys(tutProgress).length;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: font, transition: "background .3s, color .3s", position: "relative", overflow: "hidden" }}>
      <div className="noise-overlay" />
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: "60vw", height: "60vh", borderRadius: "50%", background: `radial-gradient(ellipse, ${T.glow}, transparent 70%)`, pointerEvents: "none", zIndex: 0, animation: "meshFloat 20s ease-in-out infinite" }} />
      <div style={{ position: "fixed", bottom: "-15%", left: "-5%", width: "50vw", height: "50vh", borderRadius: "50%", background: `radial-gradient(ellipse, ${T.glow}, transparent 70%)`, pointerEvents: "none", zIndex: 0, animation: "meshFloat 25s ease-in-out infinite reverse" }} />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Source+Serif+4:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px}::-webkit-scrollbar-track{background:transparent}
body{background:${T.bg}}
.noise-overlay{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:0.03;background:repeating-conic-gradient(rgba(255,255,255,0.02) 0% 25%,transparent 0% 50%) 0 0/3px 3px}
@keyframes meshFloat{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,-15px) scale(1.05)}}
input[type=range]{-webkit-appearance:none;background:rgba(255,255,255,0.06);height:2px;border-radius:2px}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:${T.accent};cursor:pointer;border:none;box-shadow:0 0 8px ${T.glow}}
textarea:focus,input:focus,select:focus{outline:none;border-color:${T.border2}!important}
@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.hov{transition:all .25s ease;border-color:transparent!important}.hov:hover{border-color:${T.border2}!important;background:${T.bg3}!important;transform:translateY(-1px)}
.bp{background:${T.accent};color:#0a0a08;border:none;padding:10px 24px;border-radius:100px;font-weight:600;cursor:pointer;font-size:12px;font-family:inherit;letter-spacing:0.01em;transition:all .2s}
.bp:hover{background:${T.accent2};transform:translateY(-1px)}
.bs{background:rgba(255,255,255,0.03);color:${T.text2};border:1px solid ${T.border2};padding:9px 20px;border-radius:100px;font-weight:500;cursor:pointer;font-size:11px;font-family:inherit;transition:all .2s;backdrop-filter:blur(8px)}
.bs:hover{border-color:${T.accent};color:${T.text}}
.inp{background:${T.bg3};border:1px solid ${T.border};border-radius:10px;padding:10px 14px;color:${T.text};font-size:13px;width:100%;font-family:inherit;transition:border .2s}
.inp:focus{border-color:${T.accent}66!important}
.sel{background:${T.bg3};border:1px solid ${T.border};border-radius:10px;padding:9px 12px;color:${T.text};font-size:13px;width:100%;font-family:inherit;cursor:pointer;-webkit-appearance:none}
.tag{display:inline-block;padding:3px 9px;border-radius:100px;font-size:8px;font-weight:600;margin-right:3px;background:rgba(255,255,255,0.04);border:1px solid ${T.border};letter-spacing:0.02em}
.g-head{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;gap:8px}
.g-head-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.g-head-brand{display:flex;align-items:center;gap:8px;flex-shrink:0}
.g-config{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.g-cats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.g-tuts{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.g-spec{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.g-res{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px}
.g-tabs{display:flex;gap:1px;overflow-x:auto;-webkit-overflow-scrolling:touch}
.g-tabs button{white-space:nowrap;flex-shrink:0}
.g-model-list{display:flex;flex-direction:column;gap:8px}
.g-model-card{display:flex;justify-content:space-between;align-items:center;gap:12px}
.g-model-actions{display:flex;flex-direction:column;gap:4px;align-items:flex-end;flex-shrink:0}
@media(max-width:640px){
  .g-head{padding:10px 14px;flex-wrap:wrap;gap:10px}
  .g-head-right{width:100%;justify-content:space-between}
  .g-config{grid-template-columns:1fr!important}
  .g-cats{grid-template-columns:repeat(3,1fr)!important}
  .g-tuts{grid-template-columns:1fr!important}
  .g-spec{grid-template-columns:repeat(2,1fr)!important}
  .g-res{grid-template-columns:1fr!important}
  .spec-grid{grid-template-columns:repeat(2,1fr)!important}
  .points-grid{grid-template-columns:1fr!important}
  .cn-grid{grid-template-columns:1fr!important}
  .hw-grid{grid-template-columns:repeat(2,1fr)!important}
  .color-grid{grid-template-columns:repeat(2,1fr)!important}
  .bp{padding:10px 18px;font-size:13px}
  .bs{padding:9px 14px;font-size:12px}

  .g-model-card{flex-direction:column!important;align-items:flex-start!important}
  .g-model-actions{flex-direction:row!important;width:100%!important;flex-wrap:wrap}
  .g-ex-wf{grid-template-columns:1fr!important}
  .g-improve-cmp{grid-template-columns:1fr!important}
  .g-tabs{padding-bottom:4px}
}`}</style>

      {showOnboarding && <Onboarding theme={theme} lang={lang} onDone={() => { setShowOnboarding(false); store.set("user:onboarded", true); }} />}

      {/* Header */}
      <header className="g-head" style={{ borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: theme === "dark" ? "rgba(4,4,4,0.85)" : "rgba(246,245,240,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 100 }}>
        <div className="g-head-brand" onClick={() => { setPage("gen"); resetAll(); }} style={{ cursor: "pointer" }}>
          <img src="/logo.png" alt="ComfyUI Studio" style={{ width: 28, height: 28, borderRadius: 6 }} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>ComfyUI Studio</span>
        </div>
        <div className="g-head-right">
          <select value={userVram || ""} onChange={e => setVram(e.target.value ? +e.target.value : null)} style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 8px", color: T.text2, fontSize: 11, cursor: "pointer" }}>
            <option value="">VRAM</option>
            {[4, 6, 8, 12, 16, 24, 32].map(v => <option key={v} value={v}>{v}GB</option>)}
          </select>
          <select value={lang} onChange={e => { setLang(e.target.value); store.set("user:lang", e.target.value); }} style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 8px", color: T.text2, fontSize: 11, cursor: "pointer" }}>
            {Object.entries(LANG_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={toggleTheme} style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>{theme === "dark" ? "☀️" : "🌙"}</button>
          <nav style={{ display: "flex", gap: 1, background: T.bg3, borderRadius: 8, padding: 2, border: `1px solid ${T.border}` }}>
            {[{ id: "gen", l: t("navWorkflow") }, { id: "mod", l: t("navModels") }, { id: "ref", l: t("navNodes") }, { id: "tut", l: t("navTutorials") }, { id: "inst", l: t("navInstall") }].map(n => (
              <button key={n.id} onClick={() => { setPage(n.id); if (n.id === "gen") resetAll(); setActiveTut(null); }}
                style={{ padding: "6px 16px", borderRadius: 100, border: "none", cursor: "pointer", background: page === n.id ? `${T.accent}18` : "transparent", color: page === n.id ? T.accent : T.text3, transition: "all .2s", fontWeight: 600, fontSize: 11, fontFamily: font }}>{n.l}</button>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "20px 12px", position: "relative", zIndex: 1 }}>
        {/* ═══ GENERATOR ═══ */}
        {page === "gen" && (<>
          {step === 0 && (<div style={{ animation: "fi .35s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{t("genTitle")}</h1>
              <p style={{ color: T.text4, fontSize: 13, marginBottom: 16 }}>{t("genDesc")}</p>
              <div style={{ display: "inline-flex", background: T.bg3, borderRadius: 8, padding: 2, border: `1px solid ${T.border}` }}>
                {[{ id: "manual", l: t("modeManual") }, { id: "ai", l: t("modeAI") }, { id: "prompt", l: t("modePrompt") }, { id: "debug", l: t("modeDebug") }, { id: "improve", l: t("modeImprove") }].map(m => (
                  <button key={m.id} onClick={() => setAiMode(m.id)} style={{ padding: "6px 16px", borderRadius: 7, border: "none", cursor: "pointer", background: aiMode === m.id ? T.text : "transparent", color: aiMode === m.id ? T.bg : T.text4, fontWeight: 600, fontSize: 11, fontFamily: font, whiteSpace: "nowrap" }}>{m.l}</button>
                ))}
              </div>
            </div>

            {/* ═══ MODE: AI AUTO ═══ */}
            {aiMode === "ai" && (
              <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
                  <textarea className="inp" style={{ minHeight: 80, resize: "vertical", lineHeight: 1.6, marginBottom: 10 }} placeholder={t("aiPlaceholder")} value={aiInput} onChange={e => setAiInput(e.target.value)} />
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
                    {t("aiExamples").split(",").map(ex => <button key={ex} onClick={() => setAiInput(ex)} style={{ padding: "4px 10px", borderRadius: 14, border: `1px solid ${T.border2}`, background: "transparent", color: T.text3, fontSize: 10, cursor: "pointer" }}>{ex}</button>)}
                  </div>
                  <button className="bp" onClick={doAIGenerate} disabled={generating || !aiInput.trim()} style={{ width: "100%", opacity: generating || !aiInput.trim() ? 0.4 : 1 }}>{generating ? <span style={{ animation: "pu 1.2s infinite" }}>{t("aiAnalyzing")}</span> : t("aiGenerate")}</button>
                </div>
              </div>
            )}

            {/* ═══ MODE: MANUAL ═══ */}
            {aiMode === "manual" && (
              <div className="g-cats">
                {CATS.map((c, i) => <button key={c.id} className="hov" onClick={() => selectCategory(c.id)} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 12px", textAlign: "left", cursor: "pointer", transition: "all .2s", animation: `fi .3s ease ${i * .03}s both` }}>
                  <div style={{ fontSize: 18, marginBottom: 4, color: theme === "dark" ? "#fff" : "#1a1918" }}>{c.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{c.label}</div>
                </button>)}
              </div>
            )}

            {/* ═══ MODE: PROMPT BUILDER ═══ */}
            {aiMode === "prompt" && (
              <PromptBuilder theme={theme} lang={lang} onApply={(prompt, neg) => {
                setConfig(prev => ({ ...prev, prompt, negPrompt: neg }));
                if (!cat) selectCategory("t2i");
                else setStep(1);
              }} />
            )}

            {/* ═══ MODE: DEBUGGER ═══ */}
            {aiMode === "debug" && <WorkflowDebugger theme={theme} lang={lang} />}

            {/* ═══ MODE: WORKFLOW IMPROVER ═══ */}
            {aiMode === "improve" && (
              <div style={{ maxWidth: 680, margin: "0 auto" }}>
                {!improveResult ? (
                  <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔧</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{t("improveTitle")}</div>
                        <div style={{ fontSize: 11, color: T.text4 }}>{t("impDesc")}</div>
                      </div>
                    </div>

                    {/* Step 1: Upload/Paste JSON */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, marginBottom: 8 }}>{t("impStep1")}</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <label style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 14px", borderRadius: 8, background: T.bg3, border: `1px dashed ${improveJson ? T.accent : T.border2}`, cursor: "pointer", fontSize: 12, fontWeight: 600, color: improveJson ? T.accent : T.text3, transition: "all .2s" }}>
                          <input type="file" accept=".json" onChange={handleWfUpload} style={{ display: "none" }} />
                          {improveJson ? t("impLoaded") : t("impUpload")}
                        </label>
                        <span style={{ fontSize: 11, color: T.text4, display: "flex", alignItems: "center" }}>{t("impOr")}</span>
                      </div>
                      <textarea
                        className="inp"
                        value={improveJson}
                        onChange={e => setImproveJson(e.target.value)}
                        placeholder={t('impPasteHint')}
                        style={{ minHeight: 100, resize: "vertical", lineHeight: 1.5, fontFamily: mono, fontSize: 11 }}
                      />
                      {improveJson && (() => {
                        try {
                          const p = JSON.parse(improveJson);
                          return (
                            <div style={{ marginTop: 6, padding: "8px 12px", background: `${T.accent}08`, borderRadius: 8, border: `1px solid ${T.accent}22`, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent }} />
                              <span style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>{t("improveParsed")}</span>
                              <span style={{ fontSize: 10, color: T.text3 }}>
                                {p.nodes?.length || 0} {t("nodes")} · {p.links?.length || 0} {t("impConn")}
                                {p.nodes?.map(n => n.type).filter((v, i, a) => a.indexOf(v) === i).slice(0, 5).join(", ")}
                                {(p.nodes?.map(n => n.type).filter((v, i, a) => a.indexOf(v) === i).length || 0) > 5 ? "..." : ""}
                              </span>
                            </div>
                          );
                        } catch { return <div style={{ marginTop: 6, padding: "6px 10px", background: "#1a0a0a", borderRadius: 6, fontSize: 10, color: "#f87171" }}>{t("aiJsonInvalid")}</div>; }
                      })()}
                    </div>

                    {/* Step 2: Improvement command */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, marginBottom: 8 }}>{t("impStep2")}</div>
                      <textarea
                        className="inp"
                        value={improveCmd}
                        onChange={e => setImproveCmd(e.target.value)}
                        placeholder={t("impReqPlaceholder")}
                        style={{ minHeight: 80, resize: "vertical", lineHeight: 1.6 }}
                      />
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
                        {[
                          t("qcQuality"),
                          t("qcLora"),
                          t("qcUpscale"),
                          t("qcLowVram"),
                          t("qcPrompt"),
                        ].map(ex => (
                          <button key={ex} onClick={() => setImproveCmd(ex)} style={{ padding: "4px 10px", borderRadius: 14, border: `1px solid ${T.border2}`, background: "transparent", color: T.text3, fontSize: 10, cursor: "pointer" }}>{ex}</button>
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <button className="bp" onClick={doImprove} disabled={generating || !improveJson.trim() || !improveCmd.trim()} style={{ width: "100%", opacity: generating || !improveJson.trim() || !improveCmd.trim() ? 0.4 : 1 }}>
                      {generating ? (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <span style={{ animation: "pu 1.2s infinite" }}>{t("impAnalyzing")}</span>
                          <span style={{ fontSize: 10, opacity: 0.7 }}>{t("impAnalyzingDesc")}</span>
                        </span>
                      ) : t("impBtn")}
                    </button>
                  </div>
                ) : (
                  /* ═══ IMPROVE RESULT ═══ */
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Analysis */}
                    <div style={{ background: T.bg2, border: `1px solid ${T.accent}22`, borderRadius: 14, padding: "18px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 18 }}>🔧</span>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{t("improveResultTitle")}</h3>
                      </div>
                      <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.8, marginBottom: 14, whiteSpace: "pre-wrap" }}>{improveResult.analysis}</div>

                      {/* Changes list */}
                      {improveResult.changes?.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 8 }}>{t("improveChanges")}</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {improveResult.changes.map((ch, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", background: T.bg3, borderRadius: 8, border: `1px solid ${T.border}` }}>
                                <div style={{ width: 20, height: 20, borderRadius: 6, background: `${T.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: T.accent, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                                <span style={{ fontSize: 11, color: T.text2, lineHeight: 1.5 }}>{ch}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Before / After comparison */}
                      <div className="g-improve-cmp" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div style={{ padding: "10px 12px", background: T.bg3, borderRadius: 8, border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "#f87171", marginBottom: 6 }}>Before</div>
                          <div style={{ fontSize: 10, color: T.text3, fontFamily: mono }}>
                            {improveOriginal?.nodes?.length || 0} {t("nodes")} · {improveOriginal?.links?.length || 0} {t("impConn")}
                          </div>
                          {improveOriginal?.nodes?.slice(0, 4).map(n => (
                            <div key={n.id} style={{ fontSize: 9, color: T.text4, marginTop: 2 }}>{n.type}</div>
                          ))}
                          {(improveOriginal?.nodes?.length || 0) > 4 && <div style={{ fontSize: 9, color: T.text4 }}>+{improveOriginal.nodes.length - 4}...</div>}
                        </div>
                        <div style={{ padding: "10px 12px", background: `${T.accent}08`, borderRadius: 8, border: `1px solid ${T.accent}22` }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: T.accent, marginBottom: 6 }}>After</div>
                          <div style={{ fontSize: 10, color: T.text2, fontFamily: mono }}>
                            {improveResult.improvedWf?.nodes?.length || 0} {t("nodes")} · {improveResult.improvedWf?.links?.length || 0} {t("impConn")}
                          </div>
                          {improveResult.improvedWf?.nodes?.slice(0, 4).map(n => (
                            <div key={n.id} style={{ fontSize: 9, color: T.text3, marginTop: 2 }}>{n.type}</div>
                          ))}
                          {(improveResult.improvedWf?.nodes?.length || 0) > 4 && <div style={{ fontSize: 9, color: T.text3 }}>+{improveResult.improvedWf.nodes.length - 4}...</div>}
                        </div>
                      </div>
                    </div>

                    {/* Improved workflow preview */}
                    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
                      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{t("improveImproved")}</span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="bs" style={{ fontSize: 10, padding: "6px 12px" }} onClick={() => { showExport(JSON.stringify(improveResult.improvedWf, null, 2), "improved_workflow.json"); }}>📋 JSON</button>
                          <button className="bp" style={{ fontSize: 11, padding: "6px 16px" }} onClick={() => { showExport(JSON.stringify(improveResult.improvedWf, null, 2), "improved_workflow.json"); }}>
                            {t("idDownload")}
                          </button>
                        </div>
                      </div>
                      {improveResult.improvedWf?.nodes && (
                        <div style={{ padding: "4px 0" }}>
                          <NodeGraph workflow={improveResult.improvedWf} theme={theme} />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button className="bs" onClick={() => { setImproveResult(null); setImproveOriginal(null); }}>{t("improveRetry")}</button>
                      <button className="bs" onClick={() => { setImproveJson(JSON.stringify(improveResult.improvedWf, null, 2)); setImproveResult(null); setImproveOriginal(null); setImproveCmd(""); }}>{t("improveChain")}</button>
                      <button className="bp" onClick={() => { setWorkflow(improveResult.improvedWf); setValidation(validateWF(improveResult.improvedWf, lang)); setCat("t2i"); setStep(2); setAiMode("manual"); }}>{t("improveView")}</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Workflow History - hidden */}

            {/* ═══ GUIDE SECTION ═══ */}
            <GuideSection theme={theme} lang={lang} />

          </div>)}

          {step === 1 && (<div style={{ animation: "fi .35s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{catObj?.icon}</span>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{catObj?.label}</h2>
            </div>
            {/* Preset applied banner */}
            {!config.model?.trim() ? (
              <div style={{ marginBottom: 14, padding: "12px 14px", background: "#1a0a0a", borderRadius: 10, border: "2px solid #f87171", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 18 }}>⚠</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171" }}>{t("pbModelWarn")}</div>
                  <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{t("pbModelWarnDesc")}</div>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 14, padding: "10px 14px", background: `${T.accent}08`, borderRadius: 10, border: `1px solid ${T.accent}22`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent }} />
                  <span style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>{t("pbApplied")}</span>
                  <span style={{ fontSize: 10, color: T.text3 }}>— {config.model} · {config.sampler}/{config.scheduler} · Steps:{config.steps} · CFG:{config.cfg}</span>
                </div>
                <span style={{ fontSize: 9, color: T.text4 }}>{t("pbModelHint")}</span>
              </div>
            )}
            {/* Civitai models with VRAM filter (#4) */}
            {CVM[cat] && (<div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <h3 style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>{t("modRecommended")}</h3>
                <a href="https://civitai.com/" target="_blank" rel="noreferrer" style={{ fontSize: 9, color: T.text4, textDecoration: "none", padding: "2px 6px", border: `1px solid ${T.border2}`, borderRadius: 4 }}>civitai.com →</a>
              </div>
              {Object.entries(CVM[cat]).map(([sub, models]) => <div key={sub}>
                {Object.keys(CVM[cat]).length > 1 && <div style={{ fontSize: 9, color: T.text3, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, fontWeight: 600 }}>{sub}</div>}
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                  {filterByVram(models).map(mdl => <button key={mdl.name} onClick={() => applyModel(mdl)} style={{ minWidth: 200, background: T.bg3, border: `1px solid ${mdl.compatible ? T.border : "#f8717133"}`, borderRadius: 10, padding: 0, textAlign: "left", cursor: "pointer", flexShrink: 0, opacity: mdl.compatible ? 1 : 0.6, overflow: "hidden" }}>
                    {/* Mini preview */}
                    <div style={{ height: 48, background: mdl.style || "linear-gradient(135deg,#1a1a2a,#2a1a1a)", position: "relative", overflow: "hidden" }}>
                      <CivitaiPreview img={mdl.img} fallbackStyle={mdl.style} wide label={mdl.name} base={mdl.base} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.8))" }} />
                      <div style={{ position: "absolute", bottom: 4, left: 8, display: "flex", gap: 3 }}>
                        <span className="tag" style={{ color: "#60a5fa", background: "rgba(0,0,0,0.5)", border: "none" }}>{mdl.base}</span>
                        <span className="tag" style={{ color: mdl.compatible ? "#4ade80" : "#f87171", background: "rgba(0,0,0,0.5)", border: "none" }}>{mdl.vram}GB</span>
                      </div>
                    </div>
                    <div style={{ padding: "8px 10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span style={{ fontSize: 11, fontWeight: 600, color: T.text2 }}>{mdl.name}</span><span style={{ fontSize: 9, color: "#fbbf24" }}>★{mdl.rating}</span></div>
                      <div style={{ fontSize: 9, color: T.text3, marginBottom: 4, lineHeight: 1.3 }}>{mdl.desc?.slice(0, 40)}{mdl.desc?.length > 40 ? "..." : ""}</div>
                      {!mdl.compatible && <div style={{ fontSize: 8, color: "#f87171" }}>{t("mpFP8Req")}</div>}
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        <span style={{ flex: 1, textAlign: "center", padding: "4px", borderRadius: 5, background: `${T.accent}15`, fontSize: 9, fontWeight: 600, color: T.accent }}>{t("mpApply")}</span>
                        {civUrl(mdl.id) && <a href={civUrl(mdl.id)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ padding: "4px 8px", borderRadius: 5, background: T.bg4, fontSize: 9, color: T.text3, textDecoration: "none" }}>↓</a>}
                      </div>
                    </div>
                  </button>)}
                </div>
              </div>)}
            </div>)}
            {/* Config */}
            <div className="g-config">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Model filename — REQUIRED */}
                <div style={{ background: T.bg2, border: `2px solid ${config.model?.trim() ? T.accent + "44" : "#f87171"}`, borderRadius: 16, padding: 20 }}>
                  <h3 style={{ fontSize: 11, color: config.model?.trim() ? T.accent : "#f87171", fontWeight: 700, letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    {config.model?.trim() ? "✓" : "⚠"} {t("cfgModelTitle")} {!config.model?.trim() && <span style={{ fontSize: 9, fontWeight: 400, color: "#f87171" }}>{t("cfgRequired")}</span>}
                  </h3>
                  <input className="inp" value={config.model} onChange={e => setConfig(p => ({ ...p, model: e.target.value }))} placeholder={t("cfgModelPH")} style={{ fontFamily: mono, fontSize: 12, marginBottom: 8, border: config.model?.trim() ? undefined : "1px solid #f87171" }} />
                  <div style={{ fontSize: 10, color: config.model?.trim() ? T.text3 : "#f87171", lineHeight: 1.6 }}>
                    ComfyUI <code style={{ background: T.bg3, padding: "1px 5px", borderRadius: 3, fontSize: 10 }}>models/checkpoints/</code> {t("cfgModelHelp")}
                    <br/>{t("cfgModelCheck")}
                  </div>
                </div>
                <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
                  <h3 style={{ fontSize: 10, color: T.text4, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>{t("cfgSampler")}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div><label style={{ fontSize: 9, color: T.text4, marginBottom: 3, display: "block" }}>Sampler</label><select className="sel" value={config.sampler} onChange={e => setConfig(p => ({ ...p, sampler: e.target.value }))}>{SAMPLERS.map(s => <option key={s}>{s}</option>)}</select></div>
                    <div><label style={{ fontSize: 9, color: T.text4, marginBottom: 3, display: "block" }}>Scheduler</label><select className="sel" value={config.scheduler} onChange={e => setConfig(p => ({ ...p, scheduler: e.target.value }))}>{SCHEDULERS.map(s => <option key={s}>{s}</option>)}</select></div>
                  </div>
                </div>
                <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
                  <h3 style={{ fontSize: 10, color: T.text4, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>{t("cfgPrompt")}</h3>
                  <textarea className="inp" rows={3} value={config.prompt} onChange={e => setConfig(p => ({ ...p, prompt: e.target.value }))} placeholder="positive..." style={{ resize: "vertical", lineHeight: 1.5, marginBottom: 6 }} />
                  <textarea className="inp" rows={2} value={config.negPrompt} onChange={e => setConfig(p => ({ ...p, negPrompt: e.target.value }))} placeholder="negative..." style={{ resize: "vertical", lineHeight: 1.5 }} />
                </div>
              </div>
              <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
                <h3 style={{ fontSize: 10, color: T.text4, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>{t("cfgParams")}</h3>
                {[{ l: "Steps", k: "steps", mn: 5, mx: 50, s: 1 }, { l: "CFG", k: "cfg", mn: 1, mx: 20, s: 0.5 }].map(p => <div key={p.k} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><label style={{ fontSize: 9, color: T.text4 }}>{p.l}</label><span style={{ fontSize: 10, fontFamily: mono, color: T.text3 }}>{config[p.k]}</span></div><input type="range" min={p.mn} max={p.mx} step={p.s} value={config[p.k]} onChange={e => setConfig(prev => ({ ...prev, [p.k]: +e.target.value }))} style={{ width: "100%" }} /></div>)}
                {/* Resolution presets (#9) */}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 9, color: T.text4, marginBottom: 4, display: "block" }}>{t("cfgResPreset")}</label>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {resPresets.map(rp => <button key={rp.label} onClick={() => setConfig(p => ({ ...p, width: rp.w, height: rp.h }))} style={{ padding: "4px 8px", borderRadius: 5, border: `1px solid ${config.width === rp.w && config.height === rp.h ? T.accent : T.border}`, background: config.width === rp.w && config.height === rp.h ? `${T.accent}15` : "transparent", color: T.text2, fontSize: 9, cursor: "pointer" }}>{rp.label} {rp.w}×{rp.h}</button>)}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                  {["width", "height"].map(k => <div key={k}><label style={{ fontSize: 9, color: T.text4, marginBottom: 2, display: "block" }}>{k}</label><input className="inp" type="number" value={config[k]} onChange={e => setConfig(p => ({ ...p, [k]: +e.target.value }))} style={{ fontFamily: mono, fontSize: 11 }} /></div>)}
                </div>
                <div>
                  <label style={{ fontSize: 9, color: T.text4, marginBottom: 2, display: "block" }}>Seed</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input className="inp" type="number" min="1" value={config.seed} onChange={e => setConfig(p => ({ ...p, seed: Math.max(1, Math.abs(Math.round(+e.target.value || 1))) }))} style={{ fontFamily: mono, fontSize: 11, flex: 1 }} />
                    <button onClick={() => setConfig(p => ({ ...p, seed: randomSeed() }))} style={{ padding: "0 10px", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, cursor: "pointer", fontSize: 10, color: T.text3 }} title={t("cfgNewSeed")}>🎲</button>
                    <button onClick={() => setConfig(p => ({ ...p, seed: randomSeed() }))} style={{ padding: "0 10px", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, cursor: "pointer", fontSize: 10, color: T.text3 }} title={t("cfgNewSeed")}>↻</button>
                  </div>
                  <div style={{ fontSize: 8, color: T.text4, marginTop: 3 }}>{t("cfgSeedHelp")}</div>
                </div>
              </div>
            </div>
            <SpecPanel category={cat} config={config} theme={theme} userVram={userVram} lang={lang} />
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 18 }}>
              <button className="bs" onClick={() => setStep(0)}>{t("genBack")}</button>
              <button className="bp" onClick={doGenerate} disabled={!config.model?.trim()} style={{ minWidth: 180, opacity: config.model?.trim() ? 1 : 0.5 }}>{config.model?.trim() ? t("genReady") : t("genModelRequired")}</button>
            </div>
          </div>)}

          {step === 2 && workflow && (<div style={{ animation: "fi .35s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
              <div><h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2, fontFamily: SERIF, letterSpacing: "-0.02em" }}>{t("resultTitle")}</h2><p style={{ color: T.text4, fontSize: 11 }}>{workflow.nodes.length} {t("nodes")} · {workflow.links.length} {t("impConn")} · {t("pbApplied")}</p></div>
              <div style={{ display: "flex", gap: 5 }}>
                <button className="bs" onClick={() => { const json = JSON.stringify(resultTab === "api" ? toAPIFormat(workflow) : workflow, null, 2); const blob = new Blob([json], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "workflow.json"; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }}>{t("resultCopy")}</button>
                <button className="bs" onClick={async () => { const id = await shareWorkflow(workflow); if (id) { setShareId(id); showExport(window.location.origin + window.location.pathname + "?wf=" + id, "share_url.txt"); } }}>📤 {shareId ? t("rsLinked") : t("rsShare")}</button>
                <button className="bp" onClick={() => { const data = resultTab === "api" ? toAPIFormat(workflow) : workflow; const json = JSON.stringify(data, null, 2); const blob = new Blob([json], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `comfyui_${cat}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }}>{t("resultDownload")}</button>
              </div>
            </div>
            {/* Applied settings summary */}
            <div style={{ marginBottom: 12, padding: "12px 14px", background: T.bg2, borderRadius: 10, border: `1px solid ${T.accent}22` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 8 }}>{t("resultSettings")}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { label: t("rsModel"), value: config.model || t("rsDefault") },
                  { label: "Sampler", value: config.sampler },
                  { label: "Scheduler", value: config.scheduler },
                  { label: "Steps", value: config.steps },
                  { label: "CFG", value: config.cfg },
                  { label: t("rsResolution"), value: `${config.width}×${config.height}` },
                ].map(item => (
                  <div key={item.label} style={{ padding: "4px 10px", background: T.bg3, borderRadius: 6, fontSize: 10 }}>
                    <span style={{ color: T.text4 }}>{item.label}: </span>
                    <span style={{ color: T.text2, fontWeight: 600, fontFamily: mono }}>{item.value}</span>
                  </div>
                ))}
              </div>
              {config.prompt && <div style={{ marginTop: 8, padding: "6px 10px", background: T.bg3, borderRadius: 6, fontSize: 10, color: T.text3, lineHeight: 1.5 }}><span style={{ color: "#4ade80", fontWeight: 600 }}>Prompt: </span>{config.prompt.slice(0, 120)}{config.prompt.length > 120 ? "..." : ""}</div>}
            </div>
            {/* Validation warnings (#17) */}
            {validation.length > 0 && <div style={{ marginBottom: 12, padding: "8px 12px", background: "#1a0a0a", borderRadius: 8, border: "1px solid #f8717133" }}>{validation.map((v, i) => <div key={i} style={{ fontSize: 10, color: "#f87171" }}>⚠ {v}</div>)}</div>}
            {/* Tabs with API format (#11) */}
            <div className="g-tabs" style={{ marginBottom: 10, background: T.bg2, borderRadius: 8, padding: 2, border: `1px solid ${T.border}`, width: "fit-content", maxWidth: "100%" }}>
              {["visual", "json", "api", "spec"].map(tab => <button key={tab} onClick={() => setResultTab(tab)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: resultTab === tab ? T.bg4 : "transparent", color: resultTab === tab ? T.text : T.text4, fontWeight: 600, fontSize: 10, fontFamily: font }}>{{ visual: t("tabGraph"), json: "JSON", api: "API Format", spec: t("tabSpec") }[tab]}</button>)}
            </div>
            {resultTab === "visual" && <NodeGraph workflow={workflow} theme={theme} />}
            {resultTab === "json" && <pre style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, color: T.text3, fontSize: 9, fontFamily: mono, lineHeight: 1.5, maxHeight: 340, overflow: "auto", whiteSpace: "pre-wrap" }}>{JSON.stringify(workflow, null, 2)}</pre>}
            {resultTab === "api" && <pre style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, color: T.text3, fontSize: 9, fontFamily: mono, lineHeight: 1.5, maxHeight: 340, overflow: "auto", whiteSpace: "pre-wrap" }}>{JSON.stringify(toAPIFormat(workflow), null, 2)}</pre>}
            {resultTab === "spec" && <SpecPanel category={cat} config={config} theme={theme} userVram={userVram} lang={lang} />}
            <div style={{ marginTop: 12, padding: 12, background: theme === "dark" ? "#050a05" : "#f0f8f0", borderRadius: 8, fontSize: 10, color: T.text3, lineHeight: 1.8 }}><span style={{ color: "#4ade80", fontWeight: 600 }}>{t("idUsage")}:</span> {t("rsUsage")}</div>
            <div style={{ textAlign: "center", marginTop: 12 }}><button className="bs" onClick={resetAll}>{t("genNew")}</button></div>
          </div>)}
        </>)}

        {/* ═══ MODELS ═══ */}
        {page === "mod" && (<div style={{ animation: "fi .35s ease" }}>
          <div style={{ marginBottom: 20 }}><h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4, fontFamily: SERIF, letterSpacing: "-0.03em" }}>{t("modTitle")}</h1><p style={{ color: T.text4, fontSize: 12 }}>{t("mpTitle")} {userVram && <span style={{ color: T.accent }}>({userVram}GB {t("mpFilter")})</span>} <a href="https://civitai.com/" target="_blank" rel="noreferrer" style={{ color: T.accent, textDecoration: "none" }}>civitai.com →</a></p></div>
          <div style={{ display: "flex", gap: 5, marginBottom: 18, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
            {Object.keys(CVM).map(k => <button key={k} onClick={() => { setMf(k); setMs(Object.keys(CVM[k])[0]); }} style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${mf === k ? T.border2 : T.border}`, background: mf === k ? T.bg4 : "transparent", color: mf === k ? T.text : T.text3, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{{ t2i: "Text→Img", i2i: "Img→Img", t2v: "Text→Vid", i2v: "Img→Vid", controlnet: "ControlNet", lora: "LoRA", upscale: "Upscale", inpaint: "Inpaint", batch: "Batch" }[k]}</button>)}
          </div>
          {msc.length > 1 && <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>{msc.map(s => <button key={s} onClick={() => setMs(s)} style={{ padding: "4px 10px", borderRadius: 5, border: "none", background: ms === s ? T.bg4 : "transparent", color: ms === s ? T.text : T.text4, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{s}</button>)}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filterByVram(cm?.[ms] || cm?.[msc[0]] || []).map((mdl, i) => (
              <div key={mdl.name} style={{ background: T.bg2, border: `1px solid ${mdl.compatible ? T.border : "#f8717122"}`, borderRadius: 14, overflow: "hidden", animation: `fi .3s ease ${i * .04}s both`, opacity: mdl.compatible ? 1 : 0.7 }}>
                {/* Image + Info row */}
                <div style={{ display: "flex", gap: 14, padding: "16px 16px 12px" }}>
                  {/* Preview image */}
                  <CivitaiPreview img={mdl.img} fallbackStyle={mdl.style} size={90} label={mdl.name} base={mdl.base} />
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{mdl.name}</span>
                      <span style={{ fontSize: 10, color: "#fbbf24", fontWeight: 600 }}>★{mdl.rating}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
                      <span className="tag" style={{ color: "#60a5fa" }}>{mdl.base}</span>
                      <span className="tag" style={{ color: mdl.compatible ? T.text3 : "#f87171" }}>{mdl.vram}GB VRAM</span>
                      <span className="tag" style={{ color: T.text4 }}>↓{mdl.dl}</span>
                      {!mdl.compatible && <span className="tag" style={{ color: "#f87171", background: "#1a0a0a" }}>{t("mpVramLow")}</span>}
                    </div>
                    <p style={{ fontSize: 11, color: T.text2, lineHeight: 1.5, marginBottom: 4 }}>{mdl.desc}</p>
                    {mdl.sampler !== "N/A" && (
                      <div style={{ fontSize: 10, color: T.text4, fontFamily: mono, padding: "4px 8px", background: T.bg3, borderRadius: 5, display: "inline-block" }}>
                        {mdl.sampler}/{mdl.scheduler} · Steps:{mdl.steps} · CFG:{mdl.cfg}
                      </div>
                    )}
                    {/* LoRA-specific info */}
                    {mdl.strength && (
                      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 10, color: T.text4, padding: "3px 8px", background: T.bg3, borderRadius: 5 }}>
                          <span style={{ color: T.accent, fontWeight: 600 }}>strength:</span> {mdl.strength}
                        </div>
                        {mdl.trigger && mdl.trigger !== "없음" && mdl.trigger !== "none" && (
                          <div style={{ fontSize: 10, color: T.text4, padding: "3px 8px", background: T.bg3, borderRadius: 5 }}>
                            <span style={{ color: "#fbbf24", fontWeight: 600 }}>trigger:</span> <code style={{ fontFamily: mono }}>{mdl.trigger}</code>
                          </div>
                        )}
                        {(mdl.trigger === "없음" || mdl.trigger === "none") && (
                          <div style={{ fontSize: 10, color: T.text4, padding: "3px 8px", background: T.bg3, borderRadius: 5 }}>
                            {t("mpNoTrigger")}
                          </div>
                        )}
                      </div>
                    )}
                    {mdl.sampleDesc && <div style={{ fontSize: 9, color: T.text4, marginTop: 4 }}>{t("mpUsage")}: {mdl.sampleDesc}</div>}
                  </div>
                </div>
                {/* Action buttons */}
                <div style={{ display: "flex", gap: 6, padding: "0 16px 14px", flexWrap: "wrap" }}>
                  {civUrl(mdl.id) && (
                    <a href={civUrl(mdl.id)} target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 14px", borderRadius: 8, background: T.accent, color: "#050505", textDecoration: "none", fontWeight: 700, fontSize: 12, minWidth: 0 }}>
                      {t("mpDlCivitai")}
                    </a>
                  )}
                  {!civUrl(mdl.id) && (
                    <a href="https://huggingface.co/" target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 14px", borderRadius: 8, background: T.accent, color: "#050505", textDecoration: "none", fontWeight: 700, fontSize: 12 }}>
                      {t("mpDlHF")}
                    </a>
                  )}
                  {civUrl(mdl.id) && (
                    <a href={civUrl(mdl.id)} target="_blank" rel="noreferrer" style={{ padding: "9px 14px", borderRadius: 8, background: "transparent", border: `1px solid ${T.border2}`, color: T.text2, textDecoration: "none", fontWeight: 600, fontSize: 11 }}>
                      {t("mpViewEx")}
                    </a>
                  )}
                  <button className="bs" style={{ padding: "9px 14px", fontSize: 11 }} onClick={() => { const targetCat = mf === "lora" ? "lora" : mf === "controlnet" ? "controlnet" : mf; if (!cat || cat !== targetCat) selectCategory(targetCat); applyModel(mdl); setPage("gen"); setStep(1); }}>
                    {t("mpApplyWf")}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <CustomNodeSection theme={theme} userVram={userVram} lang={lang} />
        </div>)}

        {/* ═══ NODE REFERENCE (Feature 3) ═══ */}
        {page === "ref" && <NodeReference theme={theme} lang={lang} />}

        {/* ═══ TUTORIALS ═══ */}
        {page === "tut" && (<div style={{ animation: "fi .35s ease" }}>
          {activeTut ? (
            <SlideViewer tutorial={activeTut} onClose={() => setActiveTut(null)} theme={theme} progress={tutProgress} onProgress={saveTutProgress} lang={lang} />
          ) : (<>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4, fontFamily: SERIF, letterSpacing: "-0.03em" }}>{t("tutTitle")}</h1>
              <p style={{ color: T.text4, fontSize: 12 }}>{t("tutDesc")}</p>
            </div>
            {/* Progress dashboard - hidden */}
            <div style={{ display: "flex", gap: 5, marginBottom: 20, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              {[{ id: "all", l: t("lvAll") }, { id: "beginner", l: t("lvBeginnerIcon") }, { id: "intermediate", l: t("lvIntermediateIcon") }, { id: "advanced", l: t("lvAdvancedIcon") }].map(lv => (
                <button key={lv.id} onClick={() => setTutFilter(lv.id)} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${tutFilter === lv.id ? T.border2 : T.border}`, background: tutFilter === lv.id ? T.bg4 : T.bg2, color: tutFilter === lv.id ? T.text : T.text3, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{lv.l}</button>
              ))}
            </div>
            <div className="g-tuts">
              {filteredTuts.map((tut, i) => {
                const tutSlidesDone = tut.slides.filter((_, si) => tutProgress[`${tut.id}-${si}`]).length;
                const pct = Math.round(tutSlidesDone / tut.slides.length * 100);
                return (
                  <button key={tut.id} className="hov" onClick={() => setActiveTut(tut)} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 16px", textAlign: "left", cursor: "pointer", transition: "all .2s", animation: `fi .3s ease ${i * .04}s both` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 24 }}>{tut.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{tut.title}</div>
                        <div style={{ display: "flex", gap: 5, marginTop: 2 }}>
                          <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: { beginner: "#0a1a0a", intermediate: "#1a1a08", advanced: "#1a0a0a" }[tut.level], color: { beginner: "#4ade80", intermediate: "#fbbf24", advanced: "#f87171" }[tut.level], fontWeight: 600 }}>{{ beginner: t("lvBeginner"), intermediate: t("lvIntermediate"), advanced: t("lvAdvanced") }[tut.level]}</span>
                          <span style={{ fontSize: 9, color: T.text4 }}>{tut.slides.length} {t("tutSlides")}{tut.quiz ? ` + ${t("tutQuiz")}` : ""}</span>
                        </div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 3, background: T.bg4, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: T.accent, borderRadius: 2, transition: "width .3s" }} />
                    </div>
                    <div style={{ marginTop: 6, fontSize: 9, color: T.text4 }}>{pct > 0 ? `${pct}% ${t("tutComplete")}` : t("tutStart")}</div>
                  </button>
                );
              })}
            </div>

            {/* Example Workflows */}
            <ExampleWorkflows theme={theme} lang={lang} />

            {/* Install Scripts Downloads */}
            <InstallDownloads theme={theme} lang={lang} />

            {/* Resources */}
            <div style={{ marginTop: 24 }}><h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{t("extResources")}</h2></div>
            <div className="g-res">
              {[
                { title: t("extDocs"), url: "https://docs.comfy.org", type: "docs" },
                { title: "ComfyUI Wiki", url: "https://comfyui-wiki.com/en/tutorial/basic", type: "guide" },
                { title: "Stable Diffusion Art", url: "https://stable-diffusion-art.com/comfyui/", type: "guide" },
                { title: t("extExamples"), url: "https://comfyanonymous.github.io/ComfyUI_examples/", type: "examples" },
              ].map(r => <a key={r.title} href={r.url} target="_blank" rel="noreferrer" style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 14px", textDecoration: "none" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.text2, marginBottom: 2 }}>{r.title}</div>
                <div style={{ fontSize: 9, color: T.text4 }}>{r.type.toUpperCase()}</div>
              </a>)}
            </div>
          </>)}
        </div>)}
      </main>

      {/* ═══ INSTALL PAGE ═══ */}
      {page === "inst" && (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 12px", animation: "fi .35s ease" }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, fontFamily: SERIF, letterSpacing: "-0.03em", color: T.text }}>{t("ipTitle")}</h1>
            <p style={{ color: T.text4, fontSize: 12 }}>{t("ipDesc")}</p>
          </div>

          {/* Quick start - horizontal scroll on mobile */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 10 }}>{t("ipQuickStart")}</div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 6 }}>
              {[
                { step: "1", title: t("ipStep1"), desc: t("ipStep1d"), icon: "⬇" },
                { step: "2", title: t("ipStep2"), desc: t("ipStep2d"), icon: "▶" },
                { step: "3", title: t("ipStep3"), desc: t("ipStep3d"), icon: "📦" },
                { step: "4", title: t("ipStep4"), desc: t("ipStep4d"), icon: "✨" },
              ].map(s => (
                <div key={s.step} style={{ minWidth: 150, flex: "0 0 auto", padding: "12px 14px", background: T.bg2, borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `${T.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{s.icon}</div>
                    <div style={{ fontSize: 9, color: T.accent, fontWeight: 700 }}>STEP {s.step}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: T.text3 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <InstallDownloads theme={theme} compact lang={lang} />

          {/* Desktop App + Folder - stacked */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
            <div style={{ padding: "14px 16px", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>💻</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{t("ipDesktop")}</div>
                  <div style={{ fontSize: 10, color: T.text3 }}>{t("ipDesktopDesc")}</div>
                </div>
              </div>
              <a href="https://www.comfy.org/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, background: T.accent, color: "#050505", textDecoration: "none", fontWeight: 700, fontSize: 12 }}>
                {t("ipDesktopDl")}
              </a>
            </div>
            <div style={{ padding: "14px 16px", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>{t("ipFolder")}</div>
              <pre style={{ background: T.bg3, padding: "12px 14px", borderRadius: 8, fontSize: 10, color: T.text2, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.7, overflowX: "auto", WebkitOverflowScrolling: "touch", margin: 0 }}>{`ComfyUI/
├─ models/
│  ├─ checkpoints/    ← {t("ipCheckpoint")}
│  ├─ loras/          ← LoRA
│  ├─ controlnet/     ← ControlNet
│  ├─ vae/            ← VAE
│  └─ upscale_models/ ← {t("ipUpscaler")}
├─ custom_nodes/      ← {t("ipCustomNode")}
├─ output/            ← {t("ipOutput")}
└─ main.py            ← {t("ipMain")}`}</pre>
            </div>
          </div>
        </div>
      )}

      

      {/* ═══ EXPORT MODAL ═══ */}
      {exportModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setExportModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, width: "100%", maxWidth: 720, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{exportModal.filename || "export.json"}</div>
                <button onClick={() => setExportModal(null)} style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 14px", color: T.text3, cursor: "pointer", fontSize: 12 }}>{t("exClose")}</button>
              </div>
              <div style={{ marginTop: 8, padding: "8px 12px", background: `${T.accent}12`, borderRadius: 8, border: `1px solid ${T.accent}33` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, marginBottom: 4 }}>{t("exportCopyMethod")}</div>
                <div style={{ fontSize: 11, color: T.text2, lineHeight: 1.6 }}>
                  {t("exStep1")}<br/>
                  {t("exStep2")}<br/>
                  {t("exStep3")}
                </div>
              </div>
            </div>
            <textarea
              readOnly
              value={exportModal.content}
              onFocus={e => e.target.select()}
              onClick={e => e.target.select()}
              style={{ flex: 1, margin: "12px 20px 16px", padding: "14px", background: T.bg, border: `2px solid ${T.accent}44`, borderRadius: 10, color: T.text2, fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 11, lineHeight: 1.5, resize: "none", outline: "none", minHeight: 250 }}
            />
          </div>
        </div>
      )}

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ position: "fixed", bottom: 80, right: 24, width: 40, height: 40, borderRadius: "50%", background: T.accent, border: "none", color: "#fff", fontSize: 18, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity .3s" }}>↑</button>
      )}

      <footer style={{ textAlign: "center", padding: "32px 24px", color: T.text4, fontSize: 10 }}><span style={{ fontFamily: SERIF, letterSpacing: "0.02em" }}>ComfyUI Studio · 2026</span></footer>
    </div>
  );
}
