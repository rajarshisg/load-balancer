import { Service, Inject, Token } from "typedi";
import HttpClient from "../clients/HttpClient";
import BaseLoadBalancerStrategy from "./strategy/BaseLoadBalancerStrategy";
import { NextFunction, Request, Response } from "express";
import { TargetGroup, Target } from "../types/index";

export const STRATEGY_TOKEN = new Token<BaseLoadBalancerStrategy>(
  "LoadBalancingStrategy"
);
export const TARGET_GROUP = new Token<TargetGroup>("LoadBalancingTargetGroup");

@Service()
class LoadBalancer {
  /**
   * Performs the load balancing. For all incoming requests chooses a target server from a target group of healthy ones, based on a strategy and forwards the requests.
   */
  @Inject()
  private httpClient: HttpClient;
  private loadBalancingStrategy: BaseLoadBalancerStrategy; // represents the strategy that is used by the load balancer
  private targetGroup: TargetGroup; // target group of servers

  constructor(
    @Inject(STRATEGY_TOKEN) loadBalancingStrategy: BaseLoadBalancerStrategy,
    @Inject(TARGET_GROUP) targetGroup: TargetGroup
  ) {
    this.loadBalancingStrategy = loadBalancingStrategy;
    this.targetGroup = targetGroup;
  }

  public listen = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Get a target from a group of healthy servers based on the load balancing strategy that is used
    const target = this.loadBalancingStrategy.getTarget(
      this.targetGroup.filter((target: Target) => target.healthy)
    );

    try {
      // Forward the request to the chosen target
      const response = (await this.httpClient.makeRequest({
        host: target.host,
        port: target.port,
        path: req.path,
        method: req.method,
        headers: req.headers as Record<string, string>, // Forward all headers
        body: req.body ? JSON.stringify(req.body) : undefined, // Forward the body if exists
      })) as {
        status?: number;
        headers?: { [key: string]: unknown };
        body?: string;
      };

      // Respond with the exact response from the target server
      if (response) {
        res.status(response.status || 200); // Set status from target response
        // Forward all headers from target response
        for (const [key, value] of Object.entries(response.headers || {})) {
          res.setHeader(key, value as string);
        }

        // Send the body from the target response
        res.send(response.body);
      }
    } catch (error) {
      console.log("Error occurred in LoadBalancer:listen");
      console.log(error);
    }

    next();
  };
}

export default LoadBalancer;
