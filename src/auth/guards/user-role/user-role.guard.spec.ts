import { Reflector } from '@nestjs/core';
import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { UserRoleGuard } from './user-role.guard';

describe('UserRoleGuard', () => {
  let userRoleGuard: UserRoleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    userRoleGuard = new UserRoleGuard(reflector);
  });

  const mockExecutionContext = (roles: string[] = [], userRoles: { name: string }[] = []) => {
    const mockContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { roles: userRoles },
        }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'get').mockReturnValue(roles);
    return mockContext;
  };

  it('should return true if no roles are required', () => {
    const context = mockExecutionContext(); // No roles required
    expect(userRoleGuard.canActivate(context)).toBe(true);
  });

  it('should return true if user has one of the required roles', () => {
    const context = mockExecutionContext(['admin'], [{ name: 'admin' }]);
    expect(userRoleGuard.canActivate(context)).toBe(true);
  });

  it('should return false if user does not have the required roles', () => {
    const context = mockExecutionContext(['admin'], [{ name: 'user' }]);
    expect(userRoleGuard.canActivate(context)).toBe(false);
  });

  it('should throw InternalServerErrorException if no user is found', () => {
    const context = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: null }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

    expect(() => userRoleGuard.canActivate(context)).toThrow(InternalServerErrorException);
  });

  it('should return true if user has multiple required roles', () => {
    const context = mockExecutionContext(['admin', 'user'], [{ name: 'admin' }, { name: 'user' }]);
    expect(userRoleGuard.canActivate(context)).toBe(true);
  });

  it('should return false if user has no matching roles', () => {
    const context = mockExecutionContext(['admin', 'manager'], [{ name: 'user' }]);
    expect(userRoleGuard.canActivate(context)).toBe(false);
  });
});
