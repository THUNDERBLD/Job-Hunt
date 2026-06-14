// middleware/errorMiddleware.js

// 404 handler — no route matched
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler — catches everything thrown in controllers
export const errorHandler = (err, req, res, next) => {
  // Sometimes mongoose throws 200 with an error — normalize it
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Something went wrong',
    // Show stack trace only in dev
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};