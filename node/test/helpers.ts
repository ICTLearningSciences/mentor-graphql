/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import path from 'path';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import sinon from 'sinon';
import * as app from 'app';
import { DecodedIdToken } from 'firebase-admin/auth';
import * as helpers from '../src/gql/middleware-helpers';

export function fixturePath(p: string): string {
  return path.join(__dirname, 'fixtures', p);
}

// duration of access token in seconds before it expires
export function accessTokenDuration(): number {
  return process.env.ACCESS_TOKEN_LENGTH
    ? parseInt(process.env.ACCESS_TOKEN_LENGTH)
    : 60 * 60 * 24 * 90;
}

export function mockSetCookie(
  name: string,
  value: string,
  days: number
): string {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  const result = name + '=' + (value || '') + expires + '; path=/';
  return result;
}
export function mockGetCookie(cookieInfo: string, name: string): string | null {
  const nameEQ = name + '=';
  const ca = cookieInfo.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function getToken(userId: string, expiresIn?: number): string {
  if (!expiresIn) {
    expiresIn = accessTokenDuration();
  }
  const expirationDate = new Date(Date.now() + expiresIn * 1000);
  const accessToken = jwt.sign(
    { id: userId, expirationDate },
    process.env.JWT_SECRET || '',
    { expiresIn: expirationDate.getTime() - new Date().getTime() }
  );
  return accessToken;
}

export async function getFirebaseToken(
  user: Partial<DecodedIdToken>
): Promise<string> {
  const emptyToken: DecodedIdToken = {
    uid: '',
    aud: '',
    auth_time: 0,
    user_id: '',
    sub: '',
    iat: 0,
    exp: 0,
    email: '',
    email_verified: false,
    firebase: {
      sign_in_provider: '',
      identities: {},
    },
    iss: '',
  };
  sinon.restore();
  sinon.stub(helpers, 'getFirebaseUserFromReqAccessToken').returns(
    new Promise((resolve) =>
      resolve({
        ...emptyToken,
        ...user,
      })
    )
  );
  return 'token';
}

export const USER_DEFAULT = '5ffdf41a1ee2c62320b49ea1';
export async function gqlWithAuth(
  app: Express,
  gql: string | Record<string, string>,
  user: string = USER_DEFAULT
): Promise<request.Response> {
  const token = getToken(user);
  return await request(app)
    .post('/graphql')
    .set('Authorization', `bearer ${token}`)
    .send(gql);
}

export async function appStart(
  fixtureMongoData = 'test/fixtures/mongodb/data-default.js'
): Promise<Express> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await mongoUnit.load(require(fixtureMongoData));
  const inst = await app.createApp();
  await app.appStart();
  return inst;
}

export async function appStop(): Promise<void> {
  await app.appStop();
  await mongoUnit.drop();
}

export enum UseDefaultTopics {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  DEFAULT = 'DEFAULT',
}
