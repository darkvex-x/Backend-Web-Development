function sendSuccess(res, data, statusCode = 200, meta = null) {
  const body = { data };
  if (meta) {
    body.meta = meta;
  }
  return res.status(statusCode).json(body);
}

function sendError(res, statusCode, message, details = null) {
  const errorObj = {
    message,
    status: statusCode
  };
  if (details) {
    errorObj.details = details;
  }
  return res.status(statusCode).json({ error: errorObj });
}

module.exports = {
  sendSuccess,
  sendError
};
