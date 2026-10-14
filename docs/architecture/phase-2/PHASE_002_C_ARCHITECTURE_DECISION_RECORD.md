# ATLAS GASTRONOMIC — PHASE 002-C
# ARCHITECTURE DECISION RECORDS (ADR-0011 .. ADR-0016) — REV 1.4
## RECIPE CORE V2 CANDIDATE DECISION AREAS

**Protocol:** Atlas AOS  
**Etapă:** Phase 002-C — Recipe Core Evolution Strategy & Architecture Decision  
**Autoritate:** Product Owner — DOCUMENTATION EXECUTION ONLY  
**Statut General:** STRICT PROPOSED (Teme de Analiză și Decizie pentru Arbitraj PO)  
**Versiune:** Rev 1.4 (Coordinated Document Revision — Rigor & Coherence)  
**Baseline HEAD:** `dc8dd75395049a9599ecbde83fa5015a6f07190e`  
**Standarde Canonice:** `standards/v1.0.0/` — FROZEN / IMMUTABLE  

---

## REGISTRU DECIZII PROPUSE PENTRU ARBITRAJ PO

| ID ADR | Titlu Decizie Candidat | Domeniu Tehnic | Alternative Evaluate | Statut |
| :--- | :--- | :--- | :---: | :---: |
| **ADR-0011** | Modelarea Operațiunilor, Concurrenței și Relațiilor de Dependență | Structură Pași & Flux Execuție | 6 alternative | `proposed` |
| **ADR-0012** | Alocarea Cantitativă a Ingredientelor și Punctele de Consum | Legătură Pas-Ingredient & Inventar | 4 alternative | `proposed` |
| **ADR-0013** | Structura Modelului Temporal (Sesiuni, Repaus și Cale Critică) | Metadate Timing & Planificare | 4 alternative | `proposed` |
| **ADR-0014** | Modelarea Ferestrei de Servire și a Urgenței Termice | Sincronizare la Masă & Calitate | 4 alternative | `proposed` |
| **ADR-0015** | Reprezentarea Constrângerilor Termice (Punct Măsurare, Unitate, Rang) | Parametri Fizici & Calitate | 3 alternative | `proposed` |
| **ADR-0016** | Tratarea Riscurilor Tehnice Ireversibile (Taxonomie pe 4 Niveluri) | Control Calitate & Siguranță | 4 alternative | `proposed` |

---

## ADR-0011: MODELAREA OPERAȚIUNILOR, CONCURRENȚEI ȘI RELAȚIILOR DE DEPENDENȚĂ

### 1. Context și Problemă Culinară
În rețetele auditate (în special *Boeuf Bourguignon* — TEST 003 și *Tagliatelle al Ragù* — TEST 001), execuția practică nu este un fir narativ strict secvențial. În timp ce carnea de vită se înăbușă la cuptor timp de cca. 150 de minute, bucătarul glasează cepele perlate pe plită (25 min) și sotează ciupercile de Paris (15 min). În V1, array-ul plat `steps: RecipeStep[]` forțează compactarea artificială a acestor operațiuni, ascunzând faptul că garniturile pot fi pregătite oricând în intervalul pasiv al cărnii.

### 2. Alternative Evaluate

#### Alternativa 0: Status-quo Recipe Core V1 (Menținerea Listei Plate)
* **Descriere:** Păstrarea array-ului plat `steps: RecipeStep[]` indexat strict `step_number: 1..N`. Concurrența este descrisă informal în textul instrucțiunilor.
* **Justificare culinară:** Simplitate maximă; rețetele simple monovoltine (ex: omletă, salate) nu necesită reprezentare de paralelism.
* **Implicații Editorial UX:** Efort minim de autorat pentru redactor. Totuși, bucătarul trebuie să citească întreaga rețetă în avans pentru a deduce sincronizarea.
* **Costuri estimate:** Cost tehnic 0; cost de migrare 0; complexitate nulă.
* **Dezavantaje:** Imposibilitatea calculării căii critice și a generării de cronometre sincronizate în UI.

