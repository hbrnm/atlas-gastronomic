# ATLAS GASTRONOMIC — PHASE 002-C
# STRATEGIA DE EVOLUȚIE A NUCLEULUI RECIPE CORE (V1 → V2) — REV 1.4

**Protocol:** Atlas AOS  
**Etapă:** Phase 002-C — Recipe Core Evolution Strategy & Architecture Decision  
**Autoritate:** Product Owner — DOCUMENTATION EXECUTION ONLY  
**Statut:** RECOMANDARE STRATEGICĂ DE ARHITECTURĂ (PROPOSED)  
**Versiune:** Rev 1.4 (Coordinated Document Revision — Rigor & Coherence)  
**Baseline HEAD:** `dc8dd75395049a9599ecbde83fa5015a6f07190e`  
**Standarde Canonice:** `standards/v1.0.0/` — FROZEN / IMMUTABLE  

---

## 1. MANDAT STRATEGIC, CONTEXT EMPIRIC ȘI FILOSOFIE EDITORIALĂ

### 1.1 Mandat și Scop Strategic
Prezenta strategie formulează direcția de evoluție arhitecturală pentru *Recipe Core*, nucleul de modelare a cunoașterii gastronomice din platforma Atlas Gastronomic. Faza 002-C este o etapă strategică și analitică de arhitectură, nu o etapă de implementare de cod. Mandatul său constă în:
1. Valorificarea concluziilor empirice din cele patru preparate de referință testate canonic în fazele 001, 002-A și 002-B;
2. Evaluarea neutră și comparativă a limitărilor demonstrate ale specificației Recipe Core V1;
3. Formularea de opțiuni riguroase de extindere structurală fără a altera sau invalida standardele înghețate (`standards/v1.0.0/`);
4. Tratarea ipotezelor de compatibilitate retroactivă drept cerințe tehnice ce trebuie demonstrate empiric prin teste în etapele ulterioare de implementare, fără a le prezenta ca fiind deja atinse;
5. Asigurarea unui echilibru durabil între formalismul informatic și eficiența redactării culinare.

### 1.2 Baza Empirică de Fapte (Cele Patru Preparate de Referință)
Strategia este fundamentată pe constatările documentate în dosarele de cercetare:
* **TEST 001 — Tagliatelle al Ragù alla Bolognese (`DOSSIER_001`):** Preparat compozit clasic bazat pe două cicluri paralele majore (fierberea de lungă durată a ragù-ului canonic AIC 1982/2023 și frământarea/laminarea aluatului proaspăt de ou și făină conform măsurii de aur notariale CCIAA Bologna 1972). A evidențiat că modelul secvențial V1 comprimă operațiunile simultane într-un șir liniar unic și nu distinge raportul dintre timpul activ și cel pasiv.
* **TEST 002 — Risotto alla Milanese (`DOSSIER_002`):** Preparat monovoltin de precizie hidrică și termodinamică (De.Co. Comune di Milano 2007). A evidențiat absența din V1 a bilanțului dinamic de lichide (evaporare vs. absorbție/reținere bulion) și necesitatea unei bariere termice de oprire a focului înainte de *mantecatura* pentru a preveni separarea grăsimilor.
* **TEST 003 — Boeuf Bourguignon (`DOSSIER_003`):** Ragu canonic de lungă durată (Escoffier 1921, Child 1961, Bocuse 1976) desfășurat pe trei piste simultane (braisage carne la cuptor timp de cca. 150 min, glacare cepe perlate 25 min, sotare ciuperci 15 min), completat de o maturare recomandată de cca. 24h la rece (J+1). A confirmat că însumarea naivă a duratelor pașilor paralele denaturează durata totală (suma aritmetică dă 280 min față de cca. 240 min pe secvența critică) și că modelul V1 nu poate reprezenta pauzele de proces peste noapte fără a distorsiona durata continuă de gătire.
* **TEST 004 — Soufflé au Fromage (`DOSSIER_004`):** Preparat clasic de fizică culinară aplicată (Carême 1815, Escoffier 1921, Montagné 1938, McGee 2004, This 1993/1995). A evidențiat cerința de separare fizică a albușului de gălbenuș, sensibilitatea la contaminarea cu lipide, recomandarea de răcire a bazei de béchamel sub pragul de coagulare a gălbenușurilor și existența unei ferestre operaționale convenționale de servire la masă post-cuptor.

