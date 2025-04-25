class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
  }
}

class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InternalServerError';
  }
}

module.exports = {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError
}; 