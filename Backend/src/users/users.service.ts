import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  findById(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  findAll() {
    return this.usersRepository.find();
  }

  create(data: {
    name: string;
    email: string;
    password: string;
    isVerified?: boolean;
  }) {
    const user = this.usersRepository.create({
      ...data,
      email: data.email.toLowerCase(),
    });
    return this.usersRepository.save(user);
  }

  async update(id: string, data: Partial<User>) {
    await this.usersRepository.update(id, data);
    return this.findById(id);
  }

  async remove(id: string) {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException("User not found");
    }
    return { message: "User deleted successfully" };
  }
}
