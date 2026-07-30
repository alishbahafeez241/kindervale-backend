import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { type NestExpressApplication } from "@nestjs/platform-express";
import { HttpExceptionFilter } from "common/http-exception.filter";
import { ResponseInterceptor } from "common/response.interceptor";
import helmet from "helmet";
import { AppModule } from "src/app.module";

// Bootstrap
(async (): Promise<undefined> => {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("api");
  app.set("trust proxy", "loopback");
  app.use(helmet());
  app.enableCors({
    origin: "*",
    credentials: true
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 5000);
})();
