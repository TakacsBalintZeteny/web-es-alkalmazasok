# TableBook – Éttermi asztalfoglaló rendszer

## 1. A projekt bemutatása

A **TableBook** egy webes éttermi asztalfoglaló alkalmazás, amely lehetővé teszi a vendégek számára az elérhető asztalok megtekintését és az éttermi foglalások kezelését.

A rendszer a foglalás során figyelembe veszi a vendégek számát, a választott dátumot, az időpontot, az asztalok kapacitását és az étterem nyitvatartását.

Az alkalmazás két felhasználói szerepkört különböztet meg:
- **Vendég (GUEST):** regisztrálhat, bejelentkezhet, foglalhat asztalt, megtekintheti és törölheti saját foglalásait.
- **Étteremvezető (MANAGER):** megtekintheti az összes foglalást, valamint kezelheti az étterem asztalait.

## 2. Főbb funkciók

### Foglalások kezelése
- Új foglalás létrehozása.
- Foglalások listázása.
- Saját foglalások törlése.
- Foglalások megtekintése jogosultság alapján.

### Szabad asztalok keresése
A rendszer a következő adatok alapján keresi meg az elérhető asztalokat:
- Dátum
- Időpont
- Vendégek száma

Az elérhető asztalokat kapacitás szerint növekvő sorrendbe rendezi, így a vendéglétszámhoz leginkább megfelelő asztal kerül előre.

### Foglalási szabályok
- Egy asztalhoz azonos időszakban nem tartozhat két átfedő foglalás.
- A vendégek száma nem haladhatja meg az asztal kapacitását.
- A foglalásnak az étterem nyitvatartási idején belül kell lennie.
- A rendszer ellenőrzi a foglalás dátumát és időpontját.

### Felhasználókezelés
- Regisztráció és bejelentkezés.
- Jelszavak biztonságos, bcrypt alapú hash-elése.
- JWT-alapú hitelesítés.
- Szerepköralapú jogosultságkezelés.

### E-mailes visszaigazolás
Sikeres foglalás után a rendszer a Resend külső szolgáltatás segítségével visszaigazoló e-mailt küld a felhasználónak.

Az e-mail tartalmazza a foglalás legfontosabb adatait:
- Dátum
- Időpont
- Vendégek száma
- Lefoglalt asztal

## 3. Felhasznált technológiák

### Frontend
- React
- TypeScript
- Vite
- CSS

### Backend
- Node.js
- Express.js
- TypeScript
- JSON Web Token (JWT)
- bcryptjs
- Resend

### Adatbázis és ORM
- PostgreSQL
- Prisma ORM

## 4. Projekt felépítése

```text
TableBook/
│
├── src/                       # Frontend alkalmazás
│   ├── App.tsx
│   ├── App.css
│   ├── api.ts
│   └── ...
│
├── server/
│   ├── prisma/
│   │   └── schema.prisma       # Adatbázis séma
│   │
│   ├── src/
│   │   ├── application/
│   │   │   └── useCases/       # Alkalmazási műveletek
│   │   ├── domain/
│   │   │   └── valueObjects/   # Domain értékobjektumok
│   │   ├── middleware/         # Hitelesítés és jogosultság
│   │   ├── routes/             # API útvonalak
│   │   ├── services/           # Külső szolgáltatások
│   │   └── index.ts            # Backend belépési pont
│   │
│   └── .env                    # Backend környezeti változók
│
├── package.json
└── README.md
```

## 5. Domainmodell

A rendszer fő domainmodelljei:

| Modell | Leírás |
|---|---|
| Table | Éttermi asztalok |
| Guest | Vendégek |
| Booking | Foglalások |
| OpeningHours | Nyitvatartási adatok |
| User | Regisztrált felhasználók |

### Értékobjektumok

- `GuestCount`: a vendégek számának validálása.
- `TimeInterval`: a foglalási időintervallum kezelése és az átfedések vizsgálata.

## 6. Telepítés és futtatás

### Előfeltételek

A projekt futtatásához szükséges:
- Node.js
- npm
- PostgreSQL adatbázis

### 1. Repository klónozása

```bash
git clone <repository-url>
cd TableBook
```

### 2. Frontend függőségek telepítése

```bash
npm install
```

### 3. Backend függőségek telepítése

```bash
cd server
npm install
```

### 4. Környezeti változók beállítása

Hozz létre egy `.env` fájlt a `server` mappában:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/tablebook"
JWT_SECRET="YOUR_SECRET_KEY"
RESEND_API_KEY="YOUR_RESEND_API_KEY"
EMAIL_FROM="TableBook <onboarding@resend.dev>"
```

A változókat a saját PostgreSQL-adatbázisodhoz és Resend-fiókodhoz kell igazítani.

**Fontos:** a `.env` fájl titkos adatokat tartalmaz, ezért nem szabad feltölteni a GitHub repositoryba.

### 5. Adatbázis migrációk

A backend mappájában futtasd:

```bash
npx prisma migrate deploy
npx prisma generate
```

Fejlesztési környezetben új migráció létrehozásához:

```bash
npx prisma migrate dev
```

### 6. Backend indítása

A `server` mappában:

```bash
npm run dev
```

A backend alapértelmezett címe:

```text
http://localhost:3001
```

### 7. Frontend indítása

A projekt gyökérmappájában:

```bash
npm run dev
```

A frontend alapértelmezett címe:

```text
http://localhost:5173
```

## 7. API végpontok

| HTTP metódus | Végpont | Funkció |
|---|---|---|
| GET | `/api/health` | Backend és adatbázis ellenőrzése |
| GET | `/api/tables` | Asztalok listázása |
| POST | `/api/tables` | Új asztal felvétele |
| GET | `/api/tables/available` | Szabad asztalok keresése |
| GET | `/api/bookings` | Foglalások listázása |
| POST | `/api/bookings` | Új foglalás létrehozása |
| DELETE | `/api/bookings/:id` | Foglalás törlése |
| POST | `/api/auth/register` | Regisztráció |
| POST | `/api/auth/login` | Bejelentkezés |

A jogosultságot igénylő végpontok JWT-alapú hitelesítést használnak.

## 8. E-mailküldés

Az alkalmazás a Resend szolgáltatást használja a foglalási visszaigazolások elküldéséhez.

A tesztelési módban a Resend csak a szolgáltatás által engedélyezett címzettre enged e-mailt küldeni. Tetszőleges címzettek használatához hitelesített küldő domain szükséges.

Az e-mailküldés hibája nem akadályozza meg a már sikeresen létrehozott foglalás mentését.

## 9. Biztonság

A projekt az alábbi biztonsági megoldásokat alkalmazza:
- Jelszavak bcrypt alapú hash-elése.
- JWT-alapú felhasználó-hitelesítés.
- Szerepköralapú hozzáférés-ellenőrzés.
- Vendégek saját foglalásainak elkülönítése.
- Foglalási ütközések ellenőrzése.
- Adatbázis-szintű korlátozás az átfedő foglalások megakadályozására.
- Titkos környezeti változók használata.

## 10. Összefoglalás

A TableBook célja egy egyszerűen használható, biztonságos és adatbázis-alapú éttermi asztalfoglaló rendszer megvalósítása.

Az alkalmazás támogatja a vendégek és az étteremvezető közötti eltérő jogosultságokat, a szabad asztalok keresését, a foglalások kezelését, valamint a külső szolgáltatáson keresztüli e-mailes visszaigazolást.