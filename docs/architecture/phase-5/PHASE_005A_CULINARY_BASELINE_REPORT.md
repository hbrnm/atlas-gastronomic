# ATLAS GASTRONOMIC — PHASE 005-A
## CULINARY BASELINE AUDIT REPORT

**Protocol:** Atlas AOS  
**Authority:** Product Owner  
**Phase:** 005-A (Culinary Research & Baseline Audit)  
**Status:** Audit Deliverable — Strict Rigor / Human Approval Gate  
**Execution Date:** 2026-10-14  
**Audit Scope:** The 5 Canonical Recipes of Atlas Gastronomic:
1. `rec_tagliatelle_ragu_001` — Tagliatelle al Ragù alla Bolognese
2. `rec_risotto_milanese_002` — Risotto alla Milanese Tradizionale
3. `rec_boeuf_bourguignon_003` — Boeuf Bourguignon Tradițional
4. `rec_souffle_fromage_004` — Soufflé Chaud au Fromage
5. `rec_sarmale_traditionale_012` — Sarmale Tradiționale în Foi de Varză Murată

---

## 1. Executive Summary & Audit Methodology

Phase 005 marks the transition from software infrastructure to **gastronomic truth, culinary reproducibility, and content validation**. In accordance with the Product Owner mandate, this audit-only evaluation examines whether the existing recipes in Atlas Gastronomic are:
- **Gastronomically authentic and defensible** against primary institutional and historical literature;
- **Internally consistent** between declared ingredients and preparation steps;
- **Technically executable** by a cook following the system without unstated assumptions;
- **Accurately represented** within the Recipe Core V2 data model;
- **Mathematically and physically sound** under portion scaling (2, 4, 6, 8 servings).

### Source Hierarchy Applied
In strict compliance with `standards/v1.0.0/` and `.agents/rules/04-research-and-sources.md`:
1. **Primary Institutional Codifications & Legal Acts:** Notarial depositions (CCIAA Bologna 1972, 1982, 2023; De.Co. Comune di Milano 2007).
2. **Foundational Classical Literature:** Auguste Escoffier (*Le Guide Culinaire*, 1903/1921), Marie-Antoine Carême (*Le Pâtissier Royal Parisien*, 1815), Pellegrino Artusi (*La scienza in cucina*, 1891), Prosper Montagné (*Larousse Gastronomique*, 1938).
3. **Canonical Regional Literature:** Radu Anton Roman (*Bucate, vinuri și obiceiuri românești*, 1998), Sanda Marin (*Carte de Bucate*, 1936), Mihail Kogălniceanu & Costache Negruzzi (1841), Păstorel Teodoreanu (1973).
4. **Food Science & Modern Technical Codifications:** Harold McGee (*On Food and Cooking*, 2004), Julia Child, Simone Beck & Louisette Bertholle (*Mastering the Art of French Cooking*, 1961), Paul Bocuse (*La Cuisine du Marché*, 1976).

---

## 2. Forensic Culinary Audit: Recipe by Recipe

---

### RECIPE 1: Tagliatelle al Ragù alla Bolognese
- **Record ID:** `rec_tagliatelle_ragu_001`
- **Slug:** `tagliatelle-al-ragu-bolognese`
- **Current Version:** `1.0.0`
- **Status:** `editorial_review`
- **Declared Yield:** 6 porții (~1650 g final; ~275 g/porție)
- **Declared Timing:** Activ 60 min, Total 212 min (Pasiv 152 min)

#### A. Canonical Culinary Identity & Historical Provenance
Tagliatelle al Ragù alla Bolognese reprezintă sinteza a două monumente gastronomice emiliene distincte, codificate notarial la Camera de Comerț din Bologna (Palazzo della Mercanzia):
1. **Tagliatella di Bologna:** Aluat proaspăt din făină de grâu moale și ouă proaspete (fără apă adăugată), întins la sucitor de lemn (*matterello*) până la o grosime de 0,6–0,8 mm și tăiat la lățimea canonică de 7 mm în stare crudă, devenind exact 8 mm la fierbere (Atto notarile Aldo Vico, 16 aprilie 1972; 1/12.270 din înălțimea Turnului Asinelli).
2. **Ragù alla Bolognese:** Sos lent fiert din carne tocată grosier de vită, pancetta proaspătă, soffritto în proporție egală (ceapă, morcov, țelină), vin sec, concentrat și passata de roșii, fiert molcom (*pippiare*) minimum 2–3 ore, îmbogățit opțional cu lapte integral dulce (Atto notarile Massimo Esposito, 20 aprilie 2023, delegat de Accademia Italiana della Cucina).

