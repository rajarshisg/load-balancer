import { Service } from "typedi";
import BaseStrategy from "./BaseLoadBalancerStrategy";
import { TargetGroup } from "../../types";
import Target from "../../models/Target";

/**
 * Implements the weighted load balancing strategy
 * Targets with higher weights receive proportionally more number of requests
 */
@Service()
class WeightedLoadBalancerStrategy implements BaseStrategy {
  // returns a prefix sum array of the weights of all the targets
  private getCumulativeWeights(targetGroup: TargetGroup): number[] {
    const cumulativeWeights = [];
    targetGroup.forEach((target: Target, index: number) => {
      if (index === 0) {
        cumulativeWeights.push(target.weight || 1);
      } else {
        cumulativeWeights.push(
          cumulativeWeights[index - 1] + (target.weight || 1)
        );
      }
    });
    return cumulativeWeights;
  }

  // selects the next target based on the weighted round-robin load balancing strategy.
  public getTarget(targetGroup: TargetGroup): Target {
    if (targetGroup.length === 0) {
      throw new Error("Target group is empty");
    }

    const cumulativeWeights = this.getCumulativeWeights(targetGroup);
    const totalWeight = cumulativeWeights[cumulativeWeights.length - 1];

    // Generate a random number between 0 and the total weight
    const randomValue = Math.floor(Math.random() * totalWeight);

    // Find the target based on the random value
    for (let i = 0; i < targetGroup.length; i++) {
      if (randomValue < cumulativeWeights[i]) {
        return targetGroup[i]; // Return the target when the random value is less than the cumulative weight
      }
    }

    // If no target was selected, fallback to the last one (shouldn't happen normally)
    return targetGroup[targetGroup.length - 1];
  }
}

export default WeightedLoadBalancerStrategy;
