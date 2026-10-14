# ATLAS GASTRONOMIC — PHASE 006-A
## KITCHEN PILOT PROTOCOL (PROTOCOLUL DE VALIDARE PRACTICĂ ÎN BUCĂTĂRIE)

**Protocol:** Atlas AOS  
**Autoritate:** Product Owner  
**Statut:** APROBAT PENTRU PREGĂTIRE (PROTOCOL FORMAL)  
**Pilot Culinar Țintă:** Tagliatelle al Ragù alla Bolognese (`rec_tagliatelle_ragu_001`)  
**Data elaborării:** Octombrie 2026  

---

### 1. SCOP, DOMENIU ȘI PRINCIPII FUNDAMENTALE

#### 1.1. Scopul protocolului
Prezentul document stabilește metodologia operațională pentru prima sesiune fizică de validare culinară din proiectul Atlas Gastronomic. Trecerea de la validarea digitală (teste automate, validare structurală Zod, acceptanță Puppeteer în browser) la validarea fizică reprezintă trecerea de la corectitudinea software-ului la **reproductibilitatea gastronomică reală**.

> [!IMPORTANT]
> **DECLARAȚIE FORMALĂ DE STATUT:**  
> Nicio rețetă din catalog nu este considerată validată fizic în bucătărie prin simpla existență a acestui protocol. Niciun test automat, scor teoretic sau analiză editorială nu poate suplini gătitul efectiv și măsurătorile empirice la bancul de lucru.

