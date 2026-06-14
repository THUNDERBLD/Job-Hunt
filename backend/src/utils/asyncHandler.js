// utils/asyncHandler.js
// Wraps every async controller function.
// Any thrown error is passed to the global errorHandler middleware automatically.
// This means you NEVER need try/catch inside a controller.

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;