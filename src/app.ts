/**
 * Entry point to the Express.js application. Instantiates and starts the server.
 */
import "reflect-metadata";
import Server from "./server";
import Container from "typedi";

// Initialize and start the server running the load balancer
const server = Container.get(Server);
server.start();
