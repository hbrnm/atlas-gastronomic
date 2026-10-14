# ATLAS GASTRONOMIC — PHASE 006-B
## FIȘĂ DE EXECUȚIE PENTRU PILOTUL FIZIC PARȚIAL: TAGLIATELLE AL RAGÙ
### (RECIPE DATA EXTRACTION & EXECUTION SHEET FOR PHYSICAL KITCHEN PILOT)

**Protocol:** Atlas AOS  
**Autoritate:** Product Owner  
**Statut:** FIȘĂ OPERAȚIONALĂ PENTRU EXECUȚIE LA BANCUL DE GĂTIT  
**Referință canonică:** `rec_tagliatelle_ragu_001`  
**Fișier sursă cod:** [`src/shared/sample-data.ts`](file:///c:/Users/pc1/Documents/antigravity/Atlas-gastronomic-repo/src/shared/sample-data.ts#L268-L701)  
**Obiectivul sesiunii:** Validarea fizică parțială a sosului Ragù alla Bolognese și a servirii cu paste uscate la un randament de **4 porții**.  

> [!NOTE]
> Această fișă este autonomă și auto-suficientă. Product Owner-ul și bucătarul pot executa sesiunea fizică direct după acest document, fără a accesa interfața web sau baza de date.

---

### 1. REFERINȚA CANONICĂ ȘI SCALAREA LA 4 PORȚII

- **Titlu canonic:** Tagliatelle al Ragù alla Bolognese
- **Randament de bază (Original Yield):** 6 porții (~1650 g masă finală montată)
- **Randament solicitat pentru pilot:** **4 porții**
- **Factor de scalare matematic aplicat:**
  $$\text{scaleFactor} = \frac{4}{6} = \frac{2}{3} \approx 0.6666666666666666$$

*Calculul respectă fidel formula implementată în aplicația Atlas Gastronomic (`formatScaledQuantity` din `RecipeDetail.tsx` și `CookMode.tsx`), prezentând valorile rotunjite practic pentru cântarul de bucătărie.*

---

### 2. CLASIFICAREA ȘI SEPARAREA STRICTĂ A INGREDIENTELOR

#### 2.1. Ingrediente pentru Sosul Ragù (Necesarul pentru Pilotul Fizic)

| ID Ingredient | Denumire Ingredient & Calitate | Cantitate Canonică (6 porții) | Cantitate Scalată (4 porții) | Precizie Cântar Casnic | Stare de Pregătire / Note Tehnice |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `pancetta` | Pancetta proaspătă de porc (dulce, neafumată) | 150 g | **100 g** | 100 g | Tocată mărunt din cuțit pe tocător de lemn |
| `ulei-masline` | Ulei extravirgin de măsline | 45 ml | **30 ml** | ~2 linguri | Pentru topirea inițială a pancettei |
| `ceapa` | Ceapă galbenă proaspătă | 60 g | **40 g** | ~½ ceapă medie | Curățată, tocată brunoise foarte fin (2–3 mm) |
| `morcov` | Morcov dulce de grădină | 60 g | **40 g** | ~½ morcov mediu | Curățat, tocat brunoise fin din cuțit |
| `telina` | Tijă de țelină verde (apio) | 60 g | **40 g** | ~½ tijă verde | Curățată de ațe, tocată brunoise fin |
| `carne-vita` | Carne de vită (pulpă sau diafragmă/cartella) | 400 g | **266,7 g** | **265 – 270 g** | Tocată grosier la sită mare (6–8 mm) sau din cuțit |
| `vin-sec` | Vin alb sec (sau roșu sec tânăr fără baric) | 120 ml | **80 ml** | 80 ml (~⅓ cană) | Sec, curat, degustat anterior (fără defect de dop) |
| `concentrat-rosii`| Dublu concentrat de roșii (doppio concentrato)| 30 g | **20 g** | ~1 lingură plină | Pastă concentrată de calitate superioară |
| `passata-rosii` | Passata fină de roșii dulci bine coapte | 200 g | **133,3 g** | **130 – 135 g** | Piure curat de roșii, fără ierburi aromatice |
| `bulion-cald` | Bulion/fond de carne sau legume (fierbinte) | 500 ml | **333,3 ml** | **~350 – 500 ml** | Se menține fierbinte pe aragaz; adăugat treptat (*q.b.*)|
| `lapte-integral`| Lapte dulce integral (3,5% grăsime) | 120 ml | **80 ml** | 80 ml | *Opțional conform AIC 2023*; încălzit ușor |
| `sare-sos` | Sare marină fină | 5 g | **3,3 g** | *după gust* | **Ajustată strict la final (min. 165–180)** |
| `piper-negru` | Piper negru boabe | 1 g | **0,67 g** | 1 praf generos | Proaspăt măcinat |

---

#### 2.2. Ingrediente pentru Finisare și Servire

| ID Ingredient | Denumire Ingredient | Cantitate Canonică (6 porții) | Cantitate Scalată (4 porții) | Note Operative |
| :--- | :--- | :---: | :---: | :--- |
| `sare-apa` | Sare gemă grunjoasă pentru apa de paste | 30 g | **20 g** | Dizolvată în apa clocotită (~6–7 g/litru) |
| `parmigiano` | Parmigiano Reggiano DOP (maturat min. 24 luni)| 60 g | **40 g** | Proaspăt răzuit fin; servit opțional la masă |

---

#### 2.3. Opțiune Specifică de Pilot: Paste Uscate (Dry Pasta Serving Choice)

> [!IMPORTANT]
> **DELIMITARE EDITORIALĂ STRICTĂ:**  
> Cantitatea de paste uscate de mai jos reprezintă o **alegere specifică exclusiv acestui pilot parțial**. Aceasta **NU** face parte din datele rețetei canonice din aplicație (care este definită pe paste proaspete all'uovo făcute în casă) și nu a fost inserată în baza de date.

| Element | Cantitate Recomandată (4 porții) | Tip & Caracteristici Recomandate |
| :--- | :---: | :--- |
| **Paste uscate (Tagliatelle / Fettuccine secche)** | **320 g – 350 g** | Tagliatelle uscate cu ou (sau paste lungi din grâu dur, de ex. tagliatelle/fettuccine trafilate al bronzo, cu suprafață aspră pentru aderența ragù-ului). |
| **Apă pentru fierbere** | **3,5 – 4 litri** | Clocot viguros într-o oală mare. |
| **Timp de fierbere paste uscate** | **Conform pachetului minus 1,5 minute** | Scoase *al dente* pentru a finaliza gătirea timp de 1–2 minute direct în tigaia cu ragù (*mantecatura*). |

---

#### 2.4. Ingrediente din Rețeta Canonică NEUTILIZATE în Acest Pilot Parțial

Deoarece acest pilot validează exclusiv ragù-ul și servirea rapidă cu paste uscate, următoarele ingrediente din rețeta canonică **nu sunt necesare la bancul de lucru**:

| ID Ingredient | Denumire în Catalog | Cantitate la 6 porții | Motivul Omiterii în Pilotul Parțial |
| :--- | :--- | :---: | :--- |
| `faina-00` | Făină de grâu moale tip 00 | 400 g | Înlocuită temporar prin paste uscate de calitate |
| `oua-proaspete` | Ouă proaspete mari (cat. A) | 4 buc (~220 g) | Înlocuită temporar prin paste uscate de calitate |
| `faina-lucru` | Făină tip 00 pentru tocător | 30 g | Nu se întinde foaie de aluat în acest pilot |

---

### 3. VERIFICAREA INTEGRITĂȚII REFERINȚELOR DE INGREDIENTE

S-a verificat exhaustiv dacă fiecare ingredient referențiat în pașii de preparare există în datele canonice:
- Pasul 1 (`step_ragu_01`): `pancetta`, `ulei-masline`, `ceapa`, `morcov`, `telina` $\to$ **Toate există (5/5)**.
- Pasul 2 (`step_ragu_02`): `carne-vita` $\to$ **Există (1/1)**.
- Pasul 3 (`step_ragu_03`): `vin-sec` $\to$ **Există (1/1)**.
- Pasul 4 (`step_ragu_04`): `concentrat-rosii`, `passata-rosii`, `bulion-cald` $\to$ **Toate există (3/3)**.
- Pasul 5 (`step_ragu_05`): `lapte-integral`, `sare-sos`, `piper-negru` $\to$ **Toate există (3/3)**.
- Pasul 8 (`step_serv_08`): `sare-apa`, `parmigiano` $\to$ **Toate există (2/2)**.
- **Concluzie de integritate:** Zero discrepanțe. Nicio referință nesoluționată sau suspendată.

---

### 4. ECHIPAMENTE NECESARE LA BANCUL DE LUCRU

1. **Caserolă grea:** fontă emailată sau inox cu fund gros (diametru 24–26 cm, adâncime medie, capac potrivit).
2. **Tocător de lemn și cuțit de bucătar ascuțit** pentru tocarea brunoise a legumelor și mărunțirea pancettei.
3. **Lingură de lemn** cu muchie dreaptă pentru amestecare și deglasare.
4. **Cănuță/crăticioară separată** pentru menținerea bulionului fierbinte pe aragaz.
5. **Oală mare (min. 5 litri)** pentru fierberea pastelor uscate.
6. **Tigaie largă / sauteuse (28–30 cm)** pentru încălzirea ragù-ului și emulsionarea finală (*mantecatura*).
7. **Clește de bucătărie sau spatulă mare.**
8. **Cântar digital de bucătărie** (precizie 1 g).

---

### 5. SECVENȚA DE EXECUȚIE A SOSULUI RAGÙ (TIMPI, REPERE ȘI TEMPERATURI)

#### PASUL 1: Topirea pancettei și Soffritto lent
- **Identificator:** `step_ragu_01`
- **Dependențe:** Niciuna (pas inițial)
- **Timp estimat în aplicație:** **12 minute** (12 min activ, 0 min pasiv)
- **Nivel foc:** Mic spre Mediu
- **Instrucțiune:** Într-o caserolă grea de fontă emailată (diametru 24–26 cm), topește cei 100 g de pancetta tocată fin împreună cu cele 2 linguri de ulei de măsline (30 ml) la foc blând. Adaugă legumele (ceapa 40 g, morcovul 40 g, țelina 40 g) mărunțite fin din cuțit și călește-le lent timp de 12 minute, amestecând frecvent cu o lingură de lemn, până când legumele se înmoaie fără a prinde culoare.
- **Indicator de finalizare (Success Cue):** Ceapa devine translucidă, legumele sunt fragede și dulci, degajând o aromă armonioasă fără nicio urmă de arsură.

---

#### PASUL 2: Rumenirea energică a cărnii de vită
- **Identificator:** `step_ragu_02`
- **Dependențe:** Necesită finalizarea `step_ragu_01`
- **Timp estimat în aplicație:** **10 minute** (10 min activ, 0 min pasiv)
- **Nivel foc:** Mediu spre Mare
- **Instrucțiune:** Mărește intensitatea focului și adaugă carnea de vită tocată grosier (265–270 g). Desfă bucățile de carne cu lingura de lemn și rumenește-o energic timp de 10 minute, amestecând continuu până când toate sucurile eliberate se evaporă complet.
- **Indicator de finalizare (Success Cue):** Carnea începe să sfârâie uscat în grăsimea proprie și capătă o tentă brună-aurie uniformă (Reacția Maillard).

---

#### PASUL 3: Deglasarea cu vin sec
- **Identificator:** `step_ragu_03`
- **Dependențe:** Necesită finalizarea `step_ragu_02`
- **Timp estimat în aplicație:** **5 minute** (5 min activ, 0 min pasiv)
- **Nivel foc:** Mare
- **Instrucțiune:** Toarnă vinul sec (80 ml, alb sau roșu) peste carnea fierbinte. Lasă-l să fiarbă vioi timp de 5 minute, amestecând energic pe fundul caserolei pentru a desprinde toate zaharurile caramelizate.
- **Indicator de finalizare (Success Cue):** Mirosul pregnant de alcool brut se atenuează, lăsând o notă fructată curată, iar lichidul liber se reduce considerabil.

---

#### PASUL 4: Adăugarea tomatelor și prima oră de fierbere molcomă
- **Identificator:** `step_ragu_04`
- **Dependențe:** Necesită finalizarea `step_ragu_03`
- **Timp estimat în aplicație:** **60 minute** (5 min activ, 55 min pasiv orientativ)
- **Nivel foc:** Foarte mic (foc molcom / fierbere leneșă denumită *pippiare*)
- **Țintă termică:** ~90°C în echipament (țintă tehnologică)
- **Instrucțiune:** Adaugă dublul concentrat de roșii (20 g) și passata (130–135 g). Amestecă bine, apoi toarnă o primă cană (circa 150 ml) de bulion fierbinte. Adu totul la punctul de fierbere, apoi redu focul la minimum absolut, acoperă oala parțial cu capacul întredeschis și lasă sosul să fiarbă foarte lent timp de 60 de minute.
- **Indicator de finalizare (Success Cue):** Sosul bolborosește leneș la intervale regulate (*pippiare*), formând mici perle de grăsime rubinie la suprafață.

---

#### PASUL 5: Încorporarea laptelui și fierberea lungă de 120 de minute
- **Identificator:** `step_ragu_05`
- **Dependențe:** Necesită finalizarea `step_ragu_04`
- **Timp estimat în aplicație:** **120 minute** (15 min activ, 105 min pasiv orientativ)
- **Nivel foc:** Foarte mic
- **Țintă termică:** ~88°C în echipament
- **Instrucțiune:** După prima oră de gătire, toarnă treptat laptele integral călduț (80 ml) în sos. Continuă fierberea lentă încă 120 de minute la foc minim (pentru a atinge durata totală de fierbere lentă de 3 ore), adăugând câte un polonic mic de bulion fierbinte de fiecare dată când ragù-ul scade prea mult. În ultimele 15 minute, gustă și asezonează cu sarea marină (circa 3 g) și piperul negru proaspăt măcinat.
- **Indicator de finalizare (Success Cue):** Ragù-ul capătă o textură densă, profund catifelată și o culoare roșu-cărămiziu închis; carnea este fondantă, iar grăsimea este emulsionată stabil în sos.

---

### 6. INSTRUCȚIUNI DE FIERBERE ȘI SERVIRE PENTRU PASTELE USCATE (PILOT ADDITION)

> [!IMPORTANT]
> Această etapă adaptează Pasul 8 canonic (`step_serv_08`) pentru utilizarea pastelor uscate alese pentru acest pilot.

1. **Fierberea apei:**
   - Pune 3,5 – 4 litri de apă la fiert într-o oală mare.
   - Când apa atinge clocotul în cascade viguroase, adaugă cele 20 g de sare grunjoasă.
2. **Fierberea pastelor uscate:**
   - Pune cele 320–350 g de tagliatelle uscate în apă.
   - Cronometrează timpul conform pachetului, dar scurtează-l cu **1,5 minute** (de ex., dacă pachetul indică 8 minute, fierbe-le strict 6,5 minute).
3. **Mantecatura în tigaie largă:**
   - În timp ce pastele fierb, pune circa două treimi din ragù-ul fierbinte într-o tigaie largă (28–30 cm) la foc mediu.
   - Scoate pastele cu un clește direct din apa clocotită în tigaia cu ragù (fără a le trece prin jet de apă rece!).
   - Adaugă imediat 3–4 linguri generoase (~50–60 ml) din apa amidonoasă de fierbere a pastelor.
   - Amestecă sau saltă energic pastele în tigaie timp de 60–90 de secunde pe foc mediu. Amidonul din apa de fierbere va emulsiona grăsimile din ragù, creând o peliculă mătăsoasă și lucioasă care se lipește de paste.
4. **Montarea și servirea celor 4 porții:**
   - Distribuie pastele legate în 4 farfurii adânci preîncălzite.
   - Adaugă restul de o treime de ragù cald deasupra fiecărei porții.
   - Servește imediat, oferind Parmigiano Reggiano DOP proaspăt ras la masă.

---

### 7. ESTIMAREA CUMULATĂ A TIMPILOR PENTRU SESIUNEA DE GĂTIT

| Etapă Operațională | Timp Activ Estimativ | Timp Pasiv Orientativ | Timp Cumulat de la Start |
| :--- | :---: | :---: | :---: |
| **Mise-en-place & Cântărire** | 15 min | — | 00:15 |
| **Pasul 1 (Pancetta & Soffritto)** | 12 min | — | 00:27 |
| **Pasul 2 (Rumenire carne vită)** | 10 min | — | 00:37 |
| **Pasul 3 (Deglasare vin sec)** | 5 min | — | 00:42 |
| **Pasul 4 (Tomate & Fierbere lentă I)**| 5 min | 55 min | 01:42 |
| **Pasul 5 (Lapte & Fierbere lentă II)**| 15 min | 105 min | 03:42 |
| **Fierbere paste uscate & Mantecatura**| 10 min | — | 03:52 |
| **TOTAL SESIUNE PILOT** | **~72 min activ** | **~160 min pasiv** | **~3h 50min – 4h 00min** |

---

### 8. AMBIGUITĂȚI OPERATIVE, RISCURI GASTRONOMICE ȘI REMEDII

1. **Rata de evaporare a lichidului vs. arzător casnic:**
   - *Risc:* Flacăra minimă a aragazului casnic poate fi prea puternică pentru volumul de 4 porții într-o oală largă, cauzând evaporarea rapidă a sosului.
   - *Remediu:* Folosiți un disc difuzor de flacără sub caserolă dacă bolborosirea este prea intensă; țineți crăticioara cu bulion cald la îndemână și completați cu câte un polonic mic de fiecare dată când sosul devine prea uscat.
2. **Sarea din pancetta și bulion:**
   - *Risc:* Sărarea timpurie a sosului înainte de reducerea lichidului prin evaporare poate duce la un ragù excesiv de sărat.
   - *Remediu:* Nu adăugați sare în primii pași; condimentați cu sare strict în ultimele 15 minute ale Pasului 5, după degustarea atentă a sosului concentrat.
3. **Turnarea laptelui:**
   - *Risc:* Laptele rece adăugat direct peste roșiile acide poate cauza micro-brânzirea proteinelor din lapte.
   - *Remediu:* Încălziți ușor laptele (la temperatura corpului / călduț) și turnați-l treptat, amestecând continuu.
4. **Mantecatura pastelor uscate:**
   - *Risc:* Pastele uscate pot absorbi lichid diferit față de cele proaspete.
   - *Remediu:* Nu aruncați apa în care au fiert pastele; amidonul din aceasta este esențial pentru reglarea fluidității sosului în tigaie.
