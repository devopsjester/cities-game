import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomCity extends Document {
  name: string;
  normalizedName: string;
  country?: string;
  region?: string;
  addedBy: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomCitySchema = new Schema<ICustomCity>(
  {
    name: {
      type: String,
      required: true,
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    country: String,
    region: String,
    addedBy: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

CustomCitySchema.index({ normalizedName: 1 });
CustomCitySchema.index({ isApproved: 1 });

export default mongoose.model<ICustomCity>('CustomCity', CustomCitySchema);