#### 1.2. Triada Validării în Atlas Gastronomic
Pentru a asigura rigoarea metodologică, Atlas Gastronomic distinge strict trei niveluri de validare:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       TRIADA VALIDĂRII GASTRONOMICE                     │
├─────────────────────────┬─────────────────────────┬─────────────────────┤
│ 1. VALIDARE SOFTWARE    │ 2. VALIDARE EDITORIALĂ   │ 3. VALIDARE FIZICĂ  │
├─────────────────────────┼─────────────────────────┼─────────────────────┤
│ • Validare scheme Zod   │ • Fidelitate surse AIC  │ • Comportament tigăi│
│ • Integritate DAG pași  │ • Denumiri și tradiție  │ • Evaporare lichid  │
│ • Scalare matematică    │ • Alergeni și riscuri   │ • Hidratare gluten  │
│ • Persistență SQLite/UI │ • Literatură istorică   │ • Ergonomie ecran   │
│ • 51 teste automate ok  │ • Rigoare terminologică │ • Calitate senzorială│
└─────────────────────────┴─────────────────────────┴─────────────────────┘
```

#### 1.3. Obiectivul Pilotului #1: Tagliatelle al Ragù alla Bolognese
Validarea rețetei `rec_tagliatelle_ragu_001` în condiții reale de bucătărie casnică, verificând:
1. Fezabilitatea temporală (60 min activ, 212 min total) și paralelismul real al preparării pastelor în timpul fierberii lente a sosului ragù.
2. Comportamentul termic și de evaporare al ragù-ului (raportul dintre cele 500 ml bulion declarate editorial și necesarul real de hidratare la foc molcom).
3. Textura și geometria aluatului de tagliatelle (hidratarea de ~55%, grosimea foii de 0,6–0,8 mm și debitarea la lățimea canonică de 7 mm crudă).
4. Emulsionarea la cald (mantecatura) și aderența sosului pe paste proaspete.
5. Utilizabilitatea interfeței **Cook Mode** pe blat de lucru (ecran, temporizator, comenzi tactile cu mâini umede/înfăinate).

---

### 2. LISTA DE VERIFICARE A PREGĂTIRILOR (CHECKLIST T-24H PÂNĂ LA T-0)

Acest protocol este conceput pentru a putea fi executat de un bucătar amator riguros, fără echipamente de laborator specializate, dar cu instrumente standard de bucătărie de bună calitate.

#### 2.1. Instrumente și Echipamente Necesare la Bancul de Lucru
- [ ] **Cântar digital de bucătărie** cu precizie de 1 g (esențial pentru făină, carne, pancetta, legume și sare).
- [ ] **Cană gradată / recipient volumetric** pentru lichide (ml).
- [ ] **Riglată sau centimetru de bucătărie curat** pentru măsurarea lățimii panglicilor de tagliatelle (țintă: 7 mm).
- [ ] **Caserolă grea de fontă emailată sau inox cu fund triplu stratificat** (diametru 24–26 cm, capac potrivit).
- [ ] **Tocător mare de lemn netratat** (ideal lemn de tei sau fag, pentru frământat și întins aluatul).
- [ ] **Cuțit de bucătar ascuțit** (coltella) pentru tăierea brunoise a legumelor și debitarea pastelor.
- [ ] **Sucitor lung de lemn** (matterello / cannella, min. 40–50 cm lungime).
- [ ] **Oală încăpătoare pentru paste** (capacitate minimă 5 litri).
- [ ] **Tigaie largă / sauteuse** (28–30 cm) pentru pasul final de mantecatura.
- [ ] **Clește de bucătărie și spumieră** pentru transferul pastelor din apa de fierbere direct în sos.
- [ ] **Termometru de bucătărie cu sondă** (opțional, dar recomandat pentru monitorizarea temperaturii bulionului și ragù-ului la 88–92°C).
- [ ] **Cronometru / timer independent** (sau telefon) ca backup pentru Cook Mode.
- [ ] **Fișa de observație tipărită** (`PHASE_006A_KITCHEN_OBSERVATION_TEMPLATE.md`) și pix cu pastă rezistentă la umezeală.

#### 2.2. Verificarea și Calitatea Ingredientelor (pentru 6 porții canonice)
- [ ] **Carne de vită (400 g):** pulpă macră sau fleică/diafragmă (cartella), tocată grosier la sită mare (6–8 mm) sau tăiată mărunt din cuțit.
- [ ] **Pancetta proaspătă (150 g):** dulce, nepipărată, fără fum.
- [ ] **Soffritto proaspăt (câte 60 g fiecare):** ceapă galbenă, morcov dulce, tijă de țelină verde (apio).
- [ ] **Vin sec (120 ml):** alb sec (Trebbiano, Albana) sau roșu tânăr fără baric; degustat în prealabil pentru a nu avea defecte de dop sau aciditate volatilă excesivă.
- [ ] **Dublu concentrat de roșii (30 g):** tub metalic, fără adaos de zahăr.
- [ ] **Passata de roșii (200 g):** passata simplă, dulce, fără arome adăugate (busuioc, oregano).
- [ ] **Bulion / Fond de carne sau legume (500 ml declarate):** nesărat sau cu foarte puțină sare, ținut cald într-o crăticioară separată pe aragaz.
- [ ] **Lapte integral (120 ml):** pasteurizat, 3,5% grăsime, călduț.
- [ ] **Ulei extravirgin de măsline (45 ml / ~3 linguri).**
- [ ] **Sare fină marină (5 g) și piper negru boabe.**
- [ ] **Făină tip 00 (400 g aluat + 30 g lucru):** făină de grâu moale cu W moderat (180–220).
- [ ] **Ouă proaspete (4 bucăți mari, categoria A):** aduse la temperatura camerei cu 2 ore înainte.
- [ ] **Sare gemă grunjoasă (30 g):** pentru apa de fierbere a pastelor.
- [ ] **Parmigiano Reggiano DOP (60 g):** maturat minimum 24 luni, proaspăt răzuit pe răzătoare fină.

---

### 3. PROTOCOLUL DE INSTALARE A INTERFEȚEI COOK MODE PE BLATUL DE LUCRU

1. **Poziționarea dispozitivului:**
   - Tableta sau laptopul se plasează pe un suport stabil, la o distanță de siguranță de 60–90 cm față de flacără, abur și stropi de grăsime.
   - Ecranul trebuie orientat la nivelul ochilor sau ușor înclinat în jos, ferit de reflexiile puternice ale hotelor sau ferestrelor.
2. **Configurarea ecranului:**
   - Se activează opțiunea de menținere a ecranului pornit (*Wake Lock* sau setare sistem: ecran aprins 4 ore).
   - Se pornește aplicația la adresa locală pe rețea privată sau instanța de test (de ex. `http://<IP-LOCAL>:3000`).
3. **Pregătirea sesiunii:**
   - Se deschide rețeta `Tagliatelle al Ragù alla Bolognese`.
   - Se verifică scalerul de porții: setat la **6 porții** (sau numărul dorit, de ex. 4).
   - Se apasă **Gătește Rețeta** pentru a intra în Cook Mode (modul cu contrast ridicat pe fundal întunecat).
4. **Ergonomie de interacțiune:**
   - Se testează apăsarea butoanelor *Pasul Următor* și *Temporizator* cu dosul articulației degetului (knuckle tap) pentru a proteja ecranul de grăsime sau făină.

