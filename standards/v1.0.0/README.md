# Atlas Gastronomic — Standards Pack v1.0

Pachet operațional pentru construirea unei baze editoriale de rețete documentate, coerente și reproductibile.

## Principii nenegociabile
- **Rigoare strictă:** rețetele trebuie să fie gastronomic coerente, tehnic executabile și verificabile.
- **Trasabilitate:** afirmațiile istorice, regionale, tehnice sau nutriționale trebuie legate de surse.
- **Reproductibilitate:** cantitățile, randamentul, temperaturile, timpii și pașii trebuie să permită repetarea preparatului.
- **Aprobare umană:** nicio rețetă nu devine publicabilă fără revizie și aprobare umană explicită.
- **Separarea faptelor de interpretare:** tradiția documentată, practica uzuală și adaptarea editorială nu se confundă.

## Structura pachetului
- `docs/` — standarde editoriale, guvernanță, flux de lucru, cercetare și model de date.
- `schemas/` — JSON Schema pentru rețete și ingrediente.
- `notion-templates/` — CSV-uri importabile în Notion.
- `examples/` — exemplu demonstrativ de rețetă și ingredient.
- `Atlas_Gastronomic_Manual_Editorial_v1.0.pdf` — manual editorial PDF.

## Rolul agentului Antigravity
Agentul poate cerceta, compara surse, redacta variante, calcula conversii, semnala contradicții și propune corecții. Nu poate inventa surse, declara verificată o informație neverificată, elimina divergențe fără justificare sau publica autonom.

## Sursa de adevăr
Repository-ul GitHub este sursa tehnică de adevăr pentru standarde, scheme și versiuni. Notion este spațiul de lucru editorial și de urmărire, nu un substitut pentru schema canonică. PDF-ul este o versiune de consultare a standardelor.

## Stări editoriale
`idea` → `researching` → `draft` → `technical_review` → `editorial_review` → `human_approved` → `published`
Orice modificare substanțială după aprobare readuce rețeta într-o stare de revizie.