> **Clarificare Epistemologică:** Pragurile cantitative observate în laborator (cum ar fi pragul de 55°C pentru emulsionarea gălbenușurilor sau degradarea volumului unui soufflé după 120–180 secunde) descriu fenomene fizico-chimice documentate experimental în condiții controlate și servesc drept repere metodice de atelier, nu drept legi universale rigide aplicabile identic în orice context culinar domestic sau profesional.

### 1.3 Filosofia Arhitecturală: „Editorial-First”
Principiul călăuzitor al evoluției Recipe Core este: **„Complexitatea tehnică a sistemului nu trebuie transferată asupra redactorului culinar.”**
* Un model de date formal exhaustiv, dar care impune autorului completarea de rețele de noduri, matrice de dependență abstracte sau protocoale industriale de control, ar crea o barieră de adopție incompatibilă cu misiunea editorială a proiectului.
* Redactorii și autorii culinari operează cu etape logice de atelier, secțiuni de preparat și indici calitativi observabili. Sistemul software trebuie să preia sarcina deducerilor analitice, oferind interfețe intuitive, tolerante și asistive.

---

## 2. MATRICEA DE REZOLVARE: CONVENȚIE EDITORIALĂ VS. VALIDARE VS. EXTENSIE STRUCTURALĂ

Pentru a preveni supraîncărcarea schemei de date, fiecare provocare identificată este mapată pe cel mai suplu nivel funcțional capabil să o rezolve:

```
┌────────────────────────────────────────────────────────────────────────┐
│             Nivelurile de Rezolvare a Cerințelor Culinare              │
├────────────────────────────────────────────────────────────────────────┤
│ Strat 1: Convenție Editorială (Ghid de stil în dosare, text liber)     │
│ Strat 2: Motor de Validare (Avertismente euristice ne-blocante)        │
│ Strat 3: Extensie Structurală Opțională (Câmpuri noi în Schema V2)     │
│ Strat 4: Separare de Domeniu / Amânare Arhitecturală                   │
└────────────────────────────────────────────────────────────────────────┘
```

| Cerință / Provocare Culinară | Strat de Rezolvare | Justificare și Mecanism Tehnic Asignat |
| :--- | :---: | :--- |
| **Moduri de Eșec (*Failure Modes*)** | **Strat 1: Convenție Editorială** | Fenomenele calitative de defect (calotă asimetrică, sos tăiat, orez cleios) sunt nuanțate descriptiv; aparțin dosarului de cercetare și ghidului de depanare tehnică, nu tabelelor relaționale. |
| **Ghidaj de Remediere și Salvare** | **Strat 1: Convenție Editorială** | Procedurile de salvare a unui preparat (ex: adăugare lingură apă rece în sos separat) sunt sfaturi didactice textuale incluse în note sau instrucțiuni. |
| **Taxonomia Riscurilor Culinare** | **Strat 2 + Strat 3** | Structură tipizată (`warning_type: "culinary_quality" \| "irreversible_risk" \| "food_safety" \| "haccp_ccp"`), permițând semnalizarea vizuală și validarea specifică fără confuzie terminologică. |
| **Discrepanțe Temporale Evidente** | **Strat 2: Motor de Validare** | Reguli ne-blocante documentate în `validation.ts` care avertizează la discrepanțe clare (ex: timp activ declarat mai mare decât timpul total), fără a bloca salvarea. |
| **Piste Paralele de Lucru** | **Strat 3: Extensie Structurală** | Câmp opțional `track: string \| null` sau `depends_on: string[] \| null` pentru a permite calcularea căii critice și afișarea pe coloane sincronizate. |
| **Alocarea Cantitativă per Pas** | **Strat 3: Extensie Structurală** | Extinderea relației dintre pași și ingrediente cu `quantity_used_in_step: number \| null` și `unit: string \| null`. |
| **Fereastră de Servire la Masă** | **Strat 3: Extensie Structurală** | Obiect opțional `service_window` cu ancoră declanșatoare (`oven_exit`, `heat_off`) și intervale optime/operaționale distincte. |
| **Maturare Calendaristică (Zile)** | **Strat 3: Extensie Structurală** | Atribut opțional de sesiune sau timp calendaristic (`lead_time_hours: number \| null`) pentru a decupla timpul de așteptare de timpul de gătire continuă. |
| **Artefacte Intermediare & Schimbări de Fază** | **Strat 4: Amânare Arhitecturală** | Modelarea formală a stărilor fizico-chimice este amânată pentru a evita supradimensionarea timpurie a nucleului V2, dar **nu este exclusă conceptual** pentru ontologii viitoare avansate. |
| **Gestiune Stocuri / Deșeuri Comerciale** | **Strat 4: Separare de Domeniu** | Contabilitatea pierderilor comerciale la scară industrială, evidența resturilor de depozit sau gestiunea cămării aparțin sistemelor ERP/WMS și nu fac parte din scopul Recipe Core. |

