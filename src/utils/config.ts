const CONFIG = {
  server: {
    port: "3000", // port on which the load balancer runs
  },
  loadBalancer: {
    targetGroup: [
      {
        host: "", // hostname of the target
        port: 80, // port on which requests are sent
        healthCheckRoute: "/", // route on which the health check requests will be sent
        weight: 1, // any integer value, higher the weight, higher the number of requests which will be routed to the target in weighted load balancing
      },
    ],
    algorithm: "SIMPLE", // algorithm followed by the load balancer. Options are `SIMPLE` and `WEIGHTED`.
    healthChecks: {
      enabled: true, // whether health checks are enabled or not
      cron: "* * * * *", // health checks are done once every minute
    },
  },
};
export default CONFIG;
