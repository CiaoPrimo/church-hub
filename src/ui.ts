export function showSection(id: string) {
  document.getElementById(id)?.classList.remove("hidden");
}

export function hideSection(id: string) {
  document.getElementById(id)?.classList.add("hidden");
}

export function setText(id: string, text: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
