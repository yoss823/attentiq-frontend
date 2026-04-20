export function getPremiumFromCookie(): boolean {
  if (typeof document === "undefined") return false;

  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const premiumCookie = cookies.find((cookie) =>
    cookie.startsWith("premium_access=")
  );

  if (!premiumCookie) return false;

  const value = premiumCookie.split("=")[1];

  try {
    const data = JSON.parse(decodeURIComponent(value));
    return data.active === true;
  } catch {
    return false;
  }
}