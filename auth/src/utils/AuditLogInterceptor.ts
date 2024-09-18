import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const type = context.getType();

    if (type === 'http') {
      const httpContext = context.switchToHttp();
      const request = httpContext.getRequest();
      const response = httpContext.getResponse().toString();
      const method = request.method;
      const url = request.url;
      return next
        .handle()
        .pipe(
          tap(() => {
            console.log(`HTTP ${method} ${url}`);
            console.log(`\tRequest: ${JSON.stringify(request.body)}`);
            console.log(`\tExecution time: ${Date.now() - now}ms`);
            })
        );
    } else{
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext();
      const request = ctx.req;
      const response = ctx.res;
      const resolverName = context.getHandler().name;
      const args = gqlContext.getArgs();

      return next
        .handle()
        .pipe(
          tap(() => {
            console.log(`After... GraphQL ${resolverName}`);
            console.log(`\tArguments: ${JSON.stringify(args)}`);
            console.log(`\tRequest: ${JSON.stringify(request.body)}`);
            console.log(`\tExecution time: ${Date.now() - now}ms`);
          })
        );
    }
  }
}