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
  expect(body.isAuthenticated).toBeFalsy();
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
  expect(body).toHaveProperty("message", "Unauthorized.");
});

test("login should return token with user data", async () => {
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
  expect(body).toHaveProperty("user");
  expect(body).toHaveProperty("token");
  expect(body.user).toHaveProperty("username");
  expect(body.user).toHaveProperty("role");
  expect(body.user).not.toHaveProperty("password");
  expect(body.token).toHaveProperty("access");
  expect(body.token).toHaveProperty("refresh");

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
  expect(body.isAuthenticated).toBeTruthy();
  expect(body).toHaveProperty("user");
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
  expect(body).toHaveProperty("user");
  expect(body).toHaveProperty("token");
  expect(body.user).toHaveProperty("username");
  expect(body.user).toHaveProperty("role");
  expect(body.user).not.toHaveProperty("password");
  expect(body.token).toHaveProperty("access");
  expect(body.token).toHaveProperty("refresh");
  expect(body.token.access).not.toBe(access);
  expect(body.token.refresh).not.toBe(refresh);

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
  expect(body).toHaveProperty("message", "Forbidden.");
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
  expect(body).toHaveProperty("message", "Unauthorized.");
});
