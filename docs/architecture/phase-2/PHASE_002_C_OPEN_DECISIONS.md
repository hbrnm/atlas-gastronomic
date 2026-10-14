# ATLAS GASTRONOMIC — PHASE 002-C
# REGISTRUL DECIZIILOR DESCHISE PENTRU ARBITRAJ PRODUCT OWNER — REV 1.4
## RECIPE CORE EVOLUTION & ARCHITECTURE TRADE-OFFS

**Protocol:** Atlas AOS  
**Etapă:** Phase 002-C — Recipe Core Evolution Strategy & Architecture Decision  
**Autoritate:** Product Owner — DOCUMENTATION EXECUTION ONLY  
**Statut:** REGISTRU DE ARBITRAJ STRATEGIC (OPEN FOR PO DECISION)  
**Versiune:** Rev 1.4 (Coordinated Document Revision — Rigor & Coherence)  
**Baseline HEAD:** `dc8dd75395049a9599ecbde83fa5015a6f07190e`  
**Standarde Canonice:** `standards/v1.0.0/` — FROZEN / IMMUTABLE  

---

## 1. PREAMBUL ȘI SCOPUL REGISTRULUI

Prezentul document consemnează deciziile de arhitectură, compromisurile de design (*trade-offs*) și dilemele strategice care **depășesc competența autonomă a agentului de dezvoltare** și necesită arbitrajul formal al Product Owner-ului înainte de autorizarea oricărei etape viitoare de implementare (Faza 002-D).

Fiecare decizie este formulată cu opțiuni mutual exclusive clar definite, impact estimat, analiză de compromis și o recomandare tehnică argumentată. **Toate deciziile rămân deschise (`OPEN`), nicio opțiune nefiind adoptată automat.**

---

## 2. LISTA DECIZIILOR DESCHISE PENTRU ARBITRAJ PO

```
┌────────────────────────────────────────────────────────────────────────┐
│             Registrul Celor Șapte Decizii Deschise                     │
├────────┬───────────────────────────────────────────────────────────────┤
│ OD-01  │ Nivelul de Formalism Matematic în Modelarea Pașilor           │
│ OD-02  │ Stabilirea Namespace-ului Canonic de Schemă ($id / OQ-002)    │
│ OD-03  │ Alinierea Câmpurilor Canonice Omise (claims, review)          │
│ OD-04  │ Nivelul de Severitate în Validarea Semantică a Timpilor       │
│ OD-05  │ Rigoarea Matematică a Bilanțului la Alocarea Ingredientelor   │
│ OD-06  │ Granularitatea Ferestrei de Servire (Calitativ vs. Secunde)   │
│ OD-07  │ Prioritizarea și Secvențierea Extinderilor V2 (Faza 002-D)   │
└────────┴───────────────────────────────────────────────────────────────┘
```

---

### OD-01: Nivelul de Formalism Matematic în Modelarea Pașilor și Concurrenței

* **Context și Alternative Evaluate:** În Strategie (Secțiunea 3) și ADR-0011 au fost evaluate comparativ toate cele șase modele teoretice posibile:
  - *Alternativa 0 (Status-quo V1 / Baseline):* Menținerea listei plate neschimbate (opțiunea de non-acțiune).
  - *Alternativa 1 (Convenție Editorială în Text):* Marcarea pistelor prin prefixe sau taguri text în instrucțiuni fără modificări de schemă.
  - *Alternativa 2 (Piste Explicite — Tracks / Swimlanes):* Structurare pe coloane paralele la nivel de pas (`track: string | null`).
  - *Alternativa 3 (Ierarhie Operațiuni / Containere):* Împărțirea rețetei în containere de nivel 1 (`operations: Operation[]`) cu sub-pași.
  - *Alternativa 4 (Model Hibrid — Secvență + Dependențe Opționale):* Numerotare secvențială nativă + identificatori stabili + `depends_on`.
  - *Alternativa 5 (Graf Aciclic Dirijat Complet — DAG Pur):* Eliminarea numerotării secvențiale, pașii fiind noduri libere legate strict prin muchii cauzale.

