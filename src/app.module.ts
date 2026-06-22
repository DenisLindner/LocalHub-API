import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ProductsservicesModule } from './modules/productsservices/productsservices.module';
import { MembersModule } from './modules/members/members.module';
import { CustomersModule } from './modules/customers/customers.module';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, authConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    AuthModule,
    DatabaseModule,
    UsersModule,
    OrganizationsModule,
    SubscriptionsModule,
    TasksModule,
    ProductsservicesModule,
    MembersModule,
    CustomersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
