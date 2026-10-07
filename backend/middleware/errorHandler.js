function errorHandler(error, req, res, next) {
  console.error(error);
  if (res.headersSent) return next(error);
  return res.status(error.statusCode || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : (error.message || 'Internal server error')
  });
}

module.exports = errorHandler;
