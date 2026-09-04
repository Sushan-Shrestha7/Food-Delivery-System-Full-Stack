import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { CreateProductDto } from "./dto/create-product.dto";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  findAll() {
    return this.productsRepository.find({ order: { createdAt: "DESC" } });
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return product;
  }

  create(dto: CreateProductDto) {
    const product = this.productsRepository.create(dto);
    return this.productsRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
    return { message: `Product ${id} deleted successfully` };
  }

  async removeByName(name: string) {
    const trimmed = decodeURIComponent(name).trim();
    const product = await this.productsRepository
      .createQueryBuilder("product")
      .where("LOWER(product.name) = LOWER(:name)", { name: trimmed })
      .getOne();

    if (!product) {
      throw new NotFoundException(`Product with name "${trimmed}" not found`);
    }

    await this.productsRepository.remove(product);
    return {
      message: `Product "${product.name}" deleted successfully`,
      deletedProduct: product,
    };
  }}
