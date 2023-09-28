import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './app.dto';

@Injectable()
export class ExtraService {
  constructor(private readonly jwtService: JwtService) {}

  async signToken(data: TokenDto) {
    const result = this.jwtService.sign(data, {
      expiresIn: '1d',
      secret: process.env.JWT_SECRET_KEY
    });
    return result;
  }

  async getUId(token: string) {
    const result = await this.jwtService.verify(token);
    return result.uId;
  }

  response(statusCode: number, message: string, content: any) {
    return {
      statusCode,
      message,
      content,
    };
  }
}
