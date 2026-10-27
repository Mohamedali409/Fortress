export const createAiHttpClient = ({ baseUrl, timeoutMs = 10000 }) => {
  const request = async (path, { method = "GET", body } = {}) => {
    if (!baseUrl) {
      throw new Error("AI service URL is not configured");
    }

    const url = `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      const error = new Error(`AI service returned HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  };

  return { request };
};
