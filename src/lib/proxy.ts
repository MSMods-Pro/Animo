export const M3U8_PROXY = "https://m3u8proxy-rho-nine.vercel.app/m3u8-proxy?url=";
export const CORS_PROXY = "https://corsproxy.io/?url=";
export const FALLBACK_PROXY = "https://api.allorigins.win/raw?url=";

export function getProxiedM3U8(url: string) {
  if (!url) return '';
  return `${M3U8_PROXY}${encodeURIComponent(url)}`;
}

export function getProxiedCors(url: string) {
  if (!url) return '';
  return `${CORS_PROXY}${encodeURIComponent(url)}`;
}

export function getProxiedFallback(url: string) {
  if (!url) return '';
  return `${FALLBACK_PROXY}${encodeURIComponent(url)}`;
}