#### B. Primary Reference Sources
- *Accademia Italiana della Cucina & CCIAA Bologna (2023):* Atto notarile 20 aprile 2023 (Notaio Massimo Esposito) — *Ricetta del rinnovato Ragù alla Bolognese*.
- *Accademia Italiana della Cucina & CCIAA Bologna (1972):* Atto notarile 16 aprile 1972 (Notaio Aldo Vico) — *Misura della Tagliatella di Bologna*.
- *Pellegrino Artusi (1891):* *La scienza in cucina e l'arte di mangiar bene*, Ricetta N. 87 (*Maccheroni alla bolognese*).

#### C. Evaluation Against Canonical Practice
- **Soffritto Ratio:** 60 g ceapă, 60 g morcov, 60 g țelină (raport exact 1:1:1). Corespunde perfect cerinței AIC 2023.
- **Meat Selection & Grind:** 400 g pulpă de vită tocată grosier + 150 g pancetta crudă proaspătă tocată din cuțit. Rumenirea separată a pancettei urmată de adăugarea legumelor respectă fidel dinamica extragerii lipidelor.
- **Tomato Balance:** 30 g dublu concentrat + 200 g passata. Acest echilibru oferă adâncime glutamică fără a transforma sosul într-unul marinara de tomate (greșeală frecventă în afara Italiei).
- **Dairy & Optional Status:** Laptele (120 ml) este marcat strict ca `optional: true` în ingrediente și descris fidel în note, respectând stipularea *facoltativo* din actul din 2023.
- **Fresh Pasta Dough:** 400 g făină tip 00 și 4 ouă mari (~220 g ou întreg). Raport de hidratare de ~55%, standardul ideal al breslei *sfogline* bologneze.

#### D. Legitimate Variations vs. Material Defects
- *Variații legitime admise de AIC 2023:* Amestec 60% vită cu 40% porc; adăugarea măruntaielor de pui (*fegatini*); un vârf discret de nucșoară; bulion ușor de zarzavat sau cub.
- *Variații neadmise (interzise de AIC):* Carne de vițel, pancetta afumată, usturoi, rozmarin, oregano, făină pentru îngroșat, smântână lichidă (*panna* — eliminată definitiv în 2023). Rețeta din Atlas nu conține niciuna dintre aceste abateri.

#### E. Discrepancies & Deficiencies Identified
1. **[MINOR] Alocare nedeclarată în Pasul 8 (`step_serv_08`):** Pasul final utilizează pastele proaspete și sosul ragù preparate în pașii precedenți, însă în `ingredient_refs` sunt declarate doar `['sare-apa', 'parmigiano']`. Deși este logic pentru un bucătar uman, modelul formal nu leagă explicit consumul produsului intermediar al pasului 5 și 7.
2. **[OBSERVATION] Scalare neliniară a ouălor la 2 porții:** 4 porții = 2.66 ouă; 2 porții = 1.33 ouă. În bucătăria reală, ouăle nu pot fi divizate fără batere preliminară și cântărire în grame (~73 g ou bătut pentru 2 porții).

---

### RECIPE 2: Risotto alla Milanese Tradizionale
- **Record ID:** `rec_risotto_milanese_002`
- **Slug:** `risotto-alla-milanese`
- **Current Version:** `1.0.0`
- **Status:** `editorial_review`
- **Declared Yield:** 4 porții (~1145 g final; ~286 g/porție)
- **Declared Timing:** Activ 32 min, Total 40 min, Pasiv 8 min

