# TableBook

## 1. A projekt bemutatása

A TableBook egy éttermi asztalfoglalást kezelő webalkalmazás prototípusa.

A projekt célja, hogy a vendégek számára lehetővé tegye az éttermi asztalok megtekintését és egy új foglalás létrehozását.

## 2. 1. heti MVP

Az első heti prototípusban az alábbi funkciók készültek el:

* éttermi asztalok listázása,
* asztalok férőhelyének megjelenítése,
* új foglalás létrehozása,
* vendég nevének megadása,
* dátum és időpont megadása,
* vendégek számának megadása,
* asztal kiválasztása,
* túl nagy létszámú foglalás tiltása,
* létrehozott foglalások listázása,
* foglalások mentése böngészőben `localStorage` segítségével.

## 3. Technológiák

A prototípus az alábbi technológiákkal készült:

* React
* TypeScript
* Vite
* CSS
* Browser LocalStorage

## 4. Adattárolás

Az első heti prototípus nem használ külön szervert vagy adatbázist.

A foglalások a böngésző `localStorage` tárhelyén kerülnek mentésre. Ennek köszönhetően az oldal újratöltése után a korábban létrehozott foglalások megmaradnak.

## 5. Futtatás

A projekt futtatásához szükséges a Node.js telepítése.

A projekt mappájában:

```bash
npm install
```

Ezután:

```bash
npm run dev
```

A fejlesztői szerver elindítása után a Vite által megadott helyi címen érhető el az alkalmazás.

## 6. 1. heti eredmény

Az első hét végére elkészült egy működő TableBook prototípus, amely képes az éttermi asztalok megjelenítésére, új foglalások létrehozására és a foglalások böngészőben történő megőrzésére.

A további hetekben a projekt új funkciókkal bővíthető a féléves feladatkiírás alapján.
