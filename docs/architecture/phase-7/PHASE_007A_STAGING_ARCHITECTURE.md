# ATLAS GASTRONOMIC — PHASE 007-A
## STAGING ARCHITECTURE & PRIVATE DEPLOYMENT BLUEPRINT

**Protocol:** Atlas AOS  
**Autoritate:** Product Owner  
**Fază:** Phase 007-A — Deployment Readiness Audit  
**Domeniu:** Arhitectura Mediului de Staging, Configurare și Proceduri Operaționale  
**Data elaborării:** Octombrie 2026  

---

### 1. RECOMANDAREA ARHITECTURALĂ PRINCIPALĂ

Pentru a respecta principiul **infrastructurii minime viabile** și a evita complexitatea operațională inutilă (nu este nevoie de Kubernetes, baze de date distribuite sau servicii cloud scumpe), se recomandă:

> [!TIP]
> **ARHITECTURA RECOMANDATĂ: SINGLE-NODE VPS + DOCKER COMPOSE + CADDY (AUTOMATIC HTTPS)**  
> O mașină virtuală unică (VPS) mică, rulând două containere Docker gestionate prin Docker Compose:
> 1. `atlas-app`: aplicația Node 24 / Express / SQLite cu volum persistent pentru date.
> 2. `caddy-proxy`: server web de ultimă generație care obține și reînnoiește automat certificate SSL Let's Encrypt, termină conexiunea HTTPS securizată și transmite cererile intern pe HTTP către portul 3000.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 INTERNET / UTILIZATORI                 │
                  └───────────────────────────┬────────────────────────────┘
                                              │ HTTPS (Port 443)
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │              SERVER VPS (Linux / Ubuntu 24.04)         │
                  │                                                        │
                  │   ┌────────────────────────────────────────────────┐   │
                  │   │ CADDY REVERSE PROXY                            │   │
                  │   │ • Termină HTTPS automat (Let's Encrypt)        │   │
                  │   │ • Redirecționează HTTP 80 -> HTTPS 443         │   │
                  │   │ • Aplică Security Headers & Gzip/Zstd          │   │
                  │   └───────────────────────┬────────────────────────┘   │
                  │                           │ Rețea Internă Docker       │
                  │                           │ http://atlas-app:3000      │
                  │                           ▼                            │
                  │   ┌────────────────────────────────────────────────┐   │
                  │   │ ATLAS GASTRONOMIC (Node 24 Production Runner)  │   │
                  │   │ • Express API & Static SPA Client              │   │
                  │   │ • PWA Service Worker & Manifest                │   │
                  │   │ • Fail-Closed Auth Middleware                  │   │
                  │   └───────────────────────┬────────────────────────┘   │
                  │                           │ Acces direct disc          │
                  │                           ▼                            │
                  │   ┌────────────────────────────────────────────────┐   │
                  │   │ VOLUM PERSISTENT DOCKER (atlas_data)           │   │
                  │   │ • /app/data/atlas_gastronomic.db (SQLite WAL)  │   │
                  │   └────────────────────────────────────────────────┘   │
                  └────────────────────────────────────────────────────────┘
```

#### Alternativă Fără Porturi Deschise (Zero-Trust): Cloudflare Tunnel
Dacă se dorește ca serverul să nu aibă **niciun port deschis către internet** (nici măcar portul 80 sau 443), containerul Caddy poate fi înlocuit cu un container `cloudflared` (Cloudflare Tunnel).  
*Avantaje:*  
- Adresa IP a serverului rămâne complet ascunsă.
- Conexiunea securizată se stabilește outbound către rețeaua Cloudflare.
- Posibilitatea de a activa opțional **Cloudflare Access** (autentificare suplimentară cu cod PIN transmis pe email pentru testeri autorizați).

---

### 2. ESTIMAREA COSTURILOR ȘI CERINȚELOR DE GĂZDUIRE

Datorită eficienței motorului Node 24 și stocării native SQLite (fără proces separat de PostgreSQL sau MySQL), cerințele hardware sunt extrem de reduse:

| Resursă | Cerință Minimă | Cerință Recomandată Staging |
| :--- | :---: | :---: |
| **CPU** | 1 vCPU (x86_64 sau ARM64) | 1–2 vCPU |
| **Memorie RAM** | 1 GB | 2 GB |
| **Stocare Disc** | 10 GB SSD / NVMe | 20 GB SSD |
| **Sistem de Operare**| Linux (Ubuntu 24.04 LTS / Debian 12)| Linux (Ubuntu 24.04 LTS) |
| **Software necesar** | Docker Engine 26+ & Docker Compose v2| Docker Engine & Compose |

#### Estimare Costuri Lunare:
- **Hetzner Cloud (CX22, 2 vCPU, 4GB RAM, 40GB NVMe):** **~3,79 € / lună** (opțiunea cu cel mai bun raport performanță/preț în Europa).
- **DigitalOcean (Basic Droplet, 1 vCPU, 2GB RAM):** **~$12 / lună**.
- **AWS Lightsail (1 vCPU, 2GB RAM):** **~$10 / lună**.
- **Certificat SSL:** **0 € / lună** (inclus automat prin Let's Encrypt via Caddy).
- **Domeniu / Subdomeniu:** un subdomeniu existent dedicat (de ex. `staging.atlasgastronomic.ro` sau `app.atlasgastronomic.ro`): **0 € cost adițional**.

---

### 3. CONFIGURAȚIA COMPLETĂ PENTRU MEDIUL DE STAGING

#### 3.1. Variabilele de Mediu Obligatorii (`.env.staging`)
Acest fișier se păstrează strict pe serverul de staging și **nu** se comite niciodată în Git:

```bash
# Mod de execuție
NODE_ENV=production
PORT=3000

# Bază de date SQLite pe volum persistent
DATABASE_PATH=/app/data/atlas_gastronomic.db

# Securitate și Control Acces Privat
# Cheie partajată pentru consultare rețete (cititor / membru familie) - minim 24 caractere aleatorii
ATLAS_ACCESS_KEY=atls_read_9f8b2c4e7a1d3f6b8c0e2a4d6f8a

# Cheie editorială pentru adăugare/editare/ștergere rețete - minim 24 caractere aleatorii
ATLAS_EDITORIAL_KEY=atls_edit_7a1d3f6b8c0e2a4d6f8a9f8b2c4e

# Activare fail-closed în producție
ATLAS_REQUIRE_AUTH=true

# Domeniu pentru Caddy (HTTPS automat)
STAGING_DOMAIN=staging.atlasgastronomic.ro
```

#### 3.2. Fișierul de Compoziție Staging (`docker-compose.staging.yml`)
```yaml
services:
  atlas-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: atlas_staging_app
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_PATH=/app/data/atlas_gastronomic.db
      - ATLAS_ACCESS_KEY=${ATLAS_ACCESS_KEY}
      - ATLAS_EDITORIAL_KEY=${ATLAS_EDITORIAL_KEY}
      - ATLAS_REQUIRE_AUTH=true
    volumes:
      - atlas_staging_data:/app/data
    networks:
      - atlas_internal
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s

  caddy-proxy:
    image: caddy:2.8-alpine
    container_name: atlas_staging_caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      - STAGING_DOMAIN=${STAGING_DOMAIN}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - atlas_internal
    depends_on:
      atlas-app:
        condition: service_healthy

volumes:
  atlas_staging_data:
    name: atlas_staging_data
  caddy_data:
    name: atlas_caddy_data
  caddy_config:
    name: atlas_caddy_config

networks:
  atlas_internal:
    name: atlas_internal_net
```

#### 3.3. Fișierul de Configurare Caddy (`Caddyfile`)
```caddy
{$STAGING_DOMAIN} {
    # Redirecționare automată HTTPS & certificat Let's Encrypt
    
    # Securitate: Antete HTTP de protecție
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
    }

    # Proxy către containerul aplicației
    reverse_proxy atlas-app:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }

    # Compresie automată pentru resurse statice
    encode zstd gzip
}
```

---

### 4. STRATEGIA DE PERSISTENȚĂ ȘI PROCEDURA DE BACKUP/RESTORE

#### 4.1. Persistența Datelor SQLite în Modul WAL
- Fişierul bazei de date se află în volumul persistent `atlas_staging_data` la calea `/app/data/atlas_gastronomic.db`.
- Modul WAL (`atlas_gastronomic.db-wal`) oferă tranzacționalitate rapidă și concurență sigură între lecturi și scrieri.

#### 4.2. Procedura de Backup Sigur (Online SQLite Backup)
Deoarece copierea directă a unui fișier SQLite în modul WAL poate produce un fișier parțial în timpul scrierilor active, se folosește comanda atomică `sqlite3 .backup` sau query-ul `VACUUM INTO`:

**Script de backup automat (cron zilnic pe VPS):**
```bash
#!/bin/bash
# /opt/scripts/backup-atlas.sh
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/backups/atlas"
mkdir -p "$BACKUP_DIR"

