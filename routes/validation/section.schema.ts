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
      groupId: { type: "string" },
      manual: { type: "boolean", default: false },
      type: { type: "string", enum: ["lecture", "lab"] },
      no: { type: "number" },
      sections: {
        type: "array",
        minItems: 1,
        maxItems: 10,
        items: {
          type: "object",
          properties: {
            roomId: { type: "string" },
            instructorId: {
              type: "array",
              items: {
                anyOf: [
                  { type: "string" },
                  {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                    },
                  },
                ],
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
      groupId: { type: ["string", "null"] },
      roomId: { type: ["string", "null"] },
      no: { type: "number" },
      instructorId: {
        type: ["array", "null"],
        items: {
          anyOf: [
            { type: "string" },
            {
              type: "object",
              properties: {
                name: { type: "string" },
              },
            },
          ],
        },
      },
    },
  },
};
