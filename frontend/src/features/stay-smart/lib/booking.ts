export function formatBookingCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function getNightCount(startDate: Date, endDate: Date) {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  const diffInDays = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );

  return Math.max(1, diffInDays);
}

export function calculateReservationTotal(input: {
  pricePerNight?: number | null;
  startDate: Date | string;
  endDate: Date | string;
  guests: number;
}) {
  const startDate =
    input.startDate instanceof Date ? input.startDate : new Date(input.startDate);
  const endDate =
    input.endDate instanceof Date ? input.endDate : new Date(input.endDate);
  const nightCount = getNightCount(startDate, endDate);
  const staySubtotal = Math.max(0, (input.pricePerNight ?? 0) * nightCount);
  const serviceFee =
    staySubtotal > 0 ? Math.max(24, Math.round(staySubtotal * 0.12)) : 0;
  const extraGuestFee = Math.max(0, input.guests - 1) * 14;

  return {
    nightCount,
    staySubtotal,
    serviceFee,
    extraGuestFee,
    total: staySubtotal + serviceFee + extraGuestFee,
  };
}
