import { User, UserRoleEnum } from '@prisma/client';
import { prisma } from '../database/prisma.js';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUser(data: { email: string; name: string; roleEnum?: UserRoleEnum }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        roleEnum: data.roleEnum ?? 'OPERATOR',
      },
    });
  }
}

export const userRepository = new UserRepository();
