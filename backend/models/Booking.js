import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Customer reference (Standardized requirement - always derived from req.user._id)
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },

  // Property reference (when booking a stay / hotel / homestay / resort)
  property: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property',
    index: true
  },

  // Owner reference (when applicable)
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },

  // Vehicle reference (when booking a cab / transport)
  vehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle',
    index: true
  },

  // Booking Identifiers
  bookingReference: { 
    type: String, 
    unique: true, 
    sparse: true,
    index: true 
  },
  bookingId: { 
    type: String, 
    unique: true, 
    sparse: true,
    index: true 
  },
  bookingType: { 
    type: String, 
    enum: ['property', 'stay', 'cab', 'vehicle', 'transport'], 
    default: 'property' 
  },
  
  // Property Stay Specific Fields
  propertyId: { type: String },
  propertyTitle: { type: String },
  destination: { type: String },
  location: { type: String },
  roomType: { type: String, default: 'Standard Deluxe' },
  numberOfRooms: { type: Number, default: 1 },
  rooms: { type: Number, default: 1 },
  checkIn: { type: String },
  checkOut: { type: String },
  nights: { type: Number, default: 1 },
  guests: { type: Number, default: 1 },
  guestDetails: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    total: { type: Number, default: 1 },
    rooms: { type: Number, default: 1 }
  },
  
  // Cab Transport Specific Fields
  vehicleId: { type: String },
  vehicleTitle: { type: String },
  vehicleType: { type: String },
  vehicleRegNo: { type: String },
  pickupLocation: { type: String },
  dropLocation: { type: String },
  pickupDate: { type: String },
  pickupTime: { type: String },
  tripType: { type: String, default: 'One-Way' }, // 'One-Way', 'Round-Trip', 'Local'
  passengers: { type: Number, default: 4 },
  days: { type: Number, default: 1 },
  driverName: { type: String },
  driverPhone: { type: String },

  // Customer Contact Snapshot Details (for quick rendering & legacy support)
  customerName: { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },

  // Pricing Details
  priceDetails: {
    baseAmount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }
  },
  baseAmount: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  serviceFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  amount: { type: Number }, // legacy fallback alias
  
  // Booking & Payment Statuses
  bookingStatus: { 
    type: String, 
    enum: ['Pending', 'Pending Approval', 'Pending Verification', 'Confirmed', 'Cancelled', 'Completed', 'Approved', 'Declined'], 
    default: 'Confirmed',
    index: true
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Pending Approval', 'Pending Verification', 'Confirmed', 'Cancelled', 'Completed', 'Approved', 'Declined'], 
    default: 'Confirmed',
    index: true
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Refunded', 'Failed'], 
    default: 'Paid',
    index: true
  },
  paymentMethod: { type: String, default: 'Razorpay UPI/Card' },
  paymentId: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  
  // Owner / Vendor Metadata
  ownerName: { type: String },
  ownerEmail: { type: String },
  vendorName: { type: String },
  vendorEmail: { type: String }
}, { 
  timestamps: true, 
  strict: false 
});

// Query optimization indexes
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ customerEmail: 1, createdAt: -1 });
bookingSchema.index({ property: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, createdAt: -1 });
bookingSchema.index({ vehicle: 1, createdAt: -1 });
bookingSchema.index({ ownerEmail: 1, createdAt: -1 });
bookingSchema.index({ vendorEmail: 1, createdAt: -1 });
bookingSchema.index({ bookingType: 1, createdAt: -1 });
bookingSchema.index({ bookingStatus: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ createdAt: -1 });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;
