import { User } from '@prisma/client';
import { badRequest, notFound, unauthorized } from '../lib/appError';
import { signToken } from '../lib/jwt';
import { comparePassword, hashPassword } from '../lib/password';
import { userRepository } from '../repositories/user.repository';
import { ChangePasswordInput, LoginInput } from '../schemas/auth.schema';

export interface PublicUser {
  id:        string;
  email:     string;
  name:      string;
  role:      string;
  createdAt: Date;
}

/** Never let the password hash leave this layer. */
function toPublicUser(user: User): PublicUser {
  return {
    id:        user.id,
    email:     user.email,
    name:      user.name,
    role:      user.role,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async login({ email, password }: LoginInput) {
    const user = await userRepository.findByEmail(email);

    // Same message for unknown email and wrong password, so the response can't
    // be used to enumerate accounts.
    if (!user || !(await comparePassword(password, user.password))) {
      throw unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw unauthorized('This account has been deactivated');
    }

    const token = signToken({
      id:    user.id,
      email: user.email,
      role:  user.role,
      name:  user.name,
    });

    return { token, user: toPublicUser(user) };
  },

  async getMe(userId: string): Promise<PublicUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw notFound('User not found');
    return toPublicUser(user);
  },

  async changePassword(userId: string, { currentPassword, newPassword }: ChangePasswordInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw notFound('User not found');

    if (!(await comparePassword(currentPassword, user.password))) {
      throw unauthorized('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw badRequest('New password must be different from the current password');
    }

    await userRepository.updatePassword(userId, await hashPassword(newPassword));
  },
};
