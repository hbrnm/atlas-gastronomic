# ATLAS GASTRONOMIC — PHASE 002-C
# PLANUL DE COMPATIBILITATE ȘI MIGRARE (RECIPE CORE V1 → V2) — REV 1.4

**Protocol:** Atlas AOS  
**Etapă:** Phase 002-C — Recipe Core Evolution Strategy & Architecture Decision  
**Autoritate:** Product Owner — DOCUMENTATION EXECUTION ONLY  
**Statut:** PLAN STRATEGIC DE COMPATIBILITATE (PROPOSED)  
**Versiune:** Rev 1.4 (Coordinated Document Revision — Rigor & Coherence)  
**Baseline HEAD:** `dc8dd75395049a9599ecbde83fa5015a6f07190e`  
**Standarde Canonice:** `standards/v1.0.0/` — FROZEN / IMMUTABLE  

---

## 1. PRINCIPIUL SUPRA-SETULUI ADITIV ȘI CELE NOUĂ DIMENSIUNI DE COMPATIBILITATE

Evoluția spre Recipe Core V2 este guvernată de **Principiul Supra-setului Strict Aditiv (*Strict Additive Superset*)**:

> **Regula Imutabilității și Conservării Contractului:**
> 1. Orice document JSON valid conform schemei `standards/v1.0.0/schemas/recipe.schema.json` trebuie să fie **valid nativ** în viitoarea schemă Recipe Core V2, fără modificări.
> 2. Toate proprietățile noi propuse pentru V2 sunt **strict opționale** (array-ul `required` din JSON Schema nu va include niciun câmp nou).
> 3. **Conservarea Constrângerilor V1:** Supra-setul aditiv **nu slăbește constrângerile de integritate ale contractului V1**. Proprietățile obligatorii existente (`title`, `servings`, `steps`), numerotarea secvențială validă a pașilor (`1..N`) și regulile de integritate referențială pentru ingrediente rămân strict aplicabile.
> 
> *Notă de Guvernanță:* Compatibilitatea V2 reprezintă o **ipoteză arhitecturală de proiectare ce trebuie demonstrată empiric prin teste automate în faza de implementare (Phase 002-D)**, și nu o proprietate asumată ca fiind deja demonstrată.

