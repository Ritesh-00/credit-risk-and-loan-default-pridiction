export class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static error(res, message = 'An error occurred', statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: {
        code: errorCode,
        details: details || undefined,
      },
    });
  }
}
