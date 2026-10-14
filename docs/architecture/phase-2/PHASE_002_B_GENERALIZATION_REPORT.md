# ATLAS AOS — RAPORT DE GENERALIZARE A DOMENIULUI ȘI AUDIT DE COMPATIBILITATE RECIPE CORE V1 (PHASE 002-B)

**Subiect:** Sinteza Generalizării Domeniului Culinar și Auditul Comparativ de Compatibilitate Arhitecturală  
**Etapă:** Phase 002-B — Domain Generalization & Recipe Core V1 Compatibility Audit  
**Data:** 2026-10-14  
**Autoritate:** Product Owner Mandate  
**Repository:** `hbrnm/atlas-gastronomic`  
**Git Working Tree:** `Atlas-gastronomic-repo`  
**Branch:** `chore/integrate-agent-skills`  
**Baseline HEAD Commit:** `dc8dd75395049a9599ecbde83fa5015a6f07190e`  
**Canonical Standards:** `standards/v1.0.0/` — **FROZEN / IMMUTABLE**  

---

## 1. Mandat și Cadrul de Evaluare

Mandatul Phase 002-B autorizat de Product Owner a impus o evaluare strictă a modelului **Recipe Core V1** în raport cu realitatea culinară a trei cazuri de efort diametral opuse ca dinamică, fizică și orizont temporal:
1. **TEST 002 — Risotto alla Milanese:** Dinamică intensivă, reacții de suprafață, hidratare progresivă în buclă într-un singur vas, emulsie critică la rece (*mantecatura*) ghidată senzorial (40 min).
2. **TEST 003 — Boeuf Bourguignon:** Înăbușire de lungă durată (*long-duration braising*), descompunere pe mai multe vase, piste paralele de garnituri (*Garniture Bourguignonne*), separare/degresare/reducere de sos, orizont temporal multi-sesiune (4 ore + maturare 24 ore la rece).
3. **TEST 004 — Soufflé au Fromage:** Patiserie/bucătărie salată de înaltă precizie termodinamică, mecanică de spume coloidale, toleranță zero la impurități lipidice, puncte critice de control (CCP) cu penalizare fatală, dilatare prin vapori de apă și fereastră negativă de servire la masă ($\le 120\text{--}180\text{ s}$).

Principiul director al acestei investigații a fost: **Nu adaptăm realitatea culinară la limitele software-ului, ci descoperim exact unde modelul funcționează direct, unde pierde semantică și unde abstracțiunile sale devin insuficiente.**

---

## 2. Matricea Consolidată de Generalizare Transversală

Tabelul de mai jos compară comportamentul și compatibilitatea modelului Recipe Core V1 pe cele 15 dimensiuni fundamentale ale domeniului gastronomic, utilizând clasificarea formală pe 4 niveluri:
* **SUPPORTED:** Reprezentat direct și corect de schema V1.
* **PARTIALLY SUPPORTED:** Reprezentabil în V1, dar cu limitări sau workaround-uri editoriale.
* **NOT SUPPORTED:** Nu poate fi reprezentat fără pierdere critică de semantică sau structură.
* **NOT APPLICABLE:** Nerelevant pentru preparatul testat.

