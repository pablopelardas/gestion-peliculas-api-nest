import * as bcrypt from 'bcrypt';
import { ValidRoles } from '../../auth/interfaces';

interface SeedUser {
  email: string;
  password: string;
  fullName: string;
  roles: ValidRoles[];
}
interface SeedRole {
  name: string;
}
interface SeedData {
  users: SeedUser[];
  roles: SeedRole[];
}


export const initialData: SeedData = {
  roles: [
    {
      name: ValidRoles.ADMIN,
    },
    {
      name: ValidRoles.USER,
    },
  ],
  users: [
    {
      email: 'admin@example.com',
      password: bcrypt.hashSync('Admin123', 10),
      fullName: 'Admin',
      roles: [ValidRoles.USER, ValidRoles.ADMIN],
    },
    {
      email: 'user@example.com',
      password: bcrypt.hashSync('User123', 10),
      fullName: 'User',
      roles: [ValidRoles.USER],
    },
  ],
};