#### Alternativa 1: Convenție Editorială în Text (Fără Modificare de Schemă)
* **Descriere:** Păstrarea schemei V1; autorul marchează pistele paralele prin etichete convenite în text (ex: `[Pistă: Garnituri]`).
* **Justificare culinară:** Permite separarea vizuală a secțiunilor fără a altera baza de date.
* **Implicații Editorial UX:** Flexibilitate stilistică; nu impune completarea de metadate structurate.
* **Costuri estimate:** Cost tehnic 0; ghid de redactare actualizat.
* **Dezavantaje:** Sistemul software rămâne opac la structură; nu se pot genera componente grafice paralele automate.

#### Alternativa 2: Piste Explicite de Lucru (*Swimlanes / Tracks*)
* **Descriere:** Adăugarea unui atribut opțional la nivel de pas: `track: string | null` (ex: `"baza-carne"`, `"garnituri"`). Pașii din aceeași pistă sunt secvențiali, iar pistele diferite sunt considerate paralele în mod implicit.
* **Regulă de migrare V1:** Pentru rețetele V1 existente, câmpul `track` **rămâne strict `null` (fără pistă definită)**. Nu se injectează o pistă implicită de tip `"main"`.
* **Justificare culinară:** Reflectă organizarea pe posturi de lucru din bucătărie.
* **Implicații Editorial UX:** Foarte intuitiv pentru redactor; direct mapabil pe vizualizarea în coloane paralele în UI.
* **Costuri estimate:** Cost tehnic redus (1 coloană nouă opțională în tabela SQLite `recipe_steps`).
* **Dezavantaje:** Dificultate la modelarea dependențelor punctuale complexe între pași din piste diferite.

#### Alternativa 3: Ierarhie Operațiuni / Containere (*Macro-operations & Sub-steps*)
* **Descriere:** Structurarea rețetei ca o listă de containere de operațiuni (`operations: Operation[]`), fiecare având propriii sub-pași.
* **Justificare culinară:** Potrivit pentru cărți de bucate structurate pe capitole interne (ex: Sos, Garnitură, Asamblare).
* **Implicații Editorial UX:** Adaugă o barieră de redactare pentru rețetele scurte; necesită interfețe imbricate în UI.
* **Costuri estimate:** Cost tehnic mediu-ridicat; modifică structura plată a tabelei `recipe_steps`.
* **Dezavantaje:** Complexitate structurală crescută și incompatibilitate cu consumatorii V1 ce așteaptă un array plat.

#### Alternativa 4: Model Hibrid (Secvență Liniară + Dependențe Explicite Opționale)
* **Descriere:** Menținerea ordinii editoriale `step_number: 1..N` ca secvență de lectură canonică, cu adăugarea unui identificator stabil per pas (`step_id: string`) și a câmpului opțional de dependențe de execuție (`depends_on: string[] | null`).
* **Separarea ordinii editoriale de dependențele cauzale:**
  - `step_number` controlează ordinea vizuală de afișare;
  - `depends_on` controlează graful cauzal de execuție. Reordonarea pașilor schimbă doar `step_number`, fără a afecta relațiile dintre pași.
* **Semantica stărilor câmpului `depends_on`:**
  - *Câmp absent (`undefined`):* În documentele V1, succesiunea este **interpretată implicit la runtime** (pasul $N$ depinde de pasul $N-1$). **NU este materializată ca referințe explicite în fișierele V1**, protejând imutabilitatea acestora.
  - *Valoare `null`:* Explicit nespecificat; la runtime are același efect ca absența (succesiune secvențială implicită $N-1$).
  - *Array vid (`[]`):* Pas independent / rădăcină paralelă (*fork*); demarează la $T=0$.
  - *Array cu identificatori (`["step_1", "step_2"]`):* Dependență cauzală directă sau convergență de ramuri.
