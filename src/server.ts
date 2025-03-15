import express from "express";
import { Service, Inject, Container } from "typedi";
import CONFIG from "./utils/config";
import HealthChecker from "./service/HealthChecker";
import { LoadBalancingStrategy, TargetGroup } from "./types";
import LoadBalancer, {
  STRATEGY_TOKEN,
  TARGET_GROUP,
} from "./service/LoadBalancer";
import Target from "./models/Target";
import LoadBalancerStrategyFactory from "./service/strategy/LoadBalancerStrategyFactory";

@Service()
class Server {
  private app = express();
  private PORT = CONFIG.server.port; // port on which server runs
  private targetGroup: TargetGroup = []; // target group for the load balancer

  @Inject()
  private healthChecker: HealthChecker; // Health checker service
  private loadBalancer: LoadBalancer; // Load balancer service

  constructor() {
    // get the target group list from config
    for (const target of CONFIG.loadBalancer.targetGroup) {
      this.targetGroup.push(
        new Target(
          target.host,
          target.port,
          target.healthCheckRoute,
          target.weight
        )
      );
    }

    // set the strategy / algorithm used by the load balancer
    Container.set(
      STRATEGY_TOKEN,
      LoadBalancerStrategyFactory.getStrategy(
        CONFIG.loadBalancer.algorithm as LoadBalancingStrategy
      )
    );
    // set the target group available to the load balancer
    Container.set(TARGET_GROUP, this.targetGroup);
    this.loadBalancer = Container.get(LoadBalancer);
  }

  public start() {
    // route all requests to the load balancer listener
    this.app.all("/", this.loadBalancer.listen);

    this.app.listen(this.PORT, () => {
      return console.log(
        `Load Balancer is running on http://localhost:${this.PORT}...`
      );
    });

    if (CONFIG.loadBalancer.healthChecks.enabled)
      // if health checks are enabled schedule the health checker
      this.healthChecker.schedule(
        this.targetGroup,
        CONFIG.loadBalancer.healthChecks.cron
      );
    else console.log("Health checks are disabled!");
  }
}

export default Server;
