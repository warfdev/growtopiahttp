import { Request, Response, NextFunction } from "express";

const ipHits: Record<string, { count: number; lastSeen: number }> = {};
const RATE_LIMIT = 20;
const INTERVAL = 10000; // 10 seconds

export function antiDdos(req: Request, res: Response, next: NextFunction): any {
  const ip: string = req.ip ?? "unknown";
  const now = Date.now();

  if (!ipHits[ip]) {
    ipHits[ip] = { count: 1, lastSeen: now };
  } else {
    const diff = now - ipHits[ip].lastSeen;
    if (diff > INTERVAL) {
      ipHits[ip] = { count: 1, lastSeen: now };
    } else {
      ipHits[ip].count++;
      ipHits[ip].lastSeen = now;

      if (ipHits[ip].count > RATE_LIMIT) {
        // If rate limit is exceeded, send the response and DO NOT call next()
        console.warn(`[DDoS Blocked] IP: ${ip}`);
        return res.status(429).send("You're sending requests too fast. Calm down, bro.");
      }
    }
  }

  // If the rate limit is not exceeded, continue with the next middleware or route handler
  next(); // Proceed to the next middleware/route handler
}