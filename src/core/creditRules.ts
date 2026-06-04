// 고교학점제 핵심 규칙 상수
// 정책 변경 시 이 파일만 수정합니다. 다른 파일에 하드코딩 금지.

export const CREDIT_RULES = {
  GRADUATION_CREDITS: 192,
  MIN_ATTENDANCE_RATE: 2 / 3,   // ≈ 0.6667
  MIN_ACHIEVEMENT_RATE: 40,
  MIN_SEMESTER_CREDITS: 28,
  TOTAL_SEMESTERS: 6,

  GRADE_THRESHOLDS: { A: 90, B: 80, C: 70, D: 60, E: 40 },

  CATEGORY_TARGETS: {
    common: 45,
    general: 40,
    career: 30,
    convergence: 30,
    pe_arts: 20,
    culture: 9,
  },

  CATEGORY_LABELS: {
    common: '공통과목',
    general: '일반선택',
    career: '진로선택',
    convergence: '융합선택',
    pe_arts: '체육·예술',
    culture: '교양',
  },

  SCHEMA_VERSION: 'v1',
  STORAGE_KEY: 'hc_app_state_v1',
} as const;
