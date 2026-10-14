# ATLAS GASTRONOMIC — PHASE 007-A
## DEPLOYMENT READINESS AUDIT (AUDITUL DE PREGĂTIRE PENTRU DEPLOYMENT)

**Protocol:** Atlas AOS  
**Autoritate:** Product Owner  
**Fază:** Phase 007-A — Deployment Readiness Audit  
**Statut:** AUDIT FINALIZAT — EVALUARE TEHNICĂ ȘI OPERAȚIONALĂ  
**Baseline Git:** `chore/integrate-agent-skills` (`dc8dd75395049a9599ecbde83fa5015a6f07190e`)  
**Data elaborării:** Octombrie 2026  

---

### 1. OBIECTIVUL ȘI METODOLOGIA AUDITULUI

Prezentul audit evaluează starea tehnică, securitatea, infrastructura de containerizare și compatibilitatea mobilă/PWA a repositorului Atlas Gastronomic, în vederea pregătirii unui deployment privat pe un mediu de **Staging cu acces HTTPS securizat**.

Fiecare secțiune distinge riguros între:
- **Fapte Verificate:** constatări bazate pe inspecția directă a codului și rularea comenzilor de verificare.
- **Riscuri Potențiale:** vulnerabilități sau fragilități operaționale identificate.
- **Recomandări:** măsuri de îmbunătățire arhitecturală sau de configurare.
- **Blocaje Efective:** elemente care împiedică deploymentul direct în starea curentă fără intervenție.

---

### 2. ARIA A: PREGĂTIREA APLICAȚIEI (APPLICATION READINESS)

#### 2.1. Construcție de Producție și Verificare Statică (Build & Typecheck)
- **Fapt Verificat:** Comanda `npm run typecheck` (`tsc --noEmit && tsc -p tsconfig.server.json --noEmit`) trece cu **0 erori**.
- **Fapt Verificat:** Comanda `npm run build` (`vite build && tsc -p tsconfig.server.json`) generează cu succes:
  - Bundle client în `dist/client/`: `index.html` (1.09 kB), CSS (14.02 kB), JS (333.51 kB, gzip: 94.74 kB).
  - Cod compilat server în `dist/server/`.
- **Fapt Verificat:** Suita completă de teste automate (`npm test`) raportează **51 teste trecute din 51** (inclusiv testele Puppeteer de acceptanță browser).
- **Evaluare Calitativă:** Aplicația se construiește deterministic, fără avertismente de compilare sau module lipsă.

#### 2.2. Pornirea în Mod de Producție (Production Startup)
- **Fapt Verificat:** Când `NODE_ENV=production`, `src/server/index.ts` servește fișierele statice din `dist/client` și redirecționează rutele non-API către `dist/client/index.html` (SPA fallback).
- **Fapt Verificat:** Rularea directă `node dist/server/index.js` pornește serverul Express pe `0.0.0.0` la portul specificat prin `PORT` (implicit 3000).

#### 2.3. Rutele API și Gestionarea Erorilor
- **Fapt Verificat:** Endpoint-ul de sănătate `/api/health` returnează HTTP 200 cu JSON: `{ status: 'ok', service: 'Atlas Gastronomic — Recipe Core V1', timestamp: ... }`.
- **Fapt Verificat:** Endpoint-urile CRUD (`/api/recipes`, `/api/recipes/:id`) returnează coduri conforme: 200 (succes), 201 (creat), 400 (validare eșuată), 401 (neautorizat), 403 (fail-closed în producție), 404 (negăsit), 500 (eroare internă).
- **Risc Potențial:** Erorile interne expun parțial `err.message` în răspunsul JSON (`{ error: '...', details: err.message }`). Deși nu se expun stack-trace-uri complete, mesajele din driverul SQLite pot conține detalii structurale ale tabelelor.

#### 2.4. Disponibilitatea Catalogului de Rețete
- **Fapt Verificat:** La prima pornire a unei baze de date noi, `initDatabase` populează automat tabela `recipes` din `SEED_RECIPES` (12 rețete).
- **Fapt Verificat:** Funcția `syncCanonicalRecipes` asigură că toate cele 5 rețete reprezentative acceptate de Product Owner (Tagliatelle, Risotto, Boeuf Bourguignon, Soufflé, Sarmale) sunt sincronizate în baza de date fără a suprascrie modificările efectuate de utilizator asupra rețetelor existente.

