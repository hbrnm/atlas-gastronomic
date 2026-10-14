# ATLAS GASTRONOMIC — PHASE 007-A
## REGISTRUL BLOCAJELOR, RISCURILOR ȘI RECOMANDĂRILOR PENTRU DEPLOYMENT
### (DEPLOYMENT BLOCKERS, RISKS & RECOMMENDATIONS REGISTER)

**Protocol:** Atlas AOS  
**Autoritate:** Product Owner  
**Fază:** Phase 007-A — Deployment Readiness Audit  
**Data elaborării:** Octombrie 2026  

---

### 1. PRINCIPIU ȘI TAXONOMIE DE CLASIFICARE

Fiecare element din acest registru este clasificat strict conform taxonomiei mandatate de Product Owner:
- **BLOCAJ EFECTIV (ACTUAL BLOCKER):** Problemă critică sau lipsă de configurație care împiedică deploymentul direct sau creează vulnerabilitate imediată. Necesită remediere obligatorie înainte de lansarea pe staging.
- **RISC POTENȚIAL (POTENTIAL RISK):** Fragilitate tehnică sau operațională care nu blochează pornirea, dar poate cauza degradare a serviciului sau corupere de date în anumite condiții.
- **RECOMANDARE (RECOMMENDATION):** Îmbunătățire de bune practici ce crește robustețea, observabilitatea sau ergonomia.
- **FAPT VERIFICAT (VERIFIED FACT):** Funcționalitate auditată prin execuție directă, confirmată ca fiind stabilă și conformă.

---

### 2. MATRICEA CENTRALĂ A REGISTRULUI

| ID | Clasificare | Domeniu | Descriere Sintetică | Severitate | Stare |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **BLK-001** | **BLOCAJ EFECTIV** | Infrastructură | Lipsă terminare HTTPS în `docker-compose.yml` existent | **P1 (Critic)** | Deschis |
| **BLK-002** | **BLOCAJ EFECTIV** | Securitate | Lipsă limitator de rată (Rate Limiting) pe `/api/auth/verify` | **P1 (Critic)** | Deschis |
| **BLK-003** | **BLOCAJ EFECTIV** | Securitate | Suport pentru chei în Query Params (`?key=...`) | **P2 (Major)** | Deschis |
| **RSK-001** | **RISC POTENȚIAL** | Operațional | Risc de backup neatomic în SQLite WAL mode | **P2 (Major)** | Deschis |
| **RSK-002** | **RISC POTENȚIAL** | Securitate | Comparație de chei vulnerabilă la timing attacks | **P3 (Mediu)** | Deschis |
| **RSK-003** | **RISC POTENȚIAL** | Containerizare| Lipsă directivă `HEALTHCHECK` în Dockerfile | **P3 (Mediu)** | Deschis |
| **REC-001** | **RECOMANDARE** | Securitate | Adăugare antete HTTP de securitate (CSP, HSTS, X-Frame) | **P4 (Minor)** | Deschis |
| **REC-002** | **RECOMANDARE** | Observabilitate| Jurnalizare structurată fără expunere de detalii SQLite | **P4 (Minor)** | Deschis |
| **FCT-001** | **FAPT VERIFICAT** | Aplicație | Compilare, typecheck și 51 teste automate trecute | — | Confirmat |
| **FCT-002** | **FAPT VERIFICAT** | Securitate | Fail-closed complet funcțional în producție pentru scrieri | — | Confirmat |
| **FCT-003** | **FAPT VERIFICAT** | Persistență | Supraviețuire date SQLite pe volum persistent la restart | — | Confirmat |
| **FCT-004** | **FAPT VERIFICAT** | UX / Cook Mode| Izolare per-rețetă și persistență la reload pe mobil | — | Confirmat |

---

### 3. ANALIZA DETALIATĂ A ELEMENTELOR

---

#### [BLK-001] Lipsă Terminare HTTPS / Reverse Proxy în Docker Compose
- **Clasificare:** **BLOCAJ EFECTIV (ACTUAL BLOCKER)**
- **Severitate:** **CRITIC (P1)**
- **Descriere:** În configurația actuală a repositorului, `docker-compose.yml` expune doar portul HTTP 3000. Pe un domeniu public de staging, traficul ar circula în clar.
- **Dovezi Verificate:**
  Fișierul `docker-compose.yml` linia 9 conține `ports: - "3000:3000"`. Nu există niciun serviciu de reverse proxy (Nginx, Caddy sau Traefik) inclus în compoziție.
- **Impact Operațional:**
  1. Cheile de acces privat sunt transmise necriptat pe internet.
  2. Browserul refuză instalarea Service Worker-ului PWA pe orice conexiune non-localhost care nu utilizează HTTPS.
- **Remediere Recomandată:** Adoptarea fișierului `docker-compose.staging.yml` și a configurației Caddy prezentate în `PHASE_007A_STAGING_ARCHITECTURE.md`.
- **Efort Estimat:** Redus (~30 minute configurare Caddy și DNS).

---

#### [BLK-002] Lipsă Limitator de Rată (Rate Limiting) pe Endpoint-ul de Autentificare
- **Clasificare:** **BLOCAJ EFECTIV (ACTUAL BLOCKER)**
- **Severitate:** **CRITIC (P1)**
- **Descriere:** Endpoint-ul `POST /api/auth/verify` acceptă un număr nelimitat de cereri pe secundă.
- **Dovezi Verificate:**
  În `src/server/app.ts` liniile 89–110, funcția de rută `app.post('/api/auth/verify', ...)` execută verificarea direct fără a trece printr-un middleware de limitare a frecvenței.
