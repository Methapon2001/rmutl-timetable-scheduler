export default {
  headers: {},
  params: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
  },
  querystring: {
    type: "object",
    properties: {
      code: { type: "string" },
      name: { type: "string" },
      credit: { type: "number", minimum: 0 },
      lecture: { type: "number", minimum: 0 },
      lab: { type: "number", minimum: 0 },
      learn: { type: "number", minimum: 0 },
      createdByUserId: { type: "string" },
      updatedByUserId: { type: "string" },
      limit: { type: "number", default: 20 },
      offset: { type: "number", default: 0 },
    },
  },
  body: {
    type: "object",
    properties: {
      code: { type: "string" },
      name: { type: "string" },
      credit: { type: "number" },
      lecture: { type: "number" },
      lab: { type: "number" },
      learn: { type: "number", minimum: 0 },
    },
  },
};
