import { PrismaClient } from "@prisma/client";
import { expect, test, beforeAll, afterAll } from "vitest";
import { hash } from "../utils/scrypt";
import { decode } from "../utils/jwt";
import server from "../app";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

let access: string;
let user: any;

beforeAll(async () => {
  await prisma.user.create({
    data: {
      username: "test_user",
      password: await hash("1234"),
      role: "user",
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      username: {
        contains: "test_user",
      },
    },
  });
});

test("create user without credential should return unauthorized", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/api/user",
    payload: {
      username: "fake_user_test_user",
      password: "1234",
      role: "user",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(401);
  expect(body).toEqual({ message: "Unauthorized." });
});

test("login should return token with user data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/auth/login",
    payload: {
      username: "test_user",
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

  const payload = await decode(body.token.access);

  access = body.token.access;
  user = { ...payload, jti: undefined, iat: undefined, exp: undefined };
});

test("create user should return forbidden", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/api/user",
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      username: "fake_user_test_user",
      password: "1234",
      role: "user",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(403);
  expect(body).toEqual({ message: "Forbidden." });
});

test("edit other user data should return forbidden", async () => {
  const response = await server.inject({
    method: "PUT",
    path: "/api/user/f0a937b1-3f80-4a2d-aeb3-d7e3373a5c26",
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      role: "admin",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(403);
  expect(body).toEqual({ message: "Forbidden." });
});

test("edit self role should return forbidden", async () => {
  const response = await server.inject({
    method: "PUT",
    path: `/api/user/${user.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      role: "admin",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(403);
  expect(body).toEqual({ message: "Forbidden." });
});

test("edit self data should return updated self data", async () => {
  const response = await server.inject({
    method: "PUT",
    path: `/api/user/${user.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      username: "test_user_edit",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toEqual({
    data: {
      id: user.id,
      username: "test_user_edit",
      role: user.role,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    },
  });

  user = body.data;
});

test("delete other user should return forbidden", async () => {
  const response = await server.inject({
    method: "DELETE",
    path: "/api/user/00000000-0000-0000-0000-000000000000",
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

test("delete self should return self data", async () => {
  const response = await server.inject({
    method: "DELETE",
    path: `/api/user/${user.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toEqual({
    data: {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: expect.any(String),
    },
  });
});
