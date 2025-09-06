import { useEffect, useState } from "react";
import { getCurrentUser, me } from "./authService";

export function useAuthUser() {
  const [user, setUser] = useState(getCurrentUser()); // pega do localStorage

  useEffect(() => {
    // se não tiver no storage (ex: página recarregada), busca na API pelo token
    if (!user) {
      me()
        .then((u) => {
          setUser(u);
          try { localStorage.setItem("user", JSON.stringify(u)); } catch {}
        })
        .catch(() => {});
    }
  }, [user]);

  return user;
}

export function displayName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ")
      || user?.name
      || user?.email
      || "usuário";
}