- **Impact Operațional:** Un robot pe internet poate executa un atac de forță brută / căutare prin dicționar pentru a ghici cheia `ATLAS_ACCESS_KEY`.
- **Remediere Recomandată:**
  1. Instalarea și activarea middleware-ului `express-rate-limit` (max 5 încercări eșuate per IP / 15 minute).
  2. SAU plasarea staging-ului în spatele Cloudflare Access (cod PIN pe email înainte de a atinge serverul).
- **Efort Estimat:** Foarte redus (~15 minute cod sau configurare proxy).

---

#### [BLK-003] Suport pentru Chei de Acces în Parametrii Query URL (`?key=...`)
- **Clasificare:** **BLOCAJ EFECTIV (ACTUAL BLOCKER)**
- **Severitate:** **MAJOR (P2)**
- **Descriere:** Funcția `extractAccessKey` acceptă cheia transmisă ca parametru URL `?key=...`.
- **Dovezi Verificate:**
  În `src/server/app.ts` linia 36:
  `const queryKey = req.query?.key; if (typeof queryKey === 'string' && queryKey.trim().length > 0) return queryKey.trim();`
- **Impact Operațional:** Dacă un utilizator accesează un link ce conține `?key=...`, cheia secretă va fi salvată în clar în fișierele de log ale proxy-ului Caddy și în antetul `Referer`.
- **Remediere Recomandată:** Dezactivarea suportului pentru `req.query?.key` când `NODE_ENV === 'production'`. Cheia se va transmite strict prin antete HTTP.
- **Efort Estimat:** 5 minute (modificare simplă în `src/server/app.ts`).

---

#### [RSK-001] Risc de Backup Neatomic în SQLite WAL Mode
- **Clasificare:** **RISC POTENȚIAL (POTENTIAL RISK)**
- **Severitate:** **MAJOR (P2)**
- **Descriere:** SQLite rulează în modul WAL (`PRAGMA journal_mode = WAL;`). Copierea simplă a fișierului `atlas_gastronomic.db` în timp ce serverul rulează poate salva o copie coruptă dacă o tranzacție scrie în `-wal`.
- **Dovezi Verificate:**
  `src/server/db.ts` linia 189 activează modul WAL. Nu există un script automatizat de backup inclus în repository.
- **Impact Operațional:** În caz de incident, un fișier restaurat dintr-un backup „la cald” poate fi ilizibil.
- **Remediere Recomandată:** Implementarea scriptului de backup care apelează `VACUUM INTO '/app/data/backup_TIMESTAMP.db'` conform documentului `PHASE_007A_STAGING_ARCHITECTURE.md`.
- **Efort Estimat:** Redus (~20 minute pentru adăugarea scriptului cron).

---

#### [RSK-002] Comparație de Chei Vulnerabilă la Timing Attacks
- **Clasificare:** **RISC POTENȚIAL (POTENTIAL RISK)**
- **Severitate:** **MEDIU (P3)**
- **Descriere:** Verificarea cheilor în Express se face prin operatorul de egalitate strictă `===`.
- **Dovezi Verificate:**
  `src/server/app.ts` linia 73: `providedAccess === accessKey`.
- **Impact Operațional:** Teoretic, diferențele de timp de execuție pot fi măsurate de un atacator pentru a afla caracterele cheii. Pe internet riscul este scăzut din cauza variației de latență a pachetelor, dar rămâne o abatere de la standardele criptografice de producție.
- **Remediere Recomandată:** Înlocuirea cu `crypto.timingSafeEqual()`.
- **Efort Estimat:** 10 minute.

---

#### [RSK-003] Lipsă Directivă `HEALTHCHECK` în Dockerfile
- **Clasificare:** **RISC POTENȚIAL (POTENTIAL RISK)**
- **Severitate:** **MEDIU (P3)**
- **Descriere:** Imaginea `Dockerfile` din etapa de producție (`runner`) nu specifică o comandă de verificare a stării de sănătate a containerului.
- **Dovezi Verificate:**
  `Dockerfile` nu conține nicio linie `HEALTHCHECK`.
- **Impact Operațional:** Dacă procesul Node întâmpină un deadlock sau rămâne fără memorie, Docker daemon raportează containerul ca fiind în continuare „Running”.
- **Remediere Recomandată:** Adăugarea directivei `HEALTHCHECK CMD node -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"`.
- **Efort Estimat:** 5 minute.

---

#### [REC-001] Adăugare Antete HTTP de Securitate
- **Clasificare:** **RECOMANDARE (RECOMMENDATION)**
- **Severitate:** **MINOR (P4)**
- **Descriere:** Întărirea securității browserului prin antete standard (`Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`).
- **Remediere Recomandată:** Configurate direct în `Caddyfile` la nivelul proxy-ului Caddy, fără a încărca aplicația Express.

---

### 4. FAPTE VERIFICATE POZITIV (PUNCTE FORTE ALE PLATFORMEI)

- **[FCT-001] Integritate Software Desăvârșită:** Toate cele 51 de teste unitare, de persistență și de acceptanță browser Puppeteer trec cu succes. Compilarea de producție este deterministică.
- **[FCT-002] Fail-Closed Impecabil:** Când `ATLAS_REQUIRE_AUTH=true`, scrierile fără cheie editorială configurată pe server eșuează automat cu HTTP 403. Niciun atac din interfața utilizator nu poate forța scrierea.
- **[FCT-003] Reziliență SQLite:** Baza de date își păstrează structura relațională și datele adăugate după restart complet al aplicației pe un alt port.
- **[FCT-004] Ergonomie Cook Mode:** Modul de gătit menține starea la reload, nu contaminează porțiile între rețete diferite și califică timpii pasivi drept orientativi.