# Rulare comandă de backup sigur direct în container
docker exec atlas_staging_app node -e "
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync('/app/data/atlas_gastronomic.db');
  db.exec(\"VACUUM INTO '/app/data/backup_${TIMESTAMP}.db';\");
  console.log('Online backup snapshot created.');
"

# Copiere snapshot din volum pe discul gazdă și comprimare
docker cp atlas_staging_app:/app/data/backup_${TIMESTAMP}.db "$BACKUP_DIR/"
docker exec atlas_staging_app rm "/app/data/backup_${TIMESTAMP}.db"
gzip "$BACKUP_DIR/backup_${TIMESTAMP}.db"

# Păstrare ultimele 14 zile de backup
find "$BACKUP_DIR" -name "*.gz" -mtime +14 -delete
```

#### 4.3. Procedura de Rollback
În cazul în care o actualizare corupe datele sau introduce o regresie:
1. Oprirea aplicației: `docker compose -f docker-compose.staging.yml down`.
2. Restaurarea fișierului de backup în volum:
   ```bash
   gunzip -c /opt/backups/atlas/backup_PREVIOUS.db.gz > /tmp/restore.db
   docker cp /tmp/restore.db atlas_staging_app:/app/data/atlas_gastronomic.db
   rm /tmp/restore.db
   ```
3. Pornirea versiunii anterioare a imaginii Docker:
   `docker compose -f docker-compose.staging.yml up -d`.

---

### 5. PROCEDURA DE DEPLOYMENT PAS CU PAS PENTRU STAGING (FAZA 007-B)

Odată ce Product Owner-ul autorizează lansarea:

1. **Pasul 1 (Provisioning VPS):** Se creează o instanță VPS Linux (ex. Hetzner CX22) și se configurează firewall-ul pentru a permite doar porturile 22 (SSH), 80 (HTTP) și 443 (HTTPS).
2. **Pasul 2 (Configurare DNS):** Se adaugă o înregistrare DNS de tip `A` pentru `STAGING_DOMAIN` către adresa IP publică a VPS-ului.
3. **Pasul 3 (Configurare Secrete):** Se creează fișierul securizat `.env.staging` pe VPS cu cheile partajate generate aleatoriu.
4. **Pasul 4 (Lansare Containere):**
   ```bash
   docker compose -f docker-compose.staging.yml up -d --build
   ```
5. **Pasul 5 (Verificare Automată):** Caddy alocă certificatul SSL în ~10 secunde; endpoint-ul `https://STAGING_DOMAIN/api/health` răspunde cu HTTP 200.

---

### 6. LISTA DE ACCEPTANȚĂ A MEDIULUI DE STAGING (STAGING ACCEPTANCE CHECKLIST)

Înainte ca instanța de staging să fie predată Product Owner-ului pentru testare reală pe mobil/desktop, trebuie bifate următoarele:

- [ ] **HTTPS Valid:** Conexiunea pe browser arată lacăt verde, fără avertismente de certificat.
- [ ] **Barieră Privată Activă:** Accesarea fără cheie afișează ecranul de deblocare, ascunzând catalogul.
- [ ] **Deblocare cu Cheie Partajată:** Introducerea cheii deblochează catalogul complet (12 rețete).
- [ ] **Cook Mode & Reîncărcare Mobil:** Se poate intra în Cook Mode pe telefon, iar reîncărcarea paginii pe mobil păstrează rețeta și pasul activ.
- [ ] **Scalare Porții:** Scalarea la 4 porții pentru Sarmale sau Tagliatelle actualizează corect ingredientele pe ecran.
- [ ] **Persistență după Restart:** Repornirea containerului (`docker compose restart atlas-app`) păstrează datele create.
- [ ] **PWA Installable:** Aplicația oferă opțiunea „Adaugă pe ecranul principal” pe mobil.
