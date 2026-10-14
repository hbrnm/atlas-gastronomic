# ATLAS GASTRONOMIC — PHASE 007-B
## DATA ACCESS BOUNDARIES & COUPLING AUDIT
### (ANALIZA CUPLĂRII STRATULUI DE ACCES LA DATE PENTRU O VIITOARE MIGRARE)

**Protocol:** Atlas AOS  
**Autoritate:** Product Owner  
**Fază:** Phase 007-B — Railway Deployment Preparation  
**Statut:** AUDIT ARHITECTURAL FINALIZAT  
**Data elaborării:** Octombrie 2026  

---

### 1. OBIECTIVUL ANALIZEI

Conform directivei Product Owner-ului:
> *„SQLite rămâne baza de date aprobată pentru stadiul curent. Nu migrați la PostgreSQL și nu introduceți Supabase. Totuși, inspectați granițele existente de acces la date și documentați orice cuplare materială care ar putea complica o viitoare migrare.”*

Acest document auditează gradul de decuplare dintre logica de domeniu (Recipe Core, entități, validare Zod, calcule de scalare) și motorul de stocare SQLite, stabilind costul tehnic și punctele de fricțiune în ipoteza unei viitoare migrări către PostgreSQL.

---

### 2. HARTA ARHITECTURALĂ A STRATULUI DE ACCES LA DATE

Atlas Gastronomic respectă o arhitectură curată de **Repository Pattern**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARHITECTURA DE STRATURI APLICAȚIE                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. STRATUL UI / CLIENT (React 19, Lucide, CSS Variables)                    │
│    • Total agnostic de baza de date. Comunică exclusiv via JSON REST API.   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. STRATUL DE DOMENIU (src/shared/types.ts, validation.ts)                  │
│    • Definește Recipe, RecipeIngredient, RecipeStep, StepIngredientAlloc.  │
│    • Scheme Zod, reguli deterministe DAG, verificare integritate.           │
│    • 100% agnostic de baza de date; pur TypeScript.                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. STRATUL REPOSITORY (src/server/repository.ts)                            │
│    • Clasa RecipeRepository expune metode curate de domeniu:                │
│      getAllRecipes(), getRecipeById(), saveRecipe(), deleteRecipe().       │
│    • Traduce rândurile din tabele în obiecte tipizate de domeniu.           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. MOTORUL DE BAZĂ DE DATE (src/server/db.ts)                               │
│    • Utilizează DatabaseSync din modulul standard Node 24 (node:sqlite).    │
│    • Administrează DDL, tabelele relaționale, indecșii și backup-ul WAL.    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 3. IDENTIFICAREA PUNCTELOR DE CUPLARE CU SQLITE

Auditul a identificat următoarele 4 puncte materiale de dependență de SQLite în implementarea curentă:

#### Cuplare 1: Execuție Sincronă (Synchronous Execution)
- **Stare curentă:** Driverul Node 24 `node:sqlite` (`DatabaseSync`) este sincron. Toate metodele din `RecipeRepository` returnează datele direct, fără `Promise`:
  ```typescript
  getAllRecipes(): RecipeListItem[] {
    const stmt = this.db.prepare(`...`);
    return stmt.all() as unknown as RecipeListItem[];
  }
  ```
- **Fricțiune la migrare:** Driverele de PostgreSQL din Node.js (de exemplu `pg` / `node-postgres`, `postgres.js`, `Kysely` sau `Prisma`) sunt **asincrone prin definiție**.
- **Impactul modificării:**
  - Metodele repository-ului vor trebui să devină asincrone: `async getAllRecipes(): Promise<RecipeListItem[]>`.
  - În `src/server/app.ts`, rutele Express apelează deja metodele într-un context în care se poate folosi `await` cu ușurință (de ex. `const recipes = await repo.getAllRecipes()`).

#### Cuplare 2: Stocarea Coloanelor JSON ca TEXT
- **Stare curentă:** SQLite stochează metadatele complexe (`equipment_json`, `allergens_json`, `sources_json`, `editorial_notes_json`, `depends_on_json`, `risks_json`) sub formă de coloane `TEXT`, serializate/deserializate manual prin `JSON.stringify` și `JSON.parse`.
- **Fricțiune la migrare:** PostgreSQL dispune de tipul nativ performant `jsonb`.
- **Impactul modificării:**
  - În PostgreSQL, se poate opta pentru `jsonb` cu căutare indexată prin operatori GIN, sau se poate păstra temporar serializarea `TEXT` / `json` pentru compatibilitate 1:1.

#### Cuplare 3: Dialectul SQL și Placeholders
- **Stare curentă:** Interogările din `repository.ts` folosesc sintaxa standard ANSI SQL cu parametri de poziție anonimi (`?`):
  ```sql
  SELECT * FROM recipes WHERE id = ? OR recipe_id = ?
  ```
- **Fricțiune la migrare:** PostgreSQL utilizează parametri poziționali numerotați (`$1`, `$2`, etc.).
- **Impactul modificării:** Modificarea simplă a placeholder-elor în textele interogărilor SQL din repository.

#### Cuplare 4: Controlul Tranzacțiilor Manuale
- **Stare curentă:** Tranzacțiile sunt declanșate prin comenzi brute SQLite: `db.exec('BEGIN TRANSACTION;')` și `db.exec('COMMIT;')`.
- **Fricțiune la migrare:** PostgreSQL necesită tranzacții executate pe un client dedicat dintr-un pool de conexiuni (`client.query('BEGIN')` ... `client.query('COMMIT')`).

---

### 4. ANALIZA DECUPLĂRII: CE RĂMÂNE 100% INTACT?

În cazul unei viitoare migrări la PostgreSQL (dacă și când cerințele viitoare de multi-tenancy o vor justifica):

| Modul din Proiect | Afectat de Migrare? | Justificare |
| :--- | :---: | :--- |
| **Interfața React (Client)** | **0% (Complet intact)** | Clientul comunică exclusiv prin API REST JSON. Structura payload-urilor nu se schimbă. |
| **Cook Mode & Scalare Porții** | **0% (Complet intact)** | Logica de scalare, timpi și temporizatoare este 100% rulată în browser. |
| **Modelele de Tipuri (`types.ts`)**| **0% (Complet intact)** | Schemele de domeniu `Recipe`, `RecipeStep`, `RecipeIngredient` rămân identice. |
| **Validarea Deterministă (`validation.ts`)**| **0% (Complet intact)** | Schemele Zod și validarea DAG a pașilor rămân agnostice de baza de date. |
| **Rutele API Express (`app.ts`)**| **< 5% (Doar `await`)** | Se adaugă `await` la apelurile `repo.saveRecipe()` etc. |
| **Repository (`repository.ts`)** | **~25% adaptare** | Se adaptează execuția la driverul asincron și placeholders `$1`. |

---

### 5. CONCLUZIE ARHITECTURALĂ

Arhitectura curentă de monolit modular este **sănătoasă, robustă și decuplată corespunzător**.  
Alegerea SQLite pentru faza actuală oferă simplitate operațională maximă, viteză de execuție sub 1 milisecundă și zero costuri de infrastructură externă, fără a compromite sau bloca o eventuală evoluție ulterioară către baze de date de întreprindere.