---

### 4. PROCEDURA DE OBSERVAȚIE PAS CU PAS (RAGÙ & TAGLIATELLE)

Fiecare etapă a rețetei trebuie executată și monitorizată conform următoarelor criterii obiective:

#### ETAPA 1: Topirea pancettei și Soffritto (Pasul 1 — Planificat: 12 min activ)
* **Acțiune:** Topirea pancettei mărunțite în ulei la foc blând, adăugarea legumelor tăiate brunoise mărunt.
* **Măsurători empirice:**
  - Ora de start și ora de final a călirii.
  - Eliberarea apei din legume: se formează abur fără sfârâit agresiv?
* **Semnal de succes (Success Cue):** Ceapa devine translucidă, legumele sunt moi și parfumate, fără nicio zonă rumenită sau arsă.
* **Înregistrare abatere:** Dacă legumele încep să prindă culoare înainte de minutul 8, focul este prea mare; dacă după 12 minute sunt încă tari, focul a fost insuficient.

#### ETAPA 2: Rumenirea cărnii de vită (Pasul 2 — Planificat: 10 min activ)
* **Acțiune:** Mărirea focului la mediu-mare, adăugarea cărnii tocate grosier, desfacerea cocoloașelor cu lingura de lemn.
* **Măsurători empirice:**
  - Timpul necesar până când apa eliberată de carne se evaporă complet.
  - Momentul în care sfârâitul devine uscat și grăsimea începe să prăjească granulele de carne.
* **Semnal de succes:** Carnea capătă o nuanță aurie-brună uniformă (Reacția Maillard).
* **Risc de urmărit:** Fierberea cărnii în propriul suc din cauza unei oale prea înguste sau a unei flăcări prea mici.

#### ETAPA 3: Deglasarea cu vin (Pasul 3 — Planificat: 5 min activ)
* **Acțiune:** Turnarea celor 120 ml vin sec peste carnea bine rumenită, amestecând pe fundul caserolei.
* **Măsurători empirice:**
  - Timpul necesar evaporării mirosului înțepător de alcool.
  - Volumul de lichid rezidual rămas în oală.
* **Semnal de succes:** Mirosul înțepător dispare complet, rămânând o aromă curată, iar fundul caserolei este perfect deglasat de resturile caramelizate.

#### ETAPA 4: Începutul fierberii lente (Pasul 4 — Planificat: 5 min activ, 55 min pasiv)
* **Acțiune:** Dizolvarea concentratului de roșii, adăugarea tomatei passata și a primei căni de bulion fierbinte (200 ml). Aducerea la punctul de fierbere și reducerea la minimul absolut (*pippiare*).
* **Măsurători empirice:**
  - Frecvența bulelor de gătire (țintă: 1-2 bule la câteva secunde).
  - Temperatura lichidului cu termometrul cu sondă (țintă: 88–92°C).
  - Volumul de lichid scăzut la sfârșitul primelor 60 de minute.
* **Semnal de succes:** Formarea micilor perle de grăsime rubinie la suprafață; miros bogat, fără aromă de roșie crudă sau arsură.

#### ETAPA 5: Încorporarea laptelui și fierberea lungă (Pasul 5 — Planificat: 15 min activ, 105 min pasiv)
* **Acțiune:** Adăugarea treptată a laptelui călduț (120 ml). Fierbere continuă la foc minim încă 2 ore. Completare treptată cu bulion fierbinte pe măsură ce scade. Potrivire de sare și piper în ultimele 15 minute.
* **Măsurători empirice:**
  - Volumul total de bulion cald adăugat pe toată durata celor 3 ore (comparat cu cele 500 ml estimate).
  - Reacția laptelui: există semne de separare/brânzire din cauza acidității roșiilor?
  - Cantitatea de sare fină necesară după evaporare (având în vedere aportul de sodiu din pancetta).
* **Semnal de succes:** Sos roșu-cărămiziu închis, onctuos, emulsie legată între carne, grăsime și roșii, carne fondantă la mestecat.

#### ETAPA 6: Prepararea aluatului de tagliatelle (Pasul 6 — Planificat: 10 min activ, 30 min pasiv)
* **Moment de execuție:** Se pornește în timp ce sosul se află la mijlocul etapei pasive din Pasul 5.
* **Acțiune:** Fontana de făină pe tocător de lemn, 4 ouă sparte în mijloc, batere cu furculița, încorporare radială, frământat manual cu podul palmei timp de 10 minute. Împachetare în folie alimentară și odihnă 30 min.
* **Măsurători empirice:**
  - Greutatea ouălor (cu și fără coajă) pentru a calcula hidratarea exactă:
    $$\text{Hidratare \%} = \frac{\text{Masa ouă (g)}}{400\text{ g făină}} \times 100$$
  - Timpul efectiv de frământare până la dispariția aspectului rugos.
