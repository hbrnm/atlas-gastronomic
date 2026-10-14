# ATLAS GASTRONOMIC — PHASE 005-A
## FINDINGS REGISTER (DEFECTS, RISKS & OBSERVATIONS)

**Protocol:** Atlas AOS  
**Authority:** Product Owner  
**Phase:** 005-A (Culinary Baseline Audit)  
**Classification Standard:** CRITICAL / MAJOR / MINOR / OBSERVATION  
**Audit Baseline:** Existing 5 Canonical Recipes in Product (`sample-data.ts`, `additional-recipes.ts`)

---

## 1. Summary of Registered Findings

| ID Găsire | Rețetă Vizată | Severitate | Categorie | Modificare Schemă Necesară? |
| :--- | :--- | :---: | :---: | :---: |
| **FIND-005A-01** | `rec_sarmale_traditionale_012` | **CRITICAL** | Integritate Ingrediente | **NU** |
| **FIND-005A-02** | `rec_sarmale_traditionale_012` | **MAJOR** | Logică & Alocare Ingrediente | **NU** |
| **FIND-005A-03** | `rec_sarmale_traditionale_012` | **MAJOR** | Execuție Tehnică & Secvență | **NU** |
| **FIND-005A-04** | `rec_sarmale_traditionale_012` | **MINOR** | Editorial & Servire | **NU** |
| **FIND-005A-05** | `rec_tagliatelle_ragu_001` | **MINOR** | Referințe Pas & Intermediari | **NU** |
| **FIND-005A-06** | `rec_boeuf_bourguignon_003` | **MINOR** | Alocare Fracționată Unt | **NU** |
| **FIND-005A-07** | `rec_tagliatelle_ragu_001` | **OBSERVATION** | Scalare Matematică Ouă | **NU** |
| **FIND-005A-08** | `rec_boeuf_bourguignon_003` | **OBSERVATION** | Scalare Fizică Lichid Înăbușire | **NU** |
| **FIND-005A-09** | `rec_souffle_fromage_004` | **OBSERVATION** | Scalare Ouă Fracționare | **NU** |
| **FIND-005A-10** | `rec_risotto_milanese_002` | **OBSERVATION** | Extracție Măduvă din Os | **NU** |

---

## 2. Detailed Findings Register

---

### Finding FIND-005A-01
- **Recipe ID:** `rec_sarmale_traditionale_012` (Sarmale Tradiționale în Foi de Varză Murată)
- **Exact Location:** `ingredients` vs. `steps[4]` (`step_sm_fierbere_lenta_05`)
- **Severity:** **CRITICAL**
- **Description:** Lichidul de fierbere lentă este utilizat în instrucțiunea pasului 5, dar lipsește cu desăvârșire din lista de ingrediente a rețetei.
- **Evidence:** 
  - Pasul 5 menționează: *„Dizolvați restul de pastă de tomate în 500-600 ml apă caldă și turnați peste sarmale până la nivelul ultimului strat.”*
  - Array-ul `ingredients` conține doar 9 elemente: carne (800g), varză (1500g), orez (100g), ceapă (200g), afumătură (200g), pastă tomate (70g), cimbru/mărar (10g), ulei (40ml), piper/sare (5g). **Apa caldă / fondul nu figurează nicăieri.**
- **Why It Matters:** Un bucătar care face cumpărăturile sau pregătește *mise en place*-ul urmărind checklist-ul de ingrediente ajunge la pasul de gătire fără a avea lichidul măsurat, compromițând consistența și calculul nutrițional/volumetric.
- **Recommended Correction:** Declararea în `ingredients` a ingredientului `apa-calda` (sau `zeama-varza-diluata` / `supa-oase`): cantitate 600 ml, unitate `ml`, grup `Sos & Lichid`, `sequence_order: 10`.
- **Schema Change Necessary:** **NU**. Schema V2 suportă nativ adăugarea de ingrediente suplimentare.

---

### Finding FIND-005A-02
- **Recipe ID:** `rec_sarmale_traditionale_012`
- **Exact Location:** `ingredients` (`ing_sm_06`) vs. `steps[1]` și `steps[4]`
- **Severity:** **MAJOR**
- **Description:** Cantitatea de pastă de tomate este declarată agregat (70 g), dar este divizată vag în instrucțiuni („2 linguri” vs „restul”), fără alocare metrică precisă per pas.
- **Evidence:**
  - `ing_sm_06`: `quantity: 70`, `unit: 'g'`.
  - Pasul 2: *„...2 linguri de pastă de tomate...”* (~30–35 g).
  - Pasul 5: *„Dizolvați restul de pastă de tomate...”* (~35–40 g).
  - Lipsesc proprietățile V2 `allocations` la nivelul pașilor.
