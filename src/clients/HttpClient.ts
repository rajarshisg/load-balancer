import { Service } from "typedi";
import { Agent, request, IncomingMessage } from "http";

@Service()
class HttpClient {
  private agent: Agent;

  constructor() {
    this.agent = new Agent({
      keepAlive: true, // Keep connections alive
      maxSockets: 10, // Max number of connections
      maxFreeSockets: 5, // Max number of idle connections
      keepAliveMsecs: 10000, // Keep connection alive for 10 seconds if idle
    });
  }

  makeRequest = (reqParams: {
    host: string;
    port: number;
    path: string;
    method: string;
    timeout?: number;
    headers?: Record<string, string>;
    body?: string;
  }): Promise<
    | {
        status?: number;
        headers?: { [key: string]: unknown };
        body?: string;
      }
    | Error
  > => {
    return new Promise((resolve, reject) => {
      const req = request(
        {
          hostname: reqParams.host,
          port: reqParams.port,
          agent: this.agent,
          path: reqParams.path,
          method: reqParams.method,
          headers: reqParams.headers,
          timeout: reqParams.timeout || 10000, // Default timeout is 10 seconds if not specified
        },
        (res: IncomingMessage) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: data,
            });
          });

          res.on("error", (err) => {
            reject(err);
          });
        }
      );

      // use its "timeout" event to abort the request
      req.on("timeout", () => {
        req.destroy();
      });

      req.on("error", (err) => {
        reject(err);
      });

      if (reqParams.body) {
        req.write(reqParams.body);
      }

      req.end();
    });
  };
}

export default HttpClient;
