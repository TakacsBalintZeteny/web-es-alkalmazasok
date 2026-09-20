import { useEffect, useState } from 'react'
import './App.css'

type Table = {
  id: number
  name: string
  capacity: number
}

type Booking = {
  id: number
  guestName: string
  date: string
  time: string
  guests: number
  tableId: number
}

const tables: Table[] = [
  { id: 1, name: '1-es asztal', capacity: 2 },
  { id: 2, name: '2-es asztal', capacity: 4 },
  { id: 3, name: '3-as asztal', capacity: 4 },
  { id: 4, name: '4-es asztal', capacity: 6 },
]

function App() {
  const [bookings, setBookings] = useState<Booking[]>(() => {
  const savedBookings = localStorage.getItem('tablebook-bookings')

  if (!savedBookings) {
    return []
  }

  return JSON.parse(savedBookings)
})
  const [guestName, setGuestName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState(2)
  const [tableId, setTableId] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
  localStorage.setItem('tablebook-bookings', JSON.stringify(bookings))
}, [bookings])

  const selectedTable = tables.find((table) => table.id === tableId)

  const createBooking = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!guestName.trim()) {
      setError('Kérlek, add meg a vendég nevét.')
      return
    }

    if (!date || !time) {
      setError('Kérlek, add meg a dátumot és az időpontot.')
      return
    }

    if (!selectedTable) {
      setError('Válassz egy asztalt.')
      return
    }

    if (guests > selectedTable.capacity) {
      setError(
        `Ez az asztal legfeljebb ${selectedTable.capacity} fő számára alkalmas.`,
      )
      return
    }

    const newBooking: Booking = {
      id: Date.now(),
      guestName: guestName.trim(),
      date,
      time,
      guests,
      tableId,
    }

    setBookings((current) => [...current, newBooking])

    setGuestName('')
    setDate('')
    setTime('')
    setGuests(2)
    setTableId(1)
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">TABLEBOOK</p>
          <h1>Éttermi asztalfoglalás</h1>
          <p className="subtitle">
            Asztalok és foglalások egyszerű kezelése.
          </p>
        </div>
      </header>

      <main className="content">
        <section className="section">
          <div className="section-title">
            <span>01</span>
            <div>
              <p className="eyebrow">ASZTALOK</p>
              <h2>Elérhető asztalok</h2>
            </div>
          </div>

          <div className="table-grid">
            {tables.map((table) => (
              <div className="table-card" key={table.id}>
                <div className="table-icon">▦</div>
                <h3>{table.name}</h3>
                <p>{table.capacity} fő</p>
              </div>
            ))}
          </div>
        </section>

        <div className="main-grid">
          <section className="section booking-form-section">
            <div className="section-title">
              <span>02</span>
              <div>
                <p className="eyebrow">ÚJ FOGLALÁS</p>
                <h2>Asztal lefoglalása</h2>
              </div>
            </div>

            <form onSubmit={createBooking} className="booking-form">
              <label>
                Vendég neve
                <input
                  type="text"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  placeholder="Például Kovács Anna"
                />
              </label>

              <label>
                Dátum
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </label>

              <label>
                Időpont
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
              </label>

              <label>
                Vendégek száma
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={guests}
                  onChange={(event) => setGuests(Number(event.target.value))}
                />
              </label>

              <label>
                Asztal
                <select
                  value={tableId}
                  onChange={(event) => setTableId(Number(event.target.value))}
                >
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.name} – {table.capacity} fő
                    </option>
                  ))}
                </select>
              </label>

              {error && <p className="error">{error}</p>}

              <button type="submit">
                Foglalás létrehozása →
              </button>
            </form>
          </section>

          <section className="section">
            <div className="section-title">
              <span>03</span>
              <div>
                <p className="eyebrow">FOGLALÁSOK</p>
                <h2>Aktív foglalások</h2>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">○</div>
                <h3>Még nincs foglalás</h3>
                <p>
                  Az első foglalást a bal oldali űrlapon hozhatod létre.
                </p>
              </div>
            ) : (
              <div className="booking-list">
                {bookings.map((booking) => {
                  const table = tables.find(
                    (item) => item.id === booking.tableId,
                  )

                  return (
                    <div className="booking-card" key={booking.id}>
                      <div>
                        <strong>{booking.guestName}</strong>
                        <p>
                          {booking.date} · {booking.time}
                        </p>
                      </div>

                      <div className="booking-details">
                        <span>{booking.guests} fő</span>
                        <span>{table?.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer>
        <span>TableBook · 1. heti prototípus</span>
        <span>React + TypeScript</span>
      </footer>
    </div>
  )
}

export default App