---

## 3. EVALUAREA COMPARATIVĂ A CELOR ȘASE MODELE DE OPERAȚIUNI ȘI CONCURRENȚĂ

Cele șase opțiuni identificate sunt evaluate în mod neutru, fără a asuma o decizie adoptată:

```
  Model 1: Liniar Plat V1              Model 2: Convenție Editorială
  [Pas 1] -> [Pas 2] -> [Pas 3]        [Pas 1] -> [=== Pista B ===] -> [Pas 2]

  Model 3: Piste Explicite (Tracks)    Model 4: Ierarhie Operațiuni
  Track A: [1] -> [2] ──┐              Op. 1: Ragù (Pași 1.1, 1.2, 1.3)
  Track B: [3] -> [4] ──┴─> [Asamblare] Op. 2: Aluat (Pași 2.1, 2.2)

  Model 5: Secvență + Dep. Opționale   Model 6: Graf DAG Pur
  [Pas 1] (depends_on: [])             (Nod A) ───> (Nod C)
  [Pas 2] (depends_on: ["pas-1"])      (Nod B) ───┘
```

### 3.1 Descrierea Tehnică a celor Șase Modele

1. **Modelul 1 — Secvențial Plat (Status-quo Recipe Core V1):**
   - *Mecanism:* Toți pașii sunt stocați într-un array plat indexat strict `step_number: 1..N`. Nu există atribute de ramificare sau paralelism.
   - *Puncte forte:* Simplitate arhitecturală maximă; validare mecanică directă; randare trivială în UI; conservare nativă a comportamentului existent.
   - *Limitări culinare:* Forțează compactarea proceselor paralele; ordinea numerică nu reflectă cronologia de atelier; calculul duratelor în paralelism rămâne o aproximare manuală.

2. **Modelul 2 — Convenție Editorială în Text (Fără Modificare de Schemă):**
   - *Mecanism:* Păstrează schema V1 nemodificată; autorul introduce marcaje tipografice standardizate în textul câmpului `instruction` (ex: `# [Pista: Garnitură Cepe]`).
   - *Puncte forte:* Cost tehnic de migrare nul; nicio modificare în schema de date; libertate de exprimare editorială.
   - *Limitări culinare:* Sistemul software nu poate procesa semantic structura; nu se pot genera cronometre sincronizate și nu se poate deduce calea critică.

3. **Modelul 3 — Piste Explicite de Lucru (*Workstreams / Swimlanes*):**
   - *Mecanism:* Fiecare pas primește un atribut opțional `track: string | null` (ex: `"baza-carne"`, `"garnituri"`). Pașii din aceeași pistă se succed secvențial, iar pistele diferite sunt considerate paralele în mod implicit.
   - *Regulă de migrare V1:* Pentru rețetele V1 existente, `track` rămâne strict `null` (fără pistă definită). Nu se injectează o pistă implicită de tip `"main"`.
   - *Puncte forte:* Intuitiv pentru autori; mapabil direct pe componente grafice de tip coloane (*swimlanes*); permite aproximarea duratei ca $\max(\text{durata pistelor}) + \text{durata asamblării}$.
   - *Limitări culinare:* Rigiditate la punctele de sincronizare granulară (când un pas dintr-o pistă depinde de un pas intermediar dintr-o altă pistă, nu de întreaga pistă).

