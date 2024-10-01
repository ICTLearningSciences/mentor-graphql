/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import passport from 'passport';
import { graphqlHTTP } from 'express-graphql';
import { Request, Response } from 'express';
import schema from './schema';
import { User } from '../models/User';
import OrganizationModel, { Organization } from '../models/Organization';
import { getRefreshedToken } from './types/user-access-token';
import { logger } from '../utils/logging';
import { getFirebaseUserFromReqAccessToken } from './middleware-helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extensions = ({ context }: any) => {
  return {
    newToken: context.newToken ? context.newToken : '',
  };
};

function isApiReq(req: Request): boolean {
  return Boolean(req.headers['mentor-graphql-req']);
}

async function getOrg(
  req: Request,
  next: (user: User, org: Organization, newToken?: string) => void,
  user: User,
  jwtToken = ''
) {
  try {
    const origin = req.header('origin');
    if (origin) {
      const subdomain = /:\/\/([^\/]+)/.exec(origin)[1].split('.')[0];
      const org = await OrganizationModel.findOne({ subdomain });
      return next(user, org, jwtToken);
    } else {
      return next(user, null, jwtToken);
    }
  } catch (err) {
    return next(user, null, jwtToken);
  }
}

async function refreshToken(
  req: Request,
  next: (user: User, org: Organization, newToken?: string) => void
) {
  try {
    logger.debug('refreshing token');
    const token = req.cookies[process.env.REFRESH_TOKEN_NAME];
    if (!token) {
      logger.debug('refresh token not found');
      return getOrg(req, next, null);
    }
    const { jwtToken, user } = await getRefreshedToken(token);
    if (user) {
      return getOrg(req, next, user, jwtToken);
    } else {
      logger.warn("couldn't get user");
      return getOrg(req, next, null);
    }
  } catch (err) {
    logger.warn(
      `couldn't refresh token ${req.cookies[process.env.REFRESH_TOKEN_NAME]}`
    );
    logger.error(err);
    return getOrg(req, next, null);
  }
}

export default graphqlHTTP((req: Request, res: Response) => {
  return new Promise(async (resolve) => {
    const authHeader = req.headers.authorization;
    const firebaseUser = await getFirebaseUserFromReqAccessToken(authHeader);
    const next = (user: User, org: Organization, newToken = '') => {
      resolve({
        schema,
        ...(!process.env.NODE_ENV?.includes('prod') && {
          graphiql: { headerEditorEnabled: true },
        }),
        context: {
          firebaseUser: firebaseUser || null,
          user: user || null,
          org: org || null,
          newToken: newToken || '',
          res: res,
          req: req,
        },
        extensions,
      });
    };
    /**
     * Try to authenticate using passport,
     * but never block the call from here.
     */
    const authType = isApiReq(req) ? 'bearer' : 'jwt';
    passport.authenticate(
      authType,
      { session: false },
      (err: string, user: User) => {
        if (err === 'token expired' || !user) {
          refreshToken(req, next);
        } else {
          getOrg(req, next, user);
        }
      }
    )(req, res, next);
  });
});
