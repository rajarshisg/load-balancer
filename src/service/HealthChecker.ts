import { Inject, Service } from "typedi";
import { CronJob } from "cron";
import HttpClient from "../clients/HttpClient";
import { Target, TargetGroup } from "../types";

@Service()
class HealthChecker {
  /**
   * The HealthChecker is responsible for checking and maintaining the healthy set of target groups.
   */
  @Inject()
  private httpClient: HttpClient;

  public schedule(targetGroup: TargetGroup, cron: string) {
    /**
     * This function starts the health checker service, which periodically checks the target group for heart beats
     */
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

                if (
                  "status" in response &&
                  response.status &&
                  +response.status < 500
                ) {
                  console.log(
                    `Target ${target.host}:${target.port}${
                      target.healthCheckRoute
                    } is healthy as of ${new Date().toUTCString()}!`
                  );
                  target.healthy = true;
                } else {
                  target.healthy = false;
                  console.log(
                    `Target ${target.host}:${target.port}${
                      target.healthCheckRoute
                    } is not healthy as of ${new Date().toUTCString()}!`
                  );
                  console.log(response);
                }
              } catch (error) {
                target.healthy = false;
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
      console.log("Error in starting the health checker service!");
      console.log(error);
    }
  }
}

export default HealthChecker;