```
┌─────────────────────────────────────────────────────────────────────────┐
│              Cele Nouă Dimensiuni ale Compatibilității V1 / V2          │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. Structural Compatibility:     Schema V2 este superset aditiv valid   │
│ 2. Semantic Compatibility:       Păstrarea nealterată a sensului de date│
│ 3. Validation Compatibility:     Păstrarea constrângerilor V1 în V2     │
│ 4. Persistence Compatibility:    Zero comenzi DDL distructive în SQLite │
│ 5. Read Compatibility:           V2 citește V1; V1 citește V2           │
│ 6. Write Compatibility:          Scrieri sigure în DB migrat            │
│ 7. Code Rollback:                Downgrade de cod la V1 fără erori      │
│ 8. Database Rollback:            Reversibilitate DDL prin scripturi down│
│ 9. Preservation of V2 Data:      Protecție la rescriere prin clienți V1 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Detalierea celor Nouă Dimensiuni

1. **Compatibilitate Structurală (*Structural Compatibility*):** Schema JSON V2 acceptă toate documentele conforme V1 ca instanțe valide, extinzând doar proprietăți opționale.
2. **Compatibilitate Semantică (*Semantic Compatibility*):** Absența câmpurilor noi V2 este interpretată conform convențiilor firești de atelier, fără distorsionarea sensului culinar.
3. **Compatibilitate de Validare (*Validation Compatibility*):** Motorul de validare TypeScript acceptă obiecte V1 fără a arunca erori și menține toate verificările stricte moștenite din V1 (titlu, porții, pași nevizi).
4. **Compatibilitate de Persistență (*Persistence Compatibility*):** Tabela SQLite `recipes` și tabelele conexe nu suferă ștergeri de tabele, eliminări de coloane sau modificări de tipuri. Toate coloanele noi au clauza `DEFAULT NULL`.
5. **Compatibilitate la Citire (*Read Compatibility*):**
   - Codul V2 citește fără erori înregistrările V1 din baza de date;
   - Codul V1 poate citi o bază de date migrată la V2, ignorând noile coloane necunoscute prin mapare selectivă.
6. **Compatibilitate la Scriere (*Write Compatibility*):** Aplicația V2 poate insera și actualiza rețete V1 sau V2 fără a încălca constrângerile de integritate ale schemei SQLite.
7. **Reversibilitate de Cod (*Code Rollback*):** În eventualitatea unui incident critic în producție, revenirea codului executabil de la V2 la V1 trebuie să se finalizeze fără erori la pornire sau la citire.
8. **Reversibilitate de Bază de Date (*Database Rollback*):** Migrările DDL V2 trebuie să fie însoțite de scripturi de rollback demonstrabile care pot readuce structura bazei la starea exactă V1.
9. **Conservarea Datelor V2 (*Preservation of V2-only Data*):**
   - *Analiză de Risc:* **Un client pur V1 nu poate salva documente V2 fără pierderi de date V2 în mod nativ**, deoarece o interfață V1 care deserializează un obiect într-un tip TypeScript V1 va ignora și va pierde câmpurile V2 (`depends_on`, `quantity_used_in_step`) la o reserializare completă (*full overwrite*).
   - *Soluție Arhitecturală Necesară:* Pentru a garanta conservarea datelor V2, sistemul trebuie să implementeze fie actualizări parțiale la nivel de câmp pe server (*PATCH semantic*), fie un container pasiv de extensibilitate (*passthrough extension bucket*).

### Comportamentul Stărilor Proprietăților JSON în V2
* **Absent (`undefined`):** Se aplică comportamentul canonic implicit V1 (succesiune secvențială, fără pistă, alocare conform textului).
* **Valoare `null`:** Semnalează explicit că parametrul este nealocat structural sau lăsat la aprecierea atelierului (*quanto basta* / fără constrângere).
* **Valoare Prezentă:** Validată strict conform tipului, domeniului de valori și regulilor referențiale V2.

---

## 2. AUDITUL DISCREPANȚELOR, PROVENIENȚA EDITORIALĂ ȘI NAMESPACE-UL V1

```
┌─────────────────────────────────────────────────────────────────────────┐
│        Discrepanța V1: JSON Schema vs. TypeScript Types                 │
├───────────────────────────────┬─────────────────────────────────────────┤
│ standards/v1.0.0/ (Canonic)   │ src/shared/types.ts (Implementare V1)   │
├───────────────────────────────┼─────────────────────────────────────────┤
│ • claims: Claim[]             │ • LIPSĂ în interfața Recipe             │
│ • review: Review | null       │ • LIPSĂ în interfața Recipe             │
│ • nutrition_estimate: Object  │ • LIPSĂ în interfața Recipe             │
│ • sources: string[]           │ • sources?: string[] (prezent)          │
│ • editorial_notes: string[]   │ • editorial_notes?: string[] (prezent)  │
└───────────────────────────────┴─────────────────────────────────────────┘
```

### Proveniența Editorială și Sursa Primară de Adevăr
* **Sursa Editorială și Istorică Primară:** Dosarele Markdown (`docs/editorial/DOSSIER_*.md`) sunt sursa primară de adevăr uman pentru afirmațiile istorice, variantele metodice și citările academice.
* **Proiecția Structurată de Date:** Schema JSON și tabelele SQLite reprezintă o **proiecție structurată derivată** optimizată pentru interogări rapide și afișare în UI.
* **Gestiunea Divergențelor:** Rețeta proiectată stochează hash-ul de versiune `source_dossier_commit`. Scripturile de audit compară proiecția cu fișierul sursă Markdown pentru a semnala divergențele.
* **Economie de Schemă:** Nu se creează coloane SQLite pentru fiecare câmp textual narativ; se folosesc coloane serializate JSON (`claims_json`, `review_json`, `nutrition_json`).
* **Semantica în datele V1:** Câmpurile `claims`, `review` și `nutrition_estimate` sunt **neînregistrate (`undefined` / absent)** în V1, **nu un array vid afirmativ**.

### Namespace-ul și Imutabilitatea Standardului V1
* **Imutabilitate:** Pachetul `standards/v1.0.0/` este strict înghețat (FROZEN / IMMUTABLE). Niciun fișier nu se modifică.
* **Identificator Canonic vs. Descărcare:** Identificatorul `$id` al schemei V1 rămâne neschimbat: `https://atlas-gastronomic.local/schemas/recipe.schema.json`. Acesta este un **URI canonic abstract de identificare a specificației**, decuplat de adresa de rețea (URL) de la care fișierul poate fi descărcat.

