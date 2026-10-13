import "dotenv/config";
import bcrypt from 'bcrypt';
import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '../src/prisma/generated/client.js';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({adapter});


async function main() {
    const password = await bcrypt.hash('admin123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@fannitech.com'},
        update: {},
        create: {
            email: 'admin@fannitech.com',
            name: 'FanniTech Admin',
            password: password,
            phone: '1234567890',
            role: 'ADMIN',
            EmailVerifyAt: new Date(),
            admin: {create: {}}
        },
    })
    console.log('Admin user created or already exists');
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});