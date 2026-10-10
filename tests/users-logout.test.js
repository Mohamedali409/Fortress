import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "15m";

// The DB layer is mocked: no MongoDB is needed to run these tests.
vi.mock("../src/modules/users/user.repository.js", () => ({
  findByEmail: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
}));

const repo = await import("../src/modules/users/user.repository.js");
const { default: app } = await import("../src/app.js");
const { default: loginRateLimit } =
  await import("../src/middlewares/login-rate-limit.middleware.js");

const ID = "64b7f0c2a1b2c3d4e5f60718";
const dbUser = {
  _id: { toString: () => ID },
  name: "Ebram",
  email: "e@x.com",
  createdAt: new Date("2026-01-01"),
};
const tokenFor = (sub = ID, opts = {}) =>
  jwt.sign({ sub }, process.env.JWT_SECRET, { expiresIn: "15m", ...opts });

beforeEach(() => {
  vi.resetAllMocks();
  loginRateLimit.resetKey("::ffff:127.0.0.1");
  loginRateLimit.resetKey("127.0.0.1");
});

describe("GET /api/health", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
  });
});

describe("POST /api/auth/register (regression)", () => {
  it("creates a user and hides password", async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockResolvedValue({ ...dbUser });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ebram", email: "E@x.com", password: "password123" });
    expect(res.status).toBe(201);
    expect(res.body.data.user.password).toBeUndefined();
  });
  it("409 on duplicate email", async () => {
    repo.findByEmail.mockResolvedValue(dbUser);
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ebram", email: "e@x.com", password: "password123" });
    expect(res.status).toBe(409);
  });
  it("400 on invalid body", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login (regression)", () => {
  it("sets httpOnly cookie on success", async () => {
    repo.findByEmail.mockResolvedValue({
      ...dbUser,
      password: await bcrypt.hash("password123", 4),
    });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "e@x.com", password: "password123" });
    expect(res.status).toBe(201);
    expect(res.headers["set-cookie"][0]).toMatch(/access_token=.+HttpOnly/);
    expect(res.headers["set-cookie"][0]).toMatch(/SameSite=Strict/);
    expect(res.headers["set-cookie"][0]).toMatch(/Path=\//);
    expect(res.headers["set-cookie"][0]).toMatch(/Max-Age=899|Max-Age=900/);
  });
  it("401 on wrong password", async () => {
    repo.findByEmail.mockResolvedValue({
      ...dbUser,
      password: await bcrypt.hash("other-password", 4),
    });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "e@x.com", password: "password123" });
    expect(res.status).toBe(401);
  });
  it("401 on unknown user", async () => {
    repo.findByEmail.mockResolvedValue(null);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "e@x.com", password: "password123" });
    expect(res.status).toBe(401);
  });

  it("limits repeated login attempts from one IP", async () => {
    repo.findByEmail.mockResolvedValue(null);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "e@x.com", password: "password123" });
      expect(res.status).toBe(401);
    }

    const limited = await request(app)
      .post("/api/auth/login")
      .send({ email: "e@x.com", password: "password123" });
    expect(limited.status).toBe(429);
    expect(limited.body.message).toMatch(/too many login attempts/i);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the access_token cookie", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", `access_token=${tokenFor()}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const c = res.headers["set-cookie"][0];
    expect(c).toMatch(/access_token=;/);
    expect(c).toMatch(/Expires=Thu, 01 Jan 1970/);
    expect(c).toMatch(/HttpOnly/);
  });
  it("is idempotent without a cookie", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
  });
});

describe("GET /api/users/me", () => {
  it("401 without cookie", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });
  it("401 with invalid token", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Cookie", "access_token=garbage");
    expect(res.status).toBe(401);
  });
  it("401 with expired token", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Cookie", `access_token=${tokenFor(ID, { expiresIn: -10 })}`);
    expect(res.status).toBe(401);
  });
  it("200 returns safe profile", async () => {
    repo.findById.mockResolvedValue(dbUser);
    const res = await request(app)
      .get("/api/users/me")
      .set("Cookie", `access_token=${tokenFor()}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({ id: ID, email: "e@x.com" });
    expect(res.body.data.user.password).toBeUndefined();
    expect(repo.findById).toHaveBeenCalledWith(ID);
  });
  it("404 when user no longer exists", async () => {
    repo.findById.mockResolvedValue(null);
    const res = await request(app)
      .get("/api/users/me")
      .set("Cookie", `access_token=${tokenFor()}`);
    expect(res.status).toBe(404);
  });
});
