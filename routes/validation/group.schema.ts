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
      name: { type: "string" },
      courseId: { type: "string" },
      planId: { type: "string" },
      createdByUserId: { type: "string" },
      updatedByUserId: { type: "string" },
      limit: { type: "number", default: 20 },
      offset: { type: "number", default: 0 },
      year: { type: "number" },
      semester: { type: "number" },
    },
  },
  body: {
    type: "object",
    properties: {
      name: { type: "string" },
      courseId: { type: "string" },
      planId: { type: "string" },
    },
  },
};
