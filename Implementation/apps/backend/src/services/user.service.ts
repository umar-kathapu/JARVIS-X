import { userRepository } from '../repositories/user.repository.js';

export class UserService {
  async getAllUsers() {
    return userRepository.findAll();
  }

  async getUserById(id: string) {
    return userRepository.findById(id);
  }
}

export const userService = new UserService();
