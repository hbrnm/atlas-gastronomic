# ATLAS GASTRONOMIC — ARCHITECTURE OVERVIEW

**Document:** Overview Arhitectural de Sistem  
**Etapă:** PHASE 2.1 — Architecture Reconciliation  
**Guvernanță:** Atlas AOS  
**Data:** 2026-10-13  
**Statut:** Propunere Arhitecturală Formală  

---

## 1. Misiune și Principii Arhitecturale

Atlas Gastronomic este un sistem editorial gastronomic complet (Direcția Strategică C), proiectat să asigure acuratețe culinară, trasabilitate istorică riguroasă și reproductibilitate tehnică. Sistemul nu este o simplă bază de date cu rețete sau un portal de agregare, ci o platformă de cunoaștere gestionată pe baza a nouă principii cardinale:

1. **Acuratețe Gastronomică:** Fiecare formulă culinară este calibrată tehnic (ingrediente, temperaturi, timpi, transformări chimice și indici de succes observabili).
2. **Integritate Structurală a Datelor:** Normalizarea strictă a catalogului de ingrediente și legarea forțată, la nivel de schemă relațională, a ingredientelor utilizate în pași.
3. **Proveniență Epistemologică:** Afirmațiile istorice, geografice și tehnice sunt susținute de dovezi concrete (citate, pagini) legate de surse de autoritate prin modelul `Claim → Evidence → Source`.
4. **Reproductibilitate:** Instrucțiunile de gătit elimină ambiguitățile; gramajele sunt explicite, iar criteriile de reușită sunt verificabile senzorial.
5. **Calitate Editorială:** Conținutul respectă standardul lingvistic și editorial (`standards/v1.0.0/`), fiind evaluat multi-axial prin Quality Gates.
6. **Responsabilitate Umană Exclusivă:** Agenții AI nu dețin autoritate culinară și nu au dreptul de a aproba sau publica conținut. Aprobarea finală este un act uman verificat server-side.
7. **Integritatea Versiunilor (Imutabilitate):** Odată ce o versiune de rețetă este aprobată (`human_approved`), conținutul gastronomic este înghețat definitiv în baza de date.
8. **Fiabilitatea Publicării:** Livrarea publică este decuplată de tabelele de redactare prin generarea de snapshot-uri imuabile (`PublicationSnapshot`) distribuite asincron prin Transactional Outbox.
9. **Arhitectură Sustenabilă (Modular Monolith):** O singură bază de cod unificată, structurată pe module de domeniu decuplate, evitând complexitatea distribuită prematură.

---

## 2. Granițele Sistemului

Platforma este delimitată strict în trei zone operaționale:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NOTION WORKSPACE (EXTERN)                       │
│    Planificare editorială, brainstorming, notițe de degustare brute    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Export / Import (Validare Zod)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               EDITORIAL STUDIO (/studio — NEXT.JS APP ROUTER)          │
│   Autentificare HTTP-only, RBAC server-side, Tranzacții ACID Postgres  │
│   Module: Knowledge Base, Research, Recipe Dev, QA, Publication, Audit │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Transactional Outbox / Snapshots
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              PUBLIC GASTRONOMIC PORTAL (/public — SSG / ISR)           │
│   Livrare statică rapidă, consum exclusiv din PublicationSnapshots     │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Notion Workspace (Mediu Extern Ne-canonic):** Instrument colaborativ flexibil. Nu reprezintă sursa canonică de date; conținutul importat este supus validării înainte de persistență.
2. **Editorial Studio (`/studio`):** Spațiul de lucru intern tranzacțional, protejat de autentificare și RBAC. Aici se execută cercetarea, redactarea, evaluarea calității și aprobarea umană.
3. **Public Gastronomic Portal (`/public`):** Interfața consumatorului public. Nu interoghează niciodată tabelele interne ale studioului; citește exclusiv din documentele înghețate `PublicationSnapshot`.

---

## 3. Justificarea Stilului Arhitectural: Modular Monolith

