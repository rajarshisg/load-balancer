export type Target = {
  host: string;
  port: number;
  healthCheckRoute: string;
  healthy: boolean;
  weight?: number;
};

export type TargetGroup = Target[];

export type LoadBalancingStrategy = "SIMPLE" | "WEIGHTED";