* **Identitatea și persistența identificatorilor `step_id`:**
  - *Generare inițială:* La ingestia unui pas V1 fără `step_id`, acesta este generat **deterministic** (ex: `${recipe_id}_step_${step_number}`).
  - *Persistență:* `step_id` este stocat persistent în SQLite cu constrângere `UNIQUE(recipe_id, step_id)`. Odată salvat, devine imutabil.
  - *Referințe inexistente:* Respinse la salvare cu `ERR_INVALID_STEP_REFERENCE`.
  - *Cicluri:* Detectate deterministic via DFS $\rightarrow$ `ERR_CYCLIC_DEPENDENCY`.
  - *Ștergerea unui pas referit:* Blocată la salvare sau marcată prin `ERR_DANGLING_STEP_REFERENCE`.
* **Cale critică vs. Planificarea resurselor:** Calea critică matematică reprezintă durata minimă teoretică cu resurse nelimitate. Planificarea resurselor (*Resource Scheduling*) ia în considerare constrângerile fizice reale (atenția bucătarului, plite, cuptoare).

#### Alternativa 5: Graf Aciclic Dirijat Complet (DAG Pur Fără Secvență)
* **Descriere:** Eliminarea completă a proprietății `step_number`. Fiecare pas este un nod independent conectat exclusiv prin arce de dependență.
* **Clarificare de limitare:** Un DAG nu oferă automat o planificare completă a activității din bucătărie. El oferă doar constrângeri parțiale de precedență; alocarea resurselor finite necesită un motor separat de scheduling.
* **Puncte forte:** Rigoare matematică formală.
* **Limitări culinare:** Barieră masivă de autorat pentru redactori; impune canvas grafic; incompatibilitate structurală majoră cu V1.

### 3. Recomandare Tehnico-Editorială și Statut
* **Recomandare:** Modelul Hibrid (Alternativa 4) oferă cel mai bun echilibru între conservarea simplității narative și capabilitatea de calcul topologic. Alternativa 2 (Piste) rămâne o opțiune viabilă pentru simplitate vizuală.
* **Statut:** `proposed` (rămâne deschis pentru arbitrajul PO).

---

## ADR-0012: ALOCAREA CANTITATIVĂ A INGREDIENTELOR ȘI PUNCTELE DE CONSUM

### 1. Context și Problemă Culinară
În *Soufflé*, ouăle achiziționate întregi sunt separate fizic: gălbenușurile emulsionează baza caldă de béchamel, iar albușurile formează spuma bătută la rece. În *Boeuf Bourguignon*, 60g de unt sunt consumate în trei pași separați. În V1, tabela `step_ingredient_refs` stochează doar asocierea `(step_id, ingredient_id)`, forțând menționarea cantității parțiale exclusiv în textul narativ.

### 2. Alternative Evaluate

#### Alternativa 0: Status-quo Recipe Core V1
* **Descriere:** Asociere exclusivă la nivel de identificator; cantitatea parțială utilizată la pas rămâne text liber în instrucțiune.
* **Cost tehnic:** 0.

#### Alternativa 1: Duplicarea intrărilor de ingredient în inventarul rețetei
* **Descriere:** Declararea a trei intrări distincte în inventar: `unt (glacare): 20g`, `unt (ciuperci): 25g`, `unt (sos): 15g`.
* **Dezavantaje:** Lista de cumpărături devine fragmentată și confuză pentru utilizator.

#### Alternativa 2: Alocare Cantitativă per Pas (`quantity_used_in_step`)
* **Descriere:** Extinderea tabelei `step_ingredient_refs` cu coloane opționale: `quantity_used_in_step: number | null` și `unit: string | null`. Pentru fracționarea fizică a produselor compozite (ouă), se poate include un sub-rol: `component: string | null` (ex: `"galbenus"`, `"albus"`).
* **Semantica valorii `null`:** Dacă `quantity_used_in_step` este `null` sau omis, această valoare reprezintă o **alocare cantitativă nespecificată structural la nivel de pas** (cantitatea fiind ghidată textual în instrucțiune sau ajustată la gust), **fără a se presupune automat că s-a consumat întreaga cantitate din inventar**.
* **Separare conceptuală:** Alocarea cantitativă per pas este decuplată de:
  - *Fracționarea fizică* a produselor în componente diferite;
  - *Pierderile de fasonare / curățare* (diferența brut vs. net);
  - *Rezervele culinare* (porții păstrate pentru finisare sau subțiere sos);
  - *Sub-rețetele autonome*.
