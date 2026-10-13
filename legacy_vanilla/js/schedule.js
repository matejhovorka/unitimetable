/**
 * Jádro pro vykreslování a výpočty rozvrhové mřížky, pozicování bloků a kolizí
 * Podporuje sudé a liché týdny (zahájení 28. 9. = lichý týden) a pevné předměty
 */

const ScheduleEngine = {
  START_HOUR: 7,   // 7:00
  END_HOUR: 20,    // 20:00 (celkem 13 hodin = 780 minut)
  
  DAYS: [
    { id: 1, name: "Pondělí", short: "Po" },
    { id: 2, name: "Úterý", short: "Út" },
    { id: 3, name: "Středa", short: "St" },
    { id: 4, name: "Čtvrtek", short: "Čt" },
    { id: 5, name: "Pátek", short: "Pá" }
  ],

  /**
   * Převede čas řetězce "HH:MM" na počet minut od START_HOUR:00
   */
  timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    const totalMinutes = (h * 60 + m) - (this.START_HOUR * 60);
    return Math.max(0, totalMinutes);
  },

  /**
   * Převede minuty od START_HOUR zpět na "HH:MM"
   */
  minutesToTime(mins) {
    const totalMinutes = mins + (this.START_HOUR * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}`;
  },

  /**
   * Celkový počet minut v jednom dni
   */
  getTotalDayMinutes() {
    return (this.END_HOUR - this.START_HOUR) * 60;
  },

  /**
   * Vypočte pozici v procentech (left a width) pro daný blok
   */
  calculatePosition(startTime, endTime) {
    const totalMinutes = this.getTotalDayMinutes();
    const startMins = this.timeToMinutes(startTime);
    const endMins = this.timeToMinutes(endTime);
    const duration = Math.max(30, endMins - startMins);

    const leftPercent = (startMins / totalMinutes) * 100;
    const widthPercent = (duration / totalMinutes) * 100;

    return {
      left: Math.max(0, Math.min(leftPercent, 100)),
      width: Math.min(widthPercent, 100 - leftPercent)
    };
  },

  /**
   * Zkontroluje, zda se týdny dvou hodin překrývají
   */
  weeksOverlap(weekA = "both", weekB = "both") {
    if (weekA === "both" || weekB === "both") return true;
    return weekA === weekB;
  },

  /**
   * Zkontroluje, zda je předmět aktivní v daném týdenním filtru
   */
  isLessonActiveInWeek(lesson, activeWeek = "all") {
    if (activeWeek === "all") return true;
    const lessonWeek = lesson.week || "both";
    if (lessonWeek === "both") return true;
    return lessonWeek === activeWeek;
  },

  /**
   * Detekuje kolize mezi lekcemi v daném dni s ohledem na týdny
   */
  findConflicts(lessons, activeWeek = "all") {
    const conflictIds = new Set();
    const conflictPairs = [];

    // Filtrujeme pouze hodiny platné pro daný týden
    const relevantLessons = lessons.filter(l => this.isLessonActiveInWeek(l, activeWeek));

    for (let i = 0; i < relevantLessons.length; i++) {
      for (let j = i + 1; j < relevantLessons.length; j++) {
        const a = relevantLessons[i];
        const b = relevantLessons[j];

        if (a.day === b.day) {
          // Pokud jedna je jen lichý a druhá jen sudý, v kalendáři nekolidují!
          const weekA = a.week || "both";
          const weekB = b.week || "both";
          if (!this.weeksOverlap(weekA, weekB)) {
            continue;
          }

          const aStart = this.timeToMinutes(a.startTime);
          const aEnd = this.timeToMinutes(a.endTime);
          const bStart = this.timeToMinutes(b.startTime);
          const bEnd = this.timeToMinutes(b.endTime);

          // Časový překryv
          if (aStart < bEnd && aEnd > bStart) {
            conflictIds.add(a.id);
            conflictIds.add(b.id);
            conflictPairs.push({ lessonA: a, lessonB: b });
          }
        }
      }
    }

    return { conflictIds, conflictPairs };
  },

  /**
   * Vykreslí časovou osu nahoře (7:00, 8:00, ..., 19:00)
   */
  renderTimeHeader(containerEl) {
    containerEl.innerHTML = "";
    for (let hour = this.START_HOUR; hour < this.END_HOUR; hour++) {
      const cell = document.createElement("div");
      cell.className = "time-header-cell";
      const padHour = String(hour).padStart(2, "0");
      cell.textContent = `${padHour}:00`;
      containerEl.appendChild(cell);
    }
  },

  /**
   * Vykreslí tělo mřížky (pondělí až pátek, případně sobota pokud jsou v ní hodiny)
   */
  renderScheduleGrid(containerEl, activeVariant, overlayVariant = null, activeWeek = "all", onLessonClick, onTrackClick) {
    containerEl.innerHTML = "";

    const rawActiveLessons = activeVariant ? activeVariant.lessons || [] : [];
    const rawOverlayLessons = overlayVariant ? overlayVariant.lessons || [] : [];

    // Filtrujeme dle aktivního týdne (vše / lichý / sudý)
    const activeLessons = rawActiveLessons.filter(l => this.isLessonActiveInWeek(l, activeWeek));
    const overlayLessons = rawOverlayLessons.filter(l => this.isLessonActiveInWeek(l, activeWeek));

    // Zkontrolujeme, zda je potřeba zobrazit sobotu
    const hasSaturday = [...activeLessons, ...overlayLessons].some(l => l.day === 6);
    const daysToShow = [...this.DAYS];
    if (hasSaturday) {
      daysToShow.push({ id: 6, name: "Sobota", short: "So" });
    }

    // Zjistíme kolize v aktivní variantě
    const { conflictIds } = this.findConflicts(activeLessons, activeWeek);

    daysToShow.forEach(day => {
      const dayRow = document.createElement("div");
      dayRow.className = "day-row";
      dayRow.dataset.day = day.id;

      // Lekce v tento den
      const dayActiveLessons = activeLessons.filter(l => l.day === day.id);
      const dayOverlayLessons = overlayLessons.filter(l => l.day === day.id);
      const isFreeDay = dayActiveLessons.length === 0;

      // Popisek dne (levý sloupec)
      const dayLabel = document.createElement("div");
      dayLabel.className = "day-label-cell";
      dayLabel.innerHTML = `
        <span class="day-name">${day.name}</span>
        ${isFreeDay ? `<span class="day-free-badge">Volno</span>` : ""}
      `;
      dayRow.appendChild(dayLabel);

      // Časová stopa pro bloky
      const dayTrack = document.createElement("div");
      dayTrack.className = "day-time-track";
      dayTrack.title = `Klikněte pro přidání předmětu na ${day.name}`;

      // Kliknutí do prázdného místa na stopě
      dayTrack.addEventListener("click", (e) => {
        if (e.target.closest(".lesson-card")) return;

        const rect = dayTrack.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        const clickedMinutes = Math.floor((ratio * this.getTotalDayMinutes()) / 15) * 15;
        const startTimeStr = this.minutesToTime(clickedMinutes);
        const endTimeStr = this.minutesToTime(clickedMinutes + 90);

        if (onTrackClick) {
          onTrackClick(day.id, startTimeStr, endTimeStr);
        }
      });

      // Detekce střídání sudý vs lichý ve stejném čase (pro režim 'all', aby se zobrazily půleně)
      const slotMap = new Map();
      if (activeWeek === "all") {
        for (let i = 0; i < dayActiveLessons.length; i++) {
          for (let j = i + 1; j < dayActiveLessons.length; j++) {
            const a = dayActiveLessons[i];
            const b = dayActiveLessons[j];
            const wA = a.week || "both";
            const wB = b.week || "both";

            // Pokud jedna je lichá a druhá sudá a časově se překrývají
            if (((wA === "odd" && wB === "even") || (wA === "even" && wB === "odd"))) {
              const aStart = this.timeToMinutes(a.startTime);
              const aEnd = this.timeToMinutes(a.endTime);
              const bStart = this.timeToMinutes(b.startTime);
              const bEnd = this.timeToMinutes(b.endTime);

              if (aStart < bEnd && aEnd > bStart) {
                // a dáme nahoru, b dolů
                const oddLesson = wA === "odd" ? a : b;
                const evenLesson = wA === "even" ? a : b;
                slotMap.set(oddLesson.id, "slot-half-top");
                slotMap.set(evenLesson.id, "slot-half-bottom");
              }
            }
          }
        }
      }

      // 1. Vykreslení aktivních bloků
      dayActiveLessons.forEach(lesson => {
        const pos = this.calculatePosition(lesson.startTime, lesson.endTime);
        const isConflict = conflictIds.has(lesson.id);
        const halfSlotClass = slotMap.get(lesson.id) || "";

        const card = document.createElement("div");
        card.className = `lesson-card type-${lesson.type || "seminar"} ${isConflict ? "is-conflict" : ""} ${halfSlotClass}`;
        card.style.left = `${pos.left}%`;
        card.style.width = `calc(${pos.width}% - 3px)`;
        card.style.setProperty("--lesson-color", lesson.color || "#6366f1");

        const typeLabels = {
          lecture: "P",
          seminar: "C",
          lab: "L",
          other: "X"
        };
        const typeShort = typeLabels[lesson.type] || "C";

        // Týdenní odznak
        let weekBadgeHtml = "";
        const lessonWeek = lesson.week || "both";
        if (lessonWeek === "odd") {
          weekBadgeHtml = `<span class="lesson-week-badge badge-odd" title="Pouze lichý týden (od 28. 9.)">Lichý</span>`;
        } else if (lessonWeek === "even") {
          weekBadgeHtml = `<span class="lesson-week-badge badge-even" title="Pouze sudý týden (od 5. 10.)">Sudý</span>`;
        }

        // Pevný předmět odznak
        const fixedBadgeHtml = lesson.isFixed ? `<span class="lesson-fixed-badge" title="Pevný základ rozvrhu">📌 Pevný</span>` : "";

        card.innerHTML = `
          <div class="lesson-card-header">
            <span class="lesson-code">${lesson.code || ""}</span>
            <div style="display: flex; align-items: center; gap: 4px;">
              ${fixedBadgeHtml}
              ${weekBadgeHtml}
              ${isConflict ? `<span class="conflict-warning-tag" title="Časová kolize s jiným předmětem!">⚠️ Kolize</span>` : ""}
              <span class="lesson-type-badge">${typeShort}</span>
            </div>
          </div>
          <div class="lesson-card-body">
            <div class="lesson-title" title="${lesson.name}">${lesson.name}</div>
            <div class="lesson-room-teacher">
              ${lesson.room ? `📍 ${lesson.room}` : ""} ${lesson.teacher ? `• ${lesson.teacher}` : ""}
            </div>
          </div>
          <div class="lesson-card-footer">
            <span>${lesson.startTime} – ${lesson.endTime}</span>
            ${lesson.credits ? `<span>${lesson.credits} kr.</span>` : ""}
          </div>
        `;

        card.addEventListener("click", (e) => {
          e.stopPropagation();
          if (onLessonClick) onLessonClick(lesson);
        });

        dayTrack.appendChild(card);
      });

      // 2. Vykreslení overlay bloků (z porovnávané varianty)
      if (overlayVariant) {
        dayOverlayLessons.forEach(overlayLesson => {
          const pos = this.calculatePosition(overlayLesson.startTime, overlayLesson.endTime);

          const overlayCard = document.createElement("div");
          overlayCard.className = `lesson-card overlay-card type-${overlayLesson.type || "seminar"}`;
          overlayCard.style.left = `${pos.left}%`;
          overlayCard.style.width = `calc(${pos.width}% - 3px)`;
          overlayCard.style.setProperty("--lesson-color", overlayLesson.color || "#a855f7");

          let overlayWeekBadge = "";
          const ovWeek = overlayLesson.week || "both";
          if (ovWeek === "odd") overlayWeekBadge = `<span class="lesson-week-badge badge-odd">Lichý</span>`;
          if (ovWeek === "even") overlayWeekBadge = `<span class="lesson-week-badge badge-even">Sudý</span>`;

          overlayCard.innerHTML = `
            <div class="lesson-card-header">
              <span class="lesson-code">${overlayLesson.code || ""}</span>
              <div style="display: flex; align-items: center; gap: 4px;">
                ${overlayWeekBadge}
                <span class="overlay-tag" title="Z varianty: ${overlayVariant.name}">+ ${overlayVariant.name.slice(0, 12)}...</span>
              </div>
            </div>
            <div class="lesson-card-body">
              <div class="lesson-title">${overlayLesson.name}</div>
              <div class="lesson-room-teacher">${overlayLesson.room || ""}</div>
            </div>
            <div class="lesson-card-footer">
              <span>${overlayLesson.startTime} – ${overlayLesson.endTime}</span>
            </div>
          `;

          overlayCard.title = `Varianta: ${overlayVariant.name}\n${overlayLesson.name}\n${overlayLesson.startTime} - ${overlayLesson.endTime}`;
          dayTrack.appendChild(overlayCard);
        });
      }

      dayRow.appendChild(dayTrack);
      containerEl.appendChild(dayRow);
    });
  },

  /**
   * Spočte statistiky rozvrhu
   */
  calculateStats(variant, activeWeek = "all") {
    if (!variant || !variant.lessons) {
      return {
        subjectCount: 0,
        totalHours: "0 h",
        totalCredits: 0,
        freeDaysText: "Žádný",
        hasConflicts: false,
        conflictCount: 0
      };
    }

    const allLessons = variant.lessons;
    const lessons = allLessons.filter(l => this.isLessonActiveInWeek(l, activeWeek));

    // Unikátní předměty dle kódu nebo názvu
    const uniqueSubjects = new Set(lessons.map(l => (l.code || l.name).trim().toUpperCase()));

    // Celkový čas výuky v minutách
    let totalMinutes = 0;
    let credits = 0;
    const creditMap = new Map();

    lessons.forEach(l => {
      const start = this.timeToMinutes(l.startTime);
      const end = this.timeToMinutes(l.endTime);
      totalMinutes += Math.max(0, end - start);

      const subjectKey = (l.code || l.name).trim().toUpperCase();
      if (l.credits && !creditMap.has(subjectKey)) {
        creditMap.set(subjectKey, Number(l.credits) || 0);
      }
    });

    creditMap.forEach(c => credits += c);

    const hoursDecimal = (totalMinutes / 60).toFixed(1);
    const totalHours = `${hoursDecimal.replace(".0", "")} h`;

    // Volné dny mezi Po-Pá
    const occupiedDays = new Set(lessons.map(l => l.day));
    const dayNames = { 1: "Pondělí", 2: "Úterý", 3: "Středa", 4: "Čtvrtek", 5: "Pátek" };
    const freeDayList = [];
    for (let d = 1; d <= 5; d++) {
      if (!occupiedDays.has(d)) {
        freeDayList.push(dayNames[d]);
      }
    }

    let freeDaysText = "Žádný";
    if (freeDayList.length > 0) {
      freeDaysText = freeDayList.join(", ") + " 🎉";
    }

    // Detekce kolizí
    const { conflictPairs } = this.findConflicts(lessons, activeWeek);
    const hasConflicts = conflictPairs.length > 0;

    return {
      subjectCount: uniqueSubjects.size,
      totalHours,
      totalCredits: credits,
      freeDaysText,
      hasConflicts,
      conflictCount: conflictPairs.length
    };
  }
};
