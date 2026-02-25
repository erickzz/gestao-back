import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ConfigModule } from '@nestjs/config';
import { auth } from 'lib/auth';

import { HttpModule } from './http/http.module';

@Module({
  imports: [AuthModule.forRoot({ auth }), ConfigModule.forRoot(), HttpModule],
})
export class AppModule {}
