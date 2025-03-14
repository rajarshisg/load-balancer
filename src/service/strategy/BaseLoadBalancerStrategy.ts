import { Target, TargetGroup } from "../../types";

interface BaseLoadBalancerStrategy {
  getTarget(targetGroup: TargetGroup): Target;
}

export default BaseLoadBalancerStrategy;
