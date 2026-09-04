import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("api/products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Post()
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), "uploads", "products");
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
          return cb(new Error("Only image files are allowed"), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  create(
    @Body() dto: CreateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    if (image) {
      dto.imageUrl = `/uploads/products/${image.filename}`;
    }
    return this.productsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Delete("name/:name")
  removeByName(@Param("name") name: string) {
    return this.productsService.removeByName(name);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }}
