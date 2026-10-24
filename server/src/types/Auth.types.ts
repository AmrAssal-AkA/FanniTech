import type { User, UserRole } from "../prisma/generated/client.js";


export type AuthUser = {id: string, role: UserRole};
export type PublicUser = Omit<User, 'password'>;

export const isPublicUser = (user: User): PublicUser => {
    const {password, ...publicUser} = user;
    return publicUser;
}