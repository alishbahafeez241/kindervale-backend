import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal Server Error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === "string") {
        message = res;
      } else {
        // @ts-expect-error Object Type Error
        message = res?.message || message;
      }

      if (status >= 500) {
        console.error(`[${status}] HttpException:`, message, exception);
      } else {
        console.info(`[${status}] ${message}`);
      }
    } else {
      console.error("Unhandled exception:", exception);
    }

    response.status(status).json({
      success: false,
      message
    });
  }
}
