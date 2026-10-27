const DEFAULT_TIMEOUT_MS = 10000;

const aiConfig = {
  redEngine: {
    baseUrl: process.env.RED_ENGINE_URL,
  },

  blueEngine: {
    baseUrl: process.env.BLUE_ENGINE_URL,
  },

  timeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
};

export default aiConfig;
