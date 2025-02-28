import { Request } from 'express';
import { expressjwt } from 'express-jwt';
import { JWT_SECRET } from '../config/secrets';


function getTokenFromHeader(req: Request): string | Promise<string> | undefined {

  const headerAuth: string[] | undefined = req.headers?.authorization?.split(' ') ?? [];

  console.log('\n\n\n\n --------------- \nJWT Token greifen...\n-----------------' + headerAuth + '\n-----------------');


  if (headerAuth.length && headerAuth[0] === 'Token') {
    return headerAuth[1];
  } else {
    return undefined;
  }
}



const auth = {
  required: expressjwt({
    credentialsRequired: true,
    secret             : JWT_SECRET,
    getToken           : getTokenFromHeader,
    requestProperty       : 'payload',
    algorithms         : ['HS256']
  }),

  optional: expressjwt({
    credentialsRequired: false,
    secret             : JWT_SECRET,
    getToken           : getTokenFromHeader,
    requestProperty       : 'payload',
    algorithms         : ['HS256']
  })
};

export const authentication = auth;