* **Explicarea Alternativelor Excluse din Opțiunile Principale de Recomandare:**
  - *Alternativa 1* este respinsă ca soluție structurală deoarece lasă calculul duratei căii critice și randarea coloanelor paralele la latitudinea interpretării nestructurate de text (fragilă computațional).
  - *Alternativa 3* este respinsă pentru nucleul primar deoarece rupe structura plată a tabelei `recipe_steps`, impunând o imbricare ierarhică ce adaugă complexitate artificială disproporționată la rețetele simple monovoltine (ex: *Risotto*).
  - *Alternativa 5 (DAG Pur)* este respinsă ca model de autorat primar deoarece eliminarea ordinii secvențiale impune un canvas grafic de noduri și muchii, generând o curbă abruptă de învățare și o rezistență masivă la adopție din partea redactorilor culinari. În plus, un DAG matematic oferă doar constrângeri de precedență topologică sub ipoteza resurselor infinite, fără a rezolva automat planificarea resurselor din bucătărie (atenția bucătarului, numărul de ochiuri de plită sau cuptoare).

* **Opțiuni Supuse Arbitrajului PO (Grupate pe Direcții Structurale):**
  - **Opțiunea 1 (Menținerea Modelelor Non-Structurale — Baseline / Text):** Păstrarea Alternativei 0 (V1 pur) sau adoptarea Alternativei 1 (convenție stilistică în text), fără nicio modificare structurală de bază de date sau schemă.
  - **Opțiunea 2 (Piste Vizuale Explicite — Alternativa 2):** Adăugarea simplă a atributului opțional `track: string | null` pe pas. Pașii sunt afișați pe coloane paralele în UI. La rețetele V1 ingerate, `track` rămâne `null` (fără pistă).
    * *Avantaje:* Ușurință maximă pentru redactori; UI intuitiv pe coloane.
    * *Dezavantaje:* Nu permite declararea dependențelor cauzale punctuale între ramuri diferite (ex: punctul exact unde pista de ciuperci se varsă în sos).
  - **Opțiunea 3 (Ierarhie Operațiuni / Containere — Alternativa 3):** Structurarea pe containere de nivel 1 (`operations: Operation[]`) cu sub-pași.
    * *Avantaje:* Excelent pentru cărți de bucate și rețete mari modulare.
    * *Dezavantaje:* Rupe compatibilitatea plată a tabelei `recipe_steps`; complică nejustificat rețetele simple.
  - **Opțiunea 4 (Model Hibrid — Alternativa 4):** Menținerea `step_number` ca ordine implicită, adăugarea `step_id: string` salvat persistent și a câmpului opțional `depends_on: string[] | null`.
    * *Semantica Relațiilor de Dependență:*
      - `depends_on` absent (`undefined` în JSON V1): succesiune narativă implicită ($N$ depinde de $N-1$ la runtime). Nu se materializează artificial în V1.
      - `depends_on: null`: echivalent semantic cu absent (nespecificat / secvențial implicit).
      - `depends_on: []`: pas independent ($T=0$, start ramură paralelă).
      - `depends_on: ["step_id"]`: dependență cauzală explicită / convergență de ramuri.
    * *Identitate și Stabilitate (`step_id`):*
      - Generare deterministă la prima salvare: `${recipe_id}_step_${step_number}`.
      - Persistență imutabilă în baza de date cu `UNIQUE(recipe_id, step_id)`. Reordonarea sau editarea textului nu alterează `step_id`.
      - Detectare cicluri: algoritmul DFS/Kahn returnează `ERR_CYCLIC_DEPENDENCY`.
      - Referințe invalide sau ștergeri: referințele către ID-uri inexistente sau ștergerea unui pas referit generează `ERR_DANGLING_STEP_REFERENCE`, blocând salvarea invalidă.
    * *Diferențiere DAG vs. Planificare Reală:* Graful de precedență determină doar ordinea topologică și calea critică matematică sub resurse infinite, fără a pretinde că generează automat orarul complet al bucătarului.
    * *Avantaje:* Rigoare topologică completă, conservă compatibilitatea structurală și experiența de lectură liniară.
    * *Dezavantaje:* Necesită instrumente asistive în UI pentru a preveni tastarea manuală a ID-urilor.
  - **Opțiunea 5 (Graf Aciclic Dirijat Complet — Alternativa 5):** Eliminarea numerotării secvențiale; pașii sunt noduri independente într-un DAG pur.
    * *Avantaje:* Rigoare formală matematică absolută.
    * *Dezavantaje:* Rupe compatibilitatea structurală cu V1; impune un efort cognitiv excesiv autorilor culinari și necesită editare pe canvas grafic.

