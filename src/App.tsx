
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

import {
  apiRequest,
  clearAuth,
  getUser,
} from './api'

import type { User } from './api'
import AuthForm from './AuthForm'

const API_URL = 'http://localhost:3001/api'

type Table = {
  id: number
  name: string
  capacity: number
}

type ApiBooking = {
  id: number
  guestId: number
  tableId: number
  date: string
  startTime: string
  endTime: string
  guestCount: number
  guest: {
    id: number
    name: string
  }
  table: Table
}

type Booking = {
  id: number
  guestName: string
  date: string
  time: string
  guests: number
  tableId: number
}

function App() {
  const [user, setUser] = useState<User | null>(() => getUser())

  const [tables, setTables] = useState<Table[]>([])
  const [availableTables, setAvailableTables] = useState<Table[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  const [loading, setLoading] = useState(true)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [availabilityError, setAvailabilityError] = useState('')

  const [date, setDate] = useState('')
  const [time, setTime] = useState('18:00')
  const [guests, setGuests] = useState(2)
  const [tableId, setTableId] = useState('')

  const [availabilityRefresh, setAvailabilityRefresh] = useState(0)

  // Asztalok és foglalások betöltése
  async function loadData(showLoading = true) {
    if (showLoading) setLoading(true)
    setError('')

    try {
      const [tablesResponse, bookingsResponse] = await Promise.all([
        fetch(`${API_URL}/tables`),
        apiRequest('/bookings'),
      ])

      if (bookingsResponse.status === 401) {
        clearAuth()
        setUser(null)
        throw new Error('A munkamenet lejárt. Kérlek, jelentkezz be újra.')
      }

      if (!tablesResponse.ok || !bookingsResponse.ok) {
        throw new Error(
          'Nem sikerült betölteni az adatokat. Ellenőrizd, fut-e a backend.',
        )
      }

      const tablesData: Table[] = await tablesResponse.json()
      const bookingsData: ApiBooking[] = await bookingsResponse.json()

      setTables(tablesData)

      setBookings(
        bookingsData.map((booking) => ({
          id: booking.id,
          guestName: booking.guest?.name ?? 'Ismeretlen vendég',
          date: String(booking.date).slice(0, 10),
          time: booking.startTime?.slice(0, 5) ?? '',
          guests: booking.guestCount,
          tableId: booking.tableId,
        })),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Nem sikerült kapcsolódni a szerverhez.',
      )
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Adatok betöltése bejelentkezés után
  useEffect(() => {
    if (user) {
      void loadData()
    } else {
      setLoading(false)
      setTables([])
      setBookings([])
    }
  }, [user])

  // Szabad asztalok automatikus lekérdezése
  useEffect(() => {
    if (
      !user ||
      !date ||
      !time ||
      !Number.isInteger(guests) ||
      guests < 1
    ) {
      setAvailableTables([])
      setTableId('')
      setAvailabilityError('')
      return
    }

    const controller = new AbortController()

    async function loadAvailableTables() {
      setAvailabilityLoading(true)
      setAvailabilityError('')

      try {
        const params = new URLSearchParams({
          date,
          time,
          guests: String(guests),
        })

        const response = await fetch(
          `${API_URL}/tables/available?${params.toString()}`,
          { signal: controller.signal },
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error ??
              'Nem sikerült lekérdezni a szabad asztalokat.',
          )
        }

        const data: Table[] = result

        setAvailableTables(data)

        setTableId((current) => {
          if (data.some((table) => table.id === Number(current))) {
            return current
          }

          return data.length > 0 ? String(data[0].id) : ''
        })
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        setAvailableTables([])
        setTableId('')

        setAvailabilityError(
          err instanceof Error
            ? err.message
            : 'Nem sikerült lekérdezni a szabad asztalokat.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setAvailabilityLoading(false)
        }
      }
    }

    void loadAvailableTables()

    return () => controller.abort()
  }, [user, date, time, guests, availabilityRefresh])

  // Új foglalás létrehozása
  async function handleCreateBooking(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!date || !time || !tableId) {
      setError('Kérlek, tölts ki minden mezőt.')
      return
    }

    if (!Number.isInteger(guests) || guests < 1) {
      setError('Legalább egy vendéget adj meg.')
      return
    }

    const selectedTable = availableTables.find(
      (table) => table.id === Number(tableId),
    )

    if (!selectedTable) {
      setError(
        'A kiválasztott asztal már nem elérhető. Kérlek, válassz másikat.',
      )
      setAvailabilityRefresh((current) => current + 1)
      return
    }

    if (guests > selectedTable.capacity) {
      setError(
        `A kiválasztott asztal legfeljebb ${selectedTable.capacity} főt tud fogadni.`,
      )
      return
    }

    setSaving(true)

    try {
      const response = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          date,
          time,
          guests,
          tableId: Number(tableId),
        }),
      })

      const result = await response.json().catch(() => ({}))

      if (response.status === 401) {
        clearAuth()
        setUser(null)
        throw new Error('A munkamenet lejárt. Kérlek, jelentkezz be újra.')
      }

      if (!response.ok) {
        throw new Error(
          result.error ??
            result.message ??
            'Nem sikerült létrehozni a foglalást.',
        )
      }

      await loadData(false)

      setAvailabilityRefresh((current) => current + 1)
      setSuccess('A foglalás sikeresen létrejött.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Hiba történt a foglalás mentésekor.',
      )

      setAvailabilityRefresh((current) => current + 1)
    } finally {
      setSaving(false)
    }
  }

  // Foglalás törlése
  async function handleDeleteBooking(id: number) {
    setError('')
    setSuccess('')
    setDeletingId(id)

    try {
      const response = await apiRequest(`/bookings/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json().catch(() => ({}))

      if (response.status === 401) {
        clearAuth()
        setUser(null)
        throw new Error('A munkamenet lejárt. Kérlek, jelentkezz be újra.')
      }

      if (!response.ok) {
        throw new Error(
          result.error ??
            result.message ??
            'Nem sikerült törölni a foglalást.',
        )
      }

      await loadData(false)

      setAvailabilityRefresh((current) => current + 1)
      setSuccess('A foglalást sikeresen töröltük.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Hiba történt a foglalás törlésekor.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  // Kijelentkezés
  function handleLogout() {
    clearAuth()
    setUser(null)
    setDate('')
    setTime('18:00')
    setGuests(2)
    setTableId('')
    setAvailableTables([])
    setError('')
    setSuccess('')
  }

  // Asztal nevének lekérdezése
  function getTableName(id: number) {
    return (
      tables.find((table) => table.id === id)?.name ??
      'Ismeretlen asztal'
    )
  }

  // Bejelentkezés nélküli felület
  if (!user) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <p className="eyebrow">TABLEBOOK</p>
            <h1>Éttermi asztalfoglalás</h1>
            <p className="subtitle">
              Jelentkezz be vagy hozz létre egy fiókot a folytatáshoz.
            </p>
          </div>
        </header>

        <main className="content">
          <AuthForm
            onAuthenticated={(authenticatedUser) => {
              setUser(authenticatedUser)
            }}
          />
        </main>

        <footer>
          <span>TableBook · prototípus</span>
          <span>React + TypeScript + PostgreSQL</span>
        </footer>
      </div>
    )
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

        <div className="user-panel">
          <div>
            <strong>{user.name}</strong>
            <p>{user.role === 'MANAGER' ? 'Éttermvezető' : 'Vendég'}</p>
          </div>

          <button type="button" onClick={handleLogout}>
            Kijelentkezés
          </button>
        </div>
      </header>

      <main className="content">
        {(error || success) && (
          <div
            className={error ? 'error' : 'success-message'}
            role={error ? 'alert' : 'status'}
            style={
              success && !error
                ? {
                    marginBottom: '24px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#e1eddf',
                    color: '#285b30',
                    fontSize: '0.9rem',
                  }
                : { marginBottom: '24px' }
            }
          >
            {error || success}
          </div>
        )}

        <section className="section">
          <div className="section-title">
            <span>01</span>
            <div>
              <p className="eyebrow">ASZTALOK</p>
              <h2>Étterem asztalai</h2>
            </div>
          </div>

          {loading ? (
            <p>Asztalok betöltése...</p>
          ) : tables.length === 0 ? (
            <div className="empty">
              <h3>Nincsenek asztalok</h3>
              <p>
                Ellenőrizd, hogy az adatbázisban szerepelnek-e asztalok.
              </p>
            </div>
          ) : (
            <div className="table-grid">
              {tables.map((table) => (
                <article className="table-card" key={table.id}>
                  <div className="table-icon" aria-hidden="true">
                    ▦
                  </div>
                  <h3>{table.name}</h3>
                  <p>{table.capacity} férőhely</p>
                </article>
              ))}
            </div>
          )}
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

            <form
              onSubmit={handleCreateBooking}
              className="booking-form"
            >
              <label htmlFor="date">
                Dátum
                <input
                  id="date"
                  type="date"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </label>

              <label htmlFor="time">
                Időpont
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  required
                />
              </label>

              <label htmlFor="guests">
                Vendégek száma
                <input
                  id="guests"
                  type="number"
                  min="1"
                  max="20"
                  value={guests}
                  onChange={(event) =>
                    setGuests(Number(event.target.value))
                  }
                  required
                />
              </label>

              <label htmlFor="tableId">
                Szabad asztal
                <select
                  id="tableId"
                  value={tableId}
                  onChange={(event) => setTableId(event.target.value)}
                  required
                  disabled={
                    !date ||
                    availabilityLoading ||
                    availableTables.length === 0
                  }
                >
                  {!date ? (
                    <option value="">Először válassz dátumot</option>
                  ) : availabilityLoading ? (
                    <option value="">Szabad asztalok keresése...</option>
                  ) : availableTables.length === 0 ? (
                    <option value="">Nincs szabad asztal</option>
                  ) : (
                    availableTables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name} – {table.capacity} fő
                      </option>
                    ))
                  )}
                </select>
              </label>

              {availabilityError && (
                <p className="error">{availabilityError}</p>
              )}

              {date &&
                !availabilityLoading &&
                !availabilityError &&
                availableTables.length === 0 && (
                  <p className="error">
                    Erre az időpontra nincs megfelelő szabad asztal.
                  </p>
                )}

              <button
                type="submit"
                disabled={
                  saving ||
                  loading ||
                  availabilityLoading ||
                  availableTables.length === 0 ||
                  !tableId
                }
              >
                {saving
                  ? 'Mentés...'
                  : 'Foglalás létrehozása →'}
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

            {loading ? (
              <p>Foglalások betöltése...</p>
            ) : bookings.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">○</div>
                <h3>Még nincs foglalás</h3>
                <p>
                  Az első foglalást a bal oldali űrlapon hozhatod létre.
                </p>
              </div>
            ) : (
              <div className="booking-list">
                {bookings.map((booking) => (
                  <article className="booking-card" key={booking.id}>
                    <div>
                      <strong>{booking.guestName}</strong>
                      <p>
                        {booking.date} · {booking.time}
                      </p>
                      <p>
                        {getTableName(booking.tableId)} · {booking.guests} fő
                      </p>
                    </div>

                    <div className="booking-actions">
                      <div className="booking-details">
                        <span>{booking.guests} fő</span>
                        <span>{getTableName(booking.tableId)}</span>
                      </div>

                      <button
                        type="button"
                        className="delete-button"
                        disabled={deletingId === booking.id}
                        onClick={() =>
                          void handleDeleteBooking(booking.id)
                        }
                      >
                        {deletingId === booking.id
                          ? 'Törlés...'
                          : 'Törlés'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer>
        <span>TableBook · prototípus</span>
        <span>React + TypeScript + PostgreSQL</span>
      </footer>
    </div>
  )
}

export default App
