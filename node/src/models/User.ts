/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  PaginatedResolveResult,
  PaginateOptions,
  PaginateQuery,
  pluginPagination,
} from './Paginatation';

export const UserRole = {
  USER: 'USER',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
  ADMIN: 'ADMIN',
  SUPER_CONTENT_MANAGER: 'SUPER_CONTENT_MANAGER',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export interface FirstTimeTracking extends Document {
  myMentorSplash: boolean;
  tooltips: boolean;
}

const defaultFirstTimeTracking = {
  myMentorSplash: false,
  tooltips: false,
};

export const FirstTimeTrackingSchema = new Schema<FirstTimeTracking>({
  myMentorSplash: { type: Boolean, default: false },
  tooltips: { type: Boolean, default: false },
});

export interface User extends Document {
  firebaseId: string;
  googleId: string;
  name: string;
  email: string;
  isDisabled: boolean;
  userRole: string;
  mentorIds: Schema.Types.ObjectId[];
  lastLoginAt: Date;
  firstTimeTracking: FirstTimeTracking;
}

export const UserSchema = new Schema<User, UserModel>(
  {
    firebaseId: { type: String },
    googleId: { type: String },
    name: { type: String },
    email: { type: String },
    isDisabled: { type: Boolean, default: false },
    userRole: {
      type: String,
      enum: [
        UserRole.USER,
        UserRole.CONTENT_MANAGER,
        UserRole.ADMIN,
        UserRole.SUPER_CONTENT_MANAGER,
        UserRole.SUPER_ADMIN,
      ],
      default: UserRole.USER,
    },
    mentorIds: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    lastLoginAt: { type: Date },
    firstTimeTracking: {
      type: FirstTimeTrackingSchema,
      default: defaultFirstTimeTracking,
    },
  },
  { timestamps: true, collation: { locale: 'en', strength: 2 } }
);

export interface UserModel extends Model<User> {
  paginate(
    query?: PaginateQuery<User>,
    options?: PaginateOptions
  ): Promise<PaginatedResolveResult<User>>;
}

UserSchema.index({ name: -1, _id: -1 });
UserSchema.index({ email: -1, _id: -1 });
UserSchema.index({ lastLoginAt: -1, _id: -1 });
UserSchema.index({ userRole: -1, _id: -1 });
pluginPagination(UserSchema);

export default mongoose.model<User, UserModel>('User', UserSchema);
