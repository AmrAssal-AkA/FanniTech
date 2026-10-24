import "dotenv/config";
import bcrypt from 'bcrypt';
import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '../src/prisma/generated/client.js';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({adapter});


async function main() {
    const password = await bcrypt.hash('Amr1292003', 10);

    await prisma.user.upsert({
        where: { email: 'amrassal@gmail.com'},
        update: {
            password: password,
        },
        create: {
            name: 'Amr Assal',
            email: 'amrassal@gmail.com',
            password: password,
        }
    })
    console.log('user are updated or created successfully');
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});