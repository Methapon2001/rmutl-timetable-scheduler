import { PrismaClient } from "@prisma/client";
import { expect, test, beforeAll, afterAll, expectTypeOf } from "vitest";
import { hash } from "../utils/scrypt";
import server from "../app";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

let access: string;
let subject: any;

beforeAll(async () => {
  await prisma.user.create({
    data: {
      username: "test_subject",
      password: await hash("1234"),
      role: "user",
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      username: {
        contains: "test_subject",
      },
    },
  });

  await prisma.building.deleteMany({
    where: {
      name: {
        contains: "test_subject",
      },
    },
  });
});

test("login should return token with user data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/auth/login",
    payload: {
      username: "test_subject",
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

test("request subject should return data array with pagination info", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/subject",
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
    expect(data).toHaveProperty("code");
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("credit");
    expect(data).toHaveProperty("lecture");
    expect(data).toHaveProperty("lab");
    expect(data).toHaveProperty("exam");
  });
});

test("create subject should return subject data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/api/subject",
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      code: "test",
      name: "fake_subject_test_subject",
      credit: 3,
      lecture: 2,
      lab: 3,
      exam: 2,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id");
  expect(body.data).toHaveProperty("code", "test");
  expect(body.data).toHaveProperty("name", "fake_subject_test_subject");
  expect(body.data).toHaveProperty("credit", 3);
  expect(body.data).toHaveProperty("lecture", 2);
  expect(body.data).toHaveProperty("lab", 3);
  expect(body.data).toHaveProperty("exam", 2);

  subject = body.data;
});

test("request subject should return subject data", async () => {
  const response = await server.inject({
    method: "GET",
    path: `/api/subject/${subject.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", subject.id);
  expect(body.data).toHaveProperty("code", subject.code);
  expect(body.data).toHaveProperty("name", subject.name);
  expect(body.data).toHaveProperty("credit", subject.credit);
  expect(body.data).toHaveProperty("lecture", subject.lecture);
  expect(body.data).toHaveProperty("lab", subject.lab);
  expect(body.data).toHaveProperty("exam", subject.exam);
});

test("edit subject should return updated subject data", async () => {
  const response = await server.inject({
    method: "PUT",
    path: `/api/subject/${subject.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      code: "test_edit",
      name: "fake_subject_test_subject_edit",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", subject.id);
  expect(body.data).toHaveProperty("code", "test_edit");
  expect(body.data).toHaveProperty("name", "fake_subject_test_subject_edit");
  expect(body.data).toHaveProperty("credit", subject.credit);
  expect(body.data).toHaveProperty("lecture", subject.lecture);
  expect(body.data).toHaveProperty("lab", subject.lab);
  expect(body.data).toHaveProperty("exam", subject.exam);

  subject = body.data;
});

test("search subject should return matched subject data", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/subject",
    query: {
      name: subject.name,
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
  expect(body.data[0]).toHaveProperty("id", subject.id);
  expect(body.data[0]).toHaveProperty("code", subject.code);
  expect(body.data[0]).toHaveProperty("name", subject.name);
  expect(body.data[0]).toHaveProperty("credit", subject.credit);
  expect(body.data[0]).toHaveProperty("lecture", subject.lecture);
  expect(body.data[0]).toHaveProperty("lab", subject.lab);
  expect(body.data[0]).toHaveProperty("exam", subject.exam);
});

test("delete subject should return deleted subject data", async () => {
  const response = await server.inject({
    method: "DELETE",
    path: `/api/subject/${subject.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", subject.id);
  expect(body.data).toHaveProperty("code", subject.code);
  expect(body.data).toHaveProperty("name", subject.name);
  expect(body.data).toHaveProperty("credit", subject.credit);
  expect(body.data).toHaveProperty("lecture", subject.lecture);
  expect(body.data).toHaveProperty("lab", subject.lab);
  expect(body.data).toHaveProperty("exam", subject.exam);
});
