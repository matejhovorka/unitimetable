/**
 * Modul pro ukládání, načítání, zálohování (JSON) a export do kalendáře (iCal)
 */

const STORAGE_KEY = "vs_rozvrhar_app_data";
const THEME_KEY = "vs_rozvrhar_theme";

const StorageManager = {
  /**
   * Načte data z LocalStorage nebo vrátí výchozí ukázková data
   */
  loadData() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        return JSON.parse(JSON.stringify(SAMPLE_SCHEDULE_DATA));
      }
      const parsed = JSON.parse(serialized);
      if (!parsed.variants || !Array.isArray(parsed.variants) || parsed.variants.length === 0) {
        return JSON.parse(JSON.stringify(SAMPLE_SCHEDULE_DATA));
      }
      return parsed;
    } catch (e) {
      console.warn("Chyba při čtení LocalStorage, načítám výchozí data:", e);
      return JSON.parse(JSON.stringify(SAMPLE_SCHEDULE_DATA));
    }
  },

  /**
   * Uloží aktuální stav aplikace
   */
  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Chyba při ukládání do LocalStorage:", e);
      return false;
    }
  },

  /**
   * Vymaže uložená data a vrátí ukázková
   */
  resetToSampleData() {
    localStorage.removeItem(STORAGE_KEY);
    return JSON.parse(JSON.stringify(SAMPLE_SCHEDULE_DATA));
  },

  /**
   * Uloží zvolený motiv (dark / light)
   */
  saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  },

  /**
   * Načte zvolený motiv
   */
  loadTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
  },

  /**
   * Stáhne data jako JSON soubor
   */
  exportToJson(data) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `rozvrh_vs_zaloha_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Načte a zvaliduje JSON soubor vybraný uživatelem
   */
  importFromJson(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed.variants || !Array.isArray(parsed.variants)) {
            throw new Error("Neplatná struktura souboru rozvrhu.");
          }
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Chyba při čtení souboru."));
      reader.readAsText(file);
    });
  },

  /**
   * Exportuje aktivní variantu rozvrhu do iCalendar formátu (.ics)
   */
  exportToICal(variant) {
    if (!variant || !variant.lessons || variant.lessons.length === 0) {
      alert("Tato varianta nemá žádné předměty k exportu.");
      return;
    }

    // Začátek semestru: 28. září 2026 (pondělí = 1. semestrální lichý týden)
    const baseOddMonday = new Date(2026, 8, 28); // 28. 9. 2026 (lichý)
    const baseEvenMonday = new Date(2026, 9, 5); // 5. 10. 2026 (sudý)

    const pad = (n) => String(n).padStart(2, "0");

    const formatICalDate = (date, timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const d = new Date(date);
      d.setHours(hours, minutes, 0, 0);
      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    };

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//VS Rozvrhar//Rozvrh Variant//CS",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${variant.name || "Můj VŠ Rozvrh"}`,
      "X-WR-TIMEZONE:Europe/Prague"
    ];

    const typeNames = {
      lecture: "Přednáška",
      seminar: "Cvičení",
      lab: "Laboratoř",
      other: "Výuka"
    };

    variant.lessons.forEach((lesson) => {
      const dayOffset = (lesson.day || 1) - 1; // 0 pro Po, 1 pro Út, ...
      const lessonWeek = lesson.week || "both";

      let startDate = new Date(baseOddMonday);
      let rrule = "RRULE:FREQ=WEEKLY;COUNT=14"; // každý týden

      if (lessonWeek === "odd") {
        startDate = new Date(baseOddMonday);
        rrule = "RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=7"; // liché týdny od 28. 9.
      } else if (lessonWeek === "even") {
        startDate = new Date(baseEvenMonday);
        rrule = "RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=7"; // sudé týdny od 5. 10.
      }

      startDate.setDate(startDate.getDate() + dayOffset);

      const dtStart = formatICalDate(startDate, lesson.startTime);
      const dtEnd = formatICalDate(startDate, lesson.endTime);

      const typeLabel = typeNames[lesson.type] || "Výuka";
      const weekSuffix = lessonWeek === "odd" ? " (Lichý týden)" : lessonWeek === "even" ? " (Sudý týden)" : "";
      const summary = `[${typeLabel}] ${lesson.name}${lesson.code ? ` (${lesson.code})` : ""}${weekSuffix}`;
      const description = `Vyučující: ${lesson.teacher || "neuveden"}\\nPoznámka: ${lesson.note || "žádná"}\\nTýden: ${lessonWeek === "odd" ? "Pouze lichý" : lessonWeek === "even" ? "Pouze sudý" : "Každý týden"}`;

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:lesson-${lesson.id}-${Date.now()}@rozvrhar.local`,
        `DTSTAMP:${formatICalDate(new Date(), "00:00")}Z`,
        `DTSTART;TZID=Europe/Prague:${dtStart}`,
        `DTEND;TZID=Europe/Prague:${dtEnd}`,
        rrule,
        `SUMMARY:${summary}`,
        `LOCATION:${lesson.room || "VŠ"}`,
        `DESCRIPTION:${description}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    });

    icsContent.push("END:VCALENDAR");

    const icsString = icsContent.join("\r\n");
    const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (variant.name || "rozvrh").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    a.href = url;
    a.download = `${safeName}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
