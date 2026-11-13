const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const busSchema = new mongoose.Schema(
  {
    busCode: {
      type: String,
      required: [true, 'Bus ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
    },
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      default: 'SwiftBus',
      maxlength: 100,
    },
    totalCapacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: 1,
      max: 120,
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'out_of_service'],
      default: 'active',
    },
    assignedRoute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    nextServiceDate: {
      type: Date,
      default: null,
    },
    busStops: {
      type: [String],
      default: [],
    },
  },
  schemaOptions()
);

busSchema.index({ status: 1, assignedRoute: 1 });

busSchema.virtual('operationalStatus').get(function operationalStatus() {
  if (this.status === 'maintenance' || this.status === 'out_of_service') {
    return 'maintenance';
  }

  return this.assignedRoute ? 'on_route' : 'available';
});

const Bus = mongoose.model('Bus', busSchema);

module.exports = { Bus };
