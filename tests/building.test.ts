import { PrismaClient } from "@prisma/client";
import { expect, test, beforeAll, afterAll, expectTypeOf } from "vitest";
import { hash } from "../utils/scrypt";
import server from "../app";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

let access: string;
let building: any;

beforeAll(async () => {
  await prisma.user.create({
    data: {
      username: "test_building",
      password: await hash("1234"),
      role: "user",
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      username: {
        contains: "test_building",
      },
    },
  });

  await prisma.building.deleteMany({
    where: {
      name: {
        contains: "test_building",
      },
    },
  });
});

test("login should return token with user data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/auth/login",
    payload: {
      username: "test_building",
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

test("request buildings should return data array with pagination info", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/building",
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
  });
});

test("create building should return building data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/api/building",
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      code: "test",
      name: "fake_building_test_building",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id");
  expect(body.data).toHaveProperty("code", "test");
  expect(body.data).toHaveProperty("name", "fake_building_test_building");

  building = body.data;
});

test("request building should return building data", async () => {
  const response = await server.inject({
    method: "GET",
    path: `/api/building/${building.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", building.id);
  expect(body.data).toHaveProperty("code", building.code);
  expect(body.data).toHaveProperty("name", building.name);
});

test("edit building should return updated building data", async () => {
  const response = await server.inject({
    method: "PUT",
    path: `/api/building/${building.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      code: "test_edit",
      name: "fake_building_test_building_edit",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", building.id);
  expect(body.data).toHaveProperty("code", "test_edit");
  expect(body.data).toHaveProperty("name", "fake_building_test_building_edit");

  building = body.data;
});

test("search building should return matched building data", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/building",
    query: {
      name: building.name,
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
  expect(body.data[0]).toHaveProperty("id", building.id);
  expect(body.data[0]).toHaveProperty("code", building.code);
  expect(body.data[0]).toHaveProperty("name", building.name);
});

test("delete building should return deleted building data", async () => {
  const response = await server.inject({
    method: "DELETE",
    path: `/api/building/${building.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", building.id);
  expect(body.data).toHaveProperty("code", building.code);
  expect(body.data).toHaveProperty("name", building.name);
});
