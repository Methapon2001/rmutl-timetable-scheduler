import { PrismaClient } from "@prisma/client";
import { expect, test, beforeAll, afterAll, expectTypeOf } from "vitest";
import { hash } from "../utils/scrypt";
import server from "../app";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

let access: string;
let admin: any;
let user: any;

beforeAll(async () => {
  admin = await prisma.user.create({
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
  expect(body).toHaveProperty("user");
  expect(body).toHaveProperty("token");
  expect(body.user).toHaveProperty("username");
  expect(body.user).toHaveProperty("role");
  expect(body.user).not.toHaveProperty("password");
  expect(body.token).toHaveProperty("access");
  expect(body.token).toHaveProperty("refresh");

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
  expect(body).toHaveProperty("data");
  expect(body).toHaveProperty("limit");
  expect(body).toHaveProperty("offset");
  expect(body).toHaveProperty("total");

  expectTypeOf(body.data).toBeArray();

  body.data.forEach((data: any) => {
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("username");
    expect(data).toHaveProperty("role");
    expect(data).not.toHaveProperty("password");
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
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id");
  expect(body.data).toHaveProperty("username", "fake_user_test_admin");
  expect(body.data).toHaveProperty("role", "user");
  expect(body.data).not.toHaveProperty("password");

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
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", user.id);
  expect(body.data).toHaveProperty("username", user.username);
  expect(body.data).toHaveProperty("role", user.role);
  expect(body.data).not.toHaveProperty("password");
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
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", user.id);
  expect(body.data).toHaveProperty("username", "fake_user_test_admin_edit");
  expect(body.data).toHaveProperty("role", "admin");
  expect(body.data).not.toHaveProperty("password");

  user = body.data;
});

test("search user should return matched user data", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/user",
    query: {
      username: user.username,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body).toHaveProperty("limit");
  expect(body).toHaveProperty("offset");
  expect(body).toHaveProperty("total", 1);
  expect(body.data[0]).toHaveProperty("id", user.id);
  expect(body.data[0]).toHaveProperty("username", user.username);
  expect(body.data[0]).toHaveProperty("role", user.role);
  expect(body.data[0]).not.toHaveProperty("password");
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
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", user.id);
  expect(body.data).toHaveProperty("username", user.username);
  expect(body.data).toHaveProperty("role", user.role);
  expect(body.data).not.toHaveProperty("password");
});

test("delete the only admin should return forbidden", async () => {
  const response = await server.inject({
    method: "DELETE",
    path: `/api/user/${admin.id}`,
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
