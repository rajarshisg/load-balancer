import { TargetGroup } from "../../types";
import Target from "../../models/Target";
interface BaseLoadBalancerStrategy {
  getTarget(targetGroup: TargetGroup): Target;
}

export default BaseLoadBalancerStrategy;
