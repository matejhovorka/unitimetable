/**
 * Hlavní aplikační kontroler VŠ Rozvrháře
 * Řídí uživatelské rozhraní, události, varianty, stav aplikace a sudé/liché týdny
 */

document.addEventListener("DOMContentLoaded", () => {
  // Stav aplikace
  let appData = StorageManager.loadData();
  let isComparing = false;
  let compareVariantId = null;
  let currentWeekFilter = "all"; // "all" | "odd" | "even"

  // Předvolby barev pro předměty
  const COLOR_PRESETS = [
    "#6366f1", // Indigo
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#8b5cf6", // Violet
    "#f43f5e", // Rose
    "#3b82f6", // Blue
    "#14b8a6", // Teal
    "#d97706"  // Dark orange
  ];

  // DOM elementy
  const variantsTabContainer = document.getElementById("variantsTabContainer");
  const timeHeaderTrack = document.getElementById("timeHeaderTrack");
  const scheduleDaysBody = document.getElementById("scheduleDaysBody");
  const printVariantTitle = document.getElementById("printVariantTitle");

  // Týdenní filtr
  const tabWeekAll = document.getElementById("tabWeekAll");
  const tabWeekOdd = document.getElementById("tabWeekOdd");
  const tabWeekEven = document.getElementById("tabWeekEven");
  const btnSyncFixed = document.getElementById("btnSyncFixed");

  // Statistiky
  const statSubjectCount = document.getElementById("statSubjectCount");
  const statTotalHours = document.getElementById("statTotalHours");
  const statTotalCredits = document.getElementById("statTotalCredits");
  const statFreeDays = document.getElementById("statFreeDays");
  const statConflicts = document.getElementById("statConflicts");
  const statConflictCard = document.getElementById("statConflictCard");

  // Modály
  const modalLesson = document.getElementById("modalLesson");
  const formLesson = document.getElementById("formLesson");
  const modalTitle = document.getElementById("modalTitle");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const btnCancelModal = document.getElementById("btnCancelModal");
  const btnDeleteLesson = document.getElementById("btnDeleteLesson");

  const lessonWeek = document.getElementById("lessonWeek");
  const lessonIsFixed = document.getElementById("lessonIsFixed");

  const modalRenameVariant = document.getElementById("modalRenameVariant");
  const formRenameVariant = document.getElementById("formRenameVariant");
  const renameVariantInput = document.getElementById("renameVariantInput");
  const btnCloseRenameModal = document.getElementById("btnCloseRenameModal");
  const btnCancelRenameModal = document.getElementById("btnCancelRenameModal");

  // Tlačítka horní lišty a variant
  const btnOpenAddModal = document.getElementById("btnOpenAddModal");
  const btnNewVariant = document.getElementById("btnNewVariant");
  const btnDuplicateVariant = document.getElementById("btnDuplicateVariant");
  const btnRenameVariant = document.getElementById("btnRenameVariant");
  const btnDeleteVariant = document.getElementById("btnDeleteVariant");
  const btnThemeToggle = document.getElementById("btnThemeToggle");

  // Porovnávání
  const btnToggleCompare = document.getElementById("btnToggleCompare");
  const compareBar = document.getElementById("compareBar");
  const compareSelect = document.getElementById("compareSelect");
  const compareBaseName = document.getElementById("compareBaseName");
  const compareOverlayName = document.getElementById("compareOverlayName");
  const btnCloseCompare = document.getElementById("btnCloseCompare");

  // Dropdown exportu
  const btnExportMenu = document.getElementById("btnExportMenu");
  const exportDropdown = document.getElementById("exportDropdown");
  const btnExportICal = document.getElementById("btnExportICal");
  const btnPrintSchedule = document.getElementById("btnPrintSchedule");
  const btnExportJson = document.getElementById("btnExportJson");
  const fileImportJson = document.getElementById("fileImportJson");
  const btnResetData = document.getElementById("btnResetData");

  // Inicializace barevných čipů v modálu
  const colorPresetsContainer = document.getElementById("colorPresets");
  const lessonColorInput = document.getElementById("lessonColor");

  COLOR_PRESETS.forEach(hex => {
    const chip = document.createElement("div");
    chip.className = "preset-chip";
    chip.style.backgroundColor = hex;
    chip.title = hex;
    chip.addEventListener("click", () => {
      lessonColorInput.value = hex;
    });
    colorPresetsContainer.appendChild(chip);
  });

  // Pomocná funkce pro zobrazení toast notifikace
  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(20px)";
      toast.style.transition = "all 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // Získání aktivní varianty
  function getActiveVariant() {
    let current = appData.variants.find(v => v.id === appData.activeVariantId);
    if (!current && appData.variants.length > 0) {
      current = appData.variants[0];
      appData.activeVariantId = current.id;
    }
    return current;
  }

  // Získání overlay varianty pro porovnání
  function getCompareVariant() {
    if (!isComparing || !compareVariantId) return null;
    return appData.variants.find(v => v.id === compareVariantId) || null;
  }

  // Uložení a překreslení
  function persistAndRefresh() {
    StorageManager.saveData(appData);
    renderAll();
  }

  // Kompletní přerenderování UI
  function renderAll() {
    renderVariantTabs();
    renderSchedule();
    renderStats();
    updateCompareView();
  }

  // Vykreslení tabů variant
  function renderVariantTabs() {
    variantsTabContainer.innerHTML = "";
    const active = getActiveVariant();

    appData.variants.forEach((v) => {
      const tab = document.createElement("button");
      const isActive = active && active.id === v.id;
      tab.className = `variant-tab ${isActive ? "active" : ""}`;
      
      const count = v.lessons ? v.lessons.length : 0;
      tab.innerHTML = `
        <span>${v.name}</span>
        <span class="tab-badge">${count}</span>
      `;

      tab.addEventListener("click", () => {
        appData.activeVariantId = v.id;
        if (isComparing && compareVariantId === v.id) {
          const other = appData.variants.find(otherV => otherV.id !== v.id);
          compareVariantId = other ? other.id : null;
        }
        persistAndRefresh();
      });

      variantsTabContainer.appendChild(tab);
    });

    if (active) {
      const weekNote = currentWeekFilter === "odd" ? " (Lichý týden)" : currentWeekFilter === "even" ? " (Sudý týden)" : "";
      printVariantTitle.textContent = `${active.name}${weekNote}`;
    }
  }

  // Vykreslení kalendáře
  function renderSchedule() {
    const active = getActiveVariant();
    const overlay = getCompareVariant();

    ScheduleEngine.renderScheduleGrid(
      scheduleDaysBody,
      active,
      overlay,
      currentWeekFilter,
      (lesson) => openEditModal(lesson),
      (day, startTime, endTime) => openAddModalWithTime(day, startTime, endTime)
    );
  }

  // Aktualizace statistik
  function renderStats() {
    const active = getActiveVariant();
    const stats = ScheduleEngine.calculateStats(active, currentWeekFilter);

    statSubjectCount.textContent = stats.subjectCount;
    statTotalHours.textContent = stats.totalHours;
    statTotalCredits.textContent = `${stats.totalCredits} ECTS`;
    statFreeDays.textContent = stats.freeDaysText;

    if (stats.hasConflicts) {
      statConflictCard.classList.add("has-conflict");
      statConflicts.textContent = `⚠️ ${stats.conflictCount} ${stats.conflictCount === 1 ? "kolize" : stats.conflictCount < 5 ? "kolize" : "kolizí"}!`;
    } else {
      statConflictCard.classList.remove("has-conflict");
      statConflicts.textContent = "Bez kolizí ✓";
    }
  }

  // Přepínání týdenního filtru (vše / lichý / sudý)
  function setWeekFilter(filter) {
    currentWeekFilter = filter;
    [tabWeekAll, tabWeekOdd, tabWeekEven].forEach(tab => tab.classList.remove("active"));
    if (filter === "all") tabWeekAll.classList.add("active");
    if (filter === "odd") tabWeekOdd.classList.add("active");
    if (filter === "even") tabWeekEven.classList.add("active");

    const labels = {
      all: "Zobrazeny všechny týdny",
      odd: "Zobrazen LICHÝ týden (od 28. 9.)",
      even: "Zobrazen SUDÝ týden (od 5. 10.)"
    };
    showToast(labels[filter], "info");
    renderAll();
  }

  tabWeekAll.addEventListener("click", () => setWeekFilter("all"));
  tabWeekOdd.addEventListener("click", () => setWeekFilter("odd"));
  tabWeekEven.addEventListener("click", () => setWeekFilter("even"));

  // Synchronizace pevných předmětů mezi všemi variantami
  btnSyncFixed.addEventListener("click", () => {
    const active = getActiveVariant();
    if (!active) return;

    const fixedLessons = (active.lessons || []).filter(l => l.isFixed);

    if (fixedLessons.length === 0) {
      alert("V této variantě zatím nemáte žádný předmět označený jako 'Pevný předmět'.\n\nUpravte libovolnou přednášku či cvičení a zaškrtněte 'Pevný předmět (povinný základ)'.");
      return;
    }

    if (confirm(`Chcete zkopírovat ${fixedLessons.length} pevných předmětů z varianty "${active.name}" do všech ostatních variant?\n\nVolitelná cvičení v ostatních variantách zůstanou zachována.`)) {
      appData.variants.forEach(variant => {
        if (variant.id === active.id) return;

        // Ponecháme nepevné hodiny dané varianty
        const customLessons = (variant.lessons || []).filter(l => !l.isFixed);

        // Naklonujeme pevné hodiny s novými ID
        const clonedFixed = JSON.parse(JSON.stringify(fixedLessons)).map(fl => ({
          ...fl,
          id: `les_fixed_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        }));

        variant.lessons = [...clonedFixed, ...customLessons];
      });

      persistAndRefresh();
      showToast(`Pevné přednášky (${fixedLessons.length}) byly synchronizovány do všech variant!`, "success");
    }
  });

  // Aktualizace panelu pro porovnávání
  function updateCompareView() {
    if (!isComparing) {
      compareBar.style.display = "none";
      btnToggleCompare.classList.remove("btn-primary");
      btnToggleCompare.classList.add("btn-secondary");
      return;
    }

    const active = getActiveVariant();
    if (!active || appData.variants.length < 2) {
      isComparing = false;
      compareBar.style.display = "none";
      return;
    }

    compareBar.style.display = "flex";
    btnToggleCompare.classList.remove("btn-secondary");
    btnToggleCompare.classList.add("btn-primary");

    compareBaseName.textContent = active.name;

    // Naplnění selectu ostatními variantami
    compareSelect.innerHTML = "";
    const otherVariants = appData.variants.filter(v => v.id !== active.id);

    if (!compareVariantId || compareVariantId === active.id) {
      compareVariantId = otherVariants[0]?.id || null;
    }

    otherVariants.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = `${v.name} (${v.lessons.length} předmětů)`;
      if (v.id === compareVariantId) {
        opt.selected = true;
      }
      compareSelect.appendChild(opt);
    });

    const overlay = getCompareVariant();
    compareOverlayName.textContent = overlay ? overlay.name : "Žádná";
  }

  // Otevření modálu pro přidání hodiny
  function openAddModal(prefill = {}) {
    formLesson.reset();
    document.getElementById("lessonId").value = "";
    modalTitle.textContent = "Přidat předmět do rozvrhu";
    btnDeleteLesson.style.display = "none";

    // Výchozí hodnoty
    document.getElementById("lessonDay").value = prefill.day || 1;
    document.getElementById("lessonStartTime").value = prefill.startTime || "09:00";
    document.getElementById("lessonEndTime").value = prefill.endTime || "10:30";
    document.getElementById("lessonType").value = prefill.type || "seminar";
    document.getElementById("lessonCredits").value = prefill.credits !== undefined ? prefill.credits : 5;
    
    // Týden a pevný předmět
    lessonWeek.value = prefill.week || (currentWeekFilter !== "all" ? currentWeekFilter : "both");
    lessonIsFixed.checked = prefill.isFixed !== undefined ? prefill.isFixed : (prefill.type === "lecture");

    // Náhodná barva z palety pro nový předmět
    const randomColor = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)];
    document.getElementById("lessonColor").value = randomColor;

    modalLesson.style.display = "flex";
    document.getElementById("lessonName").focus();
  }

  // Otevření s předvyplněným dnem a časem (po kliku do mřížky)
  function openAddModalWithTime(day, startTime, endTime) {
    openAddModal({ day, startTime, endTime });
  }

  // Otevření modálu pro editaci existující hodiny
  function openEditModal(lesson) {
    document.getElementById("lessonId").value = lesson.id;
    modalTitle.textContent = "Upravit předmět";
    btnDeleteLesson.style.display = "inline-flex";

    document.getElementById("lessonName").value = lesson.name || "";
    document.getElementById("lessonCode").value = lesson.code || "";
    document.getElementById("lessonType").value = lesson.type || "seminar";
    document.getElementById("lessonCredits").value = lesson.credits !== undefined ? lesson.credits : 0;
    document.getElementById("lessonColor").value = lesson.color || "#6366f1";
    document.getElementById("lessonDay").value = lesson.day || 1;
    document.getElementById("lessonStartTime").value = lesson.startTime || "09:00";
    document.getElementById("lessonEndTime").value = lesson.endTime || "10:30";
    document.getElementById("lessonRoom").value = lesson.room || "";
    document.getElementById("lessonTeacher").value = lesson.teacher || "";
    document.getElementById("lessonNote").value = lesson.note || "";

    // Týden a pevný
    lessonWeek.value = lesson.week || "both";
    lessonIsFixed.checked = !!lesson.isFixed;

    modalLesson.style.display = "flex";
  }

  function closeModal() {
    modalLesson.style.display = "none";
  }

  // Uložení hodiny z formuláře
  formLesson.addEventListener("submit", (e) => {
    e.preventDefault();

    const active = getActiveVariant();
    if (!active) return;

    const id = document.getElementById("lessonId").value;
    const startTime = document.getElementById("lessonStartTime").value;
    const endTime = document.getElementById("lessonEndTime").value;

    // Validace časů
    if (startTime >= endTime) {
      alert("Čas začátku musí být dříve než čas konce hodiny!");
      return;
    }

    const lessonData = {
      id: id || `les_${Date.now()}`,
      name: document.getElementById("lessonName").value.trim(),
      code: document.getElementById("lessonCode").value.trim().toUpperCase(),
      type: document.getElementById("lessonType").value,
      credits: parseInt(document.getElementById("lessonCredits").value, 10) || 0,
      color: document.getElementById("lessonColor").value,
      day: parseInt(document.getElementById("lessonDay").value, 10),
      startTime,
      endTime,
      room: document.getElementById("lessonRoom").value.trim(),
      teacher: document.getElementById("lessonTeacher").value.trim(),
      note: document.getElementById("lessonNote").value.trim(),
      week: lessonWeek.value,
      isFixed: lessonIsFixed.checked
    };

    if (id) {
      // Aktualizace existující
      const idx = active.lessons.findIndex(l => l.id === id);
      if (idx !== -1) {
        active.lessons[idx] = lessonData;
        showToast("Předmět upraven", "success");
      }
    } else {
      // Přidání nové
      active.lessons.push(lessonData);
      showToast("Předmět přidán do rozvrhu", "success");
    }

    closeModal();
    persistAndRefresh();
  });

  // Smazání hodiny
  btnDeleteLesson.addEventListener("click", () => {
    const id = document.getElementById("lessonId").value;
    if (!id) return;

    const active = getActiveVariant();
    if (!active) return;

    if (confirm("Opravdu chcete smazat tento předmět z rozvrhu?")) {
      active.lessons = active.lessons.filter(l => l.id !== id);
      closeModal();
      persistAndRefresh();
      showToast("Předmět byl smazán", "info");
    }
  });

  // Zavírání modálu
  btnCloseModal.addEventListener("click", closeModal);
  btnCancelModal.addEventListener("click", closeModal);
  modalLesson.addEventListener("click", (e) => {
    if (e.target === modalLesson) closeModal();
  });

  // Přidání nové varianty
  btnNewVariant.addEventListener("click", () => {
    const num = appData.variants.length + 1;
    const name = prompt("Zadejte název nové varianty rozvrhu:", `Varianta ${String.fromCharCode(64 + num)}`);
    if (name && name.trim()) {
      // Pokud máme v aktivní variantě pevné přednášky, nabídneme jejich zachování
      const active = getActiveVariant();
      const fixedLessons = (active?.lessons || []).filter(l => l.isFixed);
      let initialLessons = [];

      if (fixedLessons.length > 0 && confirm(`Chcete do nové varianty automaticky zahrnout ${fixedLessons.length} pevných přednášek?`)) {
        initialLessons = JSON.parse(JSON.stringify(fixedLessons)).map(l => ({
          ...l,
          id: `les_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        }));
      }

      const newVar = {
        id: `var_${Date.now()}`,
        name: name.trim(),
        lessons: initialLessons
      };
      appData.variants.push(newVar);
      appData.activeVariantId = newVar.id;
      persistAndRefresh();
      showToast(`Vytvořena varianta: ${newVar.name}`, "success");
    }
  });

  // Duplikace stávající varianty
  btnDuplicateVariant.addEventListener("click", () => {
    const active = getActiveVariant();
    if (!active) return;

    const clonedLessons = JSON.parse(JSON.stringify(active.lessons || [])).map(l => ({
      ...l,
      id: `les_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    }));

    const newVar = {
      id: `var_${Date.now()}`,
      name: `${active.name} (Kopie)`,
      lessons: clonedLessons
    };

    appData.variants.push(newVar);
    appData.activeVariantId = newVar.id;
    persistAndRefresh();
    showToast(`Varianta "${active.name}" zkopírována! Můžete v ní vyzkoušet jiné paralelky na úterní zápis.`, "success");
  });

  // Přejmenování varianty
  btnRenameVariant.addEventListener("click", () => {
    const active = getActiveVariant();
    if (!active) return;

    renameVariantInput.value = active.name;
    modalRenameVariant.style.display = "flex";
    renameVariantInput.focus();
    renameVariantInput.select();
  });

  formRenameVariant.addEventListener("submit", (e) => {
    e.preventDefault();
    const active = getActiveVariant();
    if (!active) return;

    const val = renameVariantInput.value.trim();
    if (val) {
      active.name = val;
      modalRenameVariant.style.display = "none";
      persistAndRefresh();
      showToast("Varianta přejmenována", "success");
    }
  });

  btnCloseRenameModal.addEventListener("click", () => modalRenameVariant.style.display = "none");
  btnCancelRenameModal.addEventListener("click", () => modalRenameVariant.style.display = "none");
  modalRenameVariant.addEventListener("click", (e) => {
    if (e.target === modalRenameVariant) modalRenameVariant.style.display = "none";
  });

  // Smazání varianty
  btnDeleteVariant.addEventListener("click", () => {
    if (appData.variants.length <= 1) {
      alert("Nemůžete smazat jedinou zbývající variantu rozvrhu.");
      return;
    }

    const active = getActiveVariant();
    if (!active) return;

    if (confirm(`Opravdu chcete smazat celou variantu "${active.name}"?`)) {
      appData.variants = appData.variants.filter(v => v.id !== active.id);
      appData.activeVariantId = appData.variants[0].id;
      persistAndRefresh();
      showToast("Varianta smazána", "info");
    }
  });

  // Přepínač režimu porovnávání
  btnToggleCompare.addEventListener("click", () => {
    if (appData.variants.length < 2) {
      alert("Pro porovnání potřebujete mít vytvořené alespoň dvě varianty rozvrhu. Použijte tlačítko 'Duplikovat' nebo 'Nová varianta'.");
      return;
    }

    isComparing = !isComparing;
    if (isComparing) {
      const active = getActiveVariant();
      const other = appData.variants.find(v => v.id !== active.id);
      compareVariantId = other ? other.id : null;
      showToast("Zapnut režim porovnání variant", "info");
    } else {
      showToast("Režim porovnání ukončen", "info");
    }
    renderAll();
  });

  compareSelect.addEventListener("change", (e) => {
    compareVariantId = e.target.value;
    const overlay = getCompareVariant();
    compareOverlayName.textContent = overlay ? overlay.name : "";
    renderSchedule();
  });

  btnCloseCompare.addEventListener("click", () => {
    isComparing = false;
    renderAll();
  });

  // Otevření tlačítkem "Přidat předmět"
  btnOpenAddModal.addEventListener("click", () => openAddModal());

  // Dropdown menu exportů
  btnExportMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    exportDropdown.parentElement.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    exportDropdown.parentElement.classList.remove("open");
  });

  // Export do kalendáře iCal
  btnExportICal.addEventListener("click", () => {
    const active = getActiveVariant();
    StorageManager.exportToICal(active);
    showToast("Rozvrh exportován do iCal (.ics) s liché/sudé týdny od 28. 9.", "success");
  });

  // Tisk / Uložit PDF
  btnPrintSchedule.addEventListener("click", () => {
    window.print();
  });

  // Export JSON
  btnExportJson.addEventListener("click", () => {
    StorageManager.exportToJson(appData);
    showToast("Záloha rozvrhů (JSON) byla stažena", "success");
  });

  // Import JSON
  fileImportJson.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const importedData = await StorageManager.importFromJson(file);
      appData = importedData;
      persistAndRefresh();
      showToast("Rozvrhy byly úspěšně obnoveny ze zálohy", "success");
    } catch (err) {
      alert(`Chyba při importu: ${err.message}`);
    }
    fileImportJson.value = "";
  });

  // Obnovení ukázkových dat
  btnResetData.addEventListener("click", () => {
    if (confirm("Opravdu chcete obnovit výchozí ukázková data? Vaše současné úpravy budou přepsány.")) {
      appData = StorageManager.resetToSampleData();
      persistAndRefresh();
      showToast("Ukázková data byla obnovena", "info");
    }
  });

  // Přepínání motivu (Dark / Light)
  const currentTheme = StorageManager.loadTheme();
  applyTheme(currentTheme);

  btnThemeToggle.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const nextTheme = activeTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    StorageManager.saveTheme(nextTheme);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const moon = btnThemeToggle.querySelector(".icon-moon");
    const sun = btnThemeToggle.querySelector(".icon-sun");
    if (theme === "light") {
      moon.style.display = "none";
      sun.style.display = "block";
    } else {
      moon.style.display = "block";
      sun.style.display = "none";
    }
  }

  // Klávesové zkratky
  document.addEventListener("keydown", (e) => {
    // ESC pro zavření otevřených oken
    if (e.key === "Escape") {
      closeModal();
      modalRenameVariant.style.display = "none";
      exportDropdown.parentElement.classList.remove("open");
    }
    // N pro přidání hodiny (pokud není otevřený formulář)
    if (e.key === "n" && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openAddModal();
    }
  });

  // Počáteční vykreslení časové osy a celého rozvrhu
  ScheduleEngine.renderTimeHeader(timeHeaderTrack);
  renderAll();
});
