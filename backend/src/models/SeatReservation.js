const mongoose = require('mongoose');

// One document per seat on a trip. The unique (schedule, seat) index is what
// makes double booking impossible: a seat can only ever have one reservation
// document, whether it is a legacy/agent seat, a confirmed booking or a
// short-lived checkout hold.
const seatReservationSchema = new mongoose.Schema(
  {
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
    },
    seat: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 10,
    },
    kind: {
      type: String,
      enum: ['legacy', 'booking', 'hold'],
      default: 'booking',
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    holdToken: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

seatReservationSchema.index({ schedule: 1, seat: 1 }, { unique: true });
seatReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
seatReservationSchema.index({ booking: 1 });
seatReservationSchema.index({ holdToken: 1 });

const SeatReservation = mongoose.model('SeatReservation', seatReservationSchema);

module.exports = { SeatReservation };
