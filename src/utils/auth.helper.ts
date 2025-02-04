import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export class AuthHelper {
  static async hashPassword(
    password: string,
    saltRounds: number,
  ): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  static async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static generateToken(payload: object, expiresIn: string = '7d'): string {
    const secret = process.env.JWT_SECRET || 'defaultSecret';
    return jwt.sign(payload, secret, { expiresIn });
  }

  static verifyToken(token: string): string | jwt.JwtPayload {
    const secret = process.env.JWT_SECRET || 'defaultSecret';
    return jwt.verify(token, secret);
  }
}
