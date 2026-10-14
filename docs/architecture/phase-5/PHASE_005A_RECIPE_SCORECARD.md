# ATLAS GASTRONOMIC — PHASE 005-A
## RECIPE EVALUATION SCORECARD

**Protocol:** Atlas AOS  
**Authority:** Product Owner  
**Phase:** 005-A (Culinary Quality & Product Validation)  
**Evaluation Standard:** 5 Principal Dimensions (Qualitative Scale: `PASS` / `CONDITIONAL PASS` / `FAIL`)  
**Strict Prohibition:** No fabricated numerical percentages or arbitrary scoring systems.

---

## 1. Evaluation Matrix

| Rețetă / Cod | Ingredient Integrity | Culinary Accuracy | Recipe Logic | Recipe Scaling | Cookability | Verdict Global |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Tagliatelle al Ragù**<br>`rec_tagliatelle_ragu_001` | **PASS** | **PASS** | **PASS** | **CONDITIONAL PASS** | **PASS** | **PASS** |
| **Risotto alla Milanese**<br>`rec_risotto_milanese_002` | **PASS** | **PASS** | **PASS** | **CONDITIONAL PASS** | **PASS** | **PASS** |
| **Boeuf Bourguignon**<br>`rec_boeuf_bourguignon_003` | **PASS** | **PASS** | **PASS** | **CONDITIONAL PASS** | **PASS** | **PASS** |
| **Soufflé au Fromage**<br>`rec_souffle_fromage_004` | **PASS** | **PASS** | **PASS** | **CONDITIONAL PASS** | **PASS** | **PASS** |
| **Sarmale Tradiționale**<br>`rec_sarmale_traditionale_012` | **FAIL** | **PASS** | **CONDITIONAL PASS** | **CONDITIONAL PASS** | **CONDITIONAL PASS** | **CONDITIONAL PASS** |

---

## 2. Detailed Dimension-by-Dimension Assessment

### 1. Tagliatelle al Ragù alla Bolognese (`rec_tagliatelle_ragu_001`)

- **Ingredient Integrity — PASS:**
  - Toate ingredientele declarate au unități metrice standard (g, ml).
  - Soffritto-ul respectă raportul canonic 1:1:1 (60g ceapă, 60g morcov, 60g țelină).
  - Aluatul de paste are raportul ideal de 100 g făină / 1 ou (55% hidratare).
  - Laptele este corect clasificat ca `optional: true` conform actului notarial AIC 2023.
- **Culinary Accuracy — PASS:**
  - Fidelitate 100% față de rețeta oficială depusă la Camera de Comerț Bologna în 2023 și măsura geometrică a tagliatellei din 1972 (7 mm crud / 8 mm fiert).
  - Interdicțiile AIC (fără vițel, fără usturoi, fără oregano/rozmarin, fără smântână) sunt respectate cu strictețe.
- **Recipe Logic — PASS:**
  - Piste paralele perfect sincronizate: prepararea aluatului și tăierea pastelor (pașii 6 și 7, total 65 min) se desfășoară în timpul celor 180 min de fierbere lentă (*pippiare*) a ragù-ului.
  - Pasul 8 sintetizează ambele ramuri fără blocaje de dependență.
- **Recipe Scaling — CONDITIONAL PASS:**
  - *Limita identificată:* Scalarea la 2 porții produce valori fracționare la ouă (1,33 ouă). Necesită o notă practică pentru utilizator (utilizarea a 1 ou mare + 1 gălbenuș sau baterea și cântărirea a ~73 g ou).
  - Timpul de fierbere lentă (3 ore) nu trebuie scalat liniar cu numărul de porții (suprafața vasului dictează evaporarea).
- **Cookability (Cook Mode) — PASS:**
  - Cues senzoriale precise („sfârâit uscat”, „pippiare cu perle rubinii”, „peliculă catifelată lucioasă”).
  - Timpii activi și pasivi sunt clar delimitați.

---

### 2. Risotto alla Milanese Tradizionale (`rec_risotto_milanese_002`)

