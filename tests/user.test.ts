import { PrismaClient } from "@prisma/client";
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
  expect(body).toHaveProperty("user");
  expect(body).toHaveProperty("token");
  expect(body.user).toHaveProperty("username");
  expect(body.user).toHaveProperty("role");
  expect(body.user).not.toHaveProperty("password");
  expect(body.token).toHaveProperty("access");
  expect(body.token).toHaveProperty("refresh");

  access = body.token.access;
  user = body.user;
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
  expect(body).toHaveProperty("message", "Forbidden.");
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
  expect(body).toHaveProperty("message", "Forbidden.");
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
  expect(body).toHaveProperty("message", "Forbidden.");
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
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", user.id);
  expect(body.data).toHaveProperty("username", "test_user_edit");
  expect(body.data).toHaveProperty("role", user.role);
  expect(body.data).not.toHaveProperty("password");

  user = body.data;
});

test("delete other user should return forbidden", async () => {
  const response = await server.inject({
    method: "DELETE",
    path: "/api/user/f0a937b1-3f80-4a2d-aeb3-d7e3373a5c26",
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
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", user.id);
  expect(body.data).toHaveProperty("username", user.username);
  expect(body.data).toHaveProperty("role", user.role);
  expect(body.data).not.toHaveProperty("password");
});
