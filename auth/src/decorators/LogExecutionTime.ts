function LogExecutionTime() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (req: Request, res: Response, ...args: any[]) {
      console.log(`Before... ${propertyKey}`);
      console.log('Request:', req);
      const now = Date.now();

      const result = originalMethod.apply(this, [req, res, ...args]);

      console.log(`After... ${propertyKey}, Execution time: ${Date.now() - now}ms`);

      return result;
    };

    return descriptor;
  };
}
export default LogExecutionTime;