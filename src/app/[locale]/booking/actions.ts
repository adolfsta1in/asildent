"use server";

import { createAppointment, type BookingResult } from "@/lib/booking/create";
import type { BookingInput } from "@/lib/validators/booking";

/** Server action мастера записи. Вся проверка — внутри createAppointment. */
export async function submitBooking(input: BookingInput): Promise<BookingResult> {
  return createAppointment(input, { source: "web" });
}
