const cookieName = process.env.COOKIE_NAME || "access_token";

const cookieOptions = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV === "production" ||
    process.env.COOKIE_SECURE === "true",
  sameSite: process.env.COOKIE_SAME_SITE || "strict",
  path: "/",
};

export { cookieName, cookieOptions };
