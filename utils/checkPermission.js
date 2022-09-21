import { UnAuthenticatedError } from '../errors/index.js';

const checkPermissions = (requestUser, resouceUserId) => {
  //   if(resouceUserId.role === 'admin') return
  if (requestUser.userId === resouceUserId.toString()) return;

  throw new UnAuthenticatedError('Not authorized to access this route');
};

export default checkPermissions;
