import { CREDIT_RULES } from './creditRules';
import type { AppState, UserProfile } from './types';

export function createDefaultState(): AppState {
  return {
    user: { id: crypto.randomUUID(), name: '사용자', grade: 1, semester: 1 },
    subjects: [],
    events: [],
    lastSaved: new Date().toISOString(),
    schemaVersion: CREDIT_RULES.SCHEMA_VERSION,
  };
}

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(CREDIT_RULES.STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.schemaVersion !== CREDIT_RULES.SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): boolean {
  try {
    state.lastSaved = new Date().toISOString();
    localStorage.setItem(CREDIT_RULES.STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('[하이학점] 저장 실패:', e);
    return false;
  }
}

export function clearState(): void {
  localStorage.removeItem(CREDIT_RULES.STORAGE_KEY);
}
