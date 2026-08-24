import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  district: { type: String, default: 'Nilgiris' },
  location: { type: String, required: true },
  type: { 
    type: String, 
    default: 'Homestay'
  },
  pricePerNight: { type: Number, required: true },
  price: { type: Number },
  rating: { type: Number, default: 4.9 },
  reviewsCount: { type: Number, default: 1 },
  images: [{ type: String }],
  coordinates: {
    lat: { type: Number, default: 11.4102 },
    lng: { type: Number, default: 76.6950 }
  },
  googleMapsUrl: { type: String },
  description: { type: String },
  amenities: [{ type: String }],
  ownerRules: [{ type: String }],
  reviews: [{
    userName: { type: String },
    userEmail: { type: String },
    rating: { type: Number, default: 5 },
    comment: { type: String },
    tripType: { type: String, default: 'Verified Stay' },
    date: { type: Date, default: Date.now }
  }],
  ownerId: { type: String },
  ownerName: { type: String, default: 'Host Owner' },
  ownerEmail: { type: String },
  status: { type: String, default: 'Pending Approval' },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

// Query optimization indexes
propertySchema.index({ createdAt: -1 });
propertySchema.index({ status: 1, createdAt: -1 });
propertySchema.index({ district: 1, type: 1 });
propertySchema.index({ ownerEmail: 1 });
propertySchema.index({ pricePerNight: 1 });

export const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);
export default Property;
