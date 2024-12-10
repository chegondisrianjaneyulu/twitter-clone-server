import jwt from 'jsonwebtoken'
import { prismaClient } from '../clients/db'
import { User } from '@prisma/client';
import { JWTUser } from '../interfaces';


class JWTService {
    public static async generateTokenForUser(user: User) {
 
        const payload: JWTUser = {
            id:  user.id,
            email: user?.email
        }

        const token = jwt.sign(payload, 'MYSECRETKEY');

        return token;
    }

    public static decodeToken(token: string) {
       try {
        return jwt.verify(token, 'MYSECRETKEY') as JWTUser;
       }
       catch (e) {
         return null
       }
    }
}

export default JWTService