#### 2.5. Comportamentul Cook Mode și Temporizatoare
- **Fapt Verificat:** Navigarea pas cu pas în Cook Mode afișează instrucțiunile cu tipografie mare pe fundal întunecat (contrast ridicat), indică timpul activ/pasiv, alocările de ingrediente scalate și avertismentele de risc culinar/ireversibil.
- **Fapt Verificat:** Reîncărcarea paginii (*browser reload*) în timp ce utilizatorul se află în Cook Mode conservă rețeta activă și pasul curent prin intermediul `localStorage` (`atlas_active_session`) și hash-ului URL (`#/cook/:id`).
- **Fapt Verificat:** Numărul de porții scalat per rețetă este izolat și persistat în `localStorage` (`atlas_recipe_servings`), supraviețuind reîncărcării paginii și navigării între rețete diferite fără contaminare transversală.
- **Fapt Verificat:** Temporizatorul pasiv este etichetat explicit ca **ghidaj culinar orientativ** (`pasiv orientativ`), eliminând presupunerea eronată că preparatul poate fi lăsat nesupravegheat.

#### 2.6. Persistența Datelor între Restarturi
- **Fapt Verificat:** Baza de date SQLite utilizează modul nativ `DatabaseSync` din Node 24, configurat cu `PRAGMA foreign_keys = ON;` și `PRAGMA journal_mode = WAL;`.
- **Fapt Verificat:** În testul de acceptanță `tests/production-deployment-verification.test.ts`, o rețetă adăugată prin API-ul editorial a fost verificată și regăsită intactă pe disc după oprirea completă a procesului server și repornirea acestuia pe un alt port.

---

### 3. ARIA B: SECURITATE ȘI CONTROLUL ACCESULUI

#### 3.1. Mecanismul de Autentificare și Acces Privat
- **Fapt Verificat:** Autentificarea implementată este un sistem de **cheie partajată simetrică** (*Shared Access Key*), transmisă prin header-ul HTTP `x-atlas-access-key` sau `Authorization: Bearer <token>`.
- **Fapt Verificat:** Nu s-a implementat autentificare WebAuthn / FIDO2 Passkey. Nomenclatura a fost corectată în cod și documentație, eliminând confuzia cu passkeys reale.
- **Fapt Verificat:** Când variabila de mediu `ATLAS_ACCESS_KEY` este definită pe server, consultarea rețetelor (`GET /api/recipes`, `GET /api/recipes/:id`) este complet blocată pentru utilizatorii neautentificați (răspuns 401 cu cod `APP_AUTH_REQUIRED`).
- **Fapt Verificat:** Frontend-ul afișează ecranul de barieră privată (`private-auth-gate`), ascunzând catalogul gastronomic până la introducerea cheii corecte.

#### 3.2. Protecția Operațiunilor Editoriale de Scriere
- **Fapt Verificat:** Operațiunile de modificare (`POST`, `PUT`, `DELETE` pe `/api/recipes`) sunt protejate de o cheie separată: `ATLAS_EDITORIAL_KEY` (transmisă prin `x-atlas-editorial-key`).
- **Fapt Verificat:** O cheie de simplu cititor (`ATLAS_ACCESS_KEY`) este respinsă cu 401 la orice încercare de scriere editorială.

#### 3.3. Comportamentul Fail-Closed în Producție
- **Fapt Verificat:** Când `NODE_ENV=production` și `ATLAS_REQUIRE_AUTH=true`, dacă pe server nu a fost configurată nicio cheie editorială (`ATLAS_EDITORIAL_KEY` lipsește sau este goală), toate rutele de scriere sunt dezactivate automat (răspuns 403 Forbidden cu cod `CREDENTIALS_MISSING_SERVER`).
- **Fapt Verificat:** Este imposibilă ocolirea autentificării prin manipularea stării React din client; verificarea se execută strict la nivelul middleware-urilor Express pe server.

#### 3.4. Gestiunea Secretelor și Absența Scurgerilor în Bundle-uri
- **Fapt Verificat:** S-a inspectat codul sursă client și bundle-ul compilat `dist/client/assets/index-*.js`: nicio cheie secretă, variabilă de mediu server sau hash nu este inclus în pachetul client.
- **Fapt Verificat:** Endpoint-ul `/api/auth/status` returnează exclusiv flag-uri booleene (`readAuthenticated`, `writeAuthenticated`, `privateAccessRequired`), fără a expune valorile reale sau fragmente din chei.