4. **Modelul 4 — Ierarhie Operațiuni / Containere (*Macro-operations & Sub-steps*):**
   - *Mecanism:* Rețeta conține un array de containere de operațiuni (`operations: Operation[]`), fiecare container având o listă proprie de sub-pași (`steps: RecipeStep[]`). Containerele pot fi declarate paralele sau secvențiale.
   - *Puncte forte:* Grupare logică a rețetelor mari compozite; foarte lizibil pentru organizarea pe capitole de preparare.
   - *Limitări culinare:* Modifică structura plată V1 (`recipe.steps`); necesită transformări ale interfețelor de editare; adaugă un nivel ierarhic care complică rețetele scurte și simple.

5. **Modelul 5 — Model Hibrid (Secvență Liniară + Dependențe Explicite Opționale):**
   - *Mecanism:* Păstrează ordinea editorială de afișare `step_number: 1..N`, adăugând un identificator stabil per pas (`step_id: string`) și un câmp opțional de dependențe de execuție (`depends_on: string[] | null`).
   - *Separarea ordinii editoriale de dependențele cauzale:* `step_number` dictează exclusiv ordinea de lectură umană în pagină; `depends_on` definește graful cauzal de execuție. Reordonarea pașilor în UI modifică doar `step_number`, lăsând neschimbate dependențele cauzale exprimate prin `step_id`.
   - *Definiția riguroasă a stărilor câmpului `depends_on`:*
     * **Câmp absent (`undefined`):** În documentele V1 sau la redactarea unei rețete simple, absența câmpului este **interpretată implicit la runtime** drept succesiune narativă clasică (pasul $N$ depinde de pasul precedent $N-1$). Această succesiune **NU este materializată ca referințe explicite în fișierele V1**, conservând imutabilitatea documentelor V1.
     * **Valoare `null`:** Explicit nespecificat / valoare neutră; la runtime are exact același efect ca absența câmpului (succesiune secvențială implicită $N-1$).
     * **Array vid (`[]`):** Pas declarat explicit ca independent / rădăcină paralelă (*fork*). Pasul nu așteaptă pasul precedent $N-1$ și poate demara de la $T=0$.
     * **Array cu identificatori (`["step_id_1", "step_id_2"]`):** Dependență cauzală directă sau convergență de ramuri.
   - *Identitatea, persistența și stabilitatea identificatorilor `step_id`:*
     * *Generare inițială:* La ingestia unui document V1 fără `step_id`, acesta este generat **deterministic** (ex: `${recipe_id}_step_${step_number}`).
     * *Persistență:* `step_id` este **salvat persistent** în SQLite într-o coloană dedicată cu constrângere `UNIQUE(recipe_id, step_id)`. Odată salvat, devine imutabil.
     * *Reordonare și redenumire:* Modificarea `step_number` sau a textului instrucțiunii nu modifică `step_id`.
     * *Referințe către pași inexistenți:* Motorul de validare respinge salvarea cu eroare structurală `ERR_INVALID_STEP_REFERENCE`.
     * *Detectarea ciclurilor:* Se execută un algoritm deterministic DFS; prezența unui ciclu declanșează `ERR_CYCLIC_DEPENDENCY`.
     * *Tratarea ștergerii unui pas referit:* Ștergerea unui pas referit de alți pași este blocată sau semnalată prin `ERR_DANGLING_STEP_REFERENCE`, impunând reconfigurarea dependențelor.
   - *Puncte forte:* Menține lizibilitatea secvențială; permite calculul asistat al căii critice; oferă o bază solidă de retrocompatibilitate.
   - *Limitări culinare:* Impune autorilor stabilirea sau selectarea vizuală de ID-uri la pașii non-liniari.

