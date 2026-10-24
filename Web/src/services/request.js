const unavailableMessage = 'Không thể tải dữ liệu lúc này. Vui lòng thử lại.';

// Render can take a while to wake up. Retry only read requests and temporary failures.
export async function getJson(url, { timeoutMs = 60000, retries = 1, ...options } = {}) {
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      let response;
      try {
        response = await fetch(url, { ...options, signal: controller.signal });
      } catch (cause) {
        if (attempt < retries) continue;
        throw new Error(unavailableMessage, { cause });
      }
      if (!response.ok) {
        if ([502, 503, 504].includes(response.status) && attempt < retries) continue;
        throw new Error(unavailableMessage);
      }
      try {
        return await response.json();
      } catch (cause) {
        throw new Error(unavailableMessage, { cause });
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}
