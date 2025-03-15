import { Inject, Service } from "typedi";
import { CronJob } from "cron";
import HttpClient from "../clients/HttpClient";
import { TargetGroup } from "../types";
import Target from "../models/Target";

/**
 * The HealthChecker service is responsible for checking and maintaining a healthy set of target groups
 */
@Service()
class HealthChecker {
  @Inject()
  private httpClient: HttpClient; // client to perform HTTP requests, supports connection pooling

  // schedules the health checker service, which periodically checks the target group for heart beats
  public schedule(targetGroup: TargetGroup, cron: string) {
    try {
      new CronJob(
        cron, // cron expression
        async () => {
          await Promise.all(
            targetGroup.map(async (target: Target) => {
              try {
                const response = await this.httpClient.makeRequest({
                  host: target.host,
                  port: target.port,
                  path: target.healthCheckRoute,
                  method: "GET",
                });

                // If we get a response with a status code < 500 we consider target as healthy
                if (
                  "status" in response &&
                  response.status &&
                  +response.status < 500
                ) {
                  target.setHealthy(); // set the target as healthy
                  console.log(
                    `Target ${target.host}:${target.port}${
                      target.healthCheckRoute
                    } is healthy as of ${new Date().toUTCString()}!`
                  );
                } else {
                  target.setUnhealthy(); // set the target as unhealthy
                  console.log(
                    `Target ${target.host}:${target.port}${
                      target.healthCheckRoute
                    } is not healthy as of ${new Date().toUTCString()}!`
                  );
                  console.log(response);
                }
              } catch (error) {
                target.setUnhealthy(); // set the target as unhealthy
                console.log(
                  `Target ${target.host}:${target.port}${
                    target.healthCheckRoute
                  } is not healthy as of ${new Date().toUTCString()}!`
                );
                console.log(error);
              }
            })
          );
        }, // function to execute onTick
        null, // function to execute on completion
        true // start the cron job
      );

      console.log("Successfully scheduled the health checker service!");
    } catch (error) {
      console.log("Error in scheduling the health checker service!");
      console.log(error);
    }
  }
}

export default HealthChecker;
