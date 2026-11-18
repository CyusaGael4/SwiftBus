const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: null,
      maxlength: 20,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'booking_agent', 'driver', 'passenger'],
      default: 'passenger',
    },
    status: {
      type: String,
      enum: ['active', 'invited', 'deactive', 'pending', 'rejected'],
      default: 'active',
    },
    // Booking agents apply with the counter they work from; administrators
    // read these before approving the account.
    agencyName: {
      type: String,
      trim: true,
      default: null,
      maxlength: 120,
    },
    agencyAddress: {
      type: String,
      trim: true,
      default: null,
      maxlength: 160,
    },
    agencyRegistrationNo: {
      type: String,
      trim: true,
      default: null,
      maxlength: 60,
    },
    lastActiveAt: {
      type: Date,
      default: null,
    },
    inviteSentAt: {
      type: Date,
      default: null,
    },
  },
  schemaOptions()
);

userSchema.index({ role: 1, status: 1 });
userSchema.index({ lastActiveAt: -1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('passwordHash')) return next();

  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = { User };
