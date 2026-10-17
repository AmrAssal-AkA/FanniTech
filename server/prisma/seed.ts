import "dotenv/config";
import bcrypt from 'bcrypt';
import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '../src/prisma/generated/client.js';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({adapter});


async function main() {
    const password = await bcrypt.hash('Amr123456', 10);

    await prisma.user.upsert({
        where: { email: 'Amr@fannitech.com'},
        update: {},
        create: {
            email: 'Amr@fannitech.com',
            name: 'AmrAssal',
            password: password,
            phone: '1234567898',
            role: 'TECHNICIAN',
            EmailVerifyAt: new Date(),
            technician: {} 
        },
    })
    console.log('Technician user created or already exists');
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});