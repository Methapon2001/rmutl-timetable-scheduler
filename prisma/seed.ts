import { PrismaClient } from "@prisma/client";
import { hash } from "../utils/scrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      username: "admin",
      password: await hash("1234"),
      role: "admin",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