- **Why It Matters:** Creează ambiguitate la execuție și împiedică scalarea automată proporțională precisă a fiecărei componente (umplutură vs. lichid de acoperire).
- **Recommended Correction:** Structurarea explicită a alocării V2:
  - Pasul 2 (`step_sm_omogenizare_umplutura_02`): 30 g pastă de tomate în umplutură.
  - Pasul 5 (`step_sm_fierbere_lenta_05`): 40 g pastă de tomate dizolvată în lichidul de acoperire.
- **Schema Change Necessary:** **NU**. Modelul V2 `allocations` (`quantity_used_in_step`) este deja implementat în server și baza de date.

---

### Finding FIND-005A-03
- **Recipe ID:** `rec_sarmale_traditionale_012`
- **Exact Location:** `steps` (între pasul 1 și pasul 3)
- **Severity:** **MAJOR**
- **Description:** Lipsește un pas operațional dedicat pregătirii, desfrunzirii, spălării și desărării foilor de varză murată.
- **Evidence:**
  - În `editorial_notes`, nota 1 atrage atenția: *„Desărarea foilor de varză în apă călduță este obligatorie dacă varza este prea acră sau sărată.”*
  - În fluxul de pași (`steps`), se trece direct de la călirea cepei și orezului (Pasul 1) și amestecarea cărnii (Pasul 2) la rulare (Pasul 3: *„Așezați o foaie subțire de varză murată pe palmă...”*).
- **Why It Matters:** Varza murată comercială sau de casă are adesea o salinitate excesivă (2–4% NaCl). Rularea sarmalelor fără spălare/desărare prealabilă și fără îndepărtarea nervurilor lemnoase groase conduce la un preparat necomestibil (hiper-sărat sau cu foi tari).
- **Recommended Correction:** Introducerea unui pas operațional dedicat (`step_sm_pregatire_varza_02a` sau renumerotare) de 15 minute: *„Desfaceți căpățâna de varză, alegeți foile întregi și subțiri, îndepărtați nervurile groase și lăsați-le 15-20 de minute în apă călduță dacă varza este prea sărată sau acră. Tocați fideluță cotoarele și foile rupte pentru patul oalei.”*
- **Schema Change Necessary:** **NU**.

---

### Finding FIND-005A-04
- **Recipe ID:** `rec_sarmale_traditionale_012`
- **Exact Location:** `steps[5]` (`step_sm_servire_06`) vs. `ingredients`
- **Severity:** **MINOR**
- **Description:** Garniturile tradiționale menționate în pasul de servire (mămăligă, smântână, ardei iute) nu sunt înregistrate în lista de ingrediente ca elemente opționale de servire.
- **Evidence:** Pasul 6 specifică: *„Se servesc fierbinți cu mămăligă caldă, smântână grasă și ardei iute proaspăt.”* Aceste elemente nu apar în tabelul de ingrediente.
- **Why It Matters:** Pentru un utilizator care navighează checklist-ul rețetei, lipsa acestora din lista de cumpărături creează surprize în momentul servirii.
- **Recommended Correction:** Adăugarea în `ingredients` a ingredientelor de acompaniament cu `optional: true` și `group: 'Servire Tradițională'`: `smantana-fermentata` (200 g), `ardei-iute` (4 buc), `faina-malai` (pentru mămăligă).
- **Schema Change Necessary:** **NU**.

---

### Finding FIND-005A-05
- **Recipe ID:** `rec_tagliatelle_ragu_001` (Tagliatelle al Ragù alla Bolognese)
- **Exact Location:** `steps[7]` (`step_serv_08`)
- **Severity:** **MINOR**
- **Description:** Pasul final de fierbere a pastelor și combinare cu sosul declară ca referințe de ingrediente doar `['sare-apa', 'parmigiano']`, fără a specifica referința formală la pastele proaspete și ragù-ul gata preparat.
- **Evidence:** `ingredient_refs: ['sare-apa', 'parmigiano']`.
- **Why It Matters:** Deși dependențele grafice (`depends_on: ['step_ragu_05', 'step_pasta_07']`) rezolvă corect ordinea de execuție, auditul de integritate arată o lipsă de referențiere semantică a produselor intermediare.
- **Recommended Correction:** Păstrarea ca referințe externe sau completarea în descrierea pasului cu referire la componentele intermediare.
- **Schema Change Necessary:** **NU**.

---

