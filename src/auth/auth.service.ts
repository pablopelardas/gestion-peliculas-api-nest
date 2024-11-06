import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, User } from './entities';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidRoles } from './interfaces/valid-roles.interfaces';

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
        console.log(role)
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

  private handleException(exception: any) {
    if (exception.code === '23505') {
      throw new BadRequestException('User already exists: ' + exception.detail);
    }

    throw exception;
  }
}
