import "dotenv/config";
import bcrypt from 'bcrypt';
import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '../src/prisma/generated/client.js';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({adapter});


async function main() {
    const password = await bcrypt.hash('amr123456', 10);

    await prisma.user.upsert({
        where: { email: 'amr@fanniTech.com'},
        update: {
            password: password,
        },
        create: {
            name: 'Amr-fanni',
            email: 'amr@fanniTech.com',
            password: password,
            role: 'TECHNICIAN',
            technician: {create: {}},
        },
    });
    console.log('technician user created or updated successfully');
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});