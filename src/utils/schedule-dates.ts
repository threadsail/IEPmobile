export function toDateKey(d: Date): string {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function getWeekRange(anchor: Date): { from: string; to: string } {
  const start = new Date(anchor);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { from: toDateKey(start), to: toDateKey(end) };
}
