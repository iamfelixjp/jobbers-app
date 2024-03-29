import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './User.js';

const JobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Please provide company'],
      maxLength: 50,
    },
    position: {
      type: String,
      required: [true, 'Please provide position'],
      maxLength: 100,
    },
    status: {
      type: String,
      enum: ['interview', 'declined', 'pending'],
      default: 'pending',
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'remote', 'internship'],
      default: 'full-time',
    },
    jobLocation: {
      type: String,
      default: 'my city',
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      default: 'my city',
      ref: 'User',
      required: [true, 'please provide user'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Job', JobSchema);
