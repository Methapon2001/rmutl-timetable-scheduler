import * as dotenv from "dotenv";
dotenv.config();

import Ajv from "ajv";
import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";
import * as routes from "./routes";

const server = fastify();

const schemaCompilers: Record<string, Ajv> = {
  body: new Ajv({
    removeAdditional: "all",
    coerceTypes: false,
    useDefaults: true,
  }),
  params: new Ajv({
    removeAdditional: "all",
    coerceTypes: true,
    useDefaults: true,
  }),
  querystring: new Ajv({
    removeAdditional: false,
    coerceTypes: true,
    useDefaults: true,
  }),
  headers: new Ajv({
    removeAdditional: false,
    coerceTypes: true,
  }),
};

server.setErrorHandler((error, _, reply) => {
  reply.code(error.statusCode ?? 500).send({
    message: error.message,
  });
});

server.setNotFoundHandler((_, reply) => {
  reply.code(404).send({
    message: "Not found.",
  });
});

server.setValidatorCompiler((request) => {
  if (!request.httpPart) throw new Error("Missing httpPart");
  const compiler = schemaCompilers[request.httpPart];
  if (!compiler) throw new Error(`Missing compiler for ${request.httpPart}`);

  return compiler.compile(request.schema);
});

server.register(fastifyCors);
server.register(fastifyWebsocket);

for (const route of Object.values(routes)) {
  server.register(route);
}

export default server;
