import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text')
  password: string;

  @Column('text')
  fullName: string;

  @ManyToMany(
    () => Role,
    (role: Role) => role.users,
    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'})
  @JoinTable()
  roles: Role[];

}
