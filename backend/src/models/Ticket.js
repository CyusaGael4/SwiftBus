const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
    },
    seatsBooked: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalAmountRwf: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid'],
      default: 'paid',
    },
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    bookingReference: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    seatNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    verificationCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  schemaOptions()
);

ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ schedule: 1 });
ticketSchema.index({ user: 1 });
ticketSchema.index({ booking: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = { Ticket };
