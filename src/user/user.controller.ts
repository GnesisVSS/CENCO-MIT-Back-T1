import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, Req, BadRequestException, UsePipes, ValidationPipe, NotFoundException, Query, HttpStatus, HttpCode, HttpException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/has-roles.decorator';
import { Role } from './entities/role.enum';
import { User } from './entities/user.entity';
import { SearchUserDto } from './dto/seach-user.dto';
import { UpdateUserByUserDto } from './dto/update-user-by-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request): Promise<{ message: string }> {
    try {
      await this.userService.create(createUserDto, req.user);
      return { message: 'User successfully created' };
    } catch (error) {
      throw new HttpException('User creation failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.userService.login(loginDto);
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request & { user: User }
  ): Promise<{ statusCode: number, message: string }> {
    const userId = req.user.sub;
    const result = await this.userService.updatePassword(userId, changePasswordDto.currentPassword, changePasswordDto.newPassword);
    return { statusCode: result.statusCode, message: result.message };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request & { user: User }) {
    const userId = req.user.sub;
    if (!userId) {
      throw new NotFoundException('User ID not found in the request');
    }
    return this.userService.findUserById(userId);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Patch('update')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Query('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch('updateByUser')
  @UseGuards(JwtAuthGuard)
  async updateByUser(@Req() req: Request & { user: User }, @Body() updateUserByUserDto: UpdateUserByUserDto) {
    const userId = req.user.sub;
    if (!userId) {
      throw new NotFoundException('User ID not found in the request');
    }
    return this.userService.updateByUser(userId, updateUserByUserDto);
  }

  @Delete('delete/:id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: number) {
    try {
      return await this.userService.delete(id);
    } catch (error) {
      throw new HttpException('User deletion failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('search')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async searchUsers(@Query() query: SearchUserDto) {
    const users = await this.userService.searchUsers(query);
    return { message: `Found ${users.length} users`, data: { users } };
  }
}
