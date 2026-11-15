import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private jwt: JwtService) {}


  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const cookie = req.cookies?.['x-access-token'];
    const authHeader: string | undefined = req.headers?.authorization;
    const bearer = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader?.replace('Bearer ', '');

    if (!cookie && !bearer) throw new UnauthorizedException();

    if (cookie) {
      try {
        req.user = this.jwt.verify(cookie, { audience: 'web' });
        return true;
      } catch {
        // React Native persists Set-Cookie from mobile/login; fall back to Bearer when present
        if (!bearer) throw new UnauthorizedException();
      }
    }

    if (bearer) {
      try {
        req.user = this.jwt.verify(bearer, { audience: 'mobile' });
        return true;
      } catch {
        throw new UnauthorizedException();
      }
    }

    throw new UnauthorizedException();
  }
}
