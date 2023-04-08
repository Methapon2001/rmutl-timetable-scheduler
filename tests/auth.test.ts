import { PrismaClient } from "@prisma/client";
import { expect, test, beforeAll, afterAll } from "vitest";
import { hash } from "../utils/scrypt";
import server from "../app";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

let access: string;
let refresh: string;

beforeAll(async () => {
  await prisma.user.create({
    data: {
      username: "test_auth",
      password: await hash("1234"),
      role: "user",
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      username: {
        contains: "test_auth",
      },
    },
  });
});

test("auth check should return false", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/auth/check",
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toEqual({ isAuthenticated: false });
});

test("access protected route should return unauthorized", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/auth/logout",
    payload: {
      token: refresh,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(401);
  expect(body).toEqual({ message: "Unauthorized." });
});

test("login should return token", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/auth/login",
    payload: {
      username: "test_auth",
      password: "1234",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toEqual({
    token: {
      access: expect.any(String),
      refresh: expect.any(String),
    },
  });

  access = body.token.access;
  refresh = body.token.refresh;
});

test("auth check should return true with user data", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/auth/check",
    headers: {
      authorization: `Bearer ${access}`,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toEqual({
    isAuthenticated: true,
    user: {
      id: expect.any(String),
      username: expect.any(String),
      role: expect.any(String),
    },
  });
});

test("refresh token should return token and user data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/auth/refresh",
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      token: refresh,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toEqual({
    token: {
      access: expect.any(String),
      refresh: expect.any(String),
    },
  });
  access = body.token.access;
  refresh = body.token.refresh;
});

test("access admin route should return forbidden", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/api/user",
    headers: {
      authorization: `Bearer ${access}`,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(403);
  expect(body).toEqual({ message: "Forbidden." });
});

test("logout should return ok", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/auth/logout",
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      token: refresh,
    },
  });

  const code = response.statusCode;
  const body = response.body;

  console.log(code, body);

  expect(code).toBe(200);
});

test("reuse refresh token should return forbidden", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/auth/refresh",
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      token: refresh,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(401);
  expect(body).toEqual({ message: "Unauthorized." });
});
