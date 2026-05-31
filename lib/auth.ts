import Cookies from "js-cookie";

const TOKEN_KEY = "asuma_token";
const COOKIE_EXPIRES = 7; 

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: COOKIE_EXPIRES,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    const ls = localStorage.getItem(TOKEN_KEY);
    if (ls) return ls;
  }

  const cookie = Cookies.get(TOKEN_KEY);
  return cookie ?? null;
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);

  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function syncTokenFromCookieToStorage(): void {
  if (typeof window === "undefined") return;
  const cookie = Cookies.get(TOKEN_KEY);
  if (cookie && !localStorage.getItem(TOKEN_KEY)) {
    localStorage.setItem(TOKEN_KEY, cookie);
  }
}