S-a adoptat modelul **Modular Monolith** pe baza următoarelor considerente:
* **Consistență Tranzacțională (ACID):** Operațiunile complexe de aprobare, generare de snapshot și audit necesită tranzacții atomice garantate nativ de PostgreSQL, imposibil de realizat simplu într-o arhitectură de microservicii.
* **Tipizare End-to-End:** Utilizarea TypeScript pe întregul stack (de la schema Prisma până la componentele React) elimină decalajele de contracte și erorile de serializare.
* **Simplitate Operațională:** O singură aplicație de deployat și monitorizat, fără latențe de rețea inter-servicii, fără service mesh și fără distribuție prematură a datelor.
* **Izolare Modulară:** Modulele interne au limite bine definite la nivel de directoare (`src/modules/*`), interfețe publice stricte și reguli clare de dependență.

---

## 4. Stack-ul Tehnic Recomandat

| Nivel | Tehnologie Recomandată | Statut Decizie | Justificare |
|---|---|:---:|---|
| **Framework Full-Stack** | Next.js App Router | PROPOSED (ADR-0001) | Suport unificat pentru Server Actions (`/studio`) și SSG/ISR (`/public`). |
| **Limbaj** | TypeScript (Strict Mode) | PROPOSED (ADR-0001) | Siguranță a tipurilor la nivel de domeniu și contracte de API. |
| **Bază de Date** | PostgreSQL | PROPOSED (ADR-0001) | ACID, JSONB pentru snapshot-uri, constrângeri avansate și Full-Text Search. |
| **ORM** | Prisma ORM | PROPOSED (ADR-0001) | Migrații declarative versionate, client type-safe. |
| **Validare Runtime** | Zod | PROPOSED (ADR-0001) | Validare la granițele de intrare (Server Actions, importuri Notion). |
| **Styling** | Tailwind CSS | PROPOSED (ADR-0001) | Design system modular și performant pentru interfețele complexe de studio. |
| **Autentificare** | Auth.js v5 vs. Supabase Auth | **OPEN (OQ-001)** | Necesită decizia owner-ului privind infrastructura de identitate. |
| **Stocare Media** | S3-Compatible Object Storage | **OPEN** | Stocare imagini optimizate și facsimile istorice. |

---

## 5. Modelul de Securitate și Responsabilitate

* **Autentificare Server-Side:** Sesiuni gestionate prin cookie-uri securizate HTTP-only, protejate împotriva CSRF și XSS.
* **Separarea Atribuțiilor (RBAC):**
  - Rolul de `Administrator` gestionează exclusiv utilizatorii și infrastructura tehnică; **nu deține dreptul de aprobare culinară**.
  - Rolul de `Approver` (rezervat exclusiv autorității editoriale umane) deține dreptul exclusiv de a semna o versiune de rețetă.
* **Barieră Tehnică pentru AI:** Toate cererile marcate cu `actor_type: AI_AGENT` sunt respinse automat la nivelul API-ului de aprobare și publicare cu codul HTTP `403 Forbidden`.

---

## 6. Modelul de Publicare Decuplat

Sistemul separă actul decizional de actul de distribuție:
1. **Aprobarea (`ApprovalRecord`):** Actul juridic și gastronomic prin care un editor uman certifică formula tehnică a unei `RecipeVersion`. Versiunea devine read-only.
2. **Publicarea (`Publication`):** Actul de distribuție pe un canal specific (Web, Mobile, Print). Permite retragerea de pe un canal fără anularea aprobării gastronomice.
3. **Documentul de Livrare (`PublicationSnapshot`):** Copia JSON înghețată, complet denormalizată, din care portalul public randează conținutul.

---

## 7. Statutul Deciziilor: Aprobate vs. Propuneri

* **Decizii Canonice Aprobate (din depozit):**
  - `DEC-0001`: Atlas AOS este aplicat strict pentru Atlas Gastronomic.
  - `DEC-0002`: Format hibrid, rigoare strictă, aprobare umană obligatorie.
  - `DEC-0003`: Suport unificat pentru Antigravity IDE și CLI din configurația canonică.
  - `DEC-0004`: Autonomie ridicată pentru sarcini reversibile; bariere stricte la aprobare și standarde.
  - `DEC-0005`: Pachetul `standards/v1.0.0/` este înghețat și conservat intact.
* **Decizii Arhitecturale Propuse (ADR-0001 la ADR-0010):**
  - Toate recomandările de tehnologie, ontologie pe 3 niveluri, model Claim–Evidence–Source, imutabilitate tranzacțională și Transactional Outbox rămân clasificate strict ca **`PROPOSED`** până la semnarea formală a deciziilor de către owner.

