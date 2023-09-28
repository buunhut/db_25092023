import { Module } from '@nestjs/common';
import {
  ChiTietController,
  DoiTacController,
  PhieuController,
  SanPhamController,
  UserController,
} from './app.controller';
import {
  ChiTietService,
  DoiTacService,
  PhieuService,
  SanPhamService,
  UserService,
} from './app.service';
import { ExtraService } from './app.extra';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      // secret: process.env.JWT_SECRET_KEY, // Thay thế bằng secret key của bạn
      secret: 'NDOEJS33', // Thay thế bằng secret key của bạn
      signOptions: { expiresIn: '1d' }, // Thời gian hết hạn của token
    }),
  ],
  controllers: [
    UserController,
    SanPhamController,
    DoiTacController,
    PhieuController,
    ChiTietController,
  ],
  providers: [
    UserService,
    SanPhamService,
    DoiTacService,
    PhieuService,
    ChiTietService,
    ExtraService,
  ],
})
export class AppModule {}
