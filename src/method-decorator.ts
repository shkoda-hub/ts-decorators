import 'reflect-metadata';

const sleep = async (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

function LoggingDecorator(): MethodDecorator {
  return function(
    _target: any,
    propertyKey: string | Symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      console.log(`Method ${propertyKey} was called with args: ${args}`);
      const result = await originalMethod.apply(this, args);
      console.log(`Method ${propertyKey} returns ${result}`);
      return result;
    }

    return descriptor;
  }
}

function Retrier(maxRetries: number): MethodDecorator {
  return function (_target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: unknown;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;

          if (attempt === maxRetries) {
            throw new Error(
              `Method ${String(propertyKey)} failed after ${maxRetries + 1} attempts: ${(error as Error).message}`
            );
          }

          console.error(
            `Attempt ${attempt + 1} for method ${String(propertyKey)} failed: ${(error as Error).message}. Retrying...`
          );
        }
      }

      throw lastError;
    };

    return descriptor;
  };
}

function Delay(ms: number): MethodDecorator {
  return function (_target: any, _propertyKey: string | Symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      console.log(`Waiting for ${ms} ms...`);
      await sleep(ms);
      return await originalMethod.apply(this, args);
    }
    return descriptor;
  }
}

class UserService {
  @LoggingDecorator()
  async processUser(userName: string) {
    return userName;
  }

  @Retrier(3)
  @Delay(5000)
  async reportUser() {
    throw new Error('Bad Request');
  }
}

(async () => {
  const service = new UserService();
  await service.processUser('user');
})()
