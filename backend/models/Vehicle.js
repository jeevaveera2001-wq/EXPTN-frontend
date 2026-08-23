import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    default: 'Innova Crysta'
  },
  registrationNumber: { type: String },
  regNo: { type: String },
  numberPlate: { type: String },
  numberPlateImage: { type: String },
  rcBookImage: { type: String },
  exteriorImage: { type: String },
  interiorImage: { type: String },
  images: [{ type: String }],
  providerName: { type: String, default: 'Veera Cabs & Transport' },
  providerPhone: { type: String, default: '+91 78717 79134' },
  providerEmail: { type: String },
  ownerEmail: { type: String },
  ownerName: { type: String },
  location: { type: String, default: 'Nilgiris (Ooty)' },
  district: { type: String, default: 'Nilgiris (Ooty & Coonoor)' },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  googleMapsUrl: { type: String },
  seatingCapacity: { type: Number, default: 7 },
  fuelType: { type: String, default: 'Diesel' },
  acType: { type: String, default: 'AC' },
  driverIncluded: { type: Boolean, default: true },
  driverName: { type: String, default: 'Ramesh V.' },
  driverPhone: { type: String, default: '+91 78717 79134' },
  driverLicense: { type: String },
  pricePerDay: { type: Number, default: 3500 },
  price: { type: Number, default: 3500 },
  perKmRate: { type: Number, default: 16 },
  conductDeclared: { type: Boolean, default: true },
  status: { type: String, default: 'Pending Approval' },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

// Query optimization indexes
vehicleSchema.index({ status: 1, createdAt: -1 });
vehicleSchema.index({ district: 1, type: 1 });
vehicleSchema.index({ ownerEmail: 1 });

export const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
