import mongoose from 'mongoose';
import Job from '../models/Job.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors/index.js';
import checkPermissions from '../utils/checkPermission.js';
import moment from 'moment';

// Create Job
const createJob = async (req, res) => {
  const { position, company } = req.body;

  if (!position || !company) {
    throw new BadRequestError('Please Provide All Values');
  }

  req.body.createdBy = req.user.userId;

  const job = await Job.create(req.body);

  res.status(StatusCodes.CREATED).json({ job });
};

// Get All Jobs / filtered Jobs
const getAllJobs = async (req, res) => {
  const { status, jobType, sort, search } = req.query;

  const queryObject = {
    createdBy: req.user.userId,
  };

  // add stuff based on condition
  if (status && status !== 'all') {
    queryObject.status = status;
  }

  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType;
  }

  // add search query to the queryObject (position)
  if (search) {
    // 'i' -> case insensitive
    queryObject.position = { $regex: search, $options: 'i' };
  }

  // Before adding query parameters (status, jobType, search, sort)
  // const jobs = await Job.find({ createdBy: req.user.userId });

  // Refactoring - NO AWAIT
  let result = Job.find(queryObject);

  // chain sort condition to the queryObject
  if (sort === 'latest') {
    result = result.sort('-createdAt');
  }

  if (sort === 'oldest') {
    result = result.sort('createdAt');
  }

  if (sort === 'a-z') {
    result = result.sort('position');
  }

  if (sort === 'z-a') {
    result = result.sort('-position');
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  result.skip(skip).limit(limit);

  const jobs = await result;

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};

// Update Job
const updateJob = async (req, res) => {
  const { id: jobId } = req.params;

  const { position, company } = req.body;

  if (!position || !company) {
    throw new BadRequestError('Please Provide All Values');
  }

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new NotFoundError(`No job with id :${jobId}`);
  }

  // check permission
  // console logged to see that comparison won't be possible btw req.user.userId(string) and job.createdBy(object)
  // console.log(typeof req.user.userId);
  // console.log(typeof job.createdBy);
  checkPermissions(req.user, job.createdBy);

  // First approach
  const updateJob = await Job.findOneAndUpdate({ _id: jobId }, req.body, {
    new: true,
    runValidators: true,
  });

  // Alternative approach -
  /* all properties to be updated must be pulled out from req.body and assigned as below 
     otherwise the property won't be updated even if it was passed
  */
  // job.position = position;
  // job.company = company;
  // await job.save();
  // res.status(StatusCodes.OK).json({ job });

  res.status(StatusCodes.OK).json({ updateJob });
};

// Delete Job
const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new NotFoundError(`No job with id: ${jobId}`);
  }

  checkPermissions(req.user, job.createdBy);

  await job.remove();

  res.status(StatusCodes.OK).json({ msg: 'Success! Job removed' });
};

// Job Dashboard Details
const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // console.log(stats) // stats before the reduce() method below

  // this was done to stats to reduce an easy object{} for ease of front-end
  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  // console.log(stats); // stats after the reduce() method

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  // this is done to have a cleaner response in the front-end
  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y');
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

export { createJob, getAllJobs, updateJob, showStats, deleteJob };
