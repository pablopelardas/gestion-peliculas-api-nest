import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from '../auth/entities';
import { Repository } from 'typeorm';
import { initialData } from './data/seed.data';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  async executeSeed() {
    await this.deleteTables();
const roleEntities = await this.insertRoles();
    await this.insertNewUsers(roleEntities);
    return 'seed executed';
  }

  private async deleteTables() {
      await this.userRepository.delete({});
      await this.roleRepository.delete({});
  }

  private async insertRoles() {
    const roles = initialData.roles;

    const rolesEntities: Role[] = roles.map((role) => {
      return this.roleRepository.create({
        name: role.name,
      });
    });


    await this.roleRepository.save(rolesEntities);
    return rolesEntities;
  }
  private async insertNewUsers(roleEntities: Role[]) {
    const users = initialData.users;

    const usersEntities: User[] = users.map((user) => {
      const { roles, ...userData } = user;
      return this.userRepository.create({
        ...userData,
        roles: roles.map((role) => roleEntities.find((r) => r.name === role)),
      });
    });

    await this.userRepository.save(usersEntities);

  }
}
