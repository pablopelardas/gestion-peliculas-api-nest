import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @ManyToMany(
    () => User,
    (user: User) => user.roles,
    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'}
  )
  users: User[];
}
