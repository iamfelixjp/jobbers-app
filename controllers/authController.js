import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnAuthenticatedError } from '../errors/index.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new BadRequestError('Please provide all values');
  }

  const userAlreadyExists = await User.findOne({ email });

  if (userAlreadyExists) {
    throw new BadRequestError('Email already in use');
  }
  const user = await User.create({ name, email, password });
  const token = await user.createJWT();
  res.status(StatusCodes.CREATED).json({
    user: {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      location: user.location,
    },
    token,
    location: user.location,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide all values');
  }

  // "+password" - Added password so that bcrypt compare
  const user = await User.findOne({ email }).select('+password');

  /* 
     Because the 'User' model do not return 'password', and the password is needed for comparism - 
     that's why we use the function select('+password') to add the 'password' in the database 
     to response from the 'User.findOne' method above; 
     so that it can be compared with the user login password
     log 'password' to check if is returned in the response
     console.log(user); 
  */

  if (!user) {
    throw new UnAuthenticatedError('Invalid Credentials!');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnAuthenticatedError('Invalid Credentials!');
  }

  const token = await user.createJWT();

  //Removed 'password' from response
  user.password = undefined;

  res.status(StatusCodes.OK).json({ user, token, location: user.location });
};

const updateUser = async (req, res) => {
  // console.log(req.user);
  const { name, lastName, email, location } = req.body;

  if (!name || !lastName || !email || !location) {
    throw new BadRequestError('Please provide all values!');
  }

  const user = await User.findById({ _id: req.user.userId });

  user.name = name;
  user.lastName = lastName;
  user.email = email;
  user.location = location;

  await user.save();

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ user, token, location: user.location });
};

export { register, login, updateUser };
