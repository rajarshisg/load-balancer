import { Service, Container } from "typedi";
import { LoadBalancingStrategy } from "../../types";
import BaseLoadBalancerStrategy from "./BaseLoadBalancerStrategy";
import LeastConnectionsLoadBalancerStrategy from "./LeastConnectionsLoadBalancerStrategy";
import WeightedLoadBalancerStrategy from "./WeightedLoadBalancerStrategy";
import SimpleLoadBalancerStrategy from "./SimpleLoadBalancerStrategy";

@Service()
class LoadBalancerStrategyFactory {
  public static getStrategy(
    strategy: LoadBalancingStrategy
  ): BaseLoadBalancerStrategy {
    switch (strategy) {
      case "LEAST_CONNECTIONS": {
        return Container.get(LeastConnectionsLoadBalancerStrategy);
      }
      case "WEIGHTED": {
        return Container.get(WeightedLoadBalancerStrategy);
      }
      default: {
        return Container.get(SimpleLoadBalancerStrategy);
      }
    }
  }
}

export default LoadBalancerStrategyFactory;
