export type DayOfWeek = 'PO' | 'UT' | 'ST' | 'CT' | 'PA';
export type LessonType = 'lecture' | 'exercise' | 'seminar' | 'other';
export type WeekParity = 'all' | 'even' | 'odd';

export interface LessonSlot {
  id: string;
  courseCode: string;
  courseName?: string;
  type: LessonType;
  day: DayOfWeek;
  startTime: string; // '08:00'
  endTime: string;   // '09:30'
  startMinutes: number; // minuty od půlnoci (např. 8*60 = 480)
  endMinutes: number;   // minuty od půlnoci (např. 9*60+30 = 570)
  parity: WeekParity;
  room?: string;
  teacher?: string;
  color?: string; // hex nebo tailwind identifikátor
}

export interface CourseGroup {
  groupId: string; // např. "MAT1#exercise"
  courseCode: string;
  courseName?: string;
  type: LessonType;
  options: LessonSlot[];
}

export type SemesterWeekMode = 'standard' | 'parity';

export interface UserPreferences {
  preferFreeFriday: boolean;
  preferFreeMonday: boolean;
  earlyMorningPenalty: boolean; // penalizovat start před 9:00
  minimizeGapsWeight: number;    // 1-5 váha
  weekMode: SemesterWeekMode;    // 'standard' nebo 'parity'
}


export interface SchedulePlan {
  id: string;
  slots: LessonSlot[];
  score: number;
  freeDaysCount: number;
  freeDays: DayOfWeek[];
  totalGapMinutes: number;
  earlyStartsCount: number;
  totalStudyMinutes: number;
}

export interface ParsedInputResult {
  slots: LessonSlot[];
  groups: CourseGroup[];
  detectedCoursesCount: number;
  warnings?: string[];
}

export interface SavedDraft {
  id: string;
  name: string;
  savedAt: string;
  rawSlots: LessonSlot[];
  pinnedSlotIds: string[];
  preferences: UserPreferences;
  selectedPlanId: string | null;
  activeSlots: LessonSlot[];
  score: number;
}

