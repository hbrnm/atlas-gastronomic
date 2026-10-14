# ATLAS GASTRONOMIC — PHASE 007-A
## SECURITY ASSESSMENT & PRIVATE ACCESS EVALUATION

**Protocol:** Atlas AOS  
**Autoritate:** Product Owner  
**Fază:** Phase 007-A — Deployment Readiness Audit  
**Domeniu:** Evaluarea Securității Aplicației, Controlul Accesului și Modelarea Amenințărilor  
**Data elaborării:** Octombrie 2026  

---

### 1. REZUMAT EXECUTIV DE SECURITATE

Prezentul raport evaluează postura de securitate a aplicației Atlas Gastronomic înainte de expunerea pe un server de staging conectat la internet. 

Aplicația implementează o arhitectură cu două niveluri de permisiuni prin chei partajate simetrice (*Shared Access Keys*):
1. **Nivelul de Lectură Privată:** reglementat de `ATLAS_ACCESS_KEY`.
2. **Nivelul de Scriere Editorială:** reglementat de `ATLAS_EDITORIAL_KEY`.

> [!IMPORTANT]
> **CONSTATĂRE PRINCIPALĂ PRIVIND SECURITATEA:**  
> Arhitectura logică este corectă și aplică principiul **fail-closed** în mod deterministic pe server. Cu toate acestea, expunerea pe un URL public de staging fără un strat de protecție la nivel de rețea (reverse proxy cu HTTPS, rate limiting și eliminarea parametrilor URL pentru chei) introduce riscuri de interceptare a traficului și de atac prin forță brută.

---

### 2. ANALIZA MECANISMELOR DE AUTENTIFICARE ȘI AUTORIZARE

#### 2.1. Modelul de Cheie Partajată vs. WebAuthn / Passkeys
- **Mecanismul curent:** Aplicația folosește o cheie secretă partajată (*pre-shared secret*), salvată în memoria browserului (`localStorage`) sub denumirea `atlas_access_key` și transmisă prin antetul HTTP `x-atlas-access-key` sau `Authorization: Bearer <key>`.
- **Delimitare conceptuală:** Deși în iterațiile timpurii au existat referiri colocviale la „passkey”, s-a confirmat că **nu există o implementare FIDO2 / WebAuthn**. Nomenclatura a fost aliniată riguros: este vorba strict despre o **Cheie Partajată de Acces Privat** (*Shared Access Key*).
- **Adecvare pentru Staging:** Pentru un mediu privat de staging destinat unei echipe restrânse de testare sau cercului de familie/evaluatori, mecanismul cu cheie partajată este **complet adecvat și minim invaziv**, scutind utilizatorii de proceduri complexe de înregistrare conturi sau servere OAuth.

#### 2.2. Bariera de Acces Privat (Gatekeeper)
- **Implementare pe Server:** Middleware-ul `requireReadAuth` din `src/server/app.ts`:
  ```typescript
  const requireReadAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const accessKey = getAccessKey();
    if (!accessKey || accessKey.trim().length === 0) return next();
    // verifică x-atlas-access-key sau Authorization: Bearer
    if (!isMatch) {
      return res.status(401).json({
        error: 'Acces privat. Cheie de acces validă necesară pentru consultarea rețetelor (fail-closed).',
        code: 'APP_AUTH_REQUIRED',
      });
    }
    return next();
  };
  ```
- **Comportament:** Dacă serverul este configurat cu `ATLAS_ACCESS_KEY`, nicio rețetă nu poate fi descărcată fără furnizarea cheii.
- **Implementare pe Client:** Componenta `App.tsx` apelează `/api/auth/status` la pornire. Dacă accesul privat este activ și cheia nu a fost furnizată, interfața randează exclusiv ecranul `private-auth-gate`, blocând afișarea catalogului.