* **Bilanț de masă:** Nu se presupune că toate cantitățile alocate trebuie să însumeze exact inventarul. Validarea folosește reguli euristice documentate (avertisment ne-blocant doar la depășirea inventarului; admiterea rezervelor culinare și a ajustărilor *quanto basta*).
* **Costuri estimate:** Cost tehnic redus; modificare aditivă non-destructivă în baza de date.

#### Alternativa 3: Model de Sub-Rețete / Componente Autonome
* **Descriere:** Împărțirea rețetei în blocuri complet distincte (ex: Componenta „Garnitură de cepe”), fiecare cu ingredientele sale proprii.
* **Costuri estimate:** Cost tehnic ridicat; adecvat în special pentru rețete compozite complexe (ex: *Tagliatelle al Ragù*).

### 3. Recomandare Tehnico-Editorială și Statut
* **Recomandare:** Alternativa 2 (`quantity_used_in_step`) rezolvă curat alocarea fără a fragmenta lista de inventar.
* **Statut:** `proposed` (rămâne deschis pentru arbitrajul PO).

---

## ADR-0013: STRUCTURA MODELULUI TEMPORAL (SESIUNI, REPAUS ȘI CALE CRITICĂ)

### 1. Context și Problemă Culinară
*Boeuf Bourguignon* beneficiază de o maturare de cca. 24h la rece (J+1) pentru difuzia aromelor și degresare facilă. În V1, introducerea celor 24h denaturează `total_minutes` la 28 de ore continue. De asemenea, calea critică matematică diferă de planificarea efectivă a resurselor dintr-o bucătărie reală.

### 2. Alternative Evaluate

#### Alternativa 0: Status-quo Recipe Core V1
* **Descriere:** Stocarea a două numere scalare agregate introduse manual: `active_minutes` și `total_minutes`.
* **Dezavantaje:** În prezența paralelismului sau a maturării multi-zile, relația dintre duratele pașilor și total devine ambiguă.

#### Alternativa 1: Câmpuri Agregate Suplimentare (Fără Sesiuni Complexe)
* **Descriere:** Păstrarea duratelor scalare, dar adăugarea de atribute opționale:
  - `resting_minutes: number | null` (timp de repaus pasiv scurt, ex: relaxare gluten);
  - `lead_time_hours: number | null` (intervalul calendaristic total de la debutul primei operațiuni până la servire, incluzând maturarea peste noapte).
* **Decuplare semantică:** `lead_time_hours` măsoară timpul calendaristic scurs, în timp ce `total_minutes` continuă să măsoare timpul efectiv continuu de procesare termică și activă.
* **Cost tehnic:** Minim (2 coloane noi opționale).

#### Alternativa 2: Model Multi-Sesiune Explicit
* **Descriere:** Adăugarea pe fiecare pas a unui atribut de sesiune: `session_id: string | null` sau `day_number: number | null` (ex: Pasul 1–6: Ziua 1; Pasul 7–10: Ziua 2).
* **Justificare culinară:** Indică explicit bucătarului momentele recomandate de întrerupere peste noapte.

#### Alternativa 3: Derivare Automată Exclusivă din Relațiile de Dependență
* **Descriere:** Eliminarea câmpurilor agregate manuale; `total_minutes` este derivat automat din calea critică a grafului.
* **Distincție esențială:** Calea critică matematică arată durata minimă teoretică presupunând resurse nelimitate. **Planificarea resurselor (*Resource Scheduling*)** ia în calcul faptul că un singur bucătar nu poate efectua concomitent două operațiuni ce cer atenție manuală continuă.

