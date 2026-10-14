# ATLAS GASTRONOMIC — PHASE 007-B
## SPECIFICAȚIA TEHNICĂ DE SECURITATE ȘI PERSISTENȚĂ PENTRU RAILWAY
### (SECURITY & PERSISTENCE SPECIFICATION)

**Protocol:** Atlas AOS  
**Autoritate:** Product Owner  
**Fază:** Phase 007-B — Railway Deployment Preparation  
**Data elaborării:** Octombrie 2026  

---

### 1. MODELUL DE SECURITATE ȘI CONTROL AL ACCESULUI

#### 1.1. Arhitectura cu Două Chei Partajate (Dual Shared Access Keys)
Aplicația implementează două roluri distincte fără a introduce complexitatea unui modul de User Management / OAuth:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NIVELURILE DE CONTROL AL ACCESULUI                     │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ 1. Cheie de Lectură Privată   │ 2. Cheie de Scriere Editorială              │
│    (`ATLAS_ACCESS_KEY`)       │    (`ATLAS_EDITORIAL_KEY`)                  │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ • Consultare catalog rețete   │ • Creare rețete noi (POST /api/recipes)     │
│ • Deschidere detalii rețetă   │ • Editare rețete existente (PUT /api/recipes)│
│ • Rulare Mod de Gătit         │ • Ștergere rețete (DELETE /api/recipes)     │
│ • Scalare porții pe ecran     │ • Include automat drepturile de lectură     │
│ • Acces la temporizatoare     │ • Rezervat strict autorilor redacționali    │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

#### 1.2. Transmiterea și Extragerea Cheilor
- **Antete Acceptate:**
  1. `x-atlas-access-key` sau `x-atlas-editorial-key` (standardul clientului Atlas).
  2. `Authorization: Bearer <token>` (compatibilitate cu unelte API standard).
- **Politica de Query Parameters:**
  - În modul de dezvoltare (`NODE_ENV !== 'production'`), se permite temporar `?key=...` pentru testare manuală rapidă.
  - În modul de producție (`NODE_ENV === 'production'`), **`req.query?.key` este complet ignorat**. Această regulă elimină riscul ca o cheie de acces privată să fie salvată în fișierele de jurnal (*access logs*) ale routerului de la Railway sau în istoricul browserului.

#### 1.3. Comparație în Timp Constant (Timing-Safe Equality)
Pentru a neutraliza atacurile pe canal lateral (*timing side-channel attacks*), comparația șirurilor de caractere este implementată prin funcția `timingSafeKeyCompare`:
```typescript
function timingSafeKeyCompare(provided: string | null | undefined, expected: string | null | undefined): boolean {
  if (!provided || !expected) return false;
  const hashA = crypto.createHash('sha256').update(provided.trim()).digest();
  const hashB = crypto.createHash('sha256').update(expected.trim()).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}
```
*Avantaj criptografic:* Funcția `crypto.timingSafeEqual` din Node.js aruncă o excepție dacă buffer-ele au lungimi diferite. Prin calcularea hash-ului SHA-256 pe ambele șiruri înainte de comparație, buffer-ele au întotdeauna exact 32 de octeți, prevenind atât erorile de runtime, cât și scurgerea lungimii cheii prin variații de timp.

#### 1.4. Limitatorul de Rată pe Autentificare (Rate Limiter)
Endpoint-ul `POST /api/auth/verify` este protejat împotriva căutărilor automate prin forță brută:
- **Fereastră de monitorizare:** 15 minute (900.000 ms).
- **Prag maxim aprobat:** 5 încercări per adresă IP în fereastra de 15 minute.
- **Răspuns la depășire:** HTTP 429 Too Many Requests cu antetul standard `Retry-After: <secunde>` și cod de eroare `AUTH_RATE_LIMIT_EXCEEDED`.
- **Gestiunea memoriei:** Înregistrările expirate sunt curățate automat la fiecare 10 minute (`cleanupInterval.unref()`), garantând că utilizarea memoriei RAM rămâne infimă chiar și în cazul unor scanări masive de porturi.
- **Comportament rețele partajate (NAT / Wi-Fi comun):** Utilizatorii legitimi care introduc cheia corectă se autentifică la prima încercare fără blocaj; blocajul la 5 încercări intervine exclusiv dacă se acumulează tentative greșite de la IP-ul respectiv în fereastra de 15 minute.
- **Absența credențialelor în jurnale:** Corpul cererii și cheile trimise nu sunt niciodată scrise în logurile serverului sau ale containerului.

