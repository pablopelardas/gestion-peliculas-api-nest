import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities';
import { JwtPayload } from '../interfaces/jwt-payload.interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const { id } = payload;
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new UnauthorizedException('Token not valid');
    }
    delete user.password;
    return user;
  }
}