### 3. Recomandare Tehnico-Editorială și Statut
* **Recomandare:** Combinarea Alternativei 1 (`lead_time_hours`, `resting_minutes`) cu etichetarea opțională de sesiune (Alternativa 2), menținând calculul căii critice ca asistență orientativă pentru autor.
* **Statut:** `proposed` (rămâne deschis pentru arbitrajul PO).

---

## ADR-0014: MODELAREA FERESTREI DE SERVIRE ȘI A URGENȚEI TERMICE

### 1. Context și Problemă Culinară
*Soufflé au fromage* își pierde volumul prin răcirea aerului și condensarea aburului post-cuptor. *Risotto* suferă retrogradarea rapidă a amidonului dacă nu este servit în 3–5 minute de la mantecatura. V1 nu deține niciun concept formal pentru momentul servirii.

### 2. Alternative Evaluate

#### Alternativa 0: Status-quo Recipe Core V1
* **Descriere:** Instrucțiunea de servire rămâne text liber în ultimul pas procedural.

#### Alternativa 1: Convenție Editorială în Note
* **Descriere:** Standardizarea unei rubrici „Servire și Degustare” în `editorial_notes`.

#### Alternativa 2: Clasificare Calitativă de Urgență
* **Descriere:** Câmp enum opțional pe rețetă: `service_urgency: "immediate" | "moderate" | "flexible"`.

#### Alternativa 3: Obiect Structurat Fereastră de Servire (Cele Trei Niveluri)
* **Descriere:** Câmp opțional `service_window`:
  - `anchor_event: "oven_exit" | "heat_off" | "plating"`;
  - `optimal_duration_seconds: number` (fereastra optimă de degustare calitativă);
  - `operational_limit_seconds: number | null` (limita practică de servire la masă înainte de degradare vizibilă).
* **Decuplare științifică:** Pragul experimental de degradare fizico-chimică (măsurat în laborator) rămâne consemnat în dosarul de cercetare ca fundament științific, fără a fi impus ca o constrângere mecanică rigidă în schema de date.

### 3. Recomandare Tehnico-Editorială și Statut
* **Recomandare:** Alternativa 2 (clasificare calitativă) pentru rețete generale, completată opțional cu Alternativa 3 (fereastră structurată) pentru preparatele de înaltă sensibilitate termică.
* **Statut:** `proposed` (rămâne deschis pentru arbitrajul PO).

---

## ADR-0015: REPREZENTAREA CONSTRÂNGERILOR TERMICE (PUNCT MĂSURARE, UNITATE, RANG)

### 1. Context și Problemă Culinară
În V1, `temperature_c` este un scalar pasiv. În *Soufflé*, cuptorul cere o temperatură ambiantă de cca. 190°C static, iar baza de béchamel cere răcire sub pragul de coagulare a gălbenușului. În *Boeuf*, lichidul este menținut în intervalul optim de dizolvare a colagenului (88–92°C).

### 2. Alternative Evaluate

#### Alternativa 0: Status-quo Recipe Core V1
* **Descriere:** Menținerea câmpului pasiv `temperature_c: number | null` utilizat pentru reglajul cuptorului/echipamentului.

#### Alternativa 1: Ghidaj Editorial în `success_cue`
* **Descriere:** Includerea temperaturii de produs în descriptorul senzorial (ex: `success_cue: "Compoziția este călduță la deget (<55°C), nu opărește gălbenușul"`).

#### Alternativa 2: Modelare Termică Semantică Structurată (Opțională)
* **Descriere:** Introducerea unei structuri modulare pe pas:
  - `measurement_point: "equipment_ambient" | "surface" | "core_product"`;
  - `temperature_value: number | null` și `temperature_unit: "C" | "F"` (implicit `"C"`);
  - `operator: "exact" | "below" | "above" | "range"`;
  - `range_min: number | null` și `range_max: number | null`;
  - `constraint_type: "technological_target" | "quality_threshold" | "safety_threshold"`.
