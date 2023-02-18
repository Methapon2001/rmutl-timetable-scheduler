import { PrismaClient } from "@prisma/client";
import { expect, test, beforeAll, afterAll, expectTypeOf } from "vitest";
import { hash } from "../utils/scrypt";
import server from "../app";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

let access: string;
let user: any;
let group: any;

beforeAll(async () => {
  user = await prisma.user.create({
    data: {
      username: "test_group",
      password: await hash("1234"),
      role: "user",
    },
  });

  delete user.password;
  delete user.createdAt;
  delete user.updatedAt;
});

afterAll(async () => {
  await prisma.group.deleteMany({
    where: {
      name: {
        contains: "test_group",
      },
    },
  });
  
  await prisma.user.deleteMany({
    where: {
      username: {
        contains: "test_group",
      },
    },
  });
});

test("login should return token with user data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/auth/login",
    payload: {
      username: "test_group",
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

test("request group should return data array with pagination info", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/group",
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
    expect(data).toHaveProperty("creator");
  });
});

test("create group should return group data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/api/group",
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      name: "fake_group_test_group",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id");
  expect(body.data).toHaveProperty("name", "fake_group_test_group");
  expect(body.data).toHaveProperty("creator");
  expect(body.data.creator).toEqual(user);

  group = body.data;
});

test("request group should return group data", async () => {
  const response = await server.inject({
    method: "GET",
    path: `/api/group/${group.id}`,
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
  expect(body.data).toHaveProperty("name", group.name);
  expect(body.data).toHaveProperty("creator");
  expect(body.data.creator).toEqual(user);
});

test("edit group should return updated group data", async () => {
  const response = await server.inject({
    method: "PUT",
    path: `/api/group/${group.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      name: "fake_group_test_group_edit",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", group.id);
  expect(body.data).toHaveProperty("name", "fake_group_test_group_edit");
  expect(body.data).toHaveProperty("creator");
  expect(body.data.creator).toEqual(user);

  group = body.data;
});

test("search group should return matched group data", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/group",
    query: {
      name: group.name,
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
  expect(body.data[0]).toHaveProperty("id", group.id);
  expect(body.data[0]).toHaveProperty("name", group.name);
  expect(body.data[0]).toHaveProperty("creator");
  expect(body.data[0].creator).toEqual(user);
});

test("delete group should return deleted group data", async () => {
  const response = await server.inject({
    method: "DELETE",
    path: `/api/group/${group.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", group.id);
  expect(body.data).toHaveProperty("name", group.name);
  expect(body.data).toHaveProperty("creator");
  expect(body.data.creator).toEqual(user);
});
