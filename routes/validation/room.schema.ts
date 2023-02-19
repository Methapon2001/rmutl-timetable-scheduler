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
      type: { type: "string", enum: ["lecture", "lab", "both"] },
      limit: { type: "number", default: 20 },
      offset: { type: "number", default: 0 },
    },
  },
  body: {
    type: "object",
    properties: {
      name: { type: "string" },
      type: { type: "string", enum: ["lecture", "lab", "both"] },
      buildingId: { type: "string" },
    },
  },
};