* **Țintă Tehnologică vs. Limită de Calitate vs. Siguranță:**
  - *Recomandare Tehnologică:* orientativă de proces (ex: 88–92°C freamăt braisage);
  - *Limită de Calitate:* optim organoleptic (ex: servire caldă >60°C);
  - *Limită de Siguranță:* barieră sanitară imperativă (ex: răcire rapidă supă <10°C).
* **Caracter neobligatoriu:** Toate aceste atribute sunt strict opționale.

### 3. Recomandare Tehnico-Editorială și Statut
* **Recomandare:** Păstrarea `temperature_c` pentru compatibilitate cu echipamentele existente, permițând opțional introducerea unui obiect de barieră termică pe produs la pașii relevanți.
* **Statut:** `proposed` (rămâne deschis pentru arbitrajul PO).

---

## ADR-0016: TRATAREA RISCURILOR TEHNICE IREVERSIBILE (TAXONOMIE PE 4 NIVELURI)

### 1. Context și Problemă Culinară
Anumite erori de execuție produc defecte structurale ireversibile (separarea grăsimii în risotto, lichefierea spumei de albuș, contractarea violentă a fibrelor musculare la clocot). De asemenea, dinamica ingredientelor include transformări de fază și artefacte intermediare.

### 2. Alternative Evaluate

#### Alternativa 0: Status-quo Recipe Core V1
* **Descriere:** Toți pașii au aceeași greutate vizuală; avertismentele sunt scrise cu litere aldine sau majuscule în textul narativ.

#### Alternativa 1: Convenție Editorială Asistată de Validare
* **Descriere:** Marcaje standardizate în textul instrucțiunii (ex: `> [!WARNING] ...`) recunoscute de parserul UI și afișate ca panou grafic (*Callout*).

#### Alternativa 2: Avertisment Structurat pe Taxonomie Riguroasă
* **Descriere:** Câmp opțional structurat pe pas: `warning_type: "culinary_quality" | "irreversible_risk" | "food_safety" | "haccp_ccp"` și `warning_message: string | null`.
* **Diferențiere semantică clară:**
  1. *Culinary Quality Warning:* Atenționare tehnică de atelier (ex: foc mic, reducere atentă);
  2. *Irreversible Process Risk:* Risc de degradare structurală ireversibilă (ex: sos tăiat, albuș contaminat cu lipide);
  3. *Food Safety Warning:* Reguli igienico-sanitare esențiale pentru atelier și mediul domestic (ex: răcire rapidă stock, manipulare carne crudă);
  4. *Formal HACCP CCP:* Procedură industrială reglementată legislativ (pasteurizare cu acțiune corectivă documentată).
* **Regulă:** Nu se folosește un câmp generic `quality_warning` ca substitut pentru toate categoriile, iar avertismentele sanitare nu sunt excluse din model.

#### Alternativa 3: Cadru Formal HACCP / Punct Critic de Control
* **Descriere:** Structură completă dedicată bucătăriilor profesionale reglementate: `hazard_type`, `critical_limit`, `monitoring_procedure`, `corrective_action`.
* **Evaluare neutră:** Esențial pentru unități de producție industrială și catering colectiv; mai puțin adecvat pentru gastronomia de autor și utilizarea domestică, unde poate deveni o povară birocratică.
* **Evaluare artefacte și tranziții de fază:** Modelarea formală a stărilor fizico-chimice este amânată pentru a menține nucleul suplu, dar **nu este exclusă conceptual** pentru extensii viitoare.

### 3. Recomandare Tehnico-Editorială și Statut
* **Recomandare:** Alternativa 2 (Avertisment Structurat pe Taxonomie Riguroasă) oferă beneficiul vizual și de validare necesar fără a încărca procesul editorial.
* **Statut:** `proposed` (rămâne deschis pentru arbitrajul PO).
