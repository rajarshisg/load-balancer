import { Service } from "typedi";
import BaseStrategy from "./BaseLoadBalancerStrategy";
import { TargetGroup } from "../../types";
import Target from "../../models/Target";

/**
 * Implements the least active connections based dynamic load balancing strategy.
 * It basically chooses the target that is currently serving the least number of requests.
 */
@Service()
class LeastConnectionsLoadBalancerStrategy implements BaseStrategy {
  // selects the target with the least number of active connections
  public getTarget(targetGroup: TargetGroup): Target {
    if (targetGroup.length === 0) {
      throw new Error("Target group is empty");
    }

    // find the target with least number of active connections
    let selectedTarget: Target = targetGroup[0];
    let minActiveConnections = targetGroup[0].getActiveConnections();
    for (const target of targetGroup) {
      const currActiveConnections = target.getActiveConnections();
      if (currActiveConnections < minActiveConnections) {
        minActiveConnections = currActiveConnections;
        selectedTarget = target;
      }
    }

    return selectedTarget;
  }
}

export default LeastConnectionsLoadBalancerStrategy;
