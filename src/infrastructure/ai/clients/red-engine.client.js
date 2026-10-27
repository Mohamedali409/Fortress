import aiConfig from "../config/ai.config.js";
import { createAiHttpClient } from "./ai-http.client.js";

const httpClient = createAiHttpClient({
  baseUrl: aiConfig.redEngine.baseUrl,
  timeoutMs: aiConfig.timeoutMs,
});

const getHealth = () => httpClient.request("/api/v1/health");

const scoreRisk = (employeeData) =>
  httpClient.request("/api/v1/risk/score", {
    method: "POST",
    body: employeeData,
  });

const redEngineClient = {
  getHealth,
  scoreRisk,
};

export default redEngineClient;
