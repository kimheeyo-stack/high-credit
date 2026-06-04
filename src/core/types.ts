export type SubjectCategory =
  | 'common'       // 공통과목
  | 'general'      // 일반선택
  | 'career'       // 진로선택
  | 'convergence'  // 융합선택
  | 'pe_arts'      // 체육·예술
  | 'culture';     // 교양

export type AchievementGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'I';
export type WarningType = 'none' | 'achievement' | 'attendance' | 'both';
export type DiagnosisStatus = 'safe' | 'warning' | 'danger';

export interface SubjectInput {
  id: string;
  name: string;
  credits: number;
  category: SubjectCategory;
  grade: 1 | 2 | 3;
  semester: 1 | 2;
  totalClasses: number;
  attendedClasses: number;
  writtenScore: number;
  performanceScore: number;
  isWrittenExempt: boolean; // 체육 등 지필 없는 과목
}

export interface SubjectResult extends SubjectInput {
  attendanceRate: number;
  achievementRate: number;
  achievementGrade: AchievementGrade;
  isPassed: boolean;
  earnedCredits: number;
  warningType: WarningType;
  requiredAchievementIncrease: number;
  maxRemainingAbsences: number;
}

export interface CategoryCredits {
  earned: number;
  target: number;
  percentage: number;
}

export interface GraduationDiagnosis {
  totalEarnedCredits: number;
  targetCredits: number;
  remainingCredits: number;
  progressRate: number;
  creditsByCategory: Record<SubjectCategory, CategoryCredits>;
  passedSubjects: SubjectResult[];
  warningSubjects: SubjectResult[];
  currentGrade: 1 | 2 | 3;
  currentSemester: 1 | 2;
  remainingSemesters: number;
  requiredCreditsPerSemester: number;
  status: DiagnosisStatus;
  statusMessage: string;
  checks: {
    commonSubjectsPassed: boolean;
    totalCreditsSufficient: boolean;
    noFailedSubjects: boolean;
    minSemesterCreditsMet: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  grade: 1 | 2 | 3;
  semester: 1 | 2;
}

export interface AppEvent {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'performance' | 'enrollment' | 'other';
  subjectId?: string;
}

export interface AppState {
  user: UserProfile;
  subjects: SubjectInput[];
  events: AppEvent[];
  lastSaved: string;
  schemaVersion: string;
}
