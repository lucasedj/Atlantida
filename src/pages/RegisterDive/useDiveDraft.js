import { useEffect, useState } from "react";

const DRAFT_KEY = "diveDraft";

// lê o rascunho completo
export function readDiveDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {};
  } catch {
    return {};
  }
}

// sobrescreve/mescla e salva
export function writeDiveDraft(patch) {
  const prev = readDiveDraft();
  const next = { ...prev, ...patch };
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(next)); } catch {}
  return next;
}

// apaga tudo (usar após envio com sucesso)
export function clearDiveDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

// Hook para um único campo do rascunho
export function useDraftField(key, initialValue = "") {
  const [value, setValue] = useState(() => {
    const d = readDiveDraft();
    return d[key] ?? initialValue;
  });

  // sempre que o valor mudar, persiste no localStorage
  useEffect(() => {
    writeDiveDraft({ [key]: value });
  }, [key, value]);

  return [value, setValue];
}
