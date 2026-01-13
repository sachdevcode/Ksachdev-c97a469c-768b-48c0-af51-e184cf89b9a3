import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity, OrganizationEntity } from '../entities';
import { LoginDto, RegisterDto, AuthResponse } from '@rbac-task-system/data';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(OrganizationEntity)
        private organizationRepository: Repository<OrganizationEntity>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const organization = await this.organizationRepository.findOne({
            where: { id: registerDto.organizationId },
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = this.userRepository.create({
            ...registerDto,
            password: hashedPassword,
        });

        const savedUser = await this.userRepository.save(user);

        const payload = {
            email: savedUser.email,
            sub: savedUser.id,
            role: savedUser.role,
            organizationId: savedUser.organizationId,
        };

        const { password, ...userWithoutPassword } = savedUser;

        return {
            access_token: this.jwtService.sign(payload),
            user: userWithoutPassword,
        };
    }

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            organizationId: user.organizationId,
        };

        const { password, ...userWithoutPassword } = user;

        return {
            access_token: this.jwtService.sign(payload),
            user: userWithoutPassword,
        };
    }

    async validateUser(userId: string): Promise<UserEntity> {
        return this.userRepository.findOne({ where: { id: userId } });
    }
}
