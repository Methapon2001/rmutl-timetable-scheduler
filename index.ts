import server from "./app";

const start = async () => {
  await server.listen({ host: "0.0.0.0", port: 3000 }).then((listen) => {
    console.log(`Listening on: ${listen}`);
  }).catch((e) => {
    console.log(e);
    process.exit(1);
  });
};

start();
