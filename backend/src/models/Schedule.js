const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const scheduleSchema = new mongoose.Schema(
  {
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Route is required'],
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus is required'],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    departureTime: {
      type: Date,
      required: [true, 'Departure time is required'],
    },
    arrivalTime: {
      type: Date,
      default: null,
    },
    seatsBooked: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'departed', 'delayed', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 300,
    },
  },
  schemaOptions()
);

scheduleSchema.index({ departureTime: 1, status: 1 });
scheduleSchema.index({ status: 1, departureTime: 1 });
scheduleSchema.index({ route: 1 });
scheduleSchema.index({ bus: 1 });
scheduleSchema.index({ driver: 1 });

scheduleSchema.virtual('availableSeats').get(function availableSeats() {
  const capacity = this.bus?.totalCapacity;
  if (!capacity) return null;
  return Math.max(capacity - this.seatsBooked, 0);
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = { Schedule };
