import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    console.log('[Guard]', {
      cookie: req.headers?.cookie,
      isAuth: req.isAuthenticated?.(),
    });
    return req.isAuthenticated?.() === true;
  }
}
