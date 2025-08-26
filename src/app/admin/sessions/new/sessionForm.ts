export type SessionFormData = {
  title?: string;
  time?: string;
  venue?: string;
  price?: string;
  spots?: string;
  roster?: string;
};

const KEY = "sessionForm";

function load(): SessionFormData {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionFormData) : {};
  } catch {
    return {};
  }
}

function save(data: SessionFormData) {
  if (typeof window === "undefined") return;
  const current = load();
  sessionStorage.setItem(KEY, JSON.stringify({ ...current, ...data }));
}

function clear() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

const sessionForm = { load, save, clear };
export default sessionForm;
