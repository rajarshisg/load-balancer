import { Service, Inject, Token } from "typedi";
import HttpClient from "../clients/HttpClient";
import BaseLoadBalancerStrategy from "./strategy/BaseLoadBalancerStrategy";
import { NextFunction, Request, Response } from "express";
import { TargetGroup } from "../types/index";
import Target from "../models/Target";

export const STRATEGY_TOKEN = new Token<BaseLoadBalancerStrategy>(
  "LoadBalancingStrategy"
);
export const TARGET_GROUP = new Token<TargetGroup>("LoadBalancingTargetGroup");

/**
 * The LoadBalancer service performs the actual load balancing
 * For all incoming requests chooses a target server from a target group of healthy ones, based on a selected strategy and forwards the requests
 */
@Service()
class LoadBalancer {
  @Inject()
  private httpClient: HttpClient; // client to perform HTTP requests, supports connection pooling
  private loadBalancingStrategy: BaseLoadBalancerStrategy; // represents the strategy that is used by the load balancer
  private targetGroup: TargetGroup; // target group of servers

  constructor(
    @Inject(STRATEGY_TOKEN) loadBalancingStrategy: BaseLoadBalancerStrategy,
    @Inject(TARGET_GROUP) targetGroup: TargetGroup
  ) {
    this.loadBalancingStrategy = loadBalancingStrategy;
    this.targetGroup = targetGroup;
  }

  // listens to any requests received by the load balancer and forwards them to a chosen target
  public listen = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get a target from a group of healthy servers based on the load balancing strategy that is used
      const target = this.loadBalancingStrategy.getTarget(
        this.targetGroup.filter((target: Target) => target.isHealthy())
      );

      if (!target) {
        res.send("All servers are down!!");
        return;
      }

      // increment the number of active connections for the selected target
      target.incrementActiveConnections();

      try {
        // forward the request to the chosen target
        const response = (await this.httpClient.makeRequest({
          host: target.host,
          port: target.port,
          path: req.path,
          method: req.method,
          headers: req.headers as Record<string, string>, // forward all headers
          body: req.body ? JSON.stringify(req.body) : undefined, // forward the body if exists
        })) as {
          status?: number;
          headers?: { [key: string]: unknown };
          body?: string;
        };

        // respond with the exact response from the target server
        if (response) {
          res.status(response.status || 200); // Set status from target response
          // forward all headers from target response
          for (const [key, value] of Object.entries(response.headers || {})) {
            res.setHeader(key, value as string);
          }

          // send the body from the target response
          res.send(response.body);
        }
      } catch (error) {
        console.log("Error occurred in LoadBalancer:listen");
        console.log(error);
      } finally {
        // decrement the number of active connections for the selected target
        target.decrementActiveConnections();
      }

      next();
    } catch {
      res.send("All servers are down!!");
    }
  };
}

export default LoadBalancer;
