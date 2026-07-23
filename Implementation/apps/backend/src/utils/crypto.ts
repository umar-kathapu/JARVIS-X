import bcrypt from 'bcryptjs';
import { appConfig } from '../config/app.config.js';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(appConfig.security.bcryptSaltRounds);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}
