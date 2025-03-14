import { Service } from "typedi";
import BaseStrategy from "./BaseLoadBalancerStrategy";
import { Target, TargetGroup } from "../../types";

@Service()
class SimpleLoadBalancerStrategy implements BaseStrategy {
  /**
   * Implements the simple / round-robin load balancing strategy.
   */
  private static counter = 0;

  public getTarget(targetGroup: TargetGroup): Target {
    /**
     * Selects the next target from target group in a round-robin fashion
     */
    if (targetGroup.length === 0) {
      throw new Error("Target group is empty");
    }

    // Get the current target based on the round-robin counter
    const target = targetGroup[SimpleLoadBalancerStrategy.counter];

    // Increment the counter and wrap around using modulo
    SimpleLoadBalancerStrategy.counter =
      (SimpleLoadBalancerStrategy.counter + 1) % targetGroup.length;

    return target;
  }
}

export default SimpleLoadBalancerStrategy;
