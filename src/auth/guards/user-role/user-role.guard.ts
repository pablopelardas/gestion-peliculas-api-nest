import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { META_ROLES } from '../../decorators';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get<string[]>(
      META_ROLES,
      context.getHandler(),
    );
    if (!validRoles || !validRoles.length) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new InternalServerErrorException()
    const userRoles = user.roles;
    return !!userRoles.some(role => validRoles.includes(role.name));
  }
}
