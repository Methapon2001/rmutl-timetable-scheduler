import { PrismaClient } from "@prisma/client";
import { expect, test, beforeAll, afterAll, expectTypeOf } from "vitest";
import { hash } from "../utils/scrypt";
import server from "../app";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

let access: string;
let user: any;
let building: any;
let room: any;
let instructor: any;
let subject: any;
let section: any;
let group: any;

beforeAll(async () => {
  user = await prisma.user.create({
    data: {
      username: "test_section",
      password: await hash("1234"),
      role: "user",
    },
  });

  delete user.password;
  delete user.createdAt;
  delete user.updatedAt;

  building = await prisma.building.create({
    data: {
      code: "test",
      name: "test_section",
    },
  });

  building.createdAt = building.createdAt.toJSON();
  building.updatedAt = building.updatedAt.toJSON();

  room = await prisma.room.create({
    data: {
      name: "test_section",
      type: "lecture",
      building: {
        connect: {
          id: building.id,
        },
      },
    },
    include: {
      building: true,
    },
  });

  room.createdAt = room.createdAt.toJSON();
  room.updatedAt = room.updatedAt.toJSON();
  room.building.createdAt = room.building.createdAt.toJSON();
  room.building.updatedAt = room.building.updatedAt.toJSON();

  instructor = await prisma.instructor.create({
    data: {
      name: "test_section",
    },
  });

  instructor.createdAt = instructor.createdAt.toJSON();
  instructor.updatedAt = instructor.updatedAt.toJSON();

  subject = await prisma.subject.create({
    data: {
      code: "test",
      name: "test_section",
      credit: 3,
      lecture: 2,
      lab: 3,
      exam: 2,
    },
  });

  subject.createdAt = subject.createdAt.toJSON();
  subject.updatedAt = subject.updatedAt.toJSON();

  group = await prisma.group.create({
    data: {
      name: "test_section",
      creator: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  group.createdAt = group.createdAt.toJSON();
  group.updatedAt = group.updatedAt.toJSON();
});

afterAll(async () => {
  await prisma.section.deleteMany({
    where: {
      createdBy: user.id,
    },
  });

  await prisma.room.deleteMany({
    where: {
      name: {
        contains: "test_section",
      },
    },
  });

  await prisma.building.deleteMany({
    where: {
      name: {
        contains: "test_section",
      },
    },
  });

  await prisma.instructor.deleteMany({
    where: {
      name: {
        contains: "test_section",
      },
    },
  });

  await prisma.subject.deleteMany({
    where: {
      name: {
        contains: "test_section",
      },
    },
  });

  await prisma.group.deleteMany({
    where: {
      name: {
        contains: "test_section",
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      username: {
        contains: "test_section",
      },
    },
  });
});

test("login should return token with user data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/auth/login",
    payload: {
      username: "test_section",
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

test("request section should return data array with pagination info", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/section",
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
    expect(data).toHaveProperty("type");
    expect(data).toHaveProperty("no");
    expect(data).toHaveProperty("lab");
    expect(data).toHaveProperty("manual");
    expect(data).toHaveProperty("subject");
    expect(data).toHaveProperty("room");
    expect(data).toHaveProperty("group");
    expect(data).toHaveProperty("instructor");
  });
});

test("create section should return section and related data", async () => {
  const response = await server.inject({
    method: "POST",
    path: "/api/section",
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      subjectId: subject.id,
      groupId: group.id,
      type: "lecture",
      sections: [
        {
          roomId: room.id,
          instructorId: [instructor.id],
        },
        {
          roomId: room.id,
          instructorId: [instructor.id],
        },
        {
          roomId: room.id,
          instructorId: [instructor.id],
        },
      ],
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toHaveProperty("id");
  expect(body.data).toHaveProperty("type", "lecture");
  expect(body.data).toHaveProperty("no", 1);
  expect(body.data).toHaveProperty("lab", null);
  expect(body.data).toHaveProperty("manual", false);
  expect(body.data).toHaveProperty("subject");
  expect(body.data.subject).toEqual(subject);
  expect(body.data).toHaveProperty("room");
  expect(body.data.room).toEqual(room);
  expect(body.data).toHaveProperty("group");
  expect(body.data.group).toEqual(group);
  expect(body.data).toHaveProperty("instructor");
  expect(body.data.instructor[0]).toEqual(instructor);
  expect(body.data).toHaveProperty("child");

  expectTypeOf(body.data.child).toBeArray();

  body.data.child.forEach((data: any) => {
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("type", "lab");
    expect(data).toHaveProperty("no", 1);
    expect(data).toHaveProperty("lab");
    expect(data).toHaveProperty("manual", false);
    expect(data).toHaveProperty("subject");
    expect(data.subject).toEqual(subject);
    expect(data).toHaveProperty("room");
    expect(data.room).toEqual(room);
    expect(data).toHaveProperty("group");
    expect(data.group).toEqual(group);
    expect(data).toHaveProperty("instructor");
    expect(data.instructor[0]).toEqual(instructor);
  });

  section = body.data;
});

test("request section should return section and related data", async () => {
  const response = await server.inject({
    method: "GET",
    path: `/api/section/${section.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body.data).toStrictEqual(section);
});

test("edit section should return updated section and related data", async () => {
  const response = await server.inject({
    method: "PUT",
    path: `/api/section/${section.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
    payload: {
      no: 99,
      groupId: null,
      instructorId: null,
      roomId: null,
    }
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body.data).toHaveProperty("id", section.id);
  expect(body.data).toHaveProperty("type", section.type);
  expect(body.data).toHaveProperty("no", 99);
  expect(body.data).toHaveProperty("lab", section.lab);
  expect(body.data).toHaveProperty("manual", true);
  expect(body.data).toHaveProperty("subject");
  expect(body.data.subject).toEqual(section.subject);
  expect(body.data).toHaveProperty("room");
  expect(body.data.room).toEqual(null);
  expect(body.data).toHaveProperty("group");
  expect(body.data.group).toEqual(null);
  expect(body.data).toHaveProperty("instructor");
  expect(body.data.instructor).toEqual([]);
  expect(body.data).toHaveProperty("child");

  section = body.data;
});

test("search section should return matched section and related data", async () => {
  const response = await server.inject({
    method: "GET",
    path: "/api/section",
    query: {
      no: section.no,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body).toHaveProperty("data");
  expect(body).toHaveProperty("limit");
  expect(body).toHaveProperty("offset");
  expect(body).toHaveProperty("total");
  expect(body.data[0]).toHaveProperty("no", section.no);
});

test("delete subject should return deleted section and related data", async () => {
  const response = await server.inject({
    method: "DELETE",
    path: `/api/section/${section.id}`,
    headers: {
      authorization: `Bearer ${access}`,
    },
  });

  const code = response.statusCode;
  const body = response.json();

  console.log(code, body);

  expect(code).toBe(200);
  expect(body.data).toHaveProperty("id", section.id);
  expect(body.data).toHaveProperty("type", section.type);
  expect(body.data).toHaveProperty("no", section.no);
  expect(body.data).toHaveProperty("lab", section.lab);
  expect(body.data).toHaveProperty("manual", section.manual);
  expect(body.data).toHaveProperty("subject");
  expect(body.data.subject).toEqual(section.subject);
  expect(body.data).toHaveProperty("room");
  expect(body.data.room).toEqual(section.room);
  expect(body.data).toHaveProperty("group");
  expect(body.data.group).toEqual(section.group);
  expect(body.data).toHaveProperty("child");
});
