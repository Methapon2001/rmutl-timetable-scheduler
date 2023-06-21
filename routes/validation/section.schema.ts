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
      no: { type: "number", minimum: 0 },
      type: { type: "string", enum: ["lecture", "lab"] },
      subjectId: { type: "string" },
      roomId: { type: "string" },
      instructorId: { type: "string" },
      parentId: { type: "string" },
      limit: { type: "number", default: 20 },
      offset: { type: "number", default: 0 },
    },
  },
  bodyCreate: {
    type: "object",
    properties: {
      subjectId: { type: "string" },
      groupId: { type: ["string", "null"] },
      manual: { type: "boolean", default: false },
      type: { type: "string", enum: ["lecture", "lab"] },
      no: { type: "number" },
      alt: { type: ["string", "null"] },
      section: {
        type: "array",
        minItems: 1,
        maxItems: 10,
        items: {
          type: "object",
          required: ["capacity"],
          properties: {
            capacity: { type: "number" },
            roomId: { type: ["string", "null"] },
            instructor: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
  bodyUpdate: {
    type: "object",
    properties: {
      alt: { type: ["string", "null"] },
      capacity: { type: "number" },
      groupId: { type: ["string", "null"] },
      roomId: { type: ["string", "null"] },
      instructor: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
  },
};
