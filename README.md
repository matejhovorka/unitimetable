# 🎓 UniTimetable Optimizer

**Inteligentní modelář a optimalizátor studentských rozvrhů s Constraint Satisfaction jádrem a podporou sudých/lichých týdnů.**

[![React 19](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Security: 0 Vulnerabilities](https://img.shields.io/badge/Security-0_Vulnerabilities-brightgreen.svg)](#-bezpečnostní-audit-a-nenapadnutelnost)
[![GDPR: 100% Client--Side](https://img.shields.io/badge/GDPR-100%25_Client--Side-brightgreen.svg)](#-právní-aspekty-a-gdpr)

---

## 📑 Obsah
1. [O projektu](#-o-projektu)
2. [Klíčové vlastnosti](#-klíčové-vlastnosti)
3. [Architektura a technologický stack](#-architektura-a-technologický-stack)
4. [Algoritmus řešiče (CSP Solver & Heuristiky)](#-algoritmus-řešiče-csp-solver--heuristiky)
5. [Uživatelská příručka](#-uživatelská-příručka)
6. [Datové formáty a specifikace](#-datové-formáty-a-specifikace)
7. [Bezpečnostní audit a nenapadnutelnost](#-bezpečnostní-audit-a-nenapadnutelnost)
8. [Právní aspekty a GDPR](#-právní-aspekty-a-gdpr)
9. [Instalace a spuštění](#-instalace-a-spuštění)
10. [Struktura repozitáře](#-struktura-repozitáře)

---

## 🌟 O projektu

**UniTimetable Optimizer** je moderní webová aplikace (SPA) vytvořená pro studenty vysokých škol v České republice a na Slovensku (ČVUT, VUT, MUNI, UK, ZČU, VŠB apod.). 

Každý semestr stojí studenti před stejným problémem: zapsat si 5–8 předmětů, z nichž každý nabízí desítky různých kombinací přednášek, cvičení a laboratorních seminářů. Ruční hledání bezkolizního rozvrhu s volným pátkem nebo bez dlouhých „oken“ trvá hodiny.

Aplikace tento proces automatizuje:
* Uživatel zadá nebo vloží seznam předmětů a jejich nabízených časů (ze schránky nebo ručně).
* Algoritmus s constraint satisfaction jádrem **v řádu milisekund prozkoumá všechny možné kombinace**, odfiltruje tvrdé kolize (včetně střídání sudého a lichého týdne) a seřadí nalezené varianty podle osobních preferencí studenta.
* Výsledek lze přímo exportovat do standardního formátu **iCalendar (`.ics`)** pro Google Kalendář, Apple Kalendář i MS Outlook.

---

## ✨ Klíčové vlastnosti

### 🧩 1. Inteligentní CSP Solver (Constraint Satisfaction Problem)
* **Okamžitá detekce časových kolizí:** Algoritmus hlídá překryvy intervalů a paritu týdnů (slot v sudý týden nekoliduje se slotem v lichý týden).
* **Most Constrained Variable (MRV) heuristika:** Skupiny s nejmenším počtem možností se větví přednostně, což okamžitě ořezává slepé větve stavového prostoru.
* **Ochrana proti Client-Side DoS:** Bezpečnostní limit kroků (`maxSteps = 50 000`) chrání UI vlákno před zamrznutím i při obřích datech.
* **Interaktivní zamykání (Pinning):** Kliknutím na zámek na libovolné hodině se konkrétní paralelka zafixuje a solver okamžitě přefiltruje pouze ty varianty, které tuto volbu obsahují.
* **Vážená skórovací funkce:**
  - 🌟 Bonus za volný pátek a pondělí.
  - ⚡ Nastavitelná penalizace za mezery (okna) mezi hodinami (posuvník váhy 1–5).
  - 🌅 Penalizace za ranní vstávání před 9:00.

### 🧭 2. Uživatelské rozhraní a průvodce
* **Onboarding Wizard (`WelcomeOnboardingModal.tsx`):** Úvodní 3krokový průvodce pro nového návštěvníka (výběr režimu týdnů, nastavení preferencí a volba ukázkových dat vs. čistého startu).
* **Interaktivní tutoriál (`InteractiveTutorial.tsx`):** 4krokový interaktivní walkthrough provázející uživatele zadáváním, výběrem variant, zamykáním a exportem. Kdykoliv znovu spustitelný tlačítkem *Průvodce*.
* **5denní týdenní mřížka (`TimetableGrid.tsx`):** Přehledné vizuální rozvržení Po–Pá od 7:00 do 20:00 s minutovým pozicováním a pastelovým barevným kódováním podle kódu předmětu.
* **Rychlé klávesové zkratky:** Procházení variant pomocí šipek na klávesnici (`←` / `→` nebo `↑` / `↓`).

### 💾 3. Správa dat, koncepty a zálohy
* **100% automatické lokální ukládání:** Veškerý stav se synchronizuje s `localStorage`. Při zavření okna nebo restartu počítače zůstává vše zachováno.
* **Pojmenované koncepty (`DraftsModal.tsx`):** Možnost uložit si rozpracovaný stav jako koncept (např. *„Plán A – volný pátek“*, *„Záložní plán B“*) a okamžitě mezi nimi přepínat.
* **Diskový JSON export/import konceptů:** Uložení rozpracované varianty do `.json` souboru na disk a opětovné načtení na jiném počítači.
* **Univerzální import schránky (`ImportModal.tsx`):** Inteligentní parser tabulek z HTML (Ctrl+C ze studentského informačního systému), TSV, oddělovačů středníků nebo JSONu.

---

## 🏗️ Architektura a technologický stack

Aplikace je navržena jako **100% klientská jednostránková aplikace (Single Page Application — SPA)** bez backendu a serverové databáze.

```text
┌────────────────────────────────────────────────────────┐
│                   Uživatelský prohlížeč                 │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │               React 19 + Tailwind v4             │  │
│  │   Header • PreferencesBar • TimetableGrid • ...  │  │
│  └─────────────────────────┬────────────────────────┘  │
│                            │                           │
│  ┌─────────────────────────▼────────────────────────┐  │
│  │            CSP Solver Engine (solver.ts)         │  │
│  │     MRV Heuristika • Backtracking • Skórování    │  │
│  └─────────────────────────┬────────────────────────┘  │
│                            │                           │
│  ┌─────────────────────────▼────────────────────────┐  │
│  │         Lokální perzistence (localStorage)        │  │
│  │    Surové sloty • Zámky • Koncepty • Preference  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

| Komponenta | Technologie | Důvod volby |
| :--- | :--- | :--- |
| **Framework** | **React 19** | Moderní concurrent rendering, bezpečné escapování textu. |
| **Jazyk** | **TypeScript 6** | Striktní typová kontrola datových struktur slotů a plánů. |
| **Build nástroj** | **Vite 8** | Bleskový Hot Module Replacement (HMR) a optimalizovaný build. |
| **Styling** | **Tailwind CSS v4** | Moderní CSS proměnné, utility-first design, nulový overhead. |
| **Ikony** | **Lucide React** | Vektorové SVG ikony s nízkou stopou a vysokou čitelností. |
| **Efekty** | **canvas-confetti** | Mikronimace konfet při úspěšném exportu do kalendáře. |
| **Linter** | **Oxlint** | Ultrarychlý Rust linter pro dodržování code-style pravidel. |

---

## 🧠 Algoritmus řešiče (CSP Solver & Heuristiky)

Jádro aplikace řeší úlohu **Constraint Satisfaction Problem (CSP)** s ohodnocovací funkcí.

### 1. Definice problému
* **Proměnné $V$:** Každý požadavek na předmět a typ výuky tvoří samostatnou skupinu $G_i$ (např. *BPC-SOS # Přednáška*, *BPC-SOS # Cvičení*).
* **Doména $D_i$:** Množina všech vypsaných termínů (paralelek) pro danou skupinu $G_i$.
* **Tvrdá omezení (Hard Constraints):**
  1. Z každé skupiny $G_i$ musí být vybrán právě jeden slot.
  2. Žádné dva vybrané sloty $s_a, s_b$ se nesmí časově překrývat ve stejný den, pokud mají kolidující paritu týdnů:
     $$\text{Conflict}(s_a, s_b) \iff s_a.\text{day} = s_b.\text{day} \land \text{ParityConflict}(s_a, s_b) \land (s_a.\text{start} < s_b.\text{end} \land s_b.\text{start} < s_a.\text{end})$$
     kde $\text{ParityConflict}(p_1, p_2) \iff p_1 = \text{'all'} \lor p_2 = \text{'all'} \lor p_1 = p_2$.

### 2. Heuristiky a optimalizace
* **Aplikace zámků (Pinning):** Pokud student zamkne konkrétní paralelku, doména příslušné skupiny je zredukována na $|D_i| = 1$.
* **Most Constrained Variable (MRV):** Skupiny se seřadí vzestupně podle počtu dostupných možností $|D_i|$. Skupiny s nejmenším počtem voleb se dosazují jako první, což exponenciálně snižuje počet prozkoumávaných uzlů.
* **Bezpečnostní limit kroků (Client DoS Protection):**
  Algoritmus v rekurzivním backtrackingu inkrementuje čítač `steps`. Pokud počet kroků dosáhne `maxSteps = 50 000`, algoritmus okamžitě ukončí další větvění a vrátí dosud nalezené validní kombinace. Tím je zabráněno zablokování prohlížeče.

### 3. Ohodnocovací funkce (Scoring Function)
Nalezená bezkolizní řešení jsou ohodnocena bázovým skóre $S = 1000$ bodů:
* $+350$ / $+150$ bodů za volný pátek (při aktivní / neaktivní preferenci).
* $+300$ / $+120$ bodů za volné pondělí.
* $+180$ bodů za každý další volný den (út, st, čt).
* $- (\text{celkový čas oken v min} / 15) \times (\text{váha} \times 6)$ bodů za mezery mezi výukou.
* $+150$ bonusových bodů za rozvrh zcela bez mezer (kompaktní bloky).
* $-120$ bodů za každou výuku začínající před 9:00 (pokud je penalizace zapnuta).

---

## 📖 Uživatelská příručka

### 1. První spuštění (Onboarding)
Při první návštěvě aplikace se automaticky zobrazí průvodce:
1. **Představení aplikace:** Stručný přehled funkcí.
2. **Režim semestru:** Volba mezi standardním týdnem (stejná výuka každý týden) a režimem střídání sudého a lichého týdne.
3. **Preference:** Volba preferovaného volného pátku, pondělí, penalizace ranních hodin a váhy oken.
4. **Volba startu:** Možnost začít s čistým rozvrhem nebo vyzkoušet realistická testovací data.

### 2. Zadání hodin do rozvrhu
* **Možnost A — Ruční zadání:** Kliknutím na tlačítko *„Přidat předmět ručně“* se otevře dialog, kde lze vyplnit kód předmětu, název a jednoduše „naklikat“ všechny jeho přednášky i paralelky cvičení.
* **Možnost B — Kopírování z IS (Ctrl+V):** V dialogu *„JSON & Import“* stačí vložit text tabulky zkopírovaný z IS STAG, SIS nebo KOS. Inteligentní parser sám detekuje dny, časy, místnosti i vyučující.
* **Možnost C — Kliknutí do mřížky:** Kliknutím na libovolný prázdný časový slot v mřížce rozvrhu se otevře rychlá tvorba hodiny pro daný den a čas.

### 3. Práce s variantami a zamykání (Pinning)
* Levý boční panel zobrazuje všechny nalezené bezkolizní rozvrhy seřazené podle skóre.
* Přepínat mezi nimi lze kliknutím nebo **šipkami na klávesnici** (`←` / `→`).
* Pokud se vám v rozvrhu líbí konkrétní cvičení v úterý, klikněte na jeho **ikonu zámku** 🔒. Solver zafixuje tuto volbu a okamžitě přefiltruje všechny varianty tak, aby tuto hodinu zachovaly.

### 4. Export do kalendáře (.ics)
* Kliknutím na zelené tlačítko *„Export .ICS“* v záhlaví se vygeneruje standardní kalendářový soubor RFC 5545.
* Soubor obsahuje správně nastavená pravidla opakování na 14 týdnů semestru (`RRULE`), zohledňuje sudé i liché týdny a vyplňuje název, místnost i vyučujícího.
* Soubor stačí otevřít v Google Kalendáři, Apple Kalendáři nebo MS Outlooku.

---

## 📦 Datové formáty a specifikace

### Model jednoho vyučovacího slotu (`LessonSlot`)
```typescript
interface LessonSlot {
  id: string;               // Unikátní identifikátor slotu
  courseCode: string;       // např. "BPC-SOS"
  courseName?: string;      // např. "Operační systémy"
  type: 'lecture' | 'exercise' | 'seminar' | 'other';
  day: 'PO' | 'UT' | 'ST' | 'CT' | 'PA';
  startTime: string;        // "HH:MM", např. "08:00"
  endTime: string;          // "HH:MM", např. "09:50"
  startMinutes: number;     // minuty od půlnoci (např. 480)
  endMinutes: number;       // minuty od půlnoci (např. 590)
  parity: 'all' | 'even' | 'odd'; // Každý týden / sudý / lichý
  room?: string;            // např. "C302 Linux Lab"
  teacher?: string;         // např. "Ing. Veselý"
  color?: string;           // hex kód pastelové barvy (např. "#3b82f6")
}
```

### Formát diskové zálohy (`ScheduleBackup`)
```json
{
  "version": 1,
  "exportedAt": "2026-10-13T18:00:00.000Z",
  "name": "Můj rozvrh - ZS 2026",
  "slots": [ ... ],
  "pinnedIds": [ ... ],
  "preferences": {
    "preferFreeFriday": true,
    "preferFreeMonday": false,
    "earlyMorningPenalty": true,
    "minimizeGapsWeight": 3,
    "weekMode": "even-odd"
  }
}
```

---

## 🔒 Bezpečnostní audit a nenapadnutelnost

V říjnu 2026 byl proveden kompletní bezpečnostní a zranitelnostní audit:

| Hrozba / Zranitelnost | Stav v aplikaci | Opatření a implementace |
| :--- | :---: | :--- |
| **SQL Injection / RCE na serveru** | 🛡️ Irelevantní | Aplikace nemá žádný backendový server ani SQL databázi. Běží výhradně v prohlížeči. |
| **Cross-Site Scripting (XSS)** | 🛡️ Chráněno | V projektu se nevyskytuje žádný `dangerouslySetInnerHTML`, `eval()` ani manipulace s `innerHTML`. React automaticky ošetřuje JSX výstupy. |
| **DOM Clobbering / Parsery** | 🛡️ Chráněno | `parseHtmlTable` parsuje vstupy v inertním dokumentu `DOMParser` a čte pouze bezpečné `.textContent`. |
| **Client-Side DoS (zamrznutí)** | 🛡️ Chráněno | CSP backtracking je limitován čítačem `maxSteps = 50 000`. Ani při abnormálním vstupu nedojde k pádu prohlížeče. |
| **CRLF Injection v iCalendaru** | 🛡️ Chráněno | Funkce `sanitizeIcsText` filtruje znaky nového řádku `\r` a `\n` z uživatelských textů před vložením do `.ics`. |
| **Závislosti (npm dependencies)** | 🛡️ Čisté | Příkaz `npm audit` hlásí **0 zranitelností**. Použity jsou minimální, prověřené open-source balíčky. |

---

## ⚖️ Právní aspekty a GDPR

### 1. Ochrana osobních údajů (GDPR — Nařízení EU 2016/679)
* **Zpracování na straně klienta:** Veškerá data o rozvrhu, zapsaných předmětech a jménech vyučujících jsou uložena výhradně v `localStorage` na počítači studenta.
* **Nulový přenos na cizí servery:** Aplikace neodesílá žádné síťové požadavky (`fetch`, `xhr`, `websocket`) na servery provozovatele ani třetích stran.
* **Výjimka pro osobní potřebu:** Na zpracování dat studentem pro vlastní organizaci studia se vztahuje výjimka pro osobní účely dle **čl. 2 odst. 2 písm. c) GDPR**.
* **Nulové sledovací cookies:** Web nepoužívá žádné analytické, reklamní ani profilovací soubory cookies (žádný Google Analytics, Meta Pixel ani reklamní sítě). **Zákonná cookie lišta proto není vyžadována.**
* **GDPR ochrana fontů:** Aplikace nenačítá fonty ze vzdálených serverů Google (`fonts.googleapis.com`), čímž předchází porušení GDPR z titulu nepovoleného předávání IP adres uživatelů do třetích zemí. Používá nativní systémový font stack.

### 2. Autorská práva a školní informační systémy
* Aplikace **neprovádí žádný automatizovaný web scraping** a neobchází autentizaci školních portálů.
* Data do aplikace vkládá student ze svého oprávněného přístupu přes schránku (Ctrl+C / Ctrl+V). Přenášení rozvrhu pro vlastní studijní účely spadá pod zákonnou licenci pro osobní užití v souladu s autorským zákonem ČR.

### 3. Vyloučení odpovědnosti (Disclaimer)
V aplikaci je v patičce i v dedikovaném dialogu [`LegalModal.tsx`](file:///Users/matejhovorka/Library/Mobile%20Documents/com~apple~CloudDocs/!vibecoding/rozvrh/src/components/LegalModal.tsx) implementována právní doložka o zřeknutí se odpovědnosti:
> *UniTimetable Optimizer je nezávislá studentská pomůcka a není oficiální aplikací žádné vysoké školy. Generované kombinace rozvrhů mají výhradně doporučující a informativní charakter. Autor nenese žádnou odpovědnost za případné nepřesnosti, kolize ani zmeškanou výuku. Závazným zdrojem zůstává vždy oficiální informační systém vaší univerzity.*

---

## 🚀 Instalace a spuštění

### Požadavky
* [Node.js](https://nodejs.org/) v18 nebo vyšší
* npm v9 nebo vyšší

### Postup instalace

```bash
# 1. Klonování repozitáře nebo přechod do složky projektu
cd rozvrh

# 2. Instalace závislostí
npm install

# 3. Spuštění lokálního vývojového serveru
npm run dev
```

Vývojový server se spustí na adrese `http://localhost:5173/`.

### Produkční sestavení (Build)

```bash
# Kontrola typů a sestavení produkčního balíčku do složky /dist
npm run build

# Lokální náhled produkčního sestavení
npm run preview

# Spuštění linteru
npm run lint
```

Výsledná složka `dist/` obsahuje pouze statické HTML, CSS a JS soubory, které lze okamžitě nahrát na libovolný statický hosting (GitHub Pages, Vercel, Netlify, Cloudflare Pages apod.).

---

## 📁 Struktura repozitáře

```text
├── index.html                   # Vstupní HTML šablona (bez externích trackerů a fontů)
├── package.json                 # Závislosti a skripty projektu
├── tsconfig.json                # Nastavení TypeScript kompilátoru
├── vite.config.ts               # Konfigurace Vite bundleru
├── public/                      # Statické soubory (ikony, favicon, logo)
└── src/
    ├── App.tsx                  # Hlavní řídicí komponenta aplikace a stavové toky
    ├── main.tsx                 # Vstupní bod React aplikace
    ├── index.css                # Globální styly, Tailwind v4 a systémový font stack
    ├── types/
    │   └── types.ts             # Definice TypeScript rozhraní (LessonSlot, SchedulePlan, ...)
    ├── hooks/
    │   └── useLocalStorage.ts   # Vlastní React hook pro reaktivní perzistenci v localStorage
    ├── utils/
    │   ├── colors.ts            # Generování konzistentních pastelových barev z kódu předmětu
    │   ├── exportIcs.ts         # RFC 5545 iCalendar generátor se sanitizací textu
    │   ├── sampleData.ts        # Realistická testovací univerzitní data s paralelkami
    │   ├── scheduleParser.ts    # Robustní HTML tabulkový, TSV a regexový parser schránky
    │   └── solver.ts            # CSP backtracking solver s MRV heuristikou a pojistkou kroků
    └── components/
        ├── Header.tsx           # Horní lišta s akcemi, statistikami, soukromím a exportem
        ├── Footer.tsx           # Spodní patička s právními informacemi a licencí
        ├── PreferencesBar.tsx   # Ovládací lišta preferencí (volné dny, váha mezer, ranní hodiny)
        ├── TimetableGrid.tsx    # Vizuální týdenní mřížka 7:00–20:00 s minutovým pozicováním
        ├── VariantsSidebar.tsx  # Boční panel se seznamem všech bezkolizních variant
        ├── SlotCard.tsx         # Karta vyučovací hodiny se zámkem (pinning)
        ├── SlotEditModal.tsx    # Dialog pro rychlou úpravu nebo smazání hodiny
        ├── ManualAddModal.tsx   # Dialog pro ruční vytvoření předmětu a všech jeho paralelek
        ├── DraftsModal.tsx      # Správa rozpracovaných konceptů a export na disk
        ├── ImportModal.tsx      # Dialog pro vložení rozvrhu ze schránky nebo JSONu
        ├── WelcomeOnboardingModal.tsx # 3krokový úvodní průvodce nastavením
        ├── InteractiveTutorial.tsx    # 4krokový průchozí tutoriál funkcemi rozvrháře
        └── LegalModal.tsx       # Právní informace, ochrana soukromí (GDPR) a disclaimer
```

---

## 📜 Licence

Projekt je šířen pod svobodnou licencí **MIT License**. Můžete jej volně používat, modifikovat i šířit. Podrobnosti naleznete v licenčních ujednáních.
# unitimetable
