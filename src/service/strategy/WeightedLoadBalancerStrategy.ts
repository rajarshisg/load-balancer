import { Service } from "typedi";
import BaseStrategy from "./BaseLoadBalancerStrategy";
import { Target, TargetGroup } from "../../types";

@Service()
class WeightedLoadBalancerStrategy implements BaseStrategy {
  /**
   * Implements the weighted load balancing strategy.
   * This method calculates the cumulative weights for each target.
   */
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

  /**
   * Selects the next target based on the weighted round-robin load balancing strategy.
   */
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
