import { CREDIT_RULES } from './creditRules';
import type {
  SubjectInput, SubjectResult, GraduationDiagnosis,
  AchievementGrade, SubjectCategory, CategoryCredits, DiagnosisStatus,
} from './types';

export function toAchievementGrade(rate: number): AchievementGrade {
  const t = CREDIT_RULES.GRADE_THRESHOLDS;
  if (rate >= t.A) return 'A';
  if (rate >= t.B) return 'B';
  if (rate >= t.C) return 'C';
  if (rate >= t.D) return 'D';
  if (rate >= t.E) return 'E';
  return 'I';
}

export function calcSubjectResult(s: SubjectInput): SubjectResult {
  const attendanceRate = s.totalClasses > 0 ? s.attendedClasses / s.totalClasses : 0;
  const achievementRate = s.writtenScore + s.performanceScore;
  const achievementGrade = toAchievementGrade(achievementRate);

  const attendancePassed = attendanceRate >= CREDIT_RULES.MIN_ATTENDANCE_RATE;
  const achievementPassed = achievementRate >= CREDIT_RULES.MIN_ACHIEVEMENT_RATE;
  const isPassed = attendancePassed && achievementPassed;

  const warningType =
    !attendancePassed && !achievementPassed ? 'both'
    : !attendancePassed ? 'attendance'
    : !achievementPassed ? 'achievement'
    : 'none';

  const requiredAchievementIncrease = achievementPassed
    ? 0
    : Math.ceil(CREDIT_RULES.MIN_ACHIEVEMENT_RATE - achievementRate);

  const maxAllowed = Math.floor(s.totalClasses * (1 - CREDIT_RULES.MIN_ATTENDANCE_RATE));
  const currentAbsences = s.totalClasses - s.attendedClasses;
  const maxRemainingAbsences = Math.max(0, maxAllowed - currentAbsences);

  return {
    ...s,
    attendanceRate,
    achievementRate,
    achievementGrade,
    isPassed,
    earnedCredits: isPassed ? s.credits : 0,
    warningType,
    requiredAchievementIncrease,
    maxRemainingAbsences,
  };
}

export function calcRemainingSemesters(grade: 1 | 2 | 3, semester: 1 | 2): number {
  const elapsed = (grade - 1) * 2 + (semester - 1);
  return CREDIT_RULES.TOTAL_SEMESTERS - elapsed;
}

function calcCreditsByCategory(results: SubjectResult[]): Record<SubjectCategory, CategoryCredits> {
  return Object.fromEntries(
    (Object.keys(CREDIT_RULES.CATEGORY_TARGETS) as SubjectCategory[]).map((cat) => {
      const target = CREDIT_RULES.CATEGORY_TARGETS[cat];
      const earned = results
        .filter((r) => r.category === cat && r.isPassed)
        .reduce((sum, r) => sum + r.credits, 0);
      return [cat, { earned, target, percentage: Math.min(100, (earned / target) * 100) }];
    })
  ) as Record<SubjectCategory, CategoryCredits>;
}

export function calcGraduationDiagnosis(
  subjects: SubjectInput[],
  grade: 1 | 2 | 3,
  semester: 1 | 2
): GraduationDiagnosis {
  const results = subjects.map(calcSubjectResult);
  const passedSubjects = results.filter((r) => r.isPassed);
  const warningSubjects = results.filter((r) => r.warningType !== 'none');

  const totalEarnedCredits = passedSubjects.reduce((sum, r) => sum + r.credits, 0);
  const remainingCredits = Math.max(0, CREDIT_RULES.GRADUATION_CREDITS - totalEarnedCredits);
  const progressRate = Math.min(100, (totalEarnedCredits / CREDIT_RULES.GRADUATION_CREDITS) * 100);

  const creditsByCategory = calcCreditsByCategory(results);
  const remainingSemesters = calcRemainingSemesters(grade, semester);
  const requiredCreditsPerSemester =
    remainingSemesters > 0 ? Math.ceil(remainingCredits / remainingSemesters) : 0;

  const commonSubjectsPassed =
    creditsByCategory.common.earned >= CREDIT_RULES.CATEGORY_TARGETS.common;
  const noFailedSubjects = warningSubjects.length === 0;
  const totalCreditsSufficient = remainingCredits === 0;
  const currentSemesterCredits = subjects
    .filter((s) => s.grade === grade && s.semester === semester)
    .reduce((sum, s) => sum + s.credits, 0);
  const minSemesterCreditsMet = currentSemesterCredits >= CREDIT_RULES.MIN_SEMESTER_CREDITS;

  let status: DiagnosisStatus;
  let statusMessage: string;
  if (noFailedSubjects && totalCreditsSufficient) {
    status = 'safe'; statusMessage = '졸업 요건을 모두 충족했습니다! 🎉';
  } else if (warningSubjects.length >= 3 || requiredCreditsPerSemester > 40) {
    status = 'danger'; statusMessage = '즉각적인 조치가 필요합니다. 담임 교사와 상담하세요.';
  } else {
    status = 'warning'; statusMessage = '미이수 과목 해결 및 학점 관리가 필요해요.';
  }

  return {
    totalEarnedCredits, targetCredits: CREDIT_RULES.GRADUATION_CREDITS,
    remainingCredits, progressRate, creditsByCategory,
    passedSubjects, warningSubjects,
    currentGrade: grade, currentSemester: semester,
    remainingSemesters, requiredCreditsPerSemester,
    status, statusMessage,
    checks: { commonSubjectsPassed, totalCreditsSufficient, noFailedSubjects, minSemesterCreditsMet },
  };
}
