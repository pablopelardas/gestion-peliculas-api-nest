import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, User } from './entities';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtPayload } from './interfaces';
import { LoginUserDto } from './dto/login-user.dto';
import { ExceptionHandlerService } from '../common/services/exception-handler/exception-handler.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ){}

  async register(createUserDto: CreateUserDto) {
      const {password,roles, ...userData} = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: await bcrypt.hashSync(password,10),
        roles: []
      });

      for(const role of roles){
        const roleEntity = await this.roleRepository.findOneBy({name: role});
        if(!roleEntity){
          throw new BadRequestException('Invalid role');
        }
        user.roles.push(roleEntity);
      }

      try {
        await this.userRepository.save(user);
      } catch (error) {
        this.exceptionHandlerService.handleException(error);
      }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      select: ['id', 'email', 'roles', 'password'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }
    delete user.password;
    return {
      ...user,
      roles: user.roles.map((role) => role.name),
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
