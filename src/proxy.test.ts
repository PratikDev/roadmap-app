import { getSessionCookie } from "better-auth/cookies";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";

jest.mock("better-auth/cookies", () => ({
  getSessionCookie: jest.fn(),
}));

const mockedGetSessionCookie = getSessionCookie as jest.Mock;

function makeRequest(pathname: string) {
  return new NextRequest(new URL(pathname, "http://localhost:3000"));
}

function isRedirect(res: Response, to: string) {
  expect(res.status).toBe(307);
  expect(res.headers.get("location")).toBe(`http://localhost:3000${to}`);
}

function isPassThrough(res: Response) {
  expect(res.headers.get("location")).toBeNull();
}

describe("proxy", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("auth routes (/sign-in, /sign-up, /api/auth)", () => {
    it("redirects to / when a session already exists on /sign-in", async () => {
      mockedGetSessionCookie.mockReturnValue("session-token");
      const res = await proxy(makeRequest("/sign-in"));
      isRedirect(res, "/");
    });

    it("redirects to / when a session already exists on /sign-up", async () => {
      mockedGetSessionCookie.mockReturnValue("session-token");
      const res = await proxy(makeRequest("/sign-up"));
      isRedirect(res, "/");
    });

    it("passes through /sign-in when there is no session", async () => {
      mockedGetSessionCookie.mockReturnValue(undefined);
      const res = await proxy(makeRequest("/sign-in"));
      isPassThrough(res);
    });

    it("redirects to / for nested /api/auth routes when there is a session", async () => {
      mockedGetSessionCookie.mockReturnValue("session-token");
      const res = await proxy(makeRequest("/api/auth/callback/email"));
      isRedirect(res, "/");
    });

    it("passes through nested /api/auth routes when there is no session", async () => {
      mockedGetSessionCookie.mockReturnValue(undefined);
      const res = await proxy(makeRequest("/api/auth/callback/email"));
      isPassThrough(res);
    });
  });

  describe("non-auth routes", () => {
    it("redirects to /sign-in when there is no session", async () => {
      mockedGetSessionCookie.mockReturnValue(undefined);
      const res = await proxy(makeRequest("/dashboard"));
      isRedirect(res, "/sign-in");
    });

    it("passes through when a session exists", async () => {
      mockedGetSessionCookie.mockReturnValue("session-token");
      const res = await proxy(makeRequest("/dashboard"));
      isPassThrough(res);
    });
  });

  describe("auth route exceptions (/sign-out, /get-session)", () => {
    it("treats /api/auth/sign-out as a protected route: redirects when no session", async () => {
      mockedGetSessionCookie.mockReturnValue(undefined);
      const res = await proxy(makeRequest("/api/auth/sign-out"));
      isRedirect(res, "/sign-in");
    });

    it("treats /api/auth/sign-out as a protected route: passes through with a session", async () => {
      mockedGetSessionCookie.mockReturnValue("session-token");
      const res = await proxy(makeRequest("/api/auth/sign-out"));
      isPassThrough(res);
    });

    it("treats /api/auth/get-session as a protected route: redirects when no session", async () => {
      mockedGetSessionCookie.mockReturnValue(undefined);
      const res = await proxy(makeRequest("/api/auth/get-session"));
      isRedirect(res, "/sign-in");
    });

    it("treats /api/auth/get-session as a protected route: passes through with a session", async () => {
      mockedGetSessionCookie.mockReturnValue("session-token");
      const res = await proxy(makeRequest("/api/auth/get-session"));
      isPassThrough(res);
    });
  });
});
