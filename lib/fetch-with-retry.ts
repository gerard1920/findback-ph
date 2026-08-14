/**
 * fetchWithRetry — wraps fetch with timeout + exponential backoff retry.
 *
 * Usage:
 *   const res = await fetchWithRetry("/api/items/123", { credentials: "include" }, 3);
 *
 * On network failure or timeout, retries up to `retries` times with
 * exponential backoff (1s, 2s, 4s, …).  Returns the Response from the
 * last attempt regardless of success or failure (so callers can check
 * res.ok / res.status).
 */
export async function fetchWithRetry(
  input: string | URL | Request,
  init: RequestInit & { retries?: number } = {},
): Promise<Response> {
  const { retries = 0, ...opts } = init;
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(input, { ...opts, signal: controller.signal });
      clearTimeout(timeoutId);
      return res; // success or HTTP error — let caller decide
    } catch (e) {
      clearTimeout(timeoutId);
      lastError = e as Error;

      // Don't retry on the last attempt
      if (attempt === retries) break;

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }
  }

  // All retries exhausted — throw the last error
  throw lastError ?? new Error("Failed to fetch");
}
