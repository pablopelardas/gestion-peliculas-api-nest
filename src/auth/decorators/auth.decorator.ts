import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';
import { RoleProtected } from './role-protected.decorator';
import { ValidRoles } from '../interfaces';

export const Auth = (...args: ValidRoles[]) => {
  return applyDecorators(
    RoleProtected(...args),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
};
