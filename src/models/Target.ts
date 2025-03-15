/**
 * Represents the Target model
 * A Target can be considered as a unique server which serves the requests received by the load balancer
 */
class Target {
  readonly host: string; // host name of the target
  readonly port: number; // port of the target
  readonly healthCheckRoute: string; // route to perform health checks in
  private healthy: boolean; // whether the target is healthy or not
  private activeConnections: number; // number of active connections being handled by the target
  readonly weight: number; // weight value assigned to the target, higher the weight higher it's processing capacity

  constructor(
    host: string,
    port: number,
    healthCheckRoute: string,
    weight: number = 1 // Default weight is set to 1
  ) {
    this.host = host;
    this.port = port;
    this.healthCheckRoute = healthCheckRoute;
    this.weight = weight;
    this.activeConnections = 0;
    this.healthy = true; // By default, the target is healthy
  }

  // Sets the target as healthy
  public setHealthy(): void {
    this.healthy = true;
  }

  // Sets the target as unhealthy
  public setUnhealthy(): void {
    this.healthy = false;
  }

  // Returns the current health status of the target
  public isHealthy(): boolean {
    return this.healthy;
  }

  // Increments the number of active connections for the target
  public incrementActiveConnections(): void {
    this.activeConnections++;
  }

  // Decrements the number of active connections for the target
  public decrementActiveConnections(): void {
    this.activeConnections--;
  }

  // Returns the current number of active connections for the target
  public getActiveConnections(): number {
    return this.activeConnections;
  }
}

export default Target;