---

## 8. Glosar Bilingv Canonic (Bilingual Domain Glossary)

Pentru a asigura o comunicare fără ambiguități între arhitectura tehnică (cod, schemă relațională, contracte API) și interfața editorială în limba română, termenii canonici sunt mapați după cum urmează:

| Entitate Tehnică (Cod / DB) | Termen Editorial Român (UI / Documente) | Definiție Funcțională & Distincție Arhitecturală |
|:---|:---|:---|
| `Dish` | **Preparat** (sau Preparat Canonic) | Conceptul gastronomic abstract și identitatea culturală fără cantități specifice (ex: *„Sarmale în foi de varză”*). Agregă dosarele de cercetare. |
| `Recipe` | **Rețetă** (sau Proiect Editorial) | O abordare editorială specifică a unui preparat, deținută de un autor (ex: *„Sarmale moldovenești de Crăciun — Rețeta de referință”*). Agregă versiunile SemVer. |
| `RecipeVersion` | **Versiune de rețetă** (Formula Tehnică) | Instanța completă, testabilă și reproductibilă a unei rețete la un număr de versiune SemVer (`1.0.0`). Conține gramaje, pași și devine imuabilă la aprobare. |
| `ResearchDossier` | **Dosar de cercetare** | Dosarul sintetic epistemologic care documentează atestatele istorice, probele etnografice și variantele regionale prealabile redactării rețetei. |
| `Source` | **Sursă bibliografică / Document de teren** | Cartea, manuscrisul istoric, articolul sau interviul de teren din care provin dovezile culinare. |
| `Evidence` | **Probă / Citat atestat** | Extrasul textual concret, citatul verificat cu pagină și capitol extras dintr-o sursă. |
| `Claim` | **Afirmație gastronomică** | Teza culinară sau istorică extrasă din probă, clasificată după nivelul de certitudine epistemologică. |
| `Ingredient` (sau `CanonicalIngredient`) | **Ingredient Canonic** | Elementul de catalog standardizat în modulul de Taxonomie (nume științific, categorie, alergeni). |
| `RecipeIngredient` | **Ingredient în Rețetă** (Utilizare) | Utilizarea cantitativă a unui ingredient într-o versiune specifică de rețetă (gramaj, unitate, stare fizică, grup de preparare). |
| `RecipeStep` | **Pas de preparare** | Instrucțiunea procedurală secvențială ordonată (durată, temperatură, tehnică culinară, indiciu senzorial de succes). |
| `StepIngredientRef` | **Referință Ingredient în Pas** | Legătura joncțiune strictă ce indică ce ingrediente specifice din versiune sunt consumate într-un pas dat. |
| `CulturalContext` | **Context Cultural și Etnografic** | Documentația narativă privind semnificația ritualică, originea geografică, sezonalitatea și tradiția orală a versiunii. |
| `QualityEvaluation` / `ReviewRecord` | **Înregistrare de evaluare (Review)** | Fișa de evaluare tehnică sau editorială completată de un recenzor pe baza rubricilor cantitative pe 5 dimensiuni. |
| `ApprovalRecord` | **Înregistrare de Aprobare Umană** | Actul formal juridic și editorial semnat exclusiv de Approver-ul uman, sigilând hash-ul criptografic de conținut. |
| `Publication` | **Publicare pe Canal** | Starea de distribuție a unei versiuni de rețetă pe un canal extern determinat (Web, Mobile, Newsletter, Export static). |
| `PublicationSnapshot` | **Snapshot de Publicare** | Documentul JSON denormalizat, înghețat și autosuficient, servit consumatorilor publici și CDN-ului. |
| `OutboxEvent` | **Eveniment Outbox** | Înregistrarea asincronă din coada tranzacțională locală PostgreSQL, dispatchată către canalele de distribuție. |

*Notă de Guvernanță:* Identificatorii din coloana *„Entitate Tehnică”* sunt rezervați exclusiv pentru cod sursă, baze de date, evenimente și contracte API. Denumirile din coloana *„Termen Editorial Român”* sunt rezervate pentru interfețele utilizator, rapoartele editoriale și documentația gastronomică orientată spre public.

