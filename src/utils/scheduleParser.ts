import type { DayOfWeek, LessonSlot, LessonType, WeekParity, CourseGroup } from '../types/types';
import { getCourseTheme } from './colors';

/**
 * Normalizuje text a odstraní diakritiku pro regexové párování
 */
function normalizeStr(val: string): string {
  return val
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Převede časový řetězec 'HH:MM' na minuty od půlnoci
 */
export function timeToMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Převede minuty od půlnoci zpět na 'HH:MM'
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Detekce dne v týdnu
 */
export function parseDay(raw: string): DayOfWeek | null {
  const norm = normalizeStr(raw);
  if (/^(po|pondeli|mon|monday|1|1\.)\b/.test(norm) || norm === 'po' || norm === 'pondeli') return 'PO';
  if (/^(ut|utery|tue|tuesday|2|2\.)\b/.test(norm) || norm === 'ut' || norm === 'utery') return 'UT';
  if (/^(st|streda|wed|wednesday|3|3\.)\b/.test(norm) || norm === 'st' || norm === 'streda') return 'ST';
  if (/^(ct|ctvrtek|thu|thursday|4|4\.)\b/.test(norm) || norm === 'ct' || norm === 'ctvrtek') return 'CT';
  if (/^(pa|patek|fri|friday|5|5\.)\b/.test(norm) || norm === 'pa' || norm === 'patek') return 'PA';
  return null;
}

/**
 * Detekce typu výuky
 */
export function parseLessonType(raw: string): LessonType {
  const norm = normalizeStr(raw);
  if (/predn|lec|lecture|^p$|^pr$|teorie/.test(norm)) return 'lecture';
  if (/cvic|cv|lab|exercise|praktik|^c$|^cv$|laborator/.test(norm)) return 'exercise';
  if (/semin|sem|^s$/.test(norm)) return 'seminar';
  return 'other';
}

/**
 * Detekce parity týdne (všechny, sudý, lichý)
 */
export function parseParity(raw: string): WeekParity {
  const norm = normalizeStr(raw);
  if (/\b(sud[yea]?|even|s)\b/.test(norm) && !/lich/.test(norm)) return 'even';
  if (/\b(lich[yea]?|odd|l)\b/.test(norm) && !/sud/.test(norm)) return 'odd';
  return 'all';
}

/**
 * Hledá časové rozmezí HH:MM - HH:MM v řetězci (odolné i vůči OCR mezerám)
 */
export function extractTimeRange(raw: string): { startTime: string; endTime: string; startMinutes: number; endMinutes: number } | null {
  // 1. Standardní nebo OCR formát s případnými mezerami okolo dvojtečky/tečky: "8 : 00 - 9 : 30"
  const flexibleMatch = raw.match(/(\d{1,2})\s*[:.]\s*(\d{2})\s*[-–—/ažto]+\s*(\d{1,2})\s*[:.]\s*(\d{2})/i);
  if (flexibleMatch) {
    const startH = flexibleMatch[1].padStart(2, '0');
    const startM = flexibleMatch[2];
    const endH = flexibleMatch[3].padStart(2, '0');
    const endM = flexibleMatch[4];
    const startTime = `${startH}:${startM}`;
    const endTime = `${endH}:${endM}`;
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    if (endMinutes > startMinutes) {
      return { startTime, endTime, startMinutes, endMinutes };
    }
  }

  // 2. Formát bez oddělovače mezi časy, např. "08:00 09:30"
  const spaceMatch = raw.match(/(\d{1,2}:\d{2})\s+(\d{1,2}:\d{2})/);
  if (spaceMatch) {
    const startTime = spaceMatch[1].padStart(5, '0');
    const endTime = spaceMatch[2].padStart(5, '0');
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    if (endMinutes > startMinutes) {
      return { startTime, endTime, startMinutes, endMinutes };
    }
  }

  return null;
}


/**
 * Vyčistí HTML a vrátí 2D tabulku řádků a buněk
 */
export function parseHtmlTable(html: string): string[][] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rows: string[][] = [];

  const trs = doc.querySelectorAll('tr');
  if (trs.length > 0) {
    trs.forEach((tr) => {
      const cells: string[] = [];
      tr.querySelectorAll('td, th').forEach((cell) => {
        cells.push((cell.textContent || '').trim());
      });
      if (cells.length > 0 && cells.some(c => c.length > 0)) {
        rows.push(cells);
      }
    });
    return rows;
  }

  return [];
}

/**
 * Převede čistý text (TSV / CSV / volný text po řádcích) na buňky
 */
export function parsePlainText(text: string): string[][] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const rows: string[][] = [];

  for (const line of lines) {
    if (line.includes('\t')) {
      rows.push(line.split('\t').map(c => c.trim()));
    } else if (line.includes(';') && !line.includes('&#')) {
      rows.push(line.split(';').map(c => c.trim()));
    } else {
      // Zkusit rozdělit podle vícenásobných mezer (2+ mezery)
      const multiSpace = line.split(/\s{2,}/);
      if (multiSpace.length > 1) {
        rows.push(multiSpace.map(c => c.trim()));
      } else {
        rows.push([line]);
      }
    }
  }

  return rows;
}

/**
 * Generuje náhodné unikátní ID pro slot
 */
