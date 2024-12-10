import jwt from 'jsonwebtoken'
import { prismaClient } from '../clients/db'
import { User } from '@prisma/client';


class JWTService {
    public static async generateTokenForUser(user: User) {
 
        const payload = {
            id:  user.id,
            email: user?.email
        }

        const token = jwt.sign(payload, 'MYSECRETKEY');

        return token;
    }
}

export default JWTService