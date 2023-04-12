import server from "./app";

const start = async () => {
  await server
    .listen({
      host: process.env.APP_HOST ?? "0.0.0.0",
      port: +(process.env.APP_PORT ?? 3000),
    })
    .then((listen) => {
      console.log(`Listening on: ${listen}`);
    })
    .catch((e) => {
      console.log(e);
      process.exit(1);
    });
};

start();
