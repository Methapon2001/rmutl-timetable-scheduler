export default {
  headers: {},
  params: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
  },
  querystring: {
    username: { type: "string" },
    role: { type: "string", enum: ["admin", "user"] },
    limit: { type: "number", default: 20 },
    offset: { type: "number", default: 0 },
  },
  body: {
    type: "object",
    properties: {
      username: { type: "string" },
      password: { type: "string" },
      role: { type: "string", enum: ["admin", "user"] },
    },
  },
};
