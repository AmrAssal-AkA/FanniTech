import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private jwt: JwtService) {}


  canActivate(ctx: ExecutionContext ){
    const req = ctx.switchToHttp().getRequest();
    const cookie = req.cookies['x-access-token'];
    const Barear = req.headers?.authorization?.replace('Bearer ', '');
    const token = cookie ?? Barear;
    if (!token) throw new UnauthorizedException();

    try {
      const payload = this.jwt.verify(token, {audience: cookie ? 'web' : 'mobile'});
      req.user = payload;
      return true;
    }catch (error) {
      throw new UnauthorizedException();
    }
  }
}
