import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { type NestExpressApplication } from "@nestjs/platform-express";
import { HttpExceptionFilter } from "common/http-exception.filter";
import { ResponseInterceptor } from "common/response.interceptor";
import { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { AppModule } from "src/app.module";

const apiRoots = [
  "auth",
  "users",
  "admins",
  "teachers",
  "parents",
  "students",
  "classes",
  "sections",
  "subjects",
  "attendance",
  "homework",
  "lesson-plans",
  "roles",
  "permissions",
  "dashboard",
  "fees",
  "exams",
  "report-cards",
  "calendar-events",
  "timetables",
  "documents",
  "leave-requests",
  "expenses",
  "faqs",
  "school-policies",
  "daycare-reports",
  "daycare-resources",
  "backups",
  "notifications",
  "settings"
];

// Bootstrap
(async (): Promise<undefined> => {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("api");
  app.use((request: Request, _response: Response, next: NextFunction) => {
    const root = request.path.split("/").filter(Boolean)[0];
    if (root && apiRoots.includes(root)) {
      request.url = `/api${request.url}`;
    }
    next();
  });
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
