/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLString, GraphQLObjectType, GraphQLBoolean } from 'graphql';
import { DecodedIdToken } from 'firebase-admin/auth';
import {
  User as UserSchema,
  Mentor as MentorSchema,
  Subject as SubjectSchema,
  MentorConfig as MentorConfigModel,
} from '../../models';
import {
  UserAccessTokenType,
  UserAccessToken,
  generateJwtToken,
  setTokenCookie,
  generateRefreshToken,
} from '../types/user-access-token';
import { notifyAdminNewMentors } from '../../utils/email-admin';
import { Response } from 'express';

export enum LoginType {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP',
}

export const loginFirebase = {
  type: UserAccessTokenType,
  args: {
    mentorConfig: { type: GraphQLString },
    lockMentorToConfig: { type: GraphQLBoolean },
    loginType: { type: GraphQLString },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: {
      mentorConfig: string;
      lockMentorToConfig: boolean;
      loginType: LoginType;
    },
    context: {
      firebaseUser: DecodedIdToken;
      res: Response;
    }
  ): Promise<UserAccessToken> => {
    try {
      if (!context.firebaseUser) {
        throw new Error('Not authenticated');
      }
      const { firebaseUser } = context;
      console.log(JSON.stringify(firebaseUser, null, 2));
      const signUp = args.loginType === LoginType.SIGN_UP;
      let user = await UserSchema.findOneAndUpdate(
        {
          firebaseId: firebaseUser.uid,
        },
        {
          $set: {
            firebaseId: firebaseUser.uid,
            name: firebaseUser.name,
            email: firebaseUser.email,
            lastLoginAt: new Date(),
          },
        },
        {
          new: true,
          upsert: signUp,
        }
      );
      if (!user) {
        throw new Error('No user found');
      }
      if (user.isDisabled) {
        throw new Error('Your account has been disabled');
      }
      // Create/Migrate mentor to user model
      if (!user.mentorIds.length) {
        // add any required subjects to mentor
        const requiredSubjects = await SubjectSchema.find({ isRequired: true });

        const mentorConfig = args.mentorConfig
          ? await MentorConfigModel.findOne({ configId: args.mentorConfig })
          : undefined;
        const configUpdates = {
          ...(mentorConfig?.subjects.length
            ? {
                subjects: requiredSubjects
                  .map((s) => s._id)
                  .concat(mentorConfig.subjects),
              }
            : {}),
          ...(mentorConfig?.publiclyVisible ? { isPrivate: false } : {}),
          ...(mentorConfig?.mentorType
            ? { mentorType: mentorConfig.mentorType }
            : {}),
          ...(mentorConfig?.orgPermissions.length
            ? { orgPermissions: mentorConfig.orgPermissions }
            : {}),
          ...(mentorConfig
            ? {
                mentorConfig: mentorConfig._id,
                lockedToConfig: Boolean(args.lockMentorToConfig),
              }
            : {}),
        };
        const newMentor = await MentorSchema.findOneAndUpdate(
          {
            user: user._id,
          },
          {
            $set: {
              name: firebaseUser.name,
              firstName: firebaseUser.firstName || '',
              email: firebaseUser.email,
              subjects: requiredSubjects.map((s) => s._id),
              ...configUpdates,
            },
          },
          {
            new: true,
            upsert: true,
          }
        );
        const notifyAdmin = process.env.NOTIFY_ADMIN_ON_NEW_MENTOR == 'true';
        if (notifyAdmin) {
          await notifyAdminNewMentors();
        }
        const mentorId = newMentor._id;
        user = await UserSchema.findOneAndUpdate(
          {
            firebaseId: firebaseUser.uid,
          },
          {
            $set: {
              mentorIds: [mentorId],
            },
          },
          {
            new: true,
          }
        );
      }
      // authentication successful so generate jwt and refresh tokens
      const jwtToken = await generateJwtToken(user);
      const refreshToken = await generateRefreshToken(user);
      setTokenCookie(context.res, refreshToken.token);
      return jwtToken;
    } catch (error) {
      throw new Error(error);
    }
  },
};

export default loginFirebase;
