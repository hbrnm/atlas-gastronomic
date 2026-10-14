# ATLAS GASTRONOMIC — PHASE 005-A
## IMPLEMENTATION RECOMMENDATIONS & HUMAN APPROVAL REQUEST

**Protocol:** Atlas AOS  
**Authority:** Product Owner  
**Phase:** 005-A (Culinary Quality & Baseline Audit)  
**Status:** Recommendations Only — AUDIT STAGE (Awaiting Human Authorization)  
**Strict Prohibition:** No recipe modifications, no schema changes, no code execution, and no Git commits prior to explicit Product Owner approval.

---

## 1. Context & Scope of Recommendations

Auditul culinar riguros efectuat în Faza 005-A pe cele 5 rețete canonice ale Atlas Gastronomic a demonstrat o fidelitate gastronomică și tehnică excepțională pentru primele 4 rețete (`Tagliatelle al Ragù`, `Risotto alla Milanese`, `Boeuf Bourguignon`, `Soufflé au Fromage`).

A fost identificat un pachet de defecte concrete de integritate a datelor concentrat în rețeta **Sarmale Tradiționale în Foi de Varză Murată** (`rec_sarmale_traditionale_012`), provenit din redactarea accelerată din Faza 004, alături de optimizări minore de alocare a untului în `Boeuf Bourguignon` și clarificări de scalare practică.

Toate corecțiile propuse respectă următoarele principii nenegociabile:
1. **Zero modificări de schemă:** Nicio structură de date, tabel sau tip TypeScript nu este alterat. Toate remediile utilizează câmpurile existente în modelul Recipe Core V2.
2. **Zero fabulație:** Fiecare cantitate și pas tehnic este susținut direct de literatura canonică (Sanda Marin 1936, Radu Anton Roman 1998, Escoffier 1921).
3. **Păstrarea completă a testelor existente:** Modificările sunt pur aditive și corective la nivel de conținut de date și nu alterează contractul API.

---

## 2. Prioritized Implementation Recommendations

---

### PRIORITATEA 1 (CRITICĂ) — FIND-005A-01: Lichidul de fierbere pentru Sarmale
- **Rețetă:** `rec_sarmale_traditionale_012` (`src/shared/additional-recipes.ts`)
- **Problema:** Pasul 5 solicită turnarea a 500–600 ml apă caldă peste sarmale, dar ingredientul lipsește din tabelul `ingredients`.
- **Propunere de remediere:**
  - Adăugarea în `ingredients` a elementului:
    ```typescript
    {
      id: 'ing_sm_10',
      ingredient_id: 'apa-calda',
      name: 'Apă caldă (sau zeamă de varză diluată cu apă)',
      quantity: 600,
      unit: 'ml',
      preparation: null,
      group: 'Sos & Lichid',
      optional: false,
      notes: 'Lichid fierbinte pentru acoperirea sarmalelor pe durata celor 3 ore de fierbere la cuptor',
      sequence_order: 10,
    }
    ```
  - Legarea referinței `apa-calda` în `ingredient_refs` la Pasul 5.

---

### PRIORITATEA 2 (MAJORĂ) — FIND-005A-03: Pas tehnologic de pregătire a verzei murate
- **Rețetă:** `rec_sarmale_traditionale_012` (`src/shared/additional-recipes.ts`)
- **Problema:** Rețeta sare direct de la călirea cepei la rularea sarmalelor, omițând pasul obligatoriu de verificare a salinității, desărare și curățare a nervurilor lemnoase.
- **Propunere de remediere:**
  - Inserarea unui pas operațional dedicat între călirea orezului și rulare:
    - **ID:** `step_sm_pregatire_varza_02` (renumerotare secvențială la 7 pași)
    - **Instrucțiune:** *„Desfaceți căpățâna de varză murată și alegeți frunzele subțiri și elastice. Gustați o bucățică de varză: dacă este excesiv de sărată sau acră, lăsați foile într-un lighean cu apă călduță timp de 20-30 de minute pentru desărare, apoi scurgeți-le bine. Îndepărtați cu un cuțit ascuțit nervura principală groasă și porționați foile mari în bucăți de circa 12x15 cm. Tocați fideluță cotoarele și foile rupte pentru patul oalei.”*
    - **Durată:** 15 minute (activ 15 min).
    - **Dependență:** `depends_on: []` (poate rula în paralel cu călirea cepei).

