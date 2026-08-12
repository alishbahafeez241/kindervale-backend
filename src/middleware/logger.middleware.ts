import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    const url = req.originalUrl || req.url;

    if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
      const safeBody = { ...req.body };
      if ("password" in safeBody) safeBody.password = "***";
      if ("confirmNewPassword" in safeBody) safeBody.confirmNewPassword = "***";
      if ("newPassword" in safeBody) safeBody.newPassword = "***";
      console.info(`${formattedDate} Request ${req.method} ${url} ${JSON.stringify(safeBody)}`);
    } else {
      console.info(`${formattedDate} Request ${req.method} ${url}`);
    }

    next();
  }
}

