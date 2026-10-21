import { AuthUser, AuthUserWithPassword, CreateUserInput, UserStore } from "@myriasec/core-api";
import { Injectable } from "@nestjs/common";
import { Status } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

const SAFE_SELECT = {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    updatedAt: true,
    role: true,
    status: true,
    avatarUrl: true,
    dreamWork: true,
} as const;

@Injectable()
export class PrismaUserStore implements UserStore {
    constructor(private readonly prisma: PrismaService) { }
    async findByEmailWithPassword(email: string): Promise<AuthUserWithPassword | null> {
        const row = await this.prisma.user.findUnique({
            where: { email },
            select: { ...SAFE_SELECT, password: true },
        })

        if (!row) return null;
        const { password, ...rest } = row; // Tách password và các trường còn lại

        return {
            ...rest,
            isActive: row.status !== Status.INACTIVE,
            passwordHash: password,
        }
    }

    async findById(id: string): Promise<AuthUser | null> {
        const row = await this.prisma.user.findUnique({
            where: { id },
            select: SAFE_SELECT,
        });
        if (!row) return null;
        return row ? { ...row, isActive: row.status !== Status.INACTIVE } : null;
    }

    async existsByEmail(email: string): Promise<boolean> {
        const row = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });
        return row !== null;
    }

    async create(input: CreateUserInput): Promise<AuthUser> {
        const { name, dreamWork } = input.extra;
        const row = await this.prisma.user.create({
            data: {
                email: input.email,
                password: input.passwordHash,

                // Nghiệp vụ của app
                name: typeof name === 'string' && name ? name : 'Student',
                dreamWork: typeof dreamWork === 'string' && dreamWork ? dreamWork : null,
                role: 'STUDENT',
                status: 'ACTIVE'
            },
            select: SAFE_SELECT,
        });
        return { ...row, isActive: true };
    }
}