#### 3.5. Vulnerabilități și Riscuri de Securitate Identificate
- **BLOCAJ / RISC MAJOR (SEC-01): Expunerea cheii prin Query Parameter (`?key=...`)**  
  Funcția `extractAccessKey` și `extractEditorialKey` acceptă cheia transmisă ca parametru URL (`req.query.key`).  
  *Impact:* Cheia privată poate fi salvată în fișierele de jurnal (*access logs*) ale proxy-ului invers, în istoricul browserului sau în antetul `Referer` la accesarea unor linkuri externe.  
  *Remediere recomandată:* Dezactivarea extragerii din `req.query` în producție; acceptarea cheii exclusiv prin antete HTTP (`x-atlas-access-key` sau `Authorization: Bearer`).
- **BLOCAJ / RISC MAJOR (SEC-02): Atac prin Forță Brută (Lipsă Rate Limiting)**  
  Endpoint-urile `/api/auth/verify` și rutele API nu au implementat un limitator de rată (*rate limiter*).  
  *Impact:* Un atacator care descoperă adresa IP publică a serverului de staging poate încerca ghicirea cheii partajate prin dicționare sau atac forță brută neîngrădit.  
  *Remediere recomandată:* Adăugarea middleware-ului `express-rate-limit` pe `/api/auth/verify` (max 5 încercări / minut per IP) sau protejarea accesului la nivel de rețea (de ex. Cloudflare Access, HTTP Basic Auth pe proxy).
- **RISC MEDIU (SEC-03): Comparație Vulnerabilă la Timing Attacks**  
  Verificarea cheilor în Express se face prin operatorul `===` (`provided === accessKey`), care nu garantează execuție în timp constant.  
  *Remediere recomandată:* Utilizarea funcției `crypto.timingSafeEqual()` din modulul standard Node.js.

---

### 4. ARIA C: CONTAINERIZARE ȘI INFRASTRUCTURĂ (DEPLOYMENT)

#### 4.1. Analiza Dockerfile
- **Fapt Verificat:** Dockerfile-ul utilizează o construcție multi-etapă optimizată:
  - Etapa 1 (`builder`): imagine `node:24-alpine`, instalare dependințe de dezvoltare, compilare Vite și TypeScript.
  - Etapa 2 (`runner`): imagine `node:24-alpine`, instalare strictă `npm ci --omit=dev`, copiere artefacte compilate din `builder`.
  - Execuție sub utilizator neprivilegiat: `USER node`.
  - Definire volum: `VOLUME ["/app/data"]`.
  - Port expus: `EXPOSE 3000`.
- **Risc / Lipsă (DEP-01): Lipsa directivei HEALTHCHECK în Dockerfile**  
  Dockerfile-ul nu conține instrucțiunea `HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1`. Fără aceasta, Docker daemon și orchestratorii nu pot detecta automat blocajele interne ale procesului Node.

