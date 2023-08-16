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
      year: { type: "number" },
      semester: { type: "number" },
      current: { type: "boolean" },
      limit: { type: "number", default: 20 },
      offset: { type: "number", default: 0 },
    },
  },
  body: {
    type: "object",
    properties: {
      year: { type: "number" },
      semester: { type: "number" },
      current: { type: "boolean" },
    },
  },
};
