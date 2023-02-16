import { PrismaClient } from "@prisma/client";
import { expect, test, beforeAll, afterAll, expectTypeOf } from "vitest";
import { hash } from "../utils/scrypt";
import server from "../app";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

let access: string;
let instructor: any;

beforeAll(async () => {
  await prisma.user.create({
    data: {
      username: "test_instructor",
      password: await hash("1234"),
      role: "user",
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      username: {
        contains: "test_instructor",
      },
    },
  });

  await prisma.instructor.deleteMany({
    where: {
      name: {
        contains: "test_instructor",
      },
    },
  });
});

test("login should return token with user data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/auth/login",
    payload: {
      username: "test_instructor",
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

test("request instructor should return data array with pagination info", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/instructor",
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
    expect(data).toHaveProperty("name");
  });
});

test("create instructor should return instructor data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/api/instructor",
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      name: "fake_instructor_test_instructor",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id");
  expect(body.data).toHaveProperty("name", "fake_instructor_test_instructor");

  instructor = body.data;
});

test("request instructor should return instructor data", async () => {
  const response = await server.inject({
    method: "GET",
    path: `/api/instructor/${instructor.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id");
  expect(body.data).toHaveProperty("name", instructor.name);
});

test("edit instructor should return updated instructor data", async () => {
  const response = await server.inject({
    method: "PUT",
    path: `/api/instructor/${instructor.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      name: "fake_instructor_test_instructor_edit",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", instructor.id);
  expect(body.data).toHaveProperty(
    "name",
    "fake_instructor_test_instructor_edit",
  );

  instructor = body.data;
});

test("search instructor should return matched instructor data", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/instructor",
    query: {
      name: instructor.name,
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
  expect(body.data[0]).toHaveProperty("id", instructor.id);
  expect(body.data[0]).toHaveProperty("name", instructor.name);
});

test("delete instructor should return deleted instructor data", async () => {
  const response = await server.inject({
    method: "DELETE",
    path: `/api/instructor/${instructor.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", instructor.id);
  expect(body.data).toHaveProperty("name", instructor.name);
});
