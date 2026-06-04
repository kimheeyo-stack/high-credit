import { calcGraduationDiagnosis } from './calculator';
import { loadState, saveState, createDefaultState } from './storage';
import type { AppState, SubjectInput, AppEvent, UserProfile, GraduationDiagnosis } from './types';

type Listener = (state: AppState) => void;

class HighCreditStateManager {
  private state: AppState;
  private listeners = new Set<Listener>();
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.state = loadState() ?? createDefaultState();
  }

  getState(): Readonly<AppState> { return this.state; }

  getDiagnosis(): GraduationDiagnosis {
    const { user, subjects } = this.state;
    return calcGraduationDiagnosis(subjects, user.grade, user.semester);
  }

  updateUser(patch: Partial<UserProfile>): void {
    this.state = { ...this.state, user: { ...this.state.user, ...patch } };
    this.emit();
  }

  upsertSubject(subject: SubjectInput): void {
    const subjects = [...this.state.subjects];
    const idx = subjects.findIndex((s) => s.id === subject.id);
    idx >= 0 ? (subjects[idx] = subject) : subjects.push(subject);
    this.state = { ...this.state, subjects };
    this.emit();
  }

  removeSubject(id: string): void {
    this.state = { ...this.state, subjects: this.state.subjects.filter((s) => s.id !== id) };
    this.emit();
  }

  upsertEvent(event: AppEvent): void {
    const events = [...this.state.events];
    const idx = events.findIndex((e) => e.id === event.id);
    idx >= 0 ? (events[idx] = event) : events.push(event);
    this.state = { ...this.state, events };
    this.emit();
  }

  removeEvent(id: string): void {
    this.state = { ...this.state, events: this.state.events.filter((e) => e.id !== id) };
    this.emit();
  }

  reset(): void {
    this.state = createDefaultState();
    saveState(this.state);
    this.emit();
  }

  /** 상태 변경 구독. 반환값 호출 시 구독 해제. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    this.listeners.forEach((fn) => fn(this.state));
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => saveState(this.state), 300);
  }
}

export const app = new HighCreditStateManager();
