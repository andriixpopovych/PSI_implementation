import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ObjectsModule } from './objects/objects.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReservationsModule } from './reservations/reservations.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [PrismaModule, AuthModule, SearchModule, ObjectsModule, ReservationsModule],
  controllers: [AppController],
})
export class AppModule {}