* **Recomandare tehnică:** **Opțiunea 4 (Model Hibrid)**, asistat de o interfață vizuală intuitivă pentru selecția dependențelor.

---

### OD-02: Stabilirea Namespace-ului Canonic de Schemă (`$id` / Închiderea OQ-002)

* **Context:** În prezent, schema JSON canonică utilizează identificatorul provizoriu `https://atlas-gastronomic.local/schemas/recipe.schema.json`. Fișierul `project-memory/OPEN_QUESTIONS.md` menține întrebarea deschisă OQ-002 privind domeniul public stabil.
* **Opțiuni Supuse Arbitrajului PO:**
  - **Opțiunea A (Domeniu GitHub Raw / Pages):** Utilizarea adresei stabile din repository-ul GitHub (ex: `https://raw.githubusercontent.com/hbrnm/atlas-gastronomic/main/standards/v1.0.0/schemas/recipe.schema.json`).
  - **Opțiunea B (Domeniu Public Dedicat de Proiect):** Înregistrarea unui domeniu web canonic (ex: `https://schema.atlas-gastronomic.org/v1/recipe.json`).
  - **Opțiunea C (Menținerea URI-ului Abstract .local):** Păstrarea namespace-ului intern `.local` până la o decizie viitoare de publicare open-source.
* **Recomandare tehnică:** **Opțiunea B** dacă proiectul deține sau intenționează înregistrarea unui domeniu web dedicat, sau **Opțiunea A** dacă repository-ul GitHub este sursa publică primară de adevăr.

---

### OD-03: Alinierea Câmpurilor Canonice Omise (`claims`, `review`, `nutrition_estimate`)

* **Context:** Schema JSON canonică V1 conține structura `claims: Claim[]` (cu niveluri de încredere pe patru trepte: `documented`, `widely_attested`, `editorial_interpretation`, `uncertain`), dar această structură lipsește din interfața TypeScript `Recipe` din `src/shared/types.ts` și nu este expusă în UI-ul React.
* **Sursa Primară de Adevăr vs. Proiecția Structurată:**
  - Dosarele Markdown (`DOSSIER_*.md`) constituie sursa istorică, narativă și editorială primară de adevăr.
  - Schema JSON și baza de date SQLite reprezintă proiecția computațională derivată pentru indexare, căutare și randare.
  - În documentele V1 existente, câmpurile `claims`, `review` și `nutrition_estimate` sunt **omise / neînregistrate (`undefined`)**, nu un array vid afirmativ (`[]`). Omiterea reflectă starea istorică de fapt că analiza formală de atestare nu a fost încă structurată digital pentru acele rețete.
* **Opțiuni Supuse Arbitrajului PO:**
  - **Opțiunea A (Aliniere Structurală în Proiecția V2):** Adăugarea câmpurilor opționale în `types.ts`, extinderea tabelei SQLite `recipes` cu coloane serializate JSON (`claims_json`, `review_json`, `nutrition_json`) și includerea unui panou opțional în UI.
  - **Opțiunea B (Menținerea Deducerii Exclusiv din Dosare Markdown):** Dovezile și nivelurile de încredere rămân consemnate exclusiv în documentele Markdown (`DOSSIER_*.md`), lăsând baza de date orientată doar pe execuția culinară.
* **Recomandare tehnică:** **Opțiunea A**, deoarece trasabilitatea afirmațiilor istorice este un diferențiator strategic fundamental asumat în identitatea proiectului Atlas.

---

### OD-04: Nivelul de Severitate în Validarea Semantică a Timpilor

