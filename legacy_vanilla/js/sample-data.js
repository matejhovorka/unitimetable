/**
 * Ukázková data s reálnými předměty, paralelkami a sudými/lichými týdny
 * Semestr začíná 28. 9. jako LICHÝ týden
 */

const SAMPLE_SCHEDULE_DATA = {
  variants: [
    {
      id: "var_opt_a",
      name: "Varianta A (Volný pátek ✨)",
      lessons: [
        {
          id: "les_ma1_p",
          code: "B0B01MA1",
          name: "Matematická analýza 1",
          type: "lecture",
          credits: 6,
          color: "#6366f1",
          day: 1, // Pondělí
          startTime: "09:00",
          endTime: "10:30",
          room: "KN:E-301",
          teacher: "doc. RNDr. Pavel Kříž, CSc.",
          note: "Hlavní přednáška",
          week: "both",
          isFixed: true
        },
        {
          id: "les_ma1_c",
          code: "B0B01MA1",
          name: "Matematická analýza 1",
          type: "seminar",
          credits: 0,
          color: "#6366f1",
          day: 1, // Pondělí
          startTime: "11:00",
          endTime: "12:30",
          room: "KN:E-112",
          teacher: "Mgr. Eva Svobodová",
          note: "Cvičení - paralelka 101",
          week: "both",
          isFixed: false
        },
        {
          id: "les_prg_p",
          code: "B0B36PRG",
          name: "Programování v Pythonu",
          type: "lecture",
          credits: 6,
          color: "#10b981",
          day: 2, // Úterý
          startTime: "09:00",
          endTime: "10:30",
          room: "T9:105",
          teacher: "Ing. Martin Dvořák, Ph.D.",
          note: "Přednáškový sál",
          week: "both",
          isFixed: true
        },
        {
          id: "les_prg_l_odd",
          code: "B0B36PRG",
          name: "Programování v Pythonu (Lab)",
          type: "lab",
          credits: 0,
          color: "#10b981",
          day: 2, // Úterý
          startTime: "11:00",
          endTime: "12:30",
          room: "KN:E-220 (Lab)",
          teacher: "Ing. Petr Černý",
          note: "Laboratorní měření — střídání ob týden",
          week: "odd", // Pouze lichý týden (od 28. 9.)
          isFixed: false
        },
        {
          id: "les_dbs_s_even",
          code: "B6B36DBS",
          name: "Databáze — praktikum",
          type: "seminar",
          credits: 0,
          color: "#f59e0b",
          day: 2, // Úterý ve stejném slotu jako Lab v sudém týdnu!
          startTime: "11:00",
          endTime: "12:30",
          room: "T9:350",
          teacher: "Ing. Jakub Blažek",
          note: "SQL praktika — pouze sudé týdny",
          week: "even", // Pouze sudý týden (od 5. 10.)
          isFixed: false
        },
        {
          id: "les_dbs_p",
          code: "B6B36DBS",
          name: "Databázové systémy",
          type: "lecture",
          credits: 5,
          color: "#f59e0b",
          day: 3, // Středa
          startTime: "10:00",
          endTime: "11:30",
          room: "KN:E-301",
          teacher: "prof. Ing. Karel Nový, DrSc.",
          note: "Přednáška",
          week: "both",
          isFixed: true
        },
        {
          id: "les_alg_p",
          code: "B0B01ALG",
          name: "Algoritmy a datové struktury",
          type: "lecture",
          credits: 6,
          color: "#ec4899",
          day: 4, // Čtvrtek
          startTime: "09:00",
          endTime: "10:30",
          room: "T9:107",
          teacher: "doc. Ing. Tomáš Holan, Ph.D.",
          note: "Přednáška",
          week: "both",
          isFixed: true
        },
        {
          id: "les_alg_c",
          code: "B0B01ALG",
          name: "Algoritmy a datové struktury",
          type: "seminar",
          credits: 0,
          color: "#ec4899",
          day: 4, // Čtvrtek
          startTime: "11:00",
          endTime: "12:30",
          room: "KN:E-124",
          teacher: "Mgr. Lukáš Marek",
          note: "Cvičení algoritmizace",
          week: "both",
          isFixed: false
        },
        {
          id: "les_aj_s",
          code: "B0B04AJ2",
          name: "Odborná angličtina pro IT",
          type: "seminar",
          credits: 3,
          color: "#06b6d4",
          day: 4, // Čtvrtek
          startTime: "14:15",
          endTime: "15:45",
          room: "KN:A-410",
          teacher: "PhDr. Sarah Taylor",
          note: "Konverzace a prezentace",
          week: "both",
          isFixed: false
        }
      ]
    },
    {
      id: "var_opt_b",
      name: "Varianta B (Kompaktní ranní 🌅)",
      lessons: [
        {
          id: "les_ma1_p_b",
          code: "B0B01MA1",
          name: "Matematická analýza 1",
          type: "lecture",
          credits: 6,
          color: "#6366f1",
          day: 1,
          startTime: "09:00",
          endTime: "10:30",
          room: "KN:E-301",
          teacher: "doc. RNDr. Pavel Kříž, CSc.",
          note: "Přednáška",
          week: "both",
          isFixed: true
        },
        {
          id: "les_prg_p_b",
          code: "B0B36PRG",
          name: "Programování v Pythonu",
          type: "lecture",
          credits: 6,
          color: "#10b981",
          day: 2,
          startTime: "09:00",
          endTime: "10:30",
          room: "T9:105",
          teacher: "Ing. Martin Dvořák, Ph.D.",
          note: "Přednáška",
          week: "both",
          isFixed: true
        },
        {
          id: "les_dbs_p_b",
          code: "B6B36DBS",
          name: "Databázové systémy",
          type: "lecture",
          credits: 5,
          color: "#f59e0b",
          day: 3,
          startTime: "10:00",
          endTime: "11:30",
          room: "KN:E-301",
          teacher: "prof. Ing. Karel Nový, DrSc.",
          note: "Přednáška",
          week: "both",
          isFixed: true
        },
        {
          id: "les_alg_p_b",
          code: "B0B01ALG",
          name: "Algoritmy a datové struktury",
          type: "lecture",
          credits: 6,
          color: "#ec4899",
          day: 4,
          startTime: "09:00",
          endTime: "10:30",
          room: "T9:107",
          teacher: "doc. Ing. Tomáš Holan, Ph.D.",
          note: "Přednáška",
          week: "both",
          isFixed: true
        },
        {
          id: "les_ma1_c_b",
          code: "B0B01MA1",
          name: "Matematická analýza 1",
          type: "seminar",
          credits: 0,
          color: "#6366f1",
          day: 1,
          startTime: "07:30",
          endTime: "09:00",
          room: "KN:E-112",
          teacher: "Mgr. Eva Svobodová",
          note: "Ranní paralelka",
          week: "both",
          isFixed: false
        },
        {
          id: "les_prg_l_b",
          code: "B0B36PRG",
          name: "Programování v Pythonu",
          type: "lab",
          credits: 0,
          color: "#10b981",
          day: 2,
          startTime: "07:30",
          endTime: "09:00",
          room: "KN:E-220 (Lab)",
          teacher: "Ing. Petr Černý",
          note: "Ranní laboratoř",
          week: "both",
          isFixed: false
        },
        {
          id: "les_aj_s_b",
          code: "B0B04AJ2",
          name: "Odborná angličtina pro IT",
          type: "seminar",
          credits: 3,
          color: "#06b6d4",
          day: 5, // Pátek
          startTime: "09:00",
          endTime: "10:30",
          room: "KN:A-410",
          teacher: "PhDr. Sarah Taylor",
          note: "Páteční ranní blok",
          week: "both",
          isFixed: false
        }
      ]
    },
    {
      id: "var_opt_c",
      name: "Varianta C (Záložní rozvrh)",
      lessons: [
        {
          id: "les_ma1_p_c",
          code: "B0B01MA1",
          name: "Matematická analýza 1",
          type: "lecture",
          credits: 6,
          color: "#6366f1",
          day: 1,
          startTime: "09:00",
          endTime: "10:30",
          room: "KN:E-301",
          teacher: "doc. RNDr. Pavel Kříž, CSc.",
          note: "Přednáška",
          week: "both",
          isFixed: true
        },
        {
          id: "les_prg_p_c",
          code: "B0B36PRG",
          name: "Programování v Pythonu",
          type: "lecture",
          credits: 6,
          color: "#10b981",
          day: 2,
          startTime: "09:00",
          endTime: "10:30",
          room: "T9:105",
          teacher: "Ing. Martin Dvořák, Ph.D.",
          note: "Přednáška",
          week: "both",
          isFixed: true
        },
        {
          id: "les_dbs_p_c",
          code: "B6B36DBS",
          name: "Databázové systémy",
          type: "lecture",
          credits: 5,
          color: "#f59e0b",
          day: 3,
          startTime: "10:00",
          endTime: "11:30",
          room: "KN:E-301",
          teacher: "prof. Ing. Karel Nový, DrSc.",
          note: "Přednáška",
          week: "both",
          isFixed: true
        },
        {
          id: "les_alg_p_c",
          code: "B0B01ALG",
          name: "Algoritmy a datové struktury",
          type: "lecture",
          credits: 6,
          color: "#ec4899",
          day: 4,
          startTime: "09:00",
          endTime: "10:30",
          room: "T9:107",
          teacher: "doc. Ing. Tomáš Holan, Ph.D.",
          note: "Přednáška",
          week: "both",
          isFixed: true
        },
        {
          id: "les_ma1_c_c",
          code: "B0B01MA1",
          name: "Matematická analýza 1",
          type: "seminar",
          credits: 0,
          color: "#6366f1",
          day: 1,
          startTime: "14:30",
          endTime: "16:00",
          room: "KN:E-112",
          teacher: "Mgr. Eva Svobodová",
          note: "Odpolední cvičení",
          week: "both",
          isFixed: false
        }
      ]
    }
  ],
  activeVariantId: "var_opt_a"
};
