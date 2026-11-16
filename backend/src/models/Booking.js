const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const bookingSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 32,
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
    },
    seats: {
      type: [String],
      required: true,
      validate: {
        validator: (seats) => Array.isArray(seats) && seats.length > 0,
        message: 'Select at least one seat.',
      },
    },
    passengerCount: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPriceRwf: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmountRwf: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    source: {
      type: String,
      enum: ['online', 'agent'],
      default: 'online',
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    contactName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      maxlength: 25,
      default: '',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  schemaOptions()
);

bookingSchema.index({ passenger: 1, createdAt: -1 });
bookingSchema.index({ schedule: 1, status: 1 });
// The staff Bookings page lists reservations newest first and filters by source.
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ source: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { Booking };
