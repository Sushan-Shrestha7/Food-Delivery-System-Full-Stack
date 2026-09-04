import "reflect-metadata";
import * as dns from "dns";
import { join } from "path";
import { NestFactory, Reflector } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  try {
    if (typeof (dns as any).setDefaultResultOrder === "function") {
      (dns as any).setDefaultResultOrder("ipv4first");
    }} catch (err) {
    console.warn(
      "dns.setDefaultResultOrder not available:",
      err?.message || err,
    );
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));


  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });

  const port = process.env.PORT || 5000;

  const config = new DocumentBuilder()
    .setTitle("Food Delivery API")
    .setDescription("API documentation for the Food Delivery backend")
    .setVersion("1.0")
    .addBearerAuth()
    .addServer(`http://localhost:${port}`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(port);
  console.log(`Server running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api`);
}

bootstrap();