---

### PRIORITATEA 3 (MAJORĂ) — FIND-005A-02: Alocarea metrică precisă a pastei de tomate
- **Rețetă:** `rec_sarmale_traditionale_012` (`src/shared/additional-recipes.ts`)
- **Problema:** `pasta-tomate` (70 g) este împărțită vag („2 linguri” în umplutură, „restul” în sos).
- **Propunere de remediere:**
  - Încorporarea alocărilor metrice V2 explicite:
    - Pasul 2 (omogenizare umplutură): `30 g` pastă de tomate.
    - Pasul de fierbere lentă: `40 g` pastă de tomate (dizolvată în cei 600 ml apă caldă).

---

### PRIORITATEA 4 (MINORĂ) — FIND-005A-04: Ingrediente opționale de servire la Sarmale
- **Rețetă:** `rec_sarmale_traditionale_012` (`src/shared/additional-recipes.ts`)
- **Problema:** Mămăliga, smântâna și ardeiul iute sunt cerute în pasul de servire, dar lipsesc din ingrediente.
- **Propunere de remediere:**
  - Adăugarea în `ingredients` cu statut `optional: true` și `group: 'Servire Tradițională'`:
    - `smantana-fermentata` — 200 g (smântână grasă 30% grăsime).
    - `ardei-iute` — 4 bucăți proaspete.
    - `malai` — 250 g (făină de porumb pentru mămăligă caldă).

---

### PRIORITATEA 5 (MINORĂ) — FIND-005A-06: Structurarea tranșelor de unt la Boeuf Bourguignon
- **Rețetă:** `rec_boeuf_bourguignon_003` (`src/shared/sample-data.ts`)
- **Problema:** Untul utilizat la garnituri și la finisarea sosului (*monter au beurre*) este declarat agregat.
- **Propunere de remediere:**
  - Fracționarea semantică a untului în ingrediente:
    - `ing_bb_unt_glacare`: 20 g unt (glacare cepe perlate).
    - `ing_bb_unt_ciuperci`: 30 g unt (sotare ciuperci).
    - `ing_bb_unt_finisare`: 30 g unt rece (monter au beurre).

---

### PRIORITATEA 6 (OBSERVAȚII EDITORIALE & SCALARE)
- **Note de ghidaj în `editorial_notes`:**
  - Adăugarea unei note practice la `Tagliatelle al Ragù` pentru scalarea la 2 porții: *„La prepararea a 2 porții (1,33 ouă), bateți 2 ouă întregi cu furculița și cântăriți exact 73 g de ou bătut pentru 133 g făină, păstrând restul de ou pentru altă utilizare.”*
  - Adăugarea unei note practice la `Boeuf Bourguignon` pentru scalarea la 2 porții: *„La prepararea a 2 porții de vită înăbușită, folosiți o cocotte de diametru redus (18–20 cm) și mențineți un volum minim de lichid de 500 ml pentru a preveni evaporarea completă pe durata celor 2,5 ore de coacere.”*
  - Adăugarea unei note practice la `Risotto alla Milanese`: *„Pentru 25 g măduvă curată sunt necesare 1–2 rondele de os de vită cu măduvă de la măcelărie (circa 150 g os brut).”*

---

## 3. Human Approval Gate — Next Step

Conform protocolului **Strict Rigor / Human Approval**:
- Nicio linie de cod de producție sau rețetă nu a fost modificată în Faza 005-A.
- Rapoartele 005-A au fost generate și salvate în `docs/architecture/phase-5/`.

### Solicitare adresată Product Owner-ului:
> **Se solicită aprobarea formală a recomandărilor prioritare (Prioritățile 1–6) pentru a autoriza demararea Fazei 005-B / 005-C (corectarea conținutului rețetei de Sarmale și a notelor editoriale de scalare).**
