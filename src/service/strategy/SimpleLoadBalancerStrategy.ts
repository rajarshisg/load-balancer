import { Service } from "typedi";
import BaseStrategy from "./BaseLoadBalancerStrategy";
import { TargetGroup } from "../../types";
import Target from "../../models/Target";

/**
 * Implements the simple / round-robin load balancing strategy
 * It keeps on choosing the next target in order a cyclic fashion
 */
@Service()
class SimpleLoadBalancerStrategy implements BaseStrategy {
  private static counter = 0; // maintains the target that is to be selected

  // Selects the next target from target group in a round-robin fashion
  public getTarget(targetGroup: TargetGroup): Target {
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
