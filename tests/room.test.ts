import { PrismaClient } from "@prisma/client";
import { expect, test, beforeAll, afterAll, expectTypeOf } from "vitest";
import { hash } from "../utils/scrypt";
import server from "../app";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

let access: string;
let building: any;
let room: any;

beforeAll(async () => {
  await prisma.user.create({
    data: {
      username: "test_room",
      password: await hash("1234"),
      role: "user",
    },
  });

  building = await prisma.building.create({
    data: {
      code: "test",
      name: "test_room",
    },
  });

  building.createdAt = building.createdAt.toJSON();
  building.updatedAt = building.updatedAt.toJSON();
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      username: {
        contains: "test_room",
      },
    },
  });

  await prisma.room.deleteMany({
    where: {
      name: {
        contains: "test_room",
      },
    },
  });

  await prisma.building.deleteMany({
    where: {
      name: {
        contains: "test_room",
      },
    },
  });
});

test("login should return token with user data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/auth/login",
    payload: {
      username: "test_room",
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

test("request room should return data array with pagination info", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/room",
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
    expect(data).toHaveProperty("type");
    expect(data).toHaveProperty("buildingId");
    expect(data).toHaveProperty("building");
  });
});

test("create room should return room and related data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/api/room",
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      name: "fake_room_test_room",
      type: "lecture",
      buildingId: building.id,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id");
  expect(body.data).toHaveProperty("name", "fake_room_test_room");
  expect(body.data).toHaveProperty("type", "lecture");
  expect(body.data).toHaveProperty("buildingId", building.id);
  expect(body.data).toHaveProperty("building");
  expect(body.data.building).toEqual(building);

  room = body.data;
});

test("request room should return room and related data", async () => {
  const response = await server.inject({
    method: "GET",
    path: `/api/room/${room.id}`,
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
  expect(body.data).toHaveProperty("name", room.name);
  expect(body.data).toHaveProperty("type", room.type);
  expect(body.data).toHaveProperty("buildingId", building.id);
  expect(body.data).toHaveProperty("building");
  expect(body.data.building).toEqual(building);
});

test("edit room should return updated room and related data", async () => {
  const response = await server.inject({
    method: "PUT",
    path: `/api/room/${room.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      name: "fake_room_test_room_edit",
      type: "lab",
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", room.id);
  expect(body.data).toHaveProperty("name", "fake_room_test_room_edit");
  expect(body.data).toHaveProperty("type", "lab");
  expect(body.data).toHaveProperty("buildingId", building.id);
  expect(body.data).toHaveProperty("building");
  expect(body.data.building).toEqual(building);

  room = body.data;
});

test("search room should return matched room and related data", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/room",
    query: {
      name: room.name,
      type: room.type,
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
  expect(body.data[0]).toHaveProperty("id", room.id);
  expect(body.data[0]).toHaveProperty("name", room.name);
  expect(body.data[0]).toHaveProperty("type", room.type);
  expect(body.data[0]).toHaveProperty("buildingId", building.id);
  expect(body.data[0]).toHaveProperty("building");
  expect(body.data[0].building).toEqual(building);
});

test("delete room should return deleted room and related data", async () => {
  const response = await server.inject({
    method: "DELETE",
    path: `/api/room/${room.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id", room.id);
  expect(body.data).toHaveProperty("name", room.name);
  expect(body.data).toHaveProperty("type", room.type);
  expect(body.data).toHaveProperty("buildingId", building.id);
  expect(body.data).toHaveProperty("building");
  expect(body.data.building).toEqual(building);
});
