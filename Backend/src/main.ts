import "reflect-metadata";
import * as dns from "dns";
import { NestFactory, Reflector } from "@nestjs/core";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  try {
    // Prefer IPv4 addresses when resolving hostnames to avoid ENETUNREACH on IPv6-only routes
    if (typeof (dns as any).setDefaultResultOrder === "function") {
      (dns as any).setDefaultResultOrder("ipv4first");
    }
  } catch (err) {
    // ignore if not supported on older Node versions
    console.warn(
      "dns.setDefaultResultOrder not available:",
      err?.message || err,
    );
  }
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "http://localhost:5173",
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

  const port = process.env.PORT || 5000;

  // Swagger setup
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