#### 4.2. Analiza Docker Compose
- **Fapt Verificat:** `docker-compose.yml` declară serviciul `atlas-gastronomic` cu volum dedicat numit `atlas_data:/app/data`, politică de repornire `restart: unless-stopped` și mapare a variabilelor de mediu esențiale (`ATLAS_ACCESS_KEY`, `ATLAS_EDITORIAL_KEY`, `ATLAS_REQUIRE_AUTH`).
- **BLOCAJ EFECTIV (DEP-02): Lipsa Terminării HTTPS / Reverse Proxy în Compose**  
  `docker-compose.yml` expune direct portul HTTP 3000 (`3000:3000`). În această formă:
  - Traficul circulă necriptat pe internet.
  - Cheile de acces transmise prin headere pot fi interceptate în tranzit.
  - Browserul refuză înregistrarea Service Worker-ului PWA pe orice domeniu extern non-localhost accesat prin HTTP simplu.
  - *Remediere:* Includerea unui container proxy invers (Caddy cu Let's Encrypt automat) sau utilizarea unui tunel securizat (Cloudflare Tunnel) în arhitectura de staging.

#### 4.3. Stocare Persistentă și Mecanismul de Bază de Date
- **Fapt Verificat:** Baza de date este salvată în `/app/data/atlas_gastronomic.db`. Deoarece este mapată pe volumul Docker `atlas_data`, datele supraviețuiesc recreării sau actualizării containerului.
- **Risc Operațional (DEP-03): Back-up la Cald în Modul WAL**  
  În modul WAL (`Write-Ahead Logging`), SQLite scrie tranzacțiile în fișierele temporare `.db-wal` și `.db-shm`. O simplă copiere a fișierului `.db` de pe disc în timp ce baza de date este deschisă poate produce un backup corupt.  
  *Remediere:* Crearea unui script de backup care invocă comanda nativă `sqlite3 data/atlas_gastronomic.db ".backup data/backup.db"` sau rularea unui query `VACUUM INTO 'data/backup.db'`.

---

### 5. ARIA D: PREGĂTIRE MOBILĂ ȘI PWA (MOBILE & PWA READINESS)

#### 5.1. Comportamentul Receptiv (Responsive Design)
- **Fapt Verificat:** Interfața este complet optimizată pentru ecrane mobile:
  - Grila de rețete trece de la 3 coloane pe desktop la 1 coloană pe mobil (`@media (max-width: 640px)`).
  - Butoanele de acțiune și controalele de filtrare au o zonă minimă de atingere de 44px.
  - Modul Cook Mode ocupă întreg ecranul (*full-screen counter mode*) cu dimensiune mărită a fontului (1.25rem – 1.5rem) pentru a fi lizibil pe blatul de bucătărie.
- **Fapt Verificat:** Testul Puppeteer `tests/browser-acceptance.test.ts` verifică randarea pe un viewport mobil de 375x667 (iPhone SE).

#### 5.2. Manifestul Web și Service Worker
- **Fapt Verificat:** Fișierul `src/client/public/manifest.webmanifest` există, este referențiat corect în `index.html` și conține proprietățile esențiale: `standalone`, `theme_color: #9a3412`, iconiță SVG mascăbilă.
- **Fapt Verificat:** Fișierul `src/client/public/sw.js` există și implementează:
  - Pre-caching pentru shell-ul aplicației (`/`, `/index.html`, `/manifest.webmanifest`, `/icon.svg`).
  - Strategie *Network-First* cu cădere pe cache (*fallback to cache*) pentru cererile API `/api/recipes`.
- **Condiție Obligatorie pentru Instalabilitate:** Pentru ca PWA-ul să fie instalabil pe telefoane iOS (Add to Home Screen) și Android (WebAPK install prompt), conexiunea **trebuie să fie strict HTTPS**.

---

### 6. MATRICEA SINTETICĂ A AUDITULUI

| Domeniu Auditat | Statut | Evaluare |
| :--- | :---: | :--- |
| **Construcție & Tipuri (TS/Vite)** | **GATA** | 0 erori la compilare; bundle optimizat (~95 kB gzip). |
| **Testare Automată** | **GATA** | 51/51 teste trecute (unitare, repository, lifecycle, Puppeteer). |
| **Catalog Canonic** | **GATA** | 12 rețete complete; 5 rețete reprezentative sincronizate automat. |
| **Cook Mode & Scalare** | **GATA** | Izolare pe rețetă; persistență la reload; ghidaj pasiv orientativ. |
| **Persistență SQLite** | **GATA** | Node 24 native DatabaseSync; WAL mode; tranzacții atomice verificate. |
| **Control Acces Privat** | **GATA CU REZERVE**| Barieră funcțională; fail-closed verificat; necesită eliminare `?key=`. |
| **Securitate la Nivel de Rețea** | **BLOCAT** | Lipsește Rate Limiting; expunere la forță brută pe IP public. |
| **Containerizare Docker** | **GATA CU REZERVE**| Imagine multi-stage funcțională; volum mapat; lipsește `HEALTHCHECK`. |
| **Terminare HTTPS** | **BLOCAT** | Docker Compose nu include proxy TLS; obligatoriu pentru PWA și chei. |
| **Gestiune Backup SQLite** | **NECESITĂ PROCEDURĂ**| WAL mode necesită backup online (`VACUUM INTO`), nu copiere simplă. |

---

### 7. CONCLUZIA AUDITULUI

Repositorul Atlas Gastronomic este **GATA PENTRU DEPLOYMENT CU CONDIȚII** (*READY WITH CONDITIONS*).  
Aplicația este solidă din punct de vedere software, dar necesită o configurație minimă de infrastructură (HTTPS reverse proxy + rate limiting) înainte de a putea fi expusă pe un URL de staging accesibil pe internet.
