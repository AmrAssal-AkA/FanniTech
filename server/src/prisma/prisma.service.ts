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
            max: 5
        });
        super({adapter});
    }
    async onModuleInit() {
        this.$connect();
        this.logger.log('PrismaService initialized and connected to the database.');
    }
    async onModuleDestroy() {
        this.$disconnect();
    }
  }
