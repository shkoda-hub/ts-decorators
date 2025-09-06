function LogCreation(): ClassDecorator {
  return function(target: Function) {
    console.log(`Instance was created: ${target.name}`);
  }
}

@LogCreation()
class Service {

}

(() => {
  const service = new Service();
})()
