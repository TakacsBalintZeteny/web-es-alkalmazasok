import { Resend } from 'resend'

type BookingEmailData = {
  date: Date
  startTime: string
  endTime: string
  guestCount: number
  user: {
    name: string
    email: string
  }
  table: {
    name: string
    capacity: number
  }
}

export async function sendBookingConfirmation(
  booking: BookingEmailData,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey || !from) {
    throw new Error('Hiányzik a Resend e-mail-beállítása.')
  }

  const resend = new Resend(apiKey)

  const formattedDate = new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(booking.date)

  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }
      return entities[character]
    })

  const guestName = escapeHtml(booking.user.name)
  const tableName = escapeHtml(booking.table.name)

  const { error } = await resend.emails.send({
    from,
    to: booking.user.email,
    subject: 'TableBook – Foglalás visszaigazolása',
    text: [
      `Kedves ${booking.user.name}!`,
      '',
      'Sikeresen rögzítettük az éttermi foglalásodat.',
      `Dátum: ${formattedDate}`,
      `Időpont: ${booking.startTime}–${booking.endTime}`,
      `Vendégek száma: ${booking.guestCount} fő`,
      `Asztal: ${booking.table.name}`,
      '',
      'Köszönjük, hogy a TableBookot választottad!',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
        <h1>Foglalás visszaigazolása</h1>
        <p>Kedves ${guestName}!</p>
        <p>Sikeresen rögzítettük az éttermi foglalásodat.</p>
        <h2>A foglalás adatai</h2>
        <p><strong>Dátum:</strong> ${formattedDate}</p>
        <p><strong>Időpont:</strong> ${booking.startTime}–${booking.endTime}</p>
        <p><strong>Vendégek száma:</strong> ${booking.guestCount} fő</p>
        <p><strong>Asztal:</strong> ${tableName}</p>
        <p>Köszönjük, hogy a TableBookot választottad!</p>
      </div>
    `,
  })

  if (error) {
    throw new Error(`A visszaigazoló e-mail küldése sikertelen: ${error.message}`)
  }
}