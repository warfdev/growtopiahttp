import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import d from "./serverconfig.json";

const app = express();
const port = d.http_port;

/* app usings */
import { antiDdos } from "./middlewares/AntiDdos";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(antiDdos);

// Create logs folder if it doesn't exist
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

// Middleware to log detailed HTTP request info
app.use((req: Request, res: Response, next: NextFunction) => {
  const logFile = path.join(logsDir, "http_requests.log");
  const log = `
[${new Date().toISOString()}]
> IP: ${req.ip}
> Method: ${req.method}
> URL: ${req.originalUrl}
> Headers: ${JSON.stringify(req.headers, null, 2)}
> Body: ${JSON.stringify(req.body, null, 2)}
--------------------------------------------
`;
  fs.appendFileSync(logFile, log);
  console.log(`[HTTP] ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Growtopia client handler
app.post("/growtopia/server_data.php", (req: Request, res: Response) => {
  const response = `
server|${d.bindIP}
port|${d.port}
type|1
#maint|${d.maint}
beta_server|${d.bindIP}
beta_port|${d.port}
meta|localhost
RTENDMARKERBS1001`;

  res.send(response);
});

// Start the server
app.listen(port, () => {
  console.log(`[Growtopia HTTP] Server is running on port ${port}`);
});