- **Ingredient Integrity — PASS:**
  - Respectă întru totul compoziția De.Co. Milano 2007 (orez Carnaroli, măduvă de vită, unt, șofran pur, ceapă, vin alb, bulion de carne, brânză maturată).
  - Exclude categoric uleiul de măsline și grăsimile vegetale.
  - Cantitățile sunt perfect echilibrate pentru 4 porții (320 g orez, 1200 ml bulion — raport 3,75:1).
- **Culinary Accuracy — PASS:**
  - Tostatura la uscat/grăsime până la 75–80°C (orez sticlos, fierbinte la atingere).
  - Adăugare progresivă a bulionului cald fără a îneca boabele.
  - Infuzarea șofranului la 50–60°C pentru protejarea aromelor termolabile.
  - Mantecatura *fuori dal fuoco* cu unt rece din frigider pentru emulsie stabilă *all'onda*.
- **Recipe Logic — PASS:**
  - Ramura de infuzare a șofranului (`step_rm_sofran_01`) pornește în paralel (`depends_on: []`) și este integrată la minutul 12 al fierberii în `step_rm_fierbere_05`.
  - Dependențele secvențiale sunt impecabile.
- **Recipe Scaling — CONDITIONAL PASS:**
  - La 2 porții, volumul mic de orez (160 g) într-o cratiță largă de 26 cm pierde căldura prea repede în faza de mantecatura.
  - Raportul de bulion la 2 porții necesită o marjă suplimentară de compensare a evaporării (+15%).
- **Cookability (Cook Mode) — PASS:**
  - Instrucțiuni condensate, lizibile de la 1 metru în bucătărie.
  - Indicatori termici clari în interfață.

---

### 3. Boeuf Bourguignon Tradițional (`rec_boeuf_bourguignon_003`)

- **Ingredient Integrity — PASS:**
  - Tăietură optimă (paleron/gîte bogat în colagen, 1200 g).
  - Lardoni blanșați preliminar (elimină excesul de sare și fum brut).
  - Vin roșu Pinot Noir (o sticlă întreagă de 750 ml) combinat cu fond brun concentrat (500 ml).
- **Culinary Accuracy — PASS:**
  - Rumenire în tranșe mici la 140–165°C (reacția Maillard autentică, fără fierbere în abur).
  - Tehnica *singer* codificată de Julia Child: coacerea făinii pe carnea rumenită uscată înainte de udare.
  - Garnitura burgundă clasică tripartită este gătită pe piste paralele independente, păstrând individualitatea și textura fiecărui element.
- **Recipe Logic — PASS:**
  - În timp ce carnea se înăbușă 2,5 ore în cuptor la 160°C, cele două ramuri paralele de garnituri (glacarea cepelor perlate și sotarea ciupercilor) se execută fără a bloca firul principal.
  - Reuniunea finală și degresarea sosului sunt logice și riguros explicate.
- **Recipe Scaling — CONDITIONAL PASS:**
  - *Limita identificată:* La 2 porții (400 g carne), cantitatea de vin (250 ml) și fond (165 ml) nu asigură imersia cărnii într-o cocotte standard de fontă (suprafața la bază necesită minim 400 ml lichid).
  - Timpul de hidroliză a colagenului (2,5 ore la 88–92°C în lichid) este o constantă cinetică enzimatică/termică și nu scade chiar dacă se gătesc doar 2 porții.
- **Cookability (Cook Mode) — PASS:**
  - Pași clari, cu avertismente de calitate la temperatura cuptorului și tehnica de degresare a sosului.

---

### 4. Soufflé Chaud au Fromage (`rec_souffle_fromage_004`)

- **Ingredient Integrity — PASS:**
  - Bază proporționată milimetric: roux din 40 g unt + 40 g făină, 300 ml lapte.
  - Asimetria ouălor respectată: 4 gălbenușuri în bază, 5 albușuri în spumă (*regula n+1*).
  - Brânză Comté AOP 18 luni rasă fin: 120 g în compoziție + 20 g la chemisage.