* **Semnal de succes:** Bila de aluat devine netedă, caldă și elastică; la apăsare cu degetul, amprenta revine lent la forma inițială.

#### ETAPA 7: Întinderea și tăierea canonică (Pasul 7 — Planificat: 15 min activ, 10 min pasiv)
* **Acțiune:** Întinderea foii cu sucitorul lung de lemn până la 0,6–0,8 mm. Zvântare 10–15 min pe tocător. Rulare lejeră din ambele capete spre centru și debitare cu cuțitul la 7 mm lățime.
* **Măsurători empirice:**
  - Verificarea lățimii a 5 panglici tăiate la întâmplare cu rigla gradată (țintă: 7,0 mm $\pm 0,5$ mm).
  - Verificarea tendinței de lipire a panglicilor.
* **Semnal de succes:** Panglici elastice, aspre la suprafață (*rugose*), separate ușor în cuiburi fără a se rupe sau aglomera.

#### ETAPA 8: Fierberea, mantecatura și montarea (Pasul 8 — Planificat: 5 min activ)
* **Acțiune:** Clocot viguros în 5 L apă cu 30 g sare gemă. Fierbere 2–3 minute. Transfer direct cu cleștele în tigaia mare cu 2/3 din ragù și 3–4 linguri de apă amidonoasă. Saltare/amestecare energică 1 minut. Montare în farfurii adânci încălzite, completare cu restul de ragù și Parmigiano ras.
* **Măsurători empirice:**
  - Timpul exact de fierbere până la *al dente* (cronometrat la secundă).
  - Cantitatea de apă amidonoasă necesară pentru emulsionarea sosului.
  - Greutatea totală finală a porției montate (țintă: ~275 g/porție).
* **Semnal de succes:** Tagliatellele sunt îmbrăcate uniform într-o peliculă mătăsoasă de sos; nicio baltă de lichid apos pe fundul farfuriei; pastele au rezistență plăcută la mușcătură (*al dente*), fără miez albicios făinos.

---

### 5. CUM SE ÎNREGISTREAZĂ DISCREPANȚELE ȘI TIMPII

1. **Timpi Activ vs Pasiv:**
   - Se notează pe fișa de observație ora exactă (HH:MM:SS) a fiecărei tranziții.
   - Timpul pasiv este recunoscut drept **ghidaj culinar orientativ**, depinzând de inerția termică a vasului și puterea arzătorului.
2. **Consumul de Lichide:**
   - Se notează exact volumul de bulion consumat. Dacă s-au adăugat 650 ml în loc de 500 ml, abaterea se consemnează explicit împreună cu motivul (flacără ușor prea mare, vas cu deschidere prea largă, evaporare accelerată).
3. **Masa Porțiilor:**
   - Se cântărește farfuria goală, apoi farfuria montată. Se calculează randamentul total al rețetei.

---

### 6. CUM SE EVALUEAZĂ UTILIZABILITATEA COOK MODE

În timpul gătitului, observatorul/bucătarul bifează și notează:
* **Lizibilitatea:** Au putut fi citite instrucțiunile de la o distanță de 1 metru fără efort vizual?
* **Contrastul:** A oferit tema întunecată contrast adecvat în mediul luminos al bucătăriei?
* **Navigarea:** S-au putut schimba pașii folosind degetul mare sau articulația degetului fără declanșări accidentale?
* **Temporizatorul:** A funcționat semnalul sonor și vizual? A fost clară semantica orientativă a timpului pasiv?
* **Rezistența la întreruperi:** A rămas aplicația deschisă la pasul curent după 30 de minute de inactivitate la ecran?

---

### 7. PROCEDURA POST-SESIUNE

Imediat după terminarea mesei și răcirea ustensilelor:
1. Se completează secțiunea de evaluare senzorială din fișa de observație.
2. Se calculează scorurile din *Validation Scorecard*.
3. Se inventariază constatările în funcție de severitate (Critic, Major, Minor, Recomandare).
4. Fișa scanată sau transcrisă se arhivează în dosarul de arhitectură al fazei.
