import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../src/config/db.js", () => ({
  default: vi.fn().mockResolvedValue(undefined),
  disconnectDB: vi.fn().mockResolvedValue(undefined),
}));

const db = await import("../src/config/db.js");
const { startServer, endServer } = await import("../src/server.js");

process.env.PORT = "0"; // random free port

let base;
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(async () => {
  await endServer();
  vi.restoreAllMocks();
});

describe("startServer / endServer", () => {
  it("startServer connects the DB and serves requests", async () => {
    const server = await startServer();
    base = `http://127.0.0.1:${server.address().port}`;
    expect(db.default).toHaveBeenCalledTimes(1);
    const res = await fetch(`${base}/api/health`);
    expect(res.status).toBe(200);
  });

  it("endServer stops the listener and disconnects the DB", async () => {
    const server = await startServer();
    base = `http://127.0.0.1:${server.address().port}`;
    await fetch(`${base}/api/health`); // opens a keep-alive connection
    await endServer("TEST");
    expect(server.listening).toBe(false);
    expect(db.disconnectDB).toHaveBeenCalledTimes(1);
    await expect(fetch(`${base}/api/health`)).rejects.toThrow();
  });

  it("concurrent endServer calls share one shutdown and repeats are harmless", async () => {
    await startServer();
    await Promise.all([endServer(), endServer()]);
    expect(db.disconnectDB).toHaveBeenCalledTimes(1); // shared single shutdown
    await expect(endServer()).resolves.toBeUndefined(); // later call is harmless
  });

  it("endServer works when the server was never started", async () => {
    await expect(endServer()).resolves.toBeUndefined();
    expect(db.disconnectDB).toHaveBeenCalledTimes(1);
  });

  it("can start again after being stopped", async () => {
    await startServer();
    await endServer();
    const server = await startServer();
    const res = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
    expect(res.status).toBe(200);
  });
});
