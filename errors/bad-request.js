import { StatusCodes } from 'http-status-codes';
import CustomeAPIError from './custom-api.js';

class BadRequestError extends CustomeAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export default BadRequestError;