6. **Modelul 6 — Graf Aciclic Dirijat Complet (DAG Pur):**
   - *Mecanism:* Pașii sunt exclusiv noduri într-o rețea matematică conectată prin arce dirijate. Proprietatea `step_number` dispare complet; ordinea este derivată dinamic.
   - *Clarificare de limitare:* **Un DAG nu oferă automat o planificare completă a activității din bucătărie.** Un DAG pur admite multiple sortări topologice (nu oferă o ordine unică de afișare) și ignoră complet constrângerile de resurse umane și materiale (un bucătar cu două mâini, număr limitat de ochiuri pe plită sau cuptoare). Planificarea reală de atelier necesită euristici suplimentare de alocare a resurselor.
   - *Puncte forte:* Rigoare teoretică absolută.
   - *Limitări culinare:* Barieră masivă de autorat pentru redactori; impune un canvas grafic de editare; incompatibilitate structurală majoră cu formatul V1.

---

## 4. DECONSTRUCȚIA DINAMICII INGREDIENTELOR ȘI EVALUAREA ARTEFACTELOR

Studiul celor patru preparate arată că tratarea ingredientelor exclusiv ca intrări statice de inventar necesită clarificări structurale:

```
┌────────────────────────────────────────────────────────────────────────┐
│         Deconstrucția Conceptelor de Dinamică a Ingredientelor         │
└────────────────────────────────────────────────────────────────────────┘
1. Referințe de Ingredient       ──> Legătura pasului cu lista de inventar
2. Alocare Cantitativă per Pas   ──> quantity_used_in_step (cât se consumă la pas)
3. Fracționare Fizică            ──> component (ex: albuș vs. gălbenuș)
4. Pierderi și Fasonare          ──> Diferențe brute vs. nete de atelier
5. Rezerve Culinare              ──> Porții păstrate pentru finisare / sos
6. Schimbare de Stare / Fază     ──> Modificări fizico-chimice ale materiei
7. Artefacte Intermediare        ──> Compuși rezultați (bază béchamel, aluat)
8. Sub-rețete / Componente       ──> Preparate autonome asamblate (aluat + ragù)
```

### 4.1 Alocarea Cantitativă per Pas (`quantity_used_in_step`)
* **Problemă culinară:** Ingrediente precum untul sau lichidele sunt consumate în fracțiuni repetate în pași diferiți (ex: cele 60g de unt din *Boeuf Bourguignon* distribuite la glacare, sotare și sos).
* **Soluție analizată:** Extinderea tabelei de legătură cu `quantity_used_in_step: number | null` și `unit: string | null`.
* **Semantica valorii `null`:** Dacă `quantity_used_in_step` este `null` sau omis, această valoare reprezintă o **alocare cantitativă nespecificată structural la pas** (cantitatea fiind ghidată textual în instrucțiune sau ajustată la gust), **fără a se presupune automat că s-a consumat întreaga cantitate din inventar**.

### 4.2 Decuplarea de Fracționare, Pierderi și Rezerve
* **Fracționarea fizică:** Separarea unui produs comercial în componente (`component: "yolk" | "white"`) este distinctă de consumul cantitativ parțial dintr-un stoc omogen.
* **Pierderi de fasonare:** Diferența brut vs. net (fasonare carne, curățare legume) reprezintă un raport de randament de atelier.
* **Rezerve culinare:** Cantități păstrate deliberat pentru finisare (*monter au beurre*, subțiere sos, potrivire gust *quanto basta*).
* **Reguli de validare a bilanțului de masă:** Nu se presupune că toate cantitățile alocate trebuie să însumeze exact inventarul. Validarea folosește **reguli euristice documentate**: sistemul emite un avertisment ne-blocant doar dacă suma alocărilor pe pași depășește cantitatea din inventar; dacă suma este mai mică, diferența este tratată drept rezervă culinară de atelier sau ajustare la gust.

### 4.3 Evaluarea Schimbărilor de Fază și a Artefactelor Intermediare
* **Poziționare arhitecturală:** Modelarea formală a stărilor fizico-chimice și a entităților `IntermediateArtifact` este amânată pentru a menține nucleul V2 suplu. **Această decizie nu exclude conceptual modelarea structurală a transformărilor în ontologii viitoare mai avansate.**

---

## 5. CADRUL DE RISC CULINAR: TAXONOMIA COMUNĂ PE PATRU CATEGORII

Pentru a asigura o reprezentare fidelă fără confuzii între igienă, tehnică și reglementări industriale, se adoptă o taxonomie comună riguroasă:

```
┌────────────────────────────────────────────────────────────────────────┐
│               Taxonomia Cadrului de Risc Culinar                       │
├───────────────────────────────┬────────────────────────────────────────┤
│ Categorie Semantică           │ Semnificație & Exemple Reale           │
├───────────────────────────────┼────────────────────────────────────────┤
│ 1. Culinary Quality Warning   │ Atenționare tehnică de atelier:        │
│    (Avertisment Calitativ)    │ ex: răcire béchamel călduță la deget;  │
│                               │ foc mic la reducerea sosului           │
├───────────────────────────────┼────────────────────────────────────────┤
│ 2. Irreversible Process Risk  │ Consecință ireversibilă pe textură:    │
│    (Risc Structural Critic)   │ ex: separare grăsime la mantecatura;   │
│                               │ contaminare albușuri cu lipide         │
├───────────────────────────────┼────────────────────────────────────────┤
│ 3. Food Safety Warning        │ Reguli sanitare domestice/atelier:     │
│    (Siguranță Alimentară)     │ ex: răcire rapidă supă lichidă;        │
│                               │ manipulare separată carne crudă/legume │
├───────────────────────────────┼────────────────────────────────────────┤
│ 4. Formal HACCP CCP           │ Procedură industrială reglementată:    │
│    (Punct Critic de Control)  │ monitorizare automată pasteurizare     │
│                               │ (separat de nucleul de bază V2)        │
└───────────────────────────────┴────────────────────────────────────────┘
```

> **Regulă de Proiectare:** Nu se folosește un câmp generic `quality_warning` ca substitut pentru toate categoriile. Structura V2 va permite clasificarea tipului de avertisment (`warning_type`), iar avertismentele de siguranță alimentară nu sunt excluse din model, fiind esențiale pentru instruirea corectă a bucătarului.

---

## 6. ARHITECTURA TEMPORALĂ: DECONSTRUCȚIA CONCEPTELOR ȘI SINCRO-SERVICIUL

```
┌───────────────────────────────────────┬────────────────────────────────────────┬───────────────────────────────────┐
│ Concept Temporal                      │ Semnificație Culinară                  │ Modelare Tehnică Recomandată      │
├───────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────┤
│ 1. Timp Activ (Hands-on)              │ Manipulare fizică continuă             │ Câmp explicit pe pas / rețetă     │
├───────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────┤
│ 2. Timp Pasiv (Inactive)              │ Fierbere, coacere, infuzare            │ Câmp explicit pe pas / rețetă     │
├───────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────┤
│ 3. Timp Continuu de Gătire            │ Durata continuă de la start la final   │ total_minutes (asistat / calculat)│
├───────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────┤
│ 4. Timp Calendaristic (Lead Time)     │ Interval total incluzând repaus/zile   │ lead_time_hours (opțional)        │
├───────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────┤
│ 5. Timp de Repaus Tehnic (Resting)    │ Relaxare gluten, hidratare amidon      │ resting_minutes (opțional pe pas) │
├───────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────┤
│ 6. Cale Critică Teoretică             │ Durata minimă cu resurse nelimitate    │ Derivată algoritmic (graf)        │
├───────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────┤
│ 7. Planificarea Resurselor            │ Alocare pe bucătar, plită și cuptor    │ Estimare de atelier / UI          │
├───────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────┤
│ 8. Fereastră Optimă de Servire        │ Interval de calitate senzorială maximă │ service_window.optimal_seconds    │
├───────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────┤
│ 9. Limită Operațională de Servire     │ Timp maxim până la degradare vizibilă  │ service_window.operational_limit  │
├───────────────────────────────────────┼────────────────────────────────────────┼───────────────────────────────────┤
│ 10. Prag Experimental de Degradare    │ Momentul măsurat al prăbușirii fizice  │ Documentat în dosare de cercetare │
└───────────────────────────────────────┴────────────────────────────────────────┴───────────────────────────────────┘
```

### 6.1 Validarea Semantică a Timpilor
* Nu se impune formula conform căreia suma pașilor este egală cu timpul total (în prezența concurrenței, suma depășește în mod legitim totalul).
* Calea critică nu se calculează automat din date incomplete (dacă lipsesc durate sau dependențe, sistemul folosește durata declarată editorial).
* Discrepanțele majore sunt identificate pe baza unor reguli documentate: dacă `active_minutes > total_minutes`, motorul emite un **avertisment ne-blocant**.