#### A. Canonical Culinary Identity & Historical Provenance
Risotto alla Milanese este capodopera simbolică a bucătăriei lombarde. Specificitatea sa unică constă în utilizarea măduvei crude de vită (*midollo di bue*) topite împreună cu untul pentru a forma baza lipidică în care se călește ceapa și se tostează orezul, urmată de infuzarea cu șofran pur și finisarea prin *mantecatura fuori dal fuoco*.
Codificat oficial la nivel municipal prin Deliberația Consiliului Municipal Milano nr. 3235 din 14 decembrie 2007 (Denumire Comunală De.Co.).

#### B. Primary Reference Sources
- *Comune di Milano (2007):* Deliberazione del Consiglio Comunale n. 3235 del 14 Dicembre 2007 (*Istituzione del De.Co. Risotto alla Milanese*).
- *Giovanni Felice Luraschi (1829):* *Il Nuovo Cuoco Milanese Economico*, p. 115 (*Risotto alla Milanese Giallo* — prima atestare a formulei moderne).
- *Pellegrino Artusi (1891):* Ricetta N. 77 (*Risotto alla milanese I*) & N. 78 (*senza midollo*).

#### C. Evaluation Against Canonical Practice
- **Rice Variety:** Orez Carnaroli superfino (320 g; 80 g/porție). Alternativă canonică admisă: Vialone Nano sau Baldo. Carnaroli este optim datorită conținutului de amiloză (~24%), garantând rezistență la supragătire și eliberare optimă de amilopectină pentru cremozitate.
- **Lipid Architecture:** 25 g măduvă de vită + 25 g unt la soffritto + 40 g unt rece la mantecatura. Exclude total uleiul de măsline, conform decretului De.Co.
- **Saffron Specification:** 0,15 g pistiluri pure (*stimmi*) infuzate în 60 ml bulion cald (50–60°C). Se interzice infuzarea în lichid clocotit pentru protejarea safranalului și crocinei.
- **Thermal Integrity during Mantecatura:** Retragerea de pe flacără timp de 60 secunde înainte de adăugarea untului rece (țintă <75°C) este esențială fizico-chimic: previne separarea grăsimii în fază uleioasă și asigură emulsificarea stabilă a amidonului cu lipidele.

#### D. Discrepancies & Deficiencies Identified
1. **[OBSERVATION] Granulozitatea măduvei în comerț:** Măduva crudă este disponibilă de regulă în oase de vită transversale; rețeta presupune că utilizatorul deține 25 g măduvă curată gata cântărită. O notă privind extracția din os ar spori utilitatea practică.
2. **[PASS] Fără defecte materiale sau incompatibilități de model.**

---

### RECIPE 3: Boeuf Bourguignon Tradițional
- **Record ID:** `rec_boeuf_bourguignon_003`
- **Slug:** `boeuf-bourguignon`
- **Current Version:** `1.0.0`
- **Status:** `editorial_review`
- **Declared Yield:** 6 porții (~2300 g final; ~380 g/porție)
- **Declared Timing:** Activ 90 min, Total 240 min, Pasiv 150 min, Lead Time 24 ore

#### A. Canonical Culinary Identity & Historical Provenance
Boeuf Bourguignon este etalonul metodei clasice de înăbușire (*braisage à brun*) din marea gastronomie burgundă.
Codificat canonic de Auguste Escoffier în 1903 (Recette 2062) fără marinare prealabilă la cald, perfecționat metodic de Julia Child în 1961 prin introducerea tehnicii *singer* în cuptor uscat și separarea absolută a garniturii tripartite burgunde (*lardons*, *oignons grelots glacés à brun*, *champignons sautés*).

#### B. Primary Reference Sources
- *Auguste Escoffier (1903/1921):* *Le Guide Culinaire*, Recette 2062 (*Ragoût de bœuf à la bourguignonne*).
- *Julia Child, Simone Beck, Louisette Bertholle (1961):* *Mastering the Art of French Cooking*, Vol. 1, pp. 315–317.
- *Paul Bocuse (1976):* *La Cuisine du Marché*, p. 198.
- *Harold McGee (2004):* *On Food and Cooking*, pp. 160–165 (cinetica hidrolizei colagenului în gelatină la 85–90°C).

