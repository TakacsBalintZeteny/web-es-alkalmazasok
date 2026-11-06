TableBook – Központi projektprompt
Ez a dokumentum a TableBook egyetemi projekt fő célját és heti fejlesztési feladatait foglalja össze. A cél egy magyar nyelvű, jól használható éttermi asztalfoglaló webalkalmazás elkészítése.

Fontos: mindig a már meglévő projektből indulj ki. Mielőtt módosítasz valamit, nézd át az érintett fájlokat, és őrizd meg a működő funkciókat és adatokat. Ne építsd újra feleslegesen az alkalmazást.
Kezdeti projektprompt
Segíts a TableBook fejlesztésében React, TypeScript és Vite használatával. Később Express és Node.js alapú TypeScript backend, PostgreSQL adatbázis és Prisma ORM kapcsolódik a projekthez.

A kód legyen átlátható, könnyen követhető és bővíthető. A felület legyen magyar nyelvű és reszponzív. A fejlesztést kisebb lépésekben végezd, minden változtatás után írd le, hogyan lehet ellenőrizni a működését.
1. hét – Alap frontend
Készíts egy egyszerű, működő asztalfoglaló felületet.

Legyen benne:
- asztalok listája és férőhelyeik;
- foglalási űrlap vendégnévvel, dátummal, időponttal, létszámmal és asztallal;
- a foglalások listája;
- kapacitásellenőrzés;
- érthető hibaüzenetek;
- localStorage-ban tárolt foglalások.
Ebben a szakaszban még ne legyen backend vagy adatbázis.
2. hét – Domainmodell és üzleti logika
A meglévő alkalmazásban alakítsd ki a fő modelleket:
- Table – asztal;
- Guest – vendég;
- Booking – foglalás;
- OpeningHours – nyitvatartás.
Készíts két értékobjektumot is:
- GuestCount – csak legalább egy főt fogadjon el;
- TimeInterval – érvényes kezdési és befejezési időt kezeljen.
A fő műveletek legyenek elkülönítve: asztalok listázása és felvétele, szabad asztalok keresése, foglalás létrehozása és törlése.

A vendégnév ne legyen üres, a létszám ne haladja meg az asztal férőhelyét, és ugyanarra az asztalra ne kerülhessen két átfedő foglalás.
3. hét – Backend és adatbázis
Készíts Node.js és Express alapú, TypeScript backend rendszert. Az adatokat PostgreSQL adatbázisban tárold, Prisma ORM segítségével.

A backend biztosítsa:
- az állapot ellenőrzését;
- az asztalok listázását és létrehozását;
- a foglalások listázását, létrehozását és törlését;
- a szabad asztalok lekérdezését.
A foglalás tartozzon egy vendéghez és egy asztalhoz. A nyitvatartás minden nap 10:00–22:00, az alapértelmezett foglalás egyórás.

A backend ellenőrizze a vendég nevét, a létszámot, az asztal kapacitását, a nyitvatartást és az időbeli ütközéseket. Hibás kérés esetén adjon megfelelő HTTP-státuszkódot és érthető hibaüzenetet.

Kapcsold össze a meglévő React felületet a REST API-val. Az adatokat már az adatbázisból kezelje az alkalmazás, ne csak a böngészőben tárolja.
4. hét – Felhasználók és e-mailes visszaigazolás
Bővítsd a rendszert regisztrációval és bejelentkezéssel.

Legyen két szerepkör:
- GUEST – vendég;
- MANAGER – étteremvezető.
A hitelesítés JWT-vel történjen, a jelszavakat biztonságosan hash-eld. A vendég csak a saját foglalásait láthassa és törölhesse, az étteremvezető pedig kezelhesse az összes foglalást és az asztalokat.

A szerepköröket és jogosultságokat a backend ellenőrizze. Nyilvános regisztráció során minden új felhasználó automatikusan vendég legyen.

Sikeres foglalás után küldj visszaigazoló e-mailt a felhasználónak. Az e-mail tartalmazza a dátumot, időpontot, létszámot és az asztal nevét. Az e-mail-szolgáltató kulcsai környezeti változókban legyenek. Ha az e-mail küldése sikertelen, a már elmentett foglalás maradjon meg.
A végső alkalmazás
A TableBook végül egy olyan rendszer legyen, ahol:
- a vendégek regisztrálhatnak, bejelentkezhetnek és foglalhatnak;
- megtekinthetik és kezelhetik a saját foglalásaikat;
- az étteremvezető kezelheti az asztalokat és az összes foglalást;
- a rendszer ellenőrzi a kapacitást, a nyitvatartást és az időbeli ütközéseket;
- a foglalások PostgreSQL adatbázisban tárolódnak;
- a vendég e-mailes visszaigazolást kaphat.
Opcionális későbbi fejlesztések
Ezek nem részei a kötelező heti feladatoknak:
- automatikus, optimális asztalkiosztás;
- foglalás módosítása és státuszkezelése;
- részletesebb vezetői felület és statisztikák;
- automatikus e-mail-emlékeztetők;
- unit és integrációs tesztek.
Hogyan dolgozz a projekten?
- Először nézd át a meglévő kódot, és csak utána javasolj módosításokat.
- Ne törölj adatbázisadatokat, és ne használj reset parancsot indokolatlanul.
- Mindig add meg, melyik fájlt kell módosítani vagy létrehozni.
- A szükséges kódot teljes egészében, a kapcsolódó importokkal együtt mutasd meg.
- Röviden magyarázd el, mit változtattál.
- Adj konkrét parancsokat és lépéseket a teszteléshez.
- Ne állítsd, hogy valamit teszteltél, ha valójában nem futtattad le.
- A titkos kulcsokat és jelszavakat ne kérd el, és ne tedd forráskódba.
- Mindig az aktuális heti feladatra koncentrálj, a későbbi funkciókat ne építsd be idő előtt.