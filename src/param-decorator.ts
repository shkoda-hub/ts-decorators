import 'reflect-metadata';

const ENV_META = Symbol('env-meta');

function Env(envName: string): ParameterDecorator {
  return function(target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    const existing: any[] = Reflect.getOwnMetadata(ENV_META, target) || [];
    existing.push({ index: parameterIndex, key: envName});
    Reflect.defineMetadata(ENV_META, existing, target);
  }
}

function createWithEnv<T>(cls: new(...args: any[]) => T) {
  const meta: { index: number, key: string }[] = Reflect.getOwnMetadata(ENV_META, cls) || [];
  const args = [];

  for (const { index, key } of meta) {
    args[index] = process.env[key];
  }

  return new cls(...args);
}

class ProcessService {
  constructor(
    @Env('DB_HOST') private readonly dbHost: string,
  ) {}

  process(data: string) {
    console.log(`Processing ${data}... with DB HOST ${this.dbHost}`);
  }
}

(() => {
  process.env.DB_HOST = '127.0.0.1';

  const service = createWithEnv(ProcessService)
  service.process('some data');
})()
