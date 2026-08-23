import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
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
  roomType: { type: String },
  checkIn: { type: String },
  checkOut: { type: String },
  nights: { type: Number, default: 1 },
  guests: { type: Number, default: 2 },
  
  // Cab Transport Specific Fields
  vehicleId: { type: String },
  vehicleTitle: { type: String },
  vehicleType: { type: String },
  vehicleRegNo: { type: String },
  pickupLocation: { type: String },
  dropLocation: { type: String },
  pickupDate: { type: String },
  pickupTime: { type: String },
  tripType: { type: String }, // 'One-Way', 'Round-Trip', 'Local'
  passengers: { type: Number, default: 4 },
  days: { type: Number, default: 1 },
  driverName: { type: String },
  driverPhone: { type: String },

  // Customer Contact Details
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },

  // Pricing & Status
  baseAmount: { type: Number },
  gstAmount: { type: Number },
  totalAmount: { type: Number, required: true },
  amount: { type: Number },
  status: { 
    type: String, 
    enum: ['Confirmed', 'Pending Approval', 'Pending Verification', 'Pending', 'Cancelled', 'Completed', 'Approved', 'Declined'], 
    default: 'Confirmed' 
  },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Refunded'], default: 'Paid' },
  paymentMethod: { type: String, default: 'Razorpay UPI/Card' },
  paymentId: { type: String },
  
  // Owner / Vendor Metadata
  ownerName: { type: String },
  ownerEmail: { type: String },
  vendorName: { type: String },
  vendorEmail: { type: String },

  createdAt: { type: Date, default: Date.now }
}, { strict: false });

// Query optimization indexes
bookingSchema.index({ customerEmail: 1, createdAt: -1 });
bookingSchema.index({ ownerEmail: 1, createdAt: -1 });
bookingSchema.index({ vendorEmail: 1, createdAt: -1 });
bookingSchema.index({ bookingType: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