* **Context:** La rețetele paralele, suma aritmetică a duratelor pașilor depășește durata pe calea critică (ex: la *Boeuf*, $150 + 25 + 15 + \dots = 280\text{ min}$, în timp ce `total_minutes` este 240). De asemenea, pauzele de maturare multi-zile necesită decuplare semantică (`lead_time_hours` vs `total_minutes`). Dacă datele temporale ale pașilor sunt incomplete, calea critică nu poate fi derivată automat și sistemul trebuie să utilizeze ca fallback durata editorială declarată.
* **Opțiuni Supuse Arbitrajului PO:**
  - **Opțiunea A (Avertisment Editorial Ne-blocant — Warning):** Dacă suma depășește timpul total sau există discrepanțe cu calea critică, se emite un avertisment informativ în panoul de validare (`WARN_TIMING_DISCREPANCY`), dar salvarea rețetei este permisă.
  - **Opțiunea B (Eroare Blocantă de Schemă — Error):** Rețeta nu poate fi salvată dacă `total_minutes` nu este matematic egal cu lungimea căii critice calculate din dependențe.
* **Recomandare tehnică:** **Opțiunea A (Avertisment Ne-blocant)**. În arta culinară există timpi elastici și marje de toleranță dependente de abilitatea bucătarului și de echipamente; o eroare blocantă ar bloca salvarea ciornelor și fluxul natural de redactare.

---

### OD-05: Rigoarea Matematică a Bilanțului la Alocarea Ingredientelor (`quantity_used_in_step`)

* **Context:** Dacă un ingredient este alocat parțial pe mai mulți pași (ex: untul de 60g distribuit la glacare, sotare și sos), se pune problema rigorii cu care motorul de validare verifică egalitatea dintre suma alocărilor și cantitatea din inventar.
* **Separare Conceptuală Fundamentală:**
  - Alocarea cantitativă pe pas (`quantity_used_in_step`) este distinctă de fracționarea fizică a produselor compozite (`component: "yolk" | "white"`), pierderile de curățare/fasonare și rezervele de siguranță de atelier.
  - Valoarea `null` sau absența câmpului `quantity_used_in_step` semnifică **alocare cantitativă nespecificată la pas**, nu consumul automat al întregului stoc din inventar.
  - Se elimină orice prag procentual arbitrar rigid (ex: 10%).
* **Opțiuni Supuse Arbitrajului PO:**
  - **Opțiunea A (Bilanț Matematic Strict 100%):** Suma cantităților alocate pe pași trebuie să fie exact egală cu cantitatea totală declarată în inventar. Orice diferență generează eroare blocantă.
  - **Opțiunea B (Bilanț Elastic cu Toleranțe de Atelier):** Se permite ca suma alocărilor pe pași să difere de inventarul global, admițând ajustări de gust (*quanto basta*), pierderi la fasonare sau rezerve de finisare. Motorul de validare emite doar avertismente informative ne-blocante la discrepanțe majore evidente.
* **Recomandare tehnică:** **Opțiunea B (Bilanț Elastic)**. Bucătăria de atelier funcționează cu ajustări senzoriale de gust și rezerve tehnice de finisare.

---

### OD-06: Granularitatea Ferestrei de Servire (Calitativ vs. Secunde)

* **Context:** *Soufflé-ul* prezintă o fereastră optimă de servire convențională de 120–180 secunde post-cuptor. Alte preparate au toleranțe de câteva minute sau sunt complet flexibile. Se disting trei concepte fizico-chimice și operaționale:
  1. *Fereastra optimă de servire:* intervalul în care proprietățile termice și textura sunt la apogeu senzorial.
  2. *Limita operațională de servire:* momentul maxim până la care preparatul este acceptabil din punct de vedere gastronomic.
  3. *Pragul experimental de degradare fizică:* colapsul mecanic documentat prin teste de laborator.
