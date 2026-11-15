import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../prisma/generated/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger();
    PrismaClientKnownRequestError: unknown;
    constructor(){
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL,
            ssl: {rejectUnauthorized: false},
            max: 5,
            connectionTimeoutMillis: 15000,
            idleTimeoutMillis: 30000,
            keepAlive: true
        });
        super({adapter});
    }
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('PrismaService initialized and connected to the database.');
        } catch (error) {
            this.logger.error('PrismaService failed to connect to the database', error);
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
  }