---

## 3. PROTOCOLUL CELOR ȘASE PROBE TEHNICE DE COMPATIBILITATE

Compatibilitatea retroactivă este supusă unui protocol de verificare structurat pe șase probe independente cu criterii obiective:

```
┌────────────────────────────────────────────────────────────────────────┐
│         Cele 6 Probe Verificabile de Compatibilitate V1 / V2           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Type Compatibility:   Aliniere TS Types cu JSON Schema v1.0.0       │
│ 2. Round-trip:           Conservare semantică bidirecțională completă  │
│ 3. Persistence:          Interogări SQLite native pe schema existentă  │
│ 4. Migration Safety:     Zero comenzi distructive & verificare FK      │
│ 5. UI Compatibility:     Randare și salvare fără erori în React 19     │
│ 6. Rollback & Regression: Baseline raportat + teste de simulare V2     │
└────────────────────────────────────────────────────────────────────────┘
```

### Proba 1: Compatibilitate de Tipuri (*Type Compatibility*)
* **Criteriu:** Compilarea proiectului (`npm run build` / tsc) trebuie să se finalizeze cu 0 erori de tip, demonstrând că orice obiect valid conform tipurilor V1 satisface contractul structural al tipurilor extinse V2.

### Proba 2: Conservare Semantică Bidirecțională (*Semantic Round-Trip*)
* **Criterii Verificabile:**
  1. *Ciclul V1 $\rightarrow$ V2 $\rightarrow$ V1:* Un document V1 ingestat în modelul V2, persistat în SQLite, reîncărcat și reproiectat în format V1 trebuie să fie identic semantic cu originalul:
     $$\text{Project}_{V1}(\text{Read}_{V2}(\text{Persist}_{V2}(\text{Ingest}_{V2}(R_{V1})))) \equiv R_{V1}$$
  2. *Ciclul V2 $\rightarrow$ Client V1 $\rightarrow$ V2:* Verificarea comportamentului la salvare prin clienți V1. Testul trebuie să probeze că datele V2 nu sunt corupte sau pierdute la actualizări parțiale.

### Proba 3: Persistență Relațională (*Persistence Integrity*)
* **Criteriu:** Clasa `RecipeRepository` din `src/server/repository.ts` trebuie să poată citi și scrie arborele relațional complet (rețetă, ingrediente, pași, referințe) pentru rețetele V1 stocate în SQLite, menținând integritatea referențială și ștergerea în cascadă (*cascade delete*).

### Proba 4: Siguranța Migrării Bazei de Date (*Migration Safety*)
* **Criterii Verificabile:**
  1. Scripturile de migrare se execută în mod *dry-run* pe baza existentă populată cu semințe (*seeds*).
  2. Sunt permise exclusiv operațiuni aditive: `ALTER TABLE ... ADD COLUMN ... DEFAULT NULL` și crearea de tabele noi.
  3. Sunt strict interzise: `DROP TABLE`, `DROP COLUMN`, redenumirea de coloane existente sau modificarea tipurilor de date.
  4. Rularea comenzii `PRAGMA foreign_key_check` raportează 0 erori sau încălcări de integritate.
  5. Verificarea planurilor de execuție a interogărilor (`EXPLAIN QUERY PLAN`) confirmă că performanța citirilor V1 nu este degradată.

### Proba 5: Compatibilitate Editorială în Interfață (*UI Compatibility*)
* **Criteriu:** Editorul React 19 deschide orice rețetă V1, afișează corect metadatele, ingredientele și pașii, iar panoul de validare raportează 0 erori. Formularul permite salvarea modificărilor fără a solicita completarea câmpurilor V2.

### Proba 6: Rollback și Non-Regresie (*Rollback & Regression Verification*)
* **Clarificare de Guvernanță privind Testele Existente:** Trecerea celor 18 teste automate existente reprezintă **baseline-ul obligatoriu de raportare și non-regresie**, dar **nu constituie o dovadă suficientă a funcționării V2**.
* **Protocol de Rollback Demonstrabil:**
  - În Faza 002-D, va fi creat un test automat de simulare de downgrade în care o bază de date migrată la V2 (conținând date V2) este deschisă și interogată de o instanță a codului V1.
  - Testul trebuie să confirme că aplicația V1 funcționează corect, citește toate câmpurile V1 și nu aruncă excepții din cauza coloanelor noi adăugate.

