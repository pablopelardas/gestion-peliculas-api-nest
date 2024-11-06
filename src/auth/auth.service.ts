import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, User } from './entities';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidRoles } from './interfaces/valid-roles.interfaces';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
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
        this.handleException(error);
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

  private handleException(exception: any) {
    if (exception.code === '23505') {
      throw new ConflictException('User already exists: ' + exception.detail);
    }

    throw exception;
  }
}