| Dimensiune Domeniu | TEST 002: Risotto alla Milanese | TEST 003: Boeuf Bourguignon | TEST 004: Soufflé au Fromage | Diagnostic Tehnic și Structură V1 Inspectată |
| :--- | :---: | :---: | :---: | :--- |
| **1. Operațiuni liniare / secvențiale** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | `Recipe.steps: RecipeStep[]` indexat strict `step_number: 1..N`. Suportă adecvat narațiunile liniare simple monovoltine. |
| **2. Operațiuni paralele (Concurrență)** | **NOT SUPPORTED**<br>*(Infuzie șofran + încălzire bulion)* | **NOT SUPPORTED**<br>*(Braisage + 2 garnituri paralele)* | **NOT SUPPORTED**<br>*(Béchamel + batere albușuri)* | `RecipeStep` este un array plat fără suport pentru grafuri aciclice dirijate (DAG) sau piste concurente (*swimlanes*); forțează compactarea sau reordonarea artificială. |
| **3. Dependențe temporale și de stare** | **NOT SUPPORTED**<br>*(Evaporare vin $\rightarrow$ turnare bulion)* | **NOT SUPPORTED**<br>*(Braisage finalizat $\rightarrow$ filtrare sos)* | **NOT SUPPORTED**<br>*(Răcire bază $<55^\circ\text{C}$ $\rightarrow$ gălbenușuri)* | Nu există mecanism de barieră de execuție (*gate criteria* sau `depends_on: step_id[]`); dependențele cauzale sunt exprimate exclusiv ca text narativ. |
| **4. Timp activ vs. pasiv (Fără dublă numărare)** | **PARTIALLY SUPPORTED**<br>*(32m activ / 8m pasiv = 40m total)* | **PARTIALLY SUPPORTED**<br>*(90m activ / 150m pasiv = 240m total)* | **PARTIALLY SUPPORTED**<br>*(33m activ / 20m cuptor = 53m total)* | `RecipeTiming.active_minutes` și `total_minutes` permit doar stocarea manuală a două scalare agregate. Modelul nu poate deduce sau valida calea critică din duratele pașilor în prezența concurenței. |
| **5. Pregătire multi-sesiune (Zile calendaristice)** | **NOT APPLICABLE**<br>*(Gătire directă)* | **NOT SUPPORTED**<br>*(Maturare 24h la rece J+1)* | **NOT APPLICABLE**<br>*(Consum direct)* | `RecipeTiming` nu deține concepte de `session_id`, `calendar_days` sau `lead_time_hours`; introducerea celor 24h denaturează `total_minutes` la 28h de gătire continuă. |
| **6. Transformări de stare ale ingredientelor** | **NOT SUPPORTED**<br>*(Amidon hidratat, măduvă topită)* | **NOT SUPPORTED**<br>*(Colagen $\rightarrow$ gelatină; făină $\rightarrow$ velouté)* | **NOT SUPPORTED**<br>*(Albuș lichid $\rightarrow$ spumă $\rightarrow$ gel coagulat)* | `RecipeIngredient` tratează ingredientele ca entități statice de inventar; nu există noțiunea de schimbare de fază sau evoluție fizico-chimică în proces. |
| **7. Roluri funcționale dinamice / Fracționare** | **PARTIALLY SUPPORTED**<br>*(Unt soffritto vs. mantecatura)* | **PARTIALLY SUPPORTED**<br>*(Unt glacare / sotare / sos)* | **PARTIALLY SUPPORTED**<br>*(Ouă întregi separate în gălbenuș / albuș)* | `RecipeStep.ingredient_refs` asociază ID-ul ingredientului, dar nu permite specificarea cantității fracționate per pas (`quantity_used_in_step`), forțând multiplicarea slug-urilor. |
| **8. Constrângeri și porți de temperatură** | **PARTIALLY SUPPORTED**<br>*(Pasiv: `heat_level` calitativ; poartă internă indisponibilă)* | **PARTIALLY SUPPORTED**<br>*(Pasiv: cuptor 150°C în `temperature_c`; barieră lichid indisponibilă)* | **PARTIALLY SUPPORTED**<br>*(Pasiv: cuptor 190°C în `temperature_c`; poartă $<55^\circ\text{C}$ indisponibilă)* | Distincție esențială pe trei niveluri:<br>1. **Stocare pasivă temperatură ambientală/echipament:** `PARTIALLY SUPPORTED` (câmpul `RecipeStep.temperature_c: number \| null` permite înregistrarea valorii scalare a cuptorului, ex: 150°C sau 190°C, iar `heat_level` stochează intensitatea calitativă a plitei).<br>2. **Măsurare temperatură internă produs:** `NOT SUPPORTED` (modelul nu deține proprietăți pentru starea termică a masei culinare, ex: emulsie gălbenuș sau miez carne).<br>3. **Porți termice executorii de blocare (*Enforceable gates*):** `NOT SUPPORTED` (câmpul `temperature_c` nu este validat în `validation.ts` și nu există motor de reguli condiționale pentru a opri progresia către pasul următor până la îndeplinirea pragului critic de siguranță, ex: răcire béchamel $<55^\circ\text{C}$). |
| **9. Managementul lichidelor și evaporării** | **PARTIALLY SUPPORTED**<br>*(Bilanț 355–420g evap.)* | **PARTIALLY SUPPORTED**<br>*(~500–600g evap. + 150g degresare)* | **PARTIALLY SUPPORTED**<br>*(~50g vapori abur)* | `RecipeYield` stochează doar o greutate finală scalară (`approx_final_weight_g`); nu există calcul dinamic al pierderilor prin evaporare, absorbție sau degresare. |
| **10. Toleranțe cantitative și intervale** | **NOT SUPPORTED**<br>*(Doar scalar: 320g, 80ml)* | **NOT SUPPORTED**<br>*(Doar scalar: 1200g, 750ml)* | **NOT SUPPORTED**<br>*(Doar scalar: 40g $\pm 2\text{ g}$ neacceptat)* | `RecipeIngredient.quantity: number \| null` suportă exclusiv valori scalare fixe; schema nu permite definirea de toleranțe procentuale, intervale `min`/`max` sau incertitudini de măsurare. |
| **11. Puncte Critice de Control (CCP)** | **NOT SUPPORTED**<br>*(Mantecatura pe foc = separare)* | **NOT SUPPORTED**<br>*(Fierbere clocotită = uscare carne)* | **NOT SUPPORTED**<br>*(Lipide în albuș; cuptor deschis = colaps)* | În schema V1 toți pașii sunt egali structural; nu există noțiunea de risc culinar, severitate sau semnalizare a consecințelor nerespectării tehnice. |
| **12. Moduri de eșec (*Failure Modes*)** | **NOT SUPPORTED** | **NOT SUPPORTED** | **NOT SUPPORTED** | Schema nu conține structuri de tip cauză-efect, diagnostic de atelier sau recomandări de remediere culinară. |
| **13. Criterii de Doneness (Senzorial vs. Mașină)** | **PARTIALLY SUPPORTED**<br>*(All'onda, perlatura)* | **PARTIALLY SUPPORTED**<br>*(Fondant la furculiță)* | **PARTIALLY SUPPORTED**<br>*(Creștere 3-5 cm, tremor elastic)* | `RecipeStep.success_cue: string \| null` funcționează adecvat ca descriptor calitativ narativ pentru bucătar, dar nu constituie o condiție măsurabilă sau validabilă automat de software. |
| **14. Sincronizarea servirii (*Service Window*)** | **NOT SUPPORTED**<br>*(Consum rapid recomandat)* | **NOT SUPPORTED**<br>*(Toleranță mare la cald)* | **NOT SUPPORTED**<br>*(Fereastră critică $\le 120\text{--}180\text{ s}$)* | Modelul nu deține conceptul de fereastră de servire ancorată la un eveniment de referință declanșator (*trigger event*, ex: `oven_exit` sau `heat_off`). |
| **15. Proveniență editorială și rigoare** | **SUPPORTED**<br>*(De.Co. Milano, Artusi)* | **SUPPORTED**<br>*(Escoffier, Child, Bocuse)* | **SUPPORTED**<br>*(Carême, Escoffier, McGee)* | `Recipe.sources: string[]` și `Recipe.claims` cu `confidence` pe 4 niveluri oferă o bază solidă de trasabilitate editorială a afirmațiilor. |

---

## 3. Concluzii Arhitecturale Fundamentale

### A. Ce funcționează în Recipe Core V1 (*What Works*)
1. **Modelul Relațional de Bază și Integritatea Referențială:**
   - Maparea tabelară `Recipe` $\rightarrow$ `RecipeIngredient` și `RecipeStep` $\rightarrow$ `step_ingredient_refs` este verificată automat prin cele 14 teste din `tests/repository.test.ts` și `tests/validation.test.ts` (executate cu exit code 0).
   - Detectarea erorilor structurale (ingrediente nedeclarate, ordonare invalidă a pașilor, cantități negative) funcționează deterministic conform specificațiilor din `src/shared/validation.ts`.
2. **Descriptorii Senzoriali Calitativi (`success_cue` și `heat_level`):**
   - Câmpul `success_cue` oferă o ancoră utilă pentru instruirea bucătarului uman, permițând redarea indicilor fizici observabili (*perlatura orezului*, *carne fondantă la furculiță*, *tremor elastic al calotei*), chiar dacă nu este parsabil de o mașină.
3. **Cadrul de Trasabilitate a Surselor (`claims`):**
   - Structura `claims: Claim[]` din schema JSON canonică permite ancorarea afirmațiilor istorice și tehnice pe cele 4 niveluri de încredere, prevenind confuzia dintre tradiția nescrisă și dovezile documentate.

### B. Ce NU funcționează în Recipe Core V1 (*What Does Not Work*)
1. **Liniaritatea Forțată și Absența Concurrenței (DAG):**
   - V1 presupune un flux unic de execuție. Când apar preparări paralele (garniturile din TEST 003, pasta din TEST 001, baterea albușurilor în timp ce baza se răcește în TEST 004), modelul forțează compactarea lor artificială într-un șir plat.
2. **Lipsa Suportului pentru Toleranțe Cantitative:**
   - Prezența unui singur număr scalar în `quantity` împiedică modelarea intervalelor acceptabile și a marjelor de eroare esențiale în patiserie sau dozarea lichidelor.
3. **Orbire Semantică la Puncte Critice de Control (CCP) și Porți Termice:**
   - V1 tratează identic o acțiune trivială și o acțiune cu risc de defect ireversibil. Deși permite stocarea pasivă a unei valori scalare ambientale de echipament (`RecipeStep.temperature_c: number | null`, ex: cuptor 150°C sau 190°C), modelul este complet orb la temperatura internă a produsului și nu poate impune porți termice executorii (*enforceable gates*) care să blocheze tranziția la pasul următor până la atingerea pragului termic critic.
4. **Model Temporal Incapabil de Procese Multi-Sesiune sau Ferestre de Servire:**
   - Un număr scalar de minute agregate nu poate reprezenta pauzele de 24 de ore peste noapte fără a distorsiona timpul de gătire și nu poate defini ferestre de expirare la masă ancorate la evenimente fizice.

---

## 4. Analiza Dilemelor de Design Arhitectural (Propuneri Neimplementate)

> [!IMPORTANT]
> Toate propunerile de mai jos sunt **dileme și opțiuni de design conceptuale analizate teoretic**, fără a fi selectate ca specificații finale și fără a modifica schema sau codul existent.

### Dilema 1: Identificatori Stabili de Pas vs. Referințe pe Poziția în Array
* **Opțiunea A (Indexare pe poziție `step_number: 1..N`):**
  - *Avantaje:* Simplitate extremă pentru redare liniară și autorat în UI; ușor de validat mecanic.
  - *Dezavantaje:* Fragilitate critică la modificări editoriale: inserarea, ștergerea sau reordonarea unui pas invalidează toate referințele externe și dependențele inter-pași.
* **Opțiunea B (Identificatori persistenți `step_id: string`):**
  - *Avantaje:* Asigură integritate referențială durabilă pentru dependențe de tipul `depends_on: ["sear-beef", "prepare-mirepoix"]`, chiar dacă pașii sunt mutați vizual.
  - *Dezavantaje:* Complexitate crescută la redactare și risc de referințe orfane dacă un pas referit este șters fără verificare în cascadă.

### Dilema 2: Piste Paralele Explicite (*Swimlanes*) vs. Derivare dintr-un Graf de Dependențe (DAG)
* **Opțiunea A (Piste explicite declarate de autor, ex: `track: "Garnitură"`):**
  - *Avantaje:* Extrem de intuitiv pentru autorul uman și direct mapabil pe componente de vizualizare tip coloane/swimlanes în UI.
  - *Dezavantaje:* Risc de rigiditate: nu garantează matematic că pașii din două piste chiar se pot executa simultan fără a partaja aceeași resursă fizică (ex: același bucătar sau același vas).
* **Opțiunea B (Derivare automată prin sortare topologică peste un DAG de dependențe):**
  - *Avantaje:* Rigoare matematică absolută; permite calcularea automată a căii critice, a timpilor de așteptare (*slack time*) și a concurenței reale.
  - *Dezavantaje:* Dificultate ridicată de redactare pentru un editor culinar non-tehnic și overhead substanțial al motorului de calcul.

### Dilema 3: Ancorarea Ferestrelor de Servire la Evenimente de Referință
* **Problemă identificată:** O fereastră de servire nu poate fi un număr scalar izolat (ex: „120 secunde”). Ea trebuie să aibă un punct de start precis.
* **Opțiuni de modelare analizate:**
  - Definirea unei structuri `service_window` care specifică un eveniment declanșator (*trigger event*):
    * `reference_event`: `oven_exit` (scoaterea din cuptor) sau `heat_off` (stingerea focului);
    * `optimal_window_seconds`: intervalul recomandat pentru prezentare estetică optimă (ex: 120–180s);
    * `grace_period_seconds`: limita după care preparatul suferă deflație termică sau separare fizică.

### Dilema 4: Artefacte Intermediare de Proces vs. Schimbări de Stare ale Ingredientelor
* **Opțiunea A (Schimbare de stare la nivel de ingredient):**
  - Modelarea ingredientului ca o mașină cu stări (ex: `ingredient: "carne", state: "cruda" -> "rumenita" -> "inabusita"`).
  - *Limitare:* Nu poate reprezenta compușii rezultați din fuziunea mai multor ingrediente (vin + fond + făină + grăsime $\rightarrow$ sos).
* **Opțiunea B (Artefacte intermediare compozite — `IntermediateArtifact`):**
  - Un pas poate declara `produces: { id: "art_sos_redus", name: "Sos de Burgundia redus", type: "sauce" }`.
  - Acest artefact devine un input valid pentru pașii ulteriori (`consumed_by`).
  - *Evaluare:* Reprezintă fidel realitatea culinară a preparatelor compozite, dar impune o trecere de la un model de listă la o rețea de flux de materiale (*Petri net* / flux de proces).

### Dilema 5: Unde își Au Locul CCP-urile: Model de Date, Motor de Validare sau Ambele?
* **Opțiunea A (Exclusiv în Modelul de Date):** Adăugarea unei entități `CriticalControlPoint` în schemă. Permite stocarea și redarea alertelor în UI, dar nu garantează că bucătarul respectă condiția.
* **Opțiunea B (Exclusiv în Motorul de Validare):** Reguli euristice în `validation.ts` care avertizează editorul dacă uită să menționeze temperatura de răcire la béchamel. Este utilă pentru controlul calității textului, dar opacă pentru o aplicație de gătit în timp real.
* **Opțiunea C (Model Hibrid):** Atribut opțional structurat în schemă (`is_critical_control_point: boolean`, `hazard_type`, `preventive_measure`) cuplat cu validare deterministică și redare vizuală cu prioritate ridicată în interfețe.

---

## 5. Verificarea Porților de Calitate Phase 002-B

| Poartă de Calitate | Criteriu de Evaluare | Rezultat | Dovezi și Constatări Documentate |
| :--- | :--- | :---: | :--- |
| **Gate 1 — Research Integrity** | Izvoare primare defensibile și trasabilitate clară a dovezilor. | **PASS** | Identificarea precisă a surselor: Escoffier (1903/1921), Bocuse (1976), Child (1961), Carême (1815), McGee (2004), This (1993/1995), Deliberarea De.Co. Milano (2007). |
| **Gate 2 — Culinary Decomposition** | Detalierea constrângerilor temporale, procedurale și fizico-chimice. | **PASS** | Decompoziție completă a fenomenelor: hidroliza colagenului la 80–90°C, adsorbția proteinelor din albuș la interfață, dilatarea vaporilor de apă, bilanțuri de masă reconciliate. |
| **Gate 3 — Model Compatibility** | Concluzii ancorate strict în structurile V1 existente. | **PASS** | Fiecare evaluare din cele 10 întrebări citează direct structurile inspectate în `src/shared/types.ts` (`RecipeTiming`, `RecipeStep`, `RecipeIngredient`) și `standards/v1.0.0/schemas/recipe.schema.json`. |
| **Gate 4 — Cross-Recipe Generalization** | Matricea comparativă evidențiază capabilitățile generale vs. workaround-uri. | **PASS** | Matrice pe 15 dimensiuni demonstrând că V1 este o schemă liniară scalară robustă pentru rețete simple, dar pierde semantică la preparate multi-vas, cu piste paralele sau termosensibile. |
| **Gate 5 — Architectural Recommendations** | Propuneri justificate prin dovezi reale și dileme de design analizate echilibrat. | **PASS** | Analiza a 5 dileme de design fără selectarea prematură a unei implementări; roadmap conceptual pe 3 priorități, cu evaluarea compatibilității înapoi. |
| **Gate 6 — Repository Governance** | Nicio modificare interzisă în cod, schemă, teste sau standarde canonice. | **PASS** | Zero fișiere de cod modificate; `standards/v1.0.0/` complet înghețat (0 diffs); nicio tentativă de commit sau push. |

---

## 6. Raport de Integritate Git și Mediu

Comenzile de control executate în repository-ul de lucru `Atlas-gastronomic-repo` la încheierea investigației:

```powershell
$ git branch --show-current
chore/integrate-agent-skills

$ git rev-parse HEAD
dc8dd75395049a9599ecbde83fa5015a6f07190e

$ git diff HEAD -- standards/v1.0.0/
# (Ieșire vidă - 0 modificări în standardele canonice)

$ git status --short
?? docs/architecture/phase-2/PHASE_002_B_GENERALIZATION_REPORT.md
?? docs/architecture/phase-2/RECIPE_CORE_STRESS_TEST_002.md
?? docs/architecture/phase-2/RECIPE_CORE_STRESS_TEST_003.md
?? docs/architecture/phase-2/RECIPE_CORE_STRESS_TEST_004.md
?? docs/editorial/DOSSIER_002_RISOTTO_ALLA_MILANESE.md
?? docs/editorial/DOSSIER_003_BOEUF_BOURGUIGNON.md
?? docs/editorial/DOSSIER_004_SOUFFLE_AU_FROMAGE.md
```

### Confirmări Explicite de Guvernanță:
1. **Zero modificări în codul sursă** (`src/`), baza de date SQLite, migrații sau teste.
2. **Standardele canonice `standards/v1.0.0/` sunt 100% intacte** (zero diferențe).
3. **Cazul 001 (*Tagliatelle al Ragù*)** și **Cazul 002 (*Risotto alla Milanese*)** au rămas complet nealterate.
4. **Nu s-a efectuat niciun `git add`, `git commit` sau `git push`**.
5. **Nu s-a inițiat nicio etapă de implementare (Phase 002-C)**.

---

## 7. Recomandare Finală

$$\mathbf{READY\ FOR\ FINAL\ PO\ REVIEW}$$

Faza 002-B este complet documentată, argumentată științific și ancorată riguros în arhitectura existentă. Se așteaptă evaluarea și decizia Product Owner înainte de stabilirea următorilor pași de dezvoltare.