function generateId(): string {
  return 'slot_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

/**
 * Hlavní inteligentní parser pro tabulku buněk
 */
export function parseScheduleMatrix(rows: string[][]): LessonSlot[] {
  const slots: LessonSlot[] = [];

  for (let rIndex = 0; rIndex < rows.length; rIndex++) {
    const row = rows[rIndex];
    const fullRowText = row.join(' ');

    // 1. Detekce času
    const timeMatch = extractTimeRange(fullRowText);
    if (!timeMatch) {
      continue; // Řádek bez rozpoznaného časového rozmezí pravděpodobně není záznam rozvrhu
    }

    // 2. Detekce dne
    let detectedDay: DayOfWeek | null = null;
    let dayCellIdx = -1;
    for (let c = 0; c < row.length; c++) {
      const day = parseDay(row[c]);
      if (day) {
        detectedDay = day;
        dayCellIdx = c;
        break;
      }
    }

    if (!detectedDay) {
      // Zkusit najít den v celém řádku
      for (const token of fullRowText.split(/\s+/)) {
        const d = parseDay(token);
        if (d) {
          detectedDay = d;
          break;
        }
      }
    }

    if (!detectedDay) {
      detectedDay = 'PO'; // Fallback
    }

    // 3. Detekce typu výuky
    let detectedType: LessonType = 'other';
    for (let c = 0; c < row.length; c++) {
      if (c === dayCellIdx) continue;
      const type = parseLessonType(row[c]);
      if (type !== 'other') {
        detectedType = type;
        break;
      }
    }

    // 4. Detekce parity
    const detectedParity = parseParity(fullRowText);

    // 5. Detekce kódu předmětu a názvu předmětu
    let courseCode = '';
    let courseName = '';
    let room = '';
    let teacher = '';

    // Regex pro školní kódy (např. BPC-SOS, 101MAT1, KIK/PROG, FIT101, MA1, INF-01, atd.)
    const codeRegex = /\b([A-Z0-9]{2,5}[-_/][A-Z0-9]{2,8}|[A-Z]{2,4}\d{2,4}|\d{2,4}[A-Z]{2,5}\d?|[A-Z]{2,6}\b)/;
    
    // Projdeme buňky
    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (!cell || c === dayCellIdx) continue;
      if (extractTimeRange(cell)) continue;

      // Hledání místnosti (např. T9:105, A112, D105, U2/1, C-302, TH:A-10)
      const roomMatch = cell.match(/\b([A-Z0-9]{1,4}[:/.-][A-Z0-9]{1,4}|[A-Z]\d{2,3}|U\d+|L\d{2,3})\b/i);
      if (roomMatch && !room) {
        room = roomMatch[0];
      }

      // Hledání vyučujícího
      const teacherMatch = cell.match(/\b((prof\.|doc\.|ing\.|mgr\.|rndr\.|judr\.|bc\.|ph\.?d\.)\s+[A-ZÁ-Ž][a-zá-ž]+(?:\s+[A-ZÁ-Ž][a-zá-ž]+)+)\b/i);
      if (teacherMatch && !teacher) {
        teacher = teacherMatch[1];
      }

      // Kód předmětu
      if (!courseCode) {
        const cMatch = cell.match(codeRegex);
        if (cMatch && cMatch[0] !== 'PO' && cMatch[0] !== 'UT' && cMatch[0] !== 'ST' && cMatch[0] !== 'CT' && cMatch[0] !== 'PA') {
          courseCode = cMatch[0].toUpperCase();
          // Pokud je v téže buňce i delší název, zkusit ho extrahovat
          const remainingName = cell.replace(codeRegex, '').trim();
          if (remainingName.length > 2) {
            courseName = remainingName;
          }
        }
      } else if (!courseName && cell.length > 3 && !cell.match(codeRegex)) {
        // Pokud ještě nemáme název a buňka není místnost ani vyučující
        if (!roomMatch && !teacherMatch) {
          courseName = cell;
        }
      }
    }

    // Fallback pro kód předmětu, pokud nebyl detekován regexem
    if (!courseCode) {
      for (const cell of row) {
        if (cell && cell !== detectedDay && !extractTimeRange(cell) && cell.length >= 2 && cell.length <= 12) {
          courseCode = cell.toUpperCase();
          break;
        }
      }
    }
    if (!courseCode) {
      courseCode = `PREDMET_${rIndex + 1}`;
    }

    const theme = getCourseTheme(courseCode);

    slots.push({
      id: generateId(),
      courseCode,
      courseName: courseName || courseCode,
      type: detectedType,
      day: detectedDay,
      startTime: timeMatch.startTime,
      endTime: timeMatch.endTime,
      startMinutes: timeMatch.startMinutes,
      endMinutes: timeMatch.endMinutes,
      parity: detectedParity,
      room: room || undefined,
      teacher: teacher || undefined,
      color: theme.rawHex,
    });
  }

  return slots;
}

/**
 * Zpracuje schránku (clipboard data) nebo libovolný vstupní text
 */
export function parseRawInput(htmlData: string, plainTextData: string): LessonSlot[] {
  let rows: string[][] = [];

  if (htmlData && htmlData.includes('<table')) {
    rows = parseHtmlTable(htmlData);
  }

  if (rows.length === 0 && plainTextData) {
    rows = parsePlainText(plainTextData);
  }

  if (rows.length === 0 && htmlData) {
    // Odstranit HTML tagy a zkusit jako plain text
    const textOnly = htmlData.replace(/<[^>]+>/g, ' ');
    rows = parsePlainText(textOnly);
  }

  return parseScheduleMatrix(rows);
}

/**
 * Seskupí sloty do CourseGroups (kód_předmětu + typ výuky)
 */
export function groupSlotsByRequirement(slots: LessonSlot[]): CourseGroup[] {
  const map = new Map<string, LessonSlot[]>();

  for (const slot of slots) {
    const key = `${slot.courseCode}#${slot.type}`;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(slot);
  }

  const groups: CourseGroup[] = [];
  map.forEach((options, groupId) => {
    const first = options[0];
    groups.push({
      groupId,
      courseCode: first.courseCode,
      courseName: first.courseName,
      type: first.type,
      options,
    });
  });

  return groups;
}
