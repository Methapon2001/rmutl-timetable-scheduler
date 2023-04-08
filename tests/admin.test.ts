import { PrismaClient, User } from "@prisma/client";
import { expect, test, beforeAll, afterAll } from "vitest";
import { hash } from "../utils/scrypt";
import server from "../app";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

let access: string;
let user: any;

beforeAll(async () => {
  await prisma.user.create({
    data: {
      username: "test_admin",
      password: await hash("1234"),
      role: "admin",
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      username: {
        contains: "test_admin",
      },
    },
  });
});

test("login should return token with user data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/auth/login",
    payload: {
      username: "test_admin",
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
});

test("request users should return data array with pagination info", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/user",
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toEqual({
    data: expect.arrayContaining([
      {
        id: expect.any(String),
        username: expect.any(String),
        role: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ]),
    limit: expect.any(Number),
    offset: expect.any(Number),
    total: expect.any(Number),
  });
});

test("create user should return user data without password", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/api/user",
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      username: "fake_user_test_admin",
      password: "1234",
      role: "user",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toEqual({
    data: {
      id: expect.any(String),
      username: "fake_user_test_admin",
      role: "user",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    },
  });

  user = body.data;
});

test("request user should return user data without password", async () => {
  const response = await server.inject({
    method: "GET",
    path: `/api/user/${user.id}`,
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toEqual({
    data: user,
  });
});

test("edit user should return updated user data", async () => {
  const response = await server.inject({
    method: "PUT",
    path: `/api/user/${user.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      username: "fake_user_test_admin_edit",
      password: "12345678",
      role: "admin",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toEqual({
    data: {
      id: user.id,
      username: "fake_user_test_admin_edit",
      role: "admin",
      createdAt: user.createdAt,
      updatedAt: expect.any(String),
    },
  });

  user = body.data;
});

test("delete user should return deleted user data without password", async () => {
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
    data: user,
  });
});