### Finding FIND-005A-06
- **Recipe ID:** `rec_boeuf_bourguignon_003` (Boeuf Bourguignon Tradițional)
- **Exact Location:** `ingredients` (`ing_bb_11`, `ing_bb_14`, etc.)
- **Severity:** **MINOR**
- **Description:** Untul este utilizat în trei momente distincte ale rețetei (glacare cepe perlate, sotare ciuperci, finisare sos prin *monter au beurre*), dar este declarat agregat sau cu alocări parțiale.
- **Evidence:** În pasul 6 se cer 20 g unt, în pasul 7 se cer 30 g unt, iar în pasul 8 se cer 30 g unt.
- **Why It Matters:** Claritatea în Cook Mode crește atunci când fiecare tranșă de unt are scopul și starea termică declarată (ex: unt rece la cubulețe pentru *monter au beurre* vs. unt la temperatura camerei pentru sotat).
- **Recommended Correction:** Declararea tranșelor de unt cu etichete clare în `name` și `notes`, reflectate în alocările V2 ale pașilor.
- **Schema Change Necessary:** **NU**.

---

### Finding FIND-005A-07
- **Recipe ID:** `rec_tagliatelle_ragu_001`
- **Exact Location:** Portions Scaler (2 porții)
- **Severity:** **OBSERVATION**
- **Description:** Scalarea cantității de ouă proaspete pentru paste conduce la valori fracționare nenaturale (1,33 ouă pentru 2 porții).
- **Evidence:** Rețeta de bază pentru 6 porții are 4 ouă mari și 400 g făină. Scalat la 2 porții (factor 0,333), rezultă 133 g făină și 1,33 ouă.
- **Why It Matters:** Bucătarii casnici nu pot sparge 0,33 ouă fără instrucțiuni specifice (baterea oului și cântărirea a ~73 g masă lichidă totală sau folosirea a 1 ou întreg + 1 gălbenuș).
- **Recommended Correction:** Adăugarea unei note explicative de scalare în `editorial_notes` privind ajustarea ouălor la porții pare mici.
- **Schema Change Necessary:** **NU**.

---

### Finding FIND-005A-08
- **Recipe ID:** `rec_boeuf_bourguignon_003`
- **Exact Location:** Portions Scaler & Evaporare Lichid
- **Severity:** **OBSERVATION**
- **Description:** La scalarea de la 6 la 2 porții, volumul de lichid de înăbușire (250 ml vin + 165 ml fond = 415 ml) scade sub pragul critic de acoperire într-o cocotte standard de 24–26 cm.
- **Evidence:** Evaporarea și adâncimea băii de lichid depind de geometria vasului (suprafață / diametru), nu de numărul de consumatori.
- **Why It Matters:** Înăbușirea timp de 2,5 ore într-o oală prea largă cu lichid insuficient duce la uscarea cărnii și arderea fondului.
- **Recommended Correction:** Adăugarea unei note practice de utilizare a unei oale de diametru mai mic (18–20 cm) pentru 2 porții sau menținerea unui volum minim de lichid de 500 ml.
- **Schema Change Necessary:** **NU**.

---

### Finding FIND-005A-09
- **Recipe ID:** `rec_souffle_fromage_004`
- **Exact Location:** Portions Scaler (2 porții / 6 porții)
- **Severity:** **OBSERVATION**
- **Description:** Regula asimetrică a sufleului (4 gălbenușuri + 5 albușuri) generează 2,5 albușuri la 2 porții și 7,5 albușuri la 6 porții.
- **Evidence:** Scalare matematică pur liniară: 5 * (2/4) = 2,5.
- **Why It Matters:** În bucătăria reală se folosesc 3 albușuri la 2 ramekin-uri (rotunjire superioară), nu 2,5 albușuri.
- **Recommended Correction:** Menționarea în note a rotunjirii superioare pentru albușurile suplimentare la porții pare.
- **Schema Change Necessary:** **NU**.

---

### Finding FIND-005A-10
- **Recipe ID:** `rec_risotto_milanese_002`
- **Exact Location:** `ingredients` (`ing_rm_02` — măduvă de vită)
- **Severity:** **OBSERVATION**
- **Description:** Rețeta presupune deținerea a 25 g măduvă gata curățată, fără a ghida utilizatorul în privința cantității brute de oase cu măduvă necesare de la măcelărie.
- **Evidence:** `quantity: 25`, `unit: 'g'`, `name: 'Măduvă proaspătă de vită'`.
- **Why It Matters:** Măduva se vinde de obicei în rondele de os de rasol (*ossobuco*) de circa 150–200 g pentru a extrage 25–30 g măduvă utilă.
- **Recommended Correction:** Precizarea în `notes`: *„Echivalentul a 1-2 rondele de os de vită cu măduvă (circa 150 g os brut din care se extrag 25-30 g măduvă curată)”*.
- **Schema Change Necessary:** **NU**.
