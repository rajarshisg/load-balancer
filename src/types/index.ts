import Target from "../models/Target";

// A pool of Target servers make up a TargetGroup
export type TargetGroup = Target[];

// Load balancing strategies supported
export type LoadBalancingStrategy = "SIMPLE" | "WEIGHTED" | "LEAST_CONNECTIONS";
