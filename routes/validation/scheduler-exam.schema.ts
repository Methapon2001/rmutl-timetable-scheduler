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
      weekday: {
        type: "string",
        enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      },
      start: { type: "number" },
      end: { type: "number" },
      publish: { type: "boolean" },
      examId: { type: "string" },
      createdByUserId: { type: "string" },
      updatedByUserId: { type: "string" },
      limit: { type: "number", default: 20 },
      offset: { type: "number", default: 0 },
    },
  },
  body: {
    type: "object",
    properties: {
      weekday: {
        type: "string",
        enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      },
      start: { type: "number" },
      end: { type: "number" },
      publish: { type: "boolean" },
      examId: { type: "string" },
    },
  },
};
