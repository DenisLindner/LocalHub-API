import { Global, Injectable } from '@nestjs/common';
import { PrismaClient } from 'src/generated/prisma/client';

@Global()
@Injectable()
export class PrismaService extends PrismaClient implements OnMo {}
