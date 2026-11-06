-- A GiST indexhez szükséges egyenlőségvizsgálat támogatása.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Az időpontokat HH:MM formátumú szövegből percekké alakítjuk.
-- Ez a kifejezés IMMUTABLE, ezért használható GiST indexben.
ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_no_overlapping_table_reservations"
EXCLUDE USING gist (
  "tableId" WITH =,
  "date" WITH =,
  (
    int4range(
      (
        substring("startTime" FROM 1 FOR 2)::integer * 60
        + substring("startTime" FROM 4 FOR 2)::integer
      ),
      (
        substring("endTime" FROM 1 FOR 2)::integer * 60
        + substring("endTime" FROM 4 FOR 2)::integer
      ),
      '[)'
    )
  ) WITH &&
);