* **Opțiuni Supuse Arbitrajului PO:**
  - **Opțiunea A (Clasificare Calitativă Enum):** Un singur câmp pe rețetă: `service_urgency: "immediate" | "moderate" | "flexible"`.
  - **Opțiunea B (Obiect Numeric Structurat):** Câmp opțional `service_window` cu durată optimă în secunde (`optimal_seconds`) și limită operațională (`operational_limit_seconds`), declanșate de un eveniment ancoră (`anchor_event: "oven_exit" | "heat_off"`).
  - **Opțiunea C (Model Hibrid):** Clasificare calitativă recomandată pentru toate rețetele, completată opțional de o fereastră numerică în secunde exclusiv la preparatele cu urgență critică.
* **Recomandare tehnică:** **Opțiunea C (Model Hibrid)**. Oferă simplitate pentru majoritatea rețetelor și precizie sporită pentru preparatele sensibile termodinamic.

---

### OD-07: Prioritizarea și Secvențierea Extinderilor V2 (Faza 002-D)

* **Context:** Trecerea la faza viitoare de implementare necesită stabilirea unui calendar de execuție modular. **Secvențierea extinderilor depinde direct de decizia Product Owner-ului asupra OD-01 .. OD-06 și a integrării taxonomiei cu patru categorii de riscuri:**
  1. `Culinary Quality Warning` (`warning_type: "culinary_quality"`)
  2. `Irreversible Process Risk` (`warning_type: "irreversible_risk"`)
  3. `Food Safety Warning` (`warning_type: "food_safety"`)
  4. `Formal HACCP Critical Control Point` (`warning_type: "haccp_ccp"`)

* **Opțiuni de Secvențiere Supuse Arbitrajului PO:**
  - **Dacă PO selectează Piste Explicite (OD-01 Opțiunea 2):**
    * *Etapa MVP V2:*
      - Alinierea tipurilor canonice omise (`claims`, `review`, `nutrition_estimate`).
      - Introducerea atributului opțional `track: string | null` pe pas.
      - Alocarea ingredientelor pe pas (`quantity_used_in_step: number | null`, `unit: string | null`).
      - Taxonomia de riscuri cu cele patru categorii tipizate pe pas.
    * *Etapa Full V2:*
      - Fereastră de servire structurată (`service_window`).
      - Modelare termică structurată (ținte de echipament, suprafață și produs).
      - Timp calendaristic de sesiune / maturare (`lead_time_hours`).
  - **Dacă PO selectează Modelul Hibrid (OD-01 Opțiunea 4):**
    * *Etapa MVP V2:*
      - Alinierea tipurilor canonice omise (`claims`, `review`, `nutrition_estimate`).
      - Generarea și persistența identificatorilor stabili `step_id: string`.
      - Suport structural opțional pentru `depends_on: string[] | null` cu validare de cicluri și referințe dangling.
      - Alocarea ingredientelor pe pas (`quantity_used_in_step`, `unit`).
      - Taxonomia de riscuri cu cele patru categorii tipizate pe pas.
    * *Etapa Full V2:*
      - Calcul asistat automat al căii critice din graful de dependențe cu fallback pe durata editorială.
      - Fereastră de servire structurată (`service_window`).
      - Modelare termică structurată pe trei puncte de măsurare și trei tipuri de constrângere.
      - Timp calendaristic de sesiune / maturare (`lead_time_hours`).
  - **Dacă PO selectează Menținerea Modelului V1 Non-Structural (OD-01 Opțiunea 1):**
    * *Etapa MVP V2:* Exclusiv alinierea tipurilor TypeScript omise (`claims`, `review`, `nutrition_estimate`) și convenții de documentare ghidate stilistic.
* **Recomandare tehnică:** Adoptarea unei secvențieri în două etape (MVP urmat de facilități avansate), calibrată exact pe modelul de operațiuni arbitrat de PO în OD-01 și susținută de suita completă a celor 6 probe de compatibilitate empirică.

---

## 3. CONCLUZIE ȘI SOLICITARE DE ARBITRAJ FORMAL

Acest registru oferă Product Owner-ului toate elementele de decizie tehnică și culinară necesare pentru a tranșa viitorul arhitectural al nucleului Recipe Core.

Nicio linie de cod nu va fi scrisă, nicio schemă nu va fi modificată și nicio decizie nu va fi considerată adoptată înainte de primirea deciziilor formale ale Product Owner-ului asupra punctelor OD-01 .. OD-07.
