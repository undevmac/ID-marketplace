export const ORDER_STATUSES: [value: string, label: string][] = [
  ["received", "Received"], ["proof_sent", "Proof sent"], ["printing", "Printing"],
  ["shipped", "Shipped"], ["done", "Done"], ["cancelled", "Cancelled"],
];
export const statusLabel = (v: string) => ORDER_STATUSES.find((s) => s[0] === v)?.[1] ?? v;
