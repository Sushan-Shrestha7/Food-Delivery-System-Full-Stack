import { Controller, Get, Delete, Param, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Users")
@Controller("api/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: "Get all users" })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: "Delete a user by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }}