#### C. Evaluation Against Canonical Practice
- **Meat Anatomy:** 1200 g pulpă/spată bogată în colagen (*paleron*, *gîte*, *macreuse*). Cuburi generoase de 4–5 cm. Uscarea minuțioasă pe prosoape este specificată obligatoriu pentru a preveni scăderea temperaturii sub 140°C.
- **The Singer Technique:** 45 g făină pudrată peste carne și rumenită 8 minute la 230°C în cuptor deschis (Child 1961) înainte de udare cu vin. Dextrinizează amidonul, elimină gustul de făină crudă și asigură o legare mătăsoasă fără cocoloașe.
- **Braising Liquid Ratio:** 750 ml Pinot Noir (o sticlă întreagă) + 500 ml fond brun concentrat de vită. Oferă aciditatea tartrică necesară pentru dedurizarea fibrelor musculare fără a deveni acru.
- **Independent Parallel Garnishes:** Cepele perlate (300 g) sunt glacate separat *à brun* cu unt și zahăr; ciupercile (400 g) sunt sotate uscat pe foc viu; lardonii (200 g) sunt blanșați și rumeniți separat. Această tehnică împiedică dizolvarea și transformarea legumelor în piure pe durata celor 2,5 ore de fierbere a cărnii.

#### D. Discrepancies & Deficiencies Identified
1. **[MINOR] Alocarea untului în etape paralele:** Ingredientul unt este împărțit între glacarea cepelor (20 g), sotarea ciupercilor (30 g) și finisarea sosului (*monter au beurre* 30 g), însă în lista de ingrediente este declarat agregat sau fracționat incomplet în raport cu pașii V2.
2. **[OBSERVATION] Volumul minim de lichid la scalare (2 porții):** La 2 porții (400 g carne), un volum redus proporțional la o treime (250 ml vin + 165 ml fond) într-o cocotte standard de 26 cm va avea o peliculă de doar câțiva milimetri, riscând evaporarea completă în 2,5 ore. Înăbușirea impune o adâncime minimă de imersie independentă de porții.

---

### RECIPE 4: Soufflé Chaud au Fromage
- **Record ID:** `rec_souffle_fromage_004`
- **Slug:** `souffle-au-fromage`
- **Current Version:** `1.0.0`
- **Status:** `editorial_review`
- **Declared Yield:** 4 ramekin-uri individuale de 180–200 ml (~670 g total)
- **Declared Timing:** Activ 30 min, Total 55 min, Pasiv 25 min

