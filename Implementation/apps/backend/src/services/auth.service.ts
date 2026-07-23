import { userRepository } from '../repositories/user.repository.js';

export class AuthService {
  async validateOrSeedUser(email: string, name: string) {
    let user = await userRepository.findByEmail(email);
    if (!user) {
      user = await userRepository.createUser({ email, name, role: 'OPERATOR' });
    }
    return user;
  }
}

export const authService = new AuthService();
