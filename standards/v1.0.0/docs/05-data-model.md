# Model de date — principii

## Entități
- **Recipe:** identitatea editorială și versiunea unei rețete.
- **Ingredient:** ingredient normalizat, cu unități și atribute reutilizabile.
- **RecipeIngredient:** relația dintre rețetă și ingredient, incluzând cantitatea, starea și etapa.
- **Step:** instrucțiune ordonată, cu durată, temperatură și criteriu observabil.
- **Source:** sursă bibliografică/web.
- **Claim:** afirmație editorială și nivelul său de certitudine.
- **Review:** verificare, autor, rezultat, comentarii și dată.
- **Version:** istoric și diferențe între versiuni.

## Convenții
- ID-urile sunt stabile și nu depind de titlu.
- Unitățile se păstrează explicit; nu deduce unități din text.
- Cantitățile numerice sunt numere, nu șiruri precum „un pumn”.
- Valorile necunoscute sunt `null`, nu estimate tacit.
- Duratele se stochează numeric în secunde sau minute, cu unitate definită în schemă.
- Temperaturile includ valoarea și scara Celsius.
- Ingredientele sunt normalizate, dar denumirea afișată poate fi localizată.
- Alergenii se declară separat de ingredientele brute, cu verificare umană.
- Schema JSON este contractul tehnic; câmpurile Notion sunt o vedere operațională simplificată.

## Integritate
Un ingredient din listă trebuie să fie utilizat într-un pas sau explicat ca garnitură/servire. Orice pas care invocă un ingredient trebuie să îl poată referi fără ambiguitate. Totalurile și randamentul trebuie să fie compatibile cu cantitățile.
