import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException, Req, BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { find } from 'rxjs';
import { GetUserDto } from './dto/get-user.dto';
import { User } from './entities/user.entity';
import { Not } from 'typeorm';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('signup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request): Promise<{ message: string }> {
    await this.userService.create(createUserDto, req.user);
    return { message: 'User successfully created' };
  }

  @Post('login')
  // From the body we get the parameters of the login defined in the dto file
  async login(@Body() loginDto: LoginDto) {
    try {
      // returns the response from de service
      return this.userService.login(loginDto)
    } catch (error) {
      // throw an unauthorized exception
      throw new UnauthorizedException();
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request & { user: User }) {
    if (!req.user || !req.body.email) {
      throw new BadRequestException('Invalid user data.');
    }
    const user = await this.userService.findByEmail(req.body.email);
    if (user == undefined) {
      return { message: 'User was not found or has been deleted' };
    }
    return user;
  }
  

@Get('profiles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findOne(@Param() params: GetUserDto) {
    const user = await this.userService.findUserById(params.id);
    if (user == undefined) {
      return { message: 'User was not found or has been deleted' };
    }
    return user;
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll(@Req() req: Request & { user: User}) {
    
    return this.userService.findAll();
  }

  @Roles(Role.ADMIN)
  @UseGuards(
    JwtAuthGuard,
    RolesGuard
  )
  @Patch(':rut')
  update(@Param('rut') rut: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(rut, updateUserDto);
  }

@Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: number) {
    return this.userService.softDelete(id);
    
  }
}