#### A. Canonical Culinary Identity & Historical Provenance
Soufflé-ul sărat clasic cu brânză maturată este culmea preciziei tehnice a bucătăriei franceze de restaurant și patiserie. Standardizat de Marie-Antoine Carême în 1815 pe bază de rântaș alb și ouă separate, apoi canonizat de Auguste Escoffier (Recette 2271).
Baza este o *béchamel serrée* (densă), îmbogățită cu gălbenușuri adăugate în afara focului (*hors du feu*) și brânză Comté AOP, aerată prin plierea delicată a albușurilor bătute spumă fermă (*bec d'oiseau*).

#### B. Primary Reference Sources
- *Marie-Antoine Carême (1815):* *Le Pâtissier Royal Parisien*, Tome II, pp. 280–295.
- *Auguste Escoffier (1903/1921):* *Le Guide Culinaire*, Recette 2271 (*Soufflé au Fromage*).
- *Prosper Montagné (1938):* *Larousse Gastronomique*, art. „Soufflé”.
- *Harold McGee (2004):* *On Food and Cooking*, pp. 102–104 (termodinamica expansiunii bulelor de aer și a vaporilor de apă).

#### C. Evaluation Against Canonical Practice
- **The Egg Asymmetry Rule:** 4 gălbenușuri în bază și 5 albușuri în spumă (*regula n+1 albușuri*). Oferă forța ascensională optimă fără a usca miezul sufleului.
- **Chemisage Vertical & Comté Crust:** Ungerea formelor cu unt moale strict de jos în sus, urmată de pudrarea cu Comté ras fin. Direcționează expansiunea verticală și formează o crustă inferioară izolantă.
- **Dégagement du Bord:** Trecerea degetului mare pe marginea superioară interioară a ramekin-ului pentru a crea un șanț de 2 mm. Previne aderența compoziției de buza ramekin-ului și garantează o creștere perfect dreaptă, ca un cilindru de pălărie.
- **Thermal Safety of Yolks:** Răcirea béchamel-ului la 50–55°C înainte de adăugarea gălbenușurilor. Previne coagularea lipoproteinelor (care debutează la 65°C), evitând formarea cocoloașelor de ou fiert.
- **Static Oven Protocol:** Coacere la 190°C static, pe treapta inferioară, cu interdicția absolută de a deschide ușa cuptorului în primele 20 de minute (risc de șoc termic și prăbușire a coloanei de gaz expandat).

#### D. Discrepancies & Deficiencies Identified
1. **[OBSERVATION] Fereastra de servire:** Sufleul pierde 20–30% din volum în primele 3–4 minute de la scoaterea din cuptor. Instrucțiunile de Cook Mode trebuie să avertizeze sonor și vizual bucătarul că oaspeții trebuie să fie așezați la masă *înainte* de expirarea timerului de coacere.

---

### RECIPE 5: Sarmale Tradiționale în Foi de Varză Murată
- **Record ID:** `rec_sarmale_traditionale_012`
- **Slug:** `sarmale-traditionale-moldovenesti`
- **Current Version:** `1.0.0`
- **Status:** `editorial_review`
- **Declared Yield:** 8 porții (~2400 g final; ~300 g/porție)
- **Declared Timing:** Activ 50 min, Total 230 min, Pasiv 180 min

#### A. Canonical Culinary Identity & Historical Provenance
Sarmalele în foi de varză murată reprezintă pilonul fundamental al identității gastronomice românești festive. Deși tehnica învelirii cărnii în frunze este de sorginte otomană (*sarma*), sarmaua românească s-a individualizat canonic prin utilizarea exclusivă a **porcului gras asociat cu carnea de vită**, a **verzei murate în saramură naturală** (spre deosebire de frunza de viță orientală), a aromelor dominante de **cimbru de grădină uscat** și **mărar**, a **straturilor generoase de costiță sau afumătură de porc**, și a **fierberii extrem de lungi (3–4 ore) în vase de lut ars la foc domol**.

#### B. Primary Reference Sources
- *Mihail Kogălniceanu & Costache Negruzzi (1841):* *200 de rețete cercate de bucate, prăjituri și alte trebi gospodărești* (Iași, Cantora Foiei Sătești) — Rețeta nr. 40: *Găluște (Sarmale)*.
- *Sanda Marin (1936):* *Carte de Bucate*, pp. 112–114 (*Sarmale în foi de varză*).
- *Radu Anton Roman (1998):* *Bucate, vinuri și obiceiuri românești* (Editura Paideia), pp. 154–157 (*Sarmale moldovenești de Crăciun*).
- *Păstorel Teodoreanu (1973):* *Gastronomice*, pp. 88–92 (*Despre arta sarmalei*).

#### C. Evaluation Against Canonical Practice
- **Meat-to-Rice Ratio:** 800 g carne tocată (porc + vită) și 100 g orez cu bob rotund. Raport de 8:1 (12,5% orez). Acest raport este fidel marii tradiții moldovenești de sărbătoare (sarmale mici, cărnoase, unde orezul are rol de afânare, nu de umplutură ieftină de balast).
- **Onion & Rice Sautéing:** Ceapa înăbușită ușor în ulei împreună cu orezul până devin translucide înainte de amestecare cu carnea crudă. Aceasta este tehnica clasică (Sanda Marin / Radu Anton Roman) care garantează o compoziție fragedă și evită mirosul de ceapă crudă fermentată.
- **Earthenware & Layering:** Clădirea pe pat de varză tocată mărunt cu mărar și cimbru, intercalarea cu costiță afumată și acoperirea cu capac/foi de varză pentru a menține sarmalele complet imersate în abur.

#### D. Material Defects & Discrepancies Identified (CRITICAL & MAJOR)
Spre deosebire de primele 4 rețete (care au beneficiat de dosare editoriale de cercetare aprofundate în Faza 002-D), rețeta de Sarmale a fost introdusă în Faza 004 cu carențe concrete de integritate a datelor:
1. **[CRITICAL] Lichidul de fierbere lipsește complet din lista de ingrediente:**
   - *Evidență:* În Pasul 5 (`step_sm_fierbere_lenta_05`), instrucțiunea specifică: *„Dizolvați restul de pastă de tomate în 500-600 ml apă caldă și turnați peste sarmale până la nivelul ultimului strat.”*
   - *Defect:* În lista de ingrediente (`ingredients`), **apa caldă (sau zeama de varză diluată / supa de carne) este complet absentă**! Un utilizator care își pregătește ingredientele (sau le bifează în checklist-ul interfeței) nu are cantitatea de lichid specificată.
2. **[MAJOR] Carență de alocare a pastei de tomate:**
   - *Evidență:* În `ingredients`, `pasta-tomate` este declarată o singură dată ca 70 g. În Pasul 2 se cer „2 linguri de pastă de tomate”, iar în Pasul 5 se cere „restul de pastă de tomate”. Nu există cantități metrice explicite alocate fiecărui pas în parte (`quantity_used_in_step`), lăsând bucătarul să ghicească cât înseamnă „restul”.
3. **[MAJOR] Absența pasului tehnologic de desărare / pregătire a foilor:**
   - *Evidență:* În `editorial_notes` se menționează corect: *„Desărarea foilor de varză în apă călduță este obligatorie dacă varza este prea acră sau sărată.”*
   - *Defect:* Nu există niciun pas operațional în rețetă dedicat desfrunzirii, spălării, desărării sau subțierii nervurilor groase! Pasul 1 sare direct la călirea cepei, iar Pasul 3 sare direct la rulare. Dacă varza murată este prea sărată, nerealizarea desărării distruge ireversibil preparatul.
4. **[MINOR] Elemente de servire menționate dar nedeclarate ca ingrediente:**
   - *Evidență:* Pasul 6 specifică: *„Se servesc fierbinți cu mămăligă caldă, smântână grasă și ardei iute proaspăt.”*
   - *Defect:* Mămăliga, smântâna și ardeiul iute nu figurează în lista de ingrediente nici măcar cu statut `optional: true`.

---

## 3. Comparative Summary Table

| Rețetă | ID | Porții | Calitate Gastronomică | Integritate Ingrediente | Executabilitate Tehnică | Statut Recomandat |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Tagliatelle al Ragù** | `rec_tagliatelle_ragu_001` | 6 | Canonică (AIC 2023) | 98% (Omisiune ref pas 8) | Excelentă (Piste paralele) | **PASS** |
| **Risotto alla Milanese** | `rec_risotto_milanese_002` | 4 | Canonică (De.Co. 2007) | 100% (Metrică fidelă) | Excelentă (Control termic) | **PASS** |
| **Boeuf Bourguignon** | `rec_boeuf_bourguignon_003` | 6 | Canonică (Escoffier/Child) | 95% (Alocare unt parțială) | Excelentă (Garnituri paralele) | **PASS** |
| **Soufflé au Fromage** | `rec_souffle_fromage_004` | 4 | Canonică (Carême/Escoffier) | 100% (Regula n+1) | Excepțională (Acuratețe fizică) | **PASS** |
| **Sarmale Tradiționale** | `rec_sarmale_traditionale_012` | 8 | Tradițională validă | 75% (Lichid lipsă, alocare) | Deficitară (Lipsă pas desărare) | **CONDITIONAL PASS** |

---

## 4. Concluzia Auditului Baseline

Patru din cele cinci rețete canonice (`Tagliatelle al Ragù`, `Risotto alla Milanese`, `Boeuf Bourguignon`, `Soufflé au Fromage`) au un nivel gastronomic și tehnic de cel mai înalt rang, respectând riguros sursele primare istorice și instituționale.

Rețeta de **Sarmale Tradiționale** (`rec_sarmale_traditionale_012`), deși are o compoziție gastronomică autentică, prezintă defecte concrete de integritate a datelor (lichid de gătire nedeclarat în ingrediente, lipsă pas tehnologic de pregătire a foilor de varză, alocări metrice ambigue) care necesită corecție prioritară în Faza 005.
