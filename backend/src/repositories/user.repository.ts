import { User } from '@prisma/client';
import prisma from '../prisma/client';

export const userRepository = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  updatePassword(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data:  { password: passwordHash },
    });
  },
};