#### 1.5. Antete de Securitate Injectate pe Toate Rutele
Aplicația Express configurează automat antetele recomandate de bunele practici OWASP:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (forțează browserul să comunice strict prin HTTPS timp de 1 an).
- `X-Content-Type-Options: nosniff` (blochează interpretarea eronată a tipurilor MIME).
- `X-Frame-Options: DENY` (previne atacurile de tip Clickjacking).
- `Referrer-Policy: strict-origin-when-cross-origin` (limitează trimiterea referer-ului către site-uri terțe).
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` (dezactivează accesul browserului la senzori neutilizați).

---

### 2. SPECIFICAȚIA DE PERSISTENȚĂ ȘI CICLUL DE VIAȚĂ AL BAZEI DE DATE

#### 2.1. Locația și Mount-ul pe Railway
- Calea canonică din container: `/app/data/atlas_gastronomic.db`.
- Pe Railway, se configurează un **Persistent Volume** atașat serviciului, cu Mount Path setat la `/app/data`.
- Permisiunile directorului sunt asigurate prin `Dockerfile` sub utilizatorul `node` (`chown -R node:node /app/data`).

#### 2.2. Modul Write-Ahead Logging (WAL)
SQLite rulează în modul WAL:
- Fișiere pe disc în `/app/data`:
  - `atlas_gastronomic.db` (baza de date principală).
  - `atlas_gastronomic.db-wal` (jurnalul de tranzacții neangajate).
  - `atlas_gastronomic.db-shm` (memoria partajată pentru indecși WAL).
- *Avantaje:* Lecturile (`SELECT`) nu blochează scrierile (`INSERT`/`UPDATE`), iar scrierile nu blochează lecturile. Acest lucru este esențial pentru menținerea unei interfețe fluide în Cook Mode în timp ce un redactor salvează modificări.

#### 2.3. Politica de Inițializare și Non-Suprascriere
La pornirea aplicației:
1. `initDatabase()` verifică dacă tabela `recipes` are înregistrări.
2. Dacă baza este goală (prima pornire a unui volum nou), se inserează cele 12 rețete seed (`SEED_RECIPES`).
3. Dacă baza conține deja date, `syncCanonicalRecipes()` adaugă doar rețetele canonice care lipsesc, **fără a suprascrie sau reseta niciodată** rețetele editate sau adăugate de utilizator.
4. Migrarea structurală automată (`applyV2Migration()`) adaugă coloanele V2 doar dacă lipsesc, în mod tranzacțional și non-distructiv.

#### 2.4. Procedura de Backup Online (`VACUUM INTO`)
Copierea fișierului `.db` în timp ce WAL este activ poate crea un backup corupt. De aceea, Atlas Gastronomic implementează comanda SQLite nativă `VACUUM INTO`:
- **Comportament:** Crează o copie curată, compactată, atomică și auto-suficientă a bazei de date, într-un singur fișier `.db` care include toate modificările din WAL.
- **Rulare locală sau în container:**
  ```bash
  node scripts/backup-sqlite.js /app/data/backups/atlas_snapshot_$(date +%Y%m%d).db
  ```
- **Rulare de la distanță via Railway CLI:**
  ```bash
  railway run node scripts/backup-sqlite.js /app/data/atlas_backup_manual.db
  ```

---

### 3. CONSTRÂNGERI DE OPERARE PE RAILWAY

1. **Exact 1 Replică:**  
   Railway permite scalarea containerelor, dar SQLite funcționează exclusiv cu acces local de disc. Scalarea orizontală la 2 sau mai multe replici cu același volum montat va corupe fișierul de lock al bazei de date. Manifestul `railway.json` impune `"numReplicas": 1`.
2. **Downtime Scurt la Redeploy:**  
   La fiecare actualizare de versiune, Railway oprește containerul vechi, deconectează volumul, lansează noul container și reatașează volumul. Acest ciclu durează aproximativ 10–20 de secunde, timp în care aplicația nu este accesibilă.
