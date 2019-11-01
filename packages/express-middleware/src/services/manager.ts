import { Container } from 'typedi'

class ServiceManager {
  getService<T>(service: any): T {
    return Container.get(service)
  }
}

export default ServiceManager
