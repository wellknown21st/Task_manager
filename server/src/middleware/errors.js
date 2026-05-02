export function asyncHandler(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}

export function errorMiddleware(err, _req, res, _next) {
  const status = err.status ?? 500;
  const message =
    status === 500 && process.env.NODE_ENV !== "development"
      ? "Internal Server Error"
      : err.message ?? "Internal Server Error";
  console.error(err);
  const payload = { error: message };
  if (err.details) payload.details = err.details;
  res.status(status).json(payload);
}