---

## 4. SCENARII DE MIGRARE PASIVĂ PENTRU REȚETELE EXISTENTE

Migrarea rețetelor din V1 în V2 se bazează pe **Migrare Pasivă (*Zero-Effort Ingestion*)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│               Scenariul de Migrare Pasivă pentru Rețete V1             │
├──────────────────────────────────────┬─────────────────────────────────┤
│ Câmp Nou Introdus în V2              │ Valoare Asumată la Ingestia     │
│                                      │ unui Document V1                │
├──────────────────────────────────────┼─────────────────────────────────┤
│ step.step_id                         │ Generat deterministic și salvat │
│                                      │ persistent (ex: recipe_step_1)  │
├──────────────────────────────────────┼─────────────────────────────────┤
│ step.depends_on                      │ Interpretat implicit la runtime:│
│                                      │ succesiune narativă N după N-1; │
│                                      │ NU este materializat în JSON V1 │
├──────────────────────────────────────┼─────────────────────────────────┤
│ step.track                           │ null (fără pistă; NU "main")    │
├──────────────────────────────────────┼─────────────────────────────────┤
│ step.warning_type                    │ null (fără avertisment definit) │
├──────────────────────────────────────┼─────────────────────────────────┤
│ step.warning_message                 │ null                            │
├──────────────────────────────────────┼─────────────────────────────────┤
│ step_ingredient_refs.quantity_used_in_step │ null (alocare nespecificată;    │
│                                      │ NU consum total asumat)         │
├──────────────────────────────────────┼─────────────────────────────────┤
│ recipe.service_window                │ null (fără fereastră structurată│
├──────────────────────────────────────┼─────────────────────────────────┤
│ recipe.lead_time_hours               │ null (fără timp calendaristic)  │
├──────────────────────────────────────┼─────────────────────────────────┤
│ recipe.claims                        │ undefined / absent (neînreg.)   │
├──────────────────────────────────────┼─────────────────────────────────┤
│ recipe.review                        │ null (neînregistrat)            │
├──────────────────────────────────────┼─────────────────────────────────┤
│ recipe.nutrition_estimate            │ null (neînregistrat)            │
└──────────────────────────────────────┴─────────────────────────────────┘
```

> **Clarificări de Rigoare Semantică:**
> 1. `step.track`: Rămâne strict `null`. Nu se introduce nicio pistă implicită (cum ar fi `"main"`), rețetele V1 rămânând complet neafiliate vreunei noțiuni de pistă paralelă.
> 2. `step.depends_on`: La ingestia V1, are semantica de **succesiune narativă implicită interpretată la runtime**, fără a modifica documentul JSON original.
> 3. `step_ingredient_refs.quantity_used_in_step`: Valoarea `null` desemnează o **alocare cantitativă nespecificată structural la pas**, **fără a se presupune automat că s-a consumat întreaga cantitate din inventar**.
> 4. `recipe.claims`: Absența (`undefined`) indică date neînregistrate în structura V1, **nu un array vid care ar afirma lipsa dovezilor**.

---

## 5. PROCEDURA DE SIGURANȚĂ ȘI ROLLBACK DEMONSTRABIL

Garanțiile de siguranță la nivel de procedură:
1. **Izolarea Versiunilor de Schemă:** Standardul V1 rămâne neatins în `standards/v1.0.0/`. Noua versiune va fi publicată exclusiv în `standards/v2.0.0/`.
2. **Copie de Siguranță Pre-Migrare:** Crearea obligatorie a unei copii binare a bazei de date SQLite (`atlas.db.backup`) înainte de orice rulare DDL.
3. **Verificarea prin Test a Reversibilității:** Rollback-ul va fi validat printr-un test automatizat dedicat ce probează că baza de date migrată rămâne pe deplin operabilă pentru aplicația V1.

---

## 6. CONCLUZIE FORMALĂ DE COMPATIBILITATE

Planul de compatibilitate stabilește că:
* Trecerea la Recipe Core V2 este fezabilă printr-o strategie aditivă non-destructivă ce păstrează toate constrângerile contractului V1;
* Toate ipotezele de compatibilitate și reversibilitate sunt însoțite de criterii verificabile ce vor fi demonstrate empiric prin teste în Faza 002-D;
* Riscul pierderii datelor V2 prin clienți V1 este documentat explicit, impunând mecanisme de actualizare parțială.