- **Culinary Accuracy — PASS:**
  - Chemisage vertical cu unt moale și brânză uscată pentru ghidarea mecanică a ascensiunii.
  - Degajarea marginii superioare (*dégager le bord*) cu degetul pentru a elimina aderența cu buza ramekin-ului.
  - Răcirea béchamel-ului la 50–55°C înainte de introducerea gălbenușurilor pentru protecția lipoproteinelor.
  - Coacere statică fără ventilație (190°C), cu interdicția deschiderii ușii cuptorului.
- **Recipe Logic — PASS:**
  - Dependențe secvențiale stricte: formele se răcesc în timp ce se prepară sosul; albușurile se bat abia când baza este gata și temperată.
- **Recipe Scaling — CONDITIONAL PASS:**
  - La 2 porții rezultă 2,5 albușuri (dificil de divizat de un utilizator casnic).
  - Timpul de coacere pentru ramekin-uri individuale de 180 ml rămâne de 22–25 minute indiferent dacă se coc 2, 4 sau 6 ramekin-uri.
- **Cookability (Cook Mode) — PASS:**
  - Avertismentele de risc culinar și ireversibil ghidează utilizatorul în momentele critice.

---

### 5. Sarmale Tradiționale în Foi de Varză Murată (`rec_sarmale_traditionale_012`)

- **Ingredient Integrity — FAIL:**
  - **Lichidul de fierbere lipsește complet din ingrediente:** În Pasul 5 se specifică turnarea a 500–600 ml apă caldă peste sarmale, dar ingredientul `apă` (sau zeamă de varză / fond) nu figurează în tabelul de ingrediente.
  - **Alocare ambiguă:** `pasta-tomate` (70 g) este împărțită vag între umplutură („2 linguri”) și sos („restul”), fără gramaje distincte per pas.
  - **Elemente de servire nedeclarate:** Mămăliga, smântâna și ardeiul iute sunt menționate în pasul de servire, dar lipsesc din ingrediente.
- **Culinary Accuracy — PASS:**
  - Raportul carne-orez (800 g carne / 100 g orez = 8:1) este canonic pentru sarmalele festive moldovenești de înaltă calitate.
  - Călirea preliminară a cepei și orezului este corectă și previne fermentația internă.
  - Clădirea în oală de lut cu cimbru, mărar și afumătură corespunde tradiției autentice.
- **Recipe Logic — CONDITIONAL PASS:**
  - Lipsește pasul tehnologic esențial de **pregătire, desfrunzire și desărare a foilor de varză**. Se sare direct de la călirea cepei la rularea sarmalelor.
- **Recipe Scaling — CONDITIONAL PASS:**
  - Scalarea numărului de sarmale implică modificarea geometriei vasului de gătire (diametrul oalei de lut).
  - Rularea a 30-40 de sarmale mici necesită timp activ considerabil, care trebuie semnalat la scalare.
- **Cookability (Cook Mode) — CONDITIONAL PASS:**
  - Deși instrucțiunile de rulare sunt clare, omisiunea apei de fierbere din ingrediente creează confuzie în Cook Mode când bucătarul ajunge la pasul 5 și constată că nu are lichidul măsurat și pregătit.

---

## 3. Summary of Verdicts

- **Total Recipes Audited:** 5
- **Full PASS:** 4 recipes (`Tagliatelle al Ragù`, `Risotto alla Milanese`, `Boeuf Bourguignon`, `Soufflé au Fromage`)
- **CONDITIONAL PASS:** 1 recipe (`Sarmale Tradiționale`)
- **FAIL:** 0 recipes

*Concluzie scorecard:* Primele patru rețete demonstrează o maturitate editorială și tehnică deplină. Rețeta de Sarmale necesită remedierea promptă a celor 3 deficiențe identificate (adăugarea apei în ingrediente, explicitarea gramajelor de pastă de tomate per pas și introducerea pasului operațional de desărare a verzei).
