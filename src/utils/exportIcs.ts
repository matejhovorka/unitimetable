import type { SchedulePlan } from '../types/types';

const DAY_OFFSET_MAP: Record<string, number> = {
  PO: 0,
  UT: 1,
  ST: 2,
  CT: 3,
  PA: 4,
};

function formatIcsDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Získá datum nejbližšího pondělí v budoucnosti
 */
function getNextMonday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 is Sun, 1 is Mon
  const diff = (day === 0 ? 1 : (8 - day)); // dny do příštího pondělí
  d.setDate(d.getDate() + diff);
  return d;
}

function sanitizeIcsText(str: string): string {
  return str.replace(/[\r\n]+/g, ' ').trim();
}

export function generateIcs(plan: SchedulePlan, title = 'Můj rozvrh — UniTimetable'): string {
  const nextMonday = getNextMonday();
  const events: string[] = [];
  const safeTitle = sanitizeIcsText(title);

  for (const slot of plan.slots) {
    const dayOffset = DAY_OFFSET_MAP[slot.day] ?? 0;
    const eventDate = new Date(nextMonday);
    eventDate.setDate(eventDate.getDate() + dayOffset);

    // Pokud je lichý/sudý týden, posunout první výskyt v případě potřeby
    let rrule = 'RRULE:FREQ=WEEKLY;COUNT=14';
    if (slot.parity === 'even') {
      rrule = 'RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=7';
    } else if (slot.parity === 'odd') {
      rrule = 'RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=7';
    }

    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM] = slot.endTime.split(':').map(Number);

    const startDate = new Date(eventDate);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(eventDate);
    endDate.setHours(endH, endM, 0, 0);

    const typeLabel = slot.type === 'lecture' ? 'Přednáška' : slot.type === 'exercise' ? 'Cvičení' : slot.type === 'seminar' ? 'Seminář' : 'Výuka';
    const cCode = sanitizeIcsText(slot.courseCode);
    const cName = sanitizeIcsText(slot.courseName || slot.courseCode);
    const teacher = sanitizeIcsText(slot.teacher || 'Neuveden');
    const room = sanitizeIcsText(slot.room || 'Škola');

    const summary = `${cCode} (${typeLabel}) - ${cName}`;
    const description = `Předmět: ${cName}\\nTyp: ${typeLabel}\\nVyučující: ${teacher}\\nTýden: ${slot.parity === 'all' ? 'Každý týden' : slot.parity === 'even' ? 'Sudý týden' : 'Lichý týden'}`;
    const location = room;

    events.push([
      'BEGIN:VEVENT',
      `UID:${slot.id}-${Date.now()}@unitimetable`,
      `DTSTAMP:${formatIcsDateTime(new Date())}`,
      `DTSTART:${formatIcsDateTime(startDate)}`,
      `DTEND:${formatIcsDateTime(endDate)}`,
      `${rrule}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n'));
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UniTimetable Optimizer//CZ',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${safeTitle}`,
    'X-WR-TIMEZONE:Europe/Prague',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
}

export function downloadIcsFile(plan: SchedulePlan, filename = 'rozvrh.ics') {
  const content = generateIcs(plan);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
