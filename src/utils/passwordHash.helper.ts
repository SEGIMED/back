import * as bcrypt from 'bcrypt';

export class PasswordHelper {
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
}
