const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const routeSchema = new mongoose.Schema(
  {
    routeCode: {
      type: String,
      required: [true, 'Route code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
    },
    origin: {
      type: String,
      required: [true, 'Origin is required'],
      trim: true,
      maxlength: 100,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
      maxlength: 100,
    },
    fareRwf: {
      type: Number,
      required: [true, 'Fare is required'],
      min: 0,
    },
    estimatedDurationMins: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  schemaOptions()
);

routeSchema.index({ destination: 1 });
routeSchema.index({ origin: 1 });

routeSchema.virtual('connection').get(function connection() {
  return `${this.origin} → ${this.destination}`;
});

const Route = mongoose.model('Route', routeSchema);

module.exports = { Route };
