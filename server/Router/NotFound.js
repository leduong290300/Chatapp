const notFound = (req, res, next) => {
  const error = new Error(`Không tồn tại - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
module.exports = notFound;
