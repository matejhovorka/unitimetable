import type { DayOfWeek, LessonSlot, CourseGroup, UserPreferences, SchedulePlan } from '../types/types';

const ALL_DAYS: DayOfWeek[] = ['PO', 'UT', 'ST', 'CT', 'PA'];

/**
 * Detekce kolize parity týdnů
 * Vrací true, pokud se týdny mohou potkat
 */
export function isParityConflict(p1: string, p2: string): boolean {
  if (p1 === 'all' || p2 === 'all') return true;
  return p1 === p2;
}

/**
 * Detekce tvrdého časového překryvu mezi dvěma sloty
 */
export function hasTimeOverlap(slot1: LessonSlot, slot2: LessonSlot): boolean {
  // Různé dny nekolidují
  if (slot1.day !== slot2.day) return false;

  // Nekolidují, pokud jsou v různých týdnech (lichý vs sudý)
  if (!isParityConflict(slot1.parity, slot2.parity)) return false;

  // Časový překryv: [start1, end1) a [start2, end2)
  return slot1.startMinutes < slot2.endMinutes && slot2.startMinutes < slot1.endMinutes;
}

/**
 * Zkontroluje, zda nový slot nekoliduje s žádným z dosud vybraných slotů
 */
function isSlotCompatible(newSlot: LessonSlot, currentSlots: LessonSlot[]): boolean {
  for (const existing of currentSlots) {
    if (hasTimeOverlap(newSlot, existing)) {
      return false;
    }
  }
  return true;
}

/**
 * Výpočet statistik a skóre rozvrhu na základě preferencí
 */
export function evaluateSchedule(slots: LessonSlot[], prefs: UserPreferences): {
  score: number;
  freeDaysCount: number;
  freeDays: DayOfWeek[];
  totalGapMinutes: number;
  earlyStartsCount: number;
  totalStudyMinutes: number;
} {
  // Rozdělení slotů podle dnů
  const daySlotsMap = new Map<DayOfWeek, LessonSlot[]>();
  for (const day of ALL_DAYS) {
    daySlotsMap.set(day, []);
  }

  let totalStudyMinutes = 0;
  let earlyStartsCount = 0;

  for (const slot of slots) {
    daySlotsMap.get(slot.day)!.push(slot);
    totalStudyMinutes += (slot.endMinutes - slot.startMinutes);
    if (slot.startMinutes < 540) { // před 9:00
      earlyStartsCount++;
    }
  }

  const freeDays: DayOfWeek[] = [];
  let totalGapMinutes = 0;

  for (const day of ALL_DAYS) {
    const list = daySlotsMap.get(day)!;
    if (list.length === 0) {
      freeDays.push(day);
    } else {
      // Seřadit podle času začátku
      list.sort((a, b) => a.startMinutes - b.startMinutes);
      // Spočítat okna mezi sloty
      for (let i = 0; i < list.length - 1; i++) {
        const gap = list[i + 1].startMinutes - list[i].endMinutes;
        if (gap > 0) {
          totalGapMinutes += gap;
        }
      }
    }
  }

  // Výchozí báze skóre
  let score = 1000;

  // Bonus za volný pátek
  if (freeDays.includes('PA')) {
    score += prefs.preferFreeFriday ? 350 : 150;
  } else if (prefs.preferFreeFriday) {
    score -= 100;
  }

  // Bonus za volné pondělí
  if (freeDays.includes('PO')) {
    score += prefs.preferFreeMonday ? 300 : 120;
  } else if (prefs.preferFreeMonday) {
    score -= 80;
  }

  // Bonus za jakýkoliv volný den navíc (út, st, čt)
  for (const fd of freeDays) {
    if (fd !== 'PO' && fd !== 'PA') {
      score += 180;
    }
  }

  // Penalizace za okna dle váhy (1-5)
  // 1 = slabá váha, 5 = velmi silná váha
  const gapPenaltyPer15Min = prefs.minimizeGapsWeight * 6; // např. 5 * 6 = 30 b / 15 min okna
  score -= Math.round((totalGapMinutes / 15) * gapPenaltyPer15Min);

  // Bonus za nula oken
  if (totalGapMinutes === 0) {
    score += 150;
  }

  // Penalizace za ranní vstávání
  if (prefs.earlyMorningPenalty) {
    score -= earlyStartsCount * 120;
  } else {
    score -= earlyStartsCount * 25; // mírná penalizace i bez aktivního přepínače
  }

  return {
    score: Math.max(0, score),
    freeDaysCount: freeDays.length,
    freeDays,
    totalGapMinutes,
    earlyStartsCount,
    totalStudyMinutes,
  };
}

/**
 * CSP Solver s backtrackováním a MRV (Most Constrained Variable) heuristikou
 */
export function solveSchedule(
  courseGroups: CourseGroup[],
  pinnedSlotIds: Set<string>,
  prefs: UserPreferences,
  maxSolutions = 100
): SchedulePlan[] {
  if (courseGroups.length === 0) {
    return [];
  }

  // 1. Aplikace pinningu na možnosti v jednotlivých skupinách
  const filteredGroups: CourseGroup[] = courseGroups.map((group) => {
    // Zkontrolujeme, zda je některá z voleb v této skupině zamknutá
    const pinnedOption = group.options.find((opt) => pinnedSlotIds.has(opt.id));
    if (pinnedOption) {
      // Skupina má pevně zvolenou možnost
      return {
        ...group,
        options: [pinnedOption],
      };
    }
    return group;
  });

  // 2. Seřazení podle počtu možností (MRV Heuristika - skupiny s nejméně možnostmi napřed)
  const sortedGroups = [...filteredGroups].sort((a, b) => a.options.length - b.options.length);

  const solutions: LessonSlot[][] = [];
  let steps = 0;
  const maxSteps = 50_000; // Bezpečnostní pojistka proti zamrznutí prohlížeče při obřím stavovém prostoru

  function backtrack(groupIndex: number, currentAssignments: LessonSlot[]) {
    steps++;
    if (solutions.length >= maxSolutions || steps >= maxSteps) {
      return;
    }

    if (groupIndex === sortedGroups.length) {
      // Nalezena kompletní validní kombinace pro všechny předměty a typy
      solutions.push([...currentAssignments]);
      return;
    }

    const currentGroup = sortedGroups[groupIndex];

    for (const option of currentGroup.options) {
      if (steps >= maxSteps) break;
      if (isSlotCompatible(option, currentAssignments)) {
        currentAssignments.push(option);
        backtrack(groupIndex + 1, currentAssignments);
        currentAssignments.pop(); // backtrack
      }
    }
  }

  backtrack(0, []);

  // 3. Ohodnocení všech řešení a seřazení podle skóre sestupně
  const plans: SchedulePlan[] = solutions.map((slots, idx) => {
    const evalResult = evaluateSchedule(slots, prefs);
    return {
      id: `plan_${idx + 1}`,
      slots,
      score: evalResult.score,
      freeDaysCount: evalResult.freeDaysCount,
      freeDays: evalResult.freeDays,
      totalGapMinutes: evalResult.totalGapMinutes,
      earlyStartsCount: evalResult.earlyStartsCount,
      totalStudyMinutes: evalResult.totalStudyMinutes,
    };
  });

  plans.sort((a, b) => b.score - a.score);

  return plans;
}
