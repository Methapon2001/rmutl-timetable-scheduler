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
      createdByUserId: { type: "string" },
      updatedByUserId: { type: "string" },
      limit: { type: "number", default: 20 },
      offset: { type: "number", default: 0 },
    },
  },
  body: {
    type: "object",
    properties: {
      name: { type: "string" },
      detail: {
        type: "array",
        items: {
          type: "object",
          required: ["type", "subjectId"],
          properties: {
            type: { type: "string", enum: ["compulsory", "elective"] },
            subjectId: { type: "string" },
          },
        },
      },
    },
  },
};
