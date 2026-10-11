import { ApiError } from '../utils/apiError.js';

export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Endpoint ${req.method} ${req.originalUrl} does not exist.`));
};
