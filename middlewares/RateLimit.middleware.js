import rateLimit from "express-rate-limit";

// Dynamic limiter based on req.user
export const nominatimLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: (req, res) => {
    return req.user ? 60 : 10; // 60 for logged-in, 10 for anonymous
  },
  message: { error: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
});