### 6.2 Nuanțarea Ferestrei de Servire (Cele Trei Niveluri)
1. **Fereastra Optimă de Servire:** Intervalul recomandat în care preparatul oferă apogeul organoleptic (ex: 120–180 secunde post-cuptor la soufflé; 3–5 minute la risotto).
2. **Limita Operațională de Servire:** Timpul maxim rezonabil în care preparatul poate fi transportat și prezentat la masă fără afectarea vizibilă a structurii.
3. **Pragul Experimental de Degradare:** Punctul de inflexiune măsurat în studii de laborator (ex: scăderea temperaturii interne sub 70°C, contracția termodinamică a bulelor de aer).

---

## 7. IERARHIA PARAMETRILOR TERMICI: ECHIPAMENT, SUPRAFAȚĂ ȘI PRODUS

Modelarea termică avansată distinge între trei puncte fizice de măsurare și trei tipuri de constrângeri:

```
┌────────────────────────────────────────────────────────────────────────┐
│               Ierarhia Punctelor de Măsurare Termică                   │
├───────────────────────────────┬────────────────────────────────────────┤
│ Punct de Măsurare             │ Semnificație Culinară & Exemple        │
├───────────────────────────────┼────────────────────────────────────────┤
│ 1. Echipament / Ambiant       │ Temperatura aerului din cuptor (190°C) │
│    (Equipment Ambient)        │ sau intensitatea flăcării la plită     │
├───────────────────────────────┼────────────────────────────────────────┤
│ 2. Suprafață de Contact       │ Temperatura atinsă de tigaie/cratiță   │
│    (Surface Temperature)      │ pentru reacția Maillard (160–180°C)    │
├───────────────────────────────┼────────────────────────────────────────┤
│ 3. Miezul Produsului          │ Temperatura internă măsurată cu sondă  │
│    (Core Product Temperature) │ (ex: miez friptură 55°C; béchamel <55°C│
└───────────────────────────────┴────────────────────────────────────────┘
```

### 7.1 Tipuri de Constrângeri Termice
1. **Recomandare Tehnologică (*Technological Target*):** Indicație orientativă de proces (ex: lichid menținut la freamăt fin între 88°C și 92°C).
2. **Limită de Calitate (*Quality Threshold*):** Prag senzorial recomandat (ex: servire caldă la masă peste 60°C).
3. **Limită de Siguranță Alimentară (*Safety Threshold*):** Barieră imperativă sanitară (ex: răcire rapidă supă sub 10°C; preparare termică pasăre peste 74°C).

---

## 8. PROVENIENȚĂ EDITORIALĂ, SCHEMA ȘI PROIECȚIA SQLITE

Pentru a păstra claritatea arhitecturală:
* **Sursa Primară de Adevăr:** Dosarele de cercetare Markdown (`docs/editorial/DOSSIER_*.md`) sunt sursa editorială și istorică primară pentru afirmații și bibliografie.
* **Proiecția Structurată de Rulare:** Baza de date SQLite reprezintă o **proiecție structurată derivată**, generată la build/ingestie.
* **Legătură de versiune:** Fiecare rețetă proiectată poate stoca identificatorul de versiune al dosarului sursă (`source_dossier_commit`), permițând auditul divergențelor.
* **Economie structurală:** Nu fiecare detaliu narativ din dosare este transformat în coloană SQLite; câmpurile complexe sunt păstrate ca structuri JSON serializate opționale sau text liber.

---

## 9. CONCLUZIE ȘI REZUMATUL EVOLUȚIEI

Strategia Recipe Core V1 $\rightarrow$ V2 demonstrează că:
* Compatibilitatea este concepută ca un contract aditiv ce urmează a fi demonstrat prin teste în faza de implementare;
* Modelul de operare și dependențe separă ordinea editorială de relațiile cauzale;
* Taxonomia clară a riscurilor și temperaturilor protejează rigoarea gastronomică fără birocrație industrială.

**Prezentul document este înaintat Product Owner-ului ca propunere coordonată Rev 1.4.**
