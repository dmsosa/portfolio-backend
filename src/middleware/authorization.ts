import { Request } from 'express';
import { expressjwt } from 'express-jwt';
import { JWT_SECRET } from '../config/secrets';


function getTokenFromHeader(req: Request): string | Promise<string> | undefined {

  const headerAuth: string[] | undefined = req.headers?.authorization?.split(' ') ?? [];
  if (headerAuth.length && headerAuth[0] === 'Bearer') {
    return headerAuth[1];
  } else {
    return undefined;
  }
}



export const authorization = {
  required: expressjwt({
    credentialsRequired: true,
    secret             : JWT_SECRET,
    getToken           : getTokenFromHeader,
    algorithms         : ['HS256']
  }),

  optional: expressjwt({
    credentialsRequired: false,
    secret             : JWT_SECRET,
    getToken           : getTokenFromHeader,
    algorithms         : ['HS256']
  })
};