#### 2.3. Protecția Scrierilor Editoriale și Comportamentul Fail-Closed
- **Separarea Nivelurilor:** Un utilizator care deține doar cheia de cititor nu poate crea, modifica sau șterge rețete. Rutele `POST`, `PUT` și `DELETE` pe `/api/recipes` cer explicit `ATLAS_EDITORIAL_KEY`.
- **Fail-Closed în Producție:**
  ```typescript
  if (isProd && requireAuth && (!editorialKey || editorialKey.trim().length === 0)) {
    return res.status(403).json({
      error: 'Operațiunile de scriere sunt dezactivate în producție: nicio cheie de acces redacțională nu este configurată pe server (fail-closed).',
      code: 'CREDENTIALS_MISSING_SERVER',
    });
  }
  ```
  Dacă aplicația rulează în producție cu `ATLAS_REQUIRE_AUTH=true` și administratorul a omis să seteze `ATLAS_EDITORIAL_KEY`, serverul **refuză orice scriere (HTTP 403)**, prevenind salvarea de date neprotejate.

---

### 3. VULNERABILITĂȚI ȘI AMENINȚĂRI IDENTIFICATE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MATRICEA DE RISCURI DE SECURITATE (PHASE 007-A)          │
├─────────┬──────────────────────────────┬────────────┬───────────────────────┤
│ ID Risc │ Descriere Problemă           │ Severitate │ Impact Operațional    │
├─────────┼──────────────────────────────┼────────────┼───────────────────────┤
│ SEC-01  │ Cheie în Query Param (?key=) │ MAJOR (P2) │ Scurgere în logs/URL  │
│ SEC-02  │ Lipsă Rate Limiting pe Auth  │ CRITIC (P1)│ Atac forță brută pe IP│
│ SEC-03  │ Comparație vulnerabilă timing│ MEDIU (P3) │ Timing attack teoretic│
│ SEC-04  │ Lipsă HTTPS / HSTS în compose│ CRITIC (P1)│ Interceptare trafic   │
│ SEC-05  │ Antete HTTP de securitate    │ MINOR (P3) │ Lipsă Helmet / CSP    │
└─────────┴──────────────────────────────┴────────────┴───────────────────────┘
```

#### 3.1. [SEC-01] Scurgerea Cheilor prin Parametrii Query String (`?key=...`)
- **Stare actuală:** În `src/server/app.ts`, funcțiile de extracție acceptă cheia din URL:
  ```typescript
  const queryKey = req.query?.key;
  if (typeof queryKey === 'string' && queryKey.trim().length > 0) return queryKey.trim();
  ```
- **Amenințare:**
  1. Proxy-urile inverse (Nginx, Caddy, Cloudflare, AWS ALB) jurnalează implicit URL-ul complet al cererii în fișierele de log (*access logs*), incluzând query string-ul.
  2. Dacă un utilizator distribuie un link cu `?key=...`, cheia rămâne salvată în istoricul browserului și în antetul `Referer` trimis către orice resursă externă.
- **Remediere:** Eliminarea suportului pentru `req.query?.key` în mediul de producție; cheile trebuie acceptate exclusiv prin antete HTTP (`x-atlas-access-key` sau `Authorization: Bearer`).

#### 3.2. [SEC-02] Vulnerabilitate la Atacuri prin Forță Brută (Lipsă Rate Limiting)
- **Stare actuală:** Endpoint-ul `POST /api/auth/verify` și rutele API nu au limitare de rată a cererilor.
- **Amenințare:** Dacă serverul de staging este accesibil direct pe internet prin adresa sa IP sau printr-un subdomeniu public, un robot automat poate trimite mii de cereri pe secundă pentru a ghici cheia de acces dintr-un dicționar sau listă de parole comune.
- **Remediere:**
  1. *Nivel Aplicație:* Adăugarea pachetului `express-rate-limit` pe rutele de autentificare (ex. 5 încercări eșuate per IP la fiecare 15 minute).
  2. *Nivel Rețea:* Protejarea instanței de staging în spatele unui tunel cu autentificare prealabilă (de ex. Cloudflare Access cu cod OTP pe email) sau HTTP Basic Auth configurat pe proxy-ul Caddy.

#### 3.3. [SEC-03] Timing Attacks pe Comparația de Șiruri
- **Stare actuală:** Comparația între cheia primită și cea de pe server folosește operatorul `===` (`providedAccess === accessKey`).
- **Amenințare:** Operatorul `===` se oprește la primul caracter diferit. Deși dificil de exploatat pe rețele de internet cu latență variabilă, un atacator sofisticat poate măsura deviațiile microscopice de timp pentru a deduce caracterele succesive ale cheii.
- **Remediere:** Utilizarea funcției native Node.js:
  ```typescript
  import crypto from 'node:crypto';
  function safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }
  ```

#### 3.4. [SEC-04] Lipsa Criptării în Tranzit (HTTPS Obligatoriu)
- **Stare actuală:** Containerul Node.js rulează pe HTTP simplu (portul 3000).
- **Amenințare:** Fără HTTPS, orice persoană aflată pe aceeași rețea Wi-Fi cu utilizatorul (de exemplu într-o cafenea sau rețea publică) poate intercepta pachetele HTTP în clar, capturând cheia `x-atlas-access-key` din antete.
- **Remediere:** Staging-ul **nu trebuie expus niciodată pe HTTP simplu**. Este obligatorie terminarea TLS printr-un proxy invers (Caddy / Nginx) cu certificat valid Let's Encrypt sau Cloudflare Edge TLS.

#### 3.5. [SEC-05] Lipsa Antetelor de Întărire HTTP (Security Headers)
- **Stare actuală:** Aplicația nu utilizează `helmet` sau antete explicite de securitate (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).
- **Remediere:** Adăugarea middleware-ului `helmet()` sau configurarea antetelor direct în fișierul `Caddyfile` al proxy-ului invers.

---

### 4. GESTIUNEA SECRETELOR ȘI AUDITUL BUNDLE-ULUI CLIENT

- **Audit Client Bundle:** S-a analizat compilația `dist/client/assets/index-*.js`. Nu există nicio referință la `process.env.ATLAS_ACCESS_KEY`, `process.env.ATLAS_EDITORIAL_KEY` sau secrete hardcodate.
- **Stocarea în Client:** Browserul salvează cheia introdusă în `localStorage.getItem('atlas_access_key')`. Deoarece aplicația este un SPA fără conținut generat de utilizatori externi (XSS scăzut), stocarea în localStorage este acceptabilă pentru nivelul de acces privat. Pentru medii cu cerințe stricte, se poate migra la cookie-uri `HttpOnly; Secure; SameSite=Strict`.

---

### 5. MODELAREA AMENINȚĂRILOR PENTRU MEDIUL DE STAGING

| Vector de Atac | Probabilitate | Impact | Contramăsură în Arhitectura Staging |
| :--- | :---: | :---: | :--- |
| **Scanare automată a porturilor pe internet** | Mare | Mediu | Portul 3000 închis la firewall; expus doar 443 prin Caddy sau 0 porturi deschise prin Cloudflare Tunnel. |
| **Ghicire forță brută a cheii partajate** | Mare | Mare | Limitator de rată (5 cereri/min) + lungime minimă a cheii de 24 caractere generate aleatoriu. |
| **Interceptare Wi-Fi a traficului** | Medie | Mare | HTTPS obligatoriu cu HSTS (redirecționare automată de la HTTP). |
| **Scurgere cheie prin referer/logs** | Medie | Mediu | Eliminarea completă a parametrilor `?key=` din codul de producție. |
| **Injectare SQL (SQLi)** | Foarte mică | Critic | Imposibil: toate interogările SQLite din `repository.ts` folosesc instrucțiuni parametrizate (`prepare(...).run/get(params)`). |

---

### 6. CONCLUZIE ȘI LISTA DE CERINȚE OBLIGATORII PENTRU STAGING

Pentru ca mediul de staging să fie considerat securizat, sunt necesare următoarele măsuri minimale înainte de lansare:
1. **Obligativitate HTTPS:** Deploymentul pe staging se face exclusiv cu certificat SSL/TLS valid.
2. **Chei complexe:** `ATLAS_ACCESS_KEY` și `ATLAS_EDITORIAL_KEY` trebuie să fie șiruri de mare entropie (min. 24 caractere alfanumerice aleatorii).
3. **Izolare la nivel de rețea:** Serverul Node.js ascultă doar pe rețeaua internă Docker, nefiind expus direct pe internet.
4. **Remedierea SEC-01 și SEC-02:** Eliminarea `?key=` și adăugarea rate limiter-ului pe `/api/auth/verify`.
