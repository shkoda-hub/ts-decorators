function ReadOnly(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    let value: unknown;

    Object.defineProperty(target, propertyKey, {
      configurable: true,
      get: () => value,
      set: (newValue) => {
        if (value === undefined) {
          value = newValue;
        } else {
          throw new Error(`Property ${String(propertyKey)} is read-only`);
        }
      },
    });
  };
}

class AuthService {
  @ReadOnly()
  public authType: string = 'base';
}

(() => {
  const service = new AuthService();
  console.log(service.authType);

  service.authType = 'jwt';
})()
