/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';
import { getFirebaseToken, getToken } from '../../helpers';
import { DecodedIdToken } from 'firebase-admin/auth';

describe('login firebase', () => {
  let app: Express;
  beforeEach(async () => {
    await mongoUnit.load(require('test/fixtures/mongodb/data-default.js'));
    app = await createApp();
    await appStart();
  });

  afterEach(async () => {
    await appStop();
    await mongoUnit.drop();
  });

  it(`can log in`, async () => {
    const token = await getFirebaseToken({
      uid: '5ffdf1231ee2c62320b49e99',
      name: 'test',
      email: '123@gmaikl.com',
    });

    const fetchResult = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation LoginFirebase($mentorConfig: String, $lockMentorToConfig: Boolean) {
          loginFirebase(mentorConfig: $mentorConfig, lockMentorToConfig: $lockMentorToConfig, loginType: "SIGN_IN") {
            user {
              name
              email
            }
            accessToken
            expirationDate
          }
        }`,
      });
    expect(fetchResult.status).to.equal(200);
    expect(fetchResult.body.data.loginFirebase.user.name).to.eql('test');
  });

  it(`creates a new user using mentor config passed in`, async () => {
    const firebaseUser = {
      uid: '5ffdf1231ee2c62220b49e49',
      name: 'test',
      email: '123@gmail.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = await getFirebaseToken(firebaseUser);

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation LoginFirebase($mentorConfig: String, $lockMentorToConfig: Boolean){
        loginFirebase(mentorConfig: $mentorConfig, lockMentorToConfig: $lockMentorToConfig, loginType: "SIGN_UP") {
          user {
            name
            email
          }
          accessToken
          expirationDate
        }
      }`,
        variables: {
          mentorConfig: '2023TestConfig',
          lockMentorToConfig: true,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'data.loginFirebase.user.name',
      'test'
    );
    expect(response.body).to.have.deep.nested.property(
      'data.loginFirebase.user.email',
      '123@gmail.com'
    );

    const response2 = await request(app)
      .post('/graphql')
      .send({
        query: `query Mentors($filter: Object){
          mentors(filter: $filter){
            edges{
              node{
                name
                isPublicApproved
                isPrivate
                mentorType
                orgPermissions{
                  orgId
                  orgName
                  viewPermission
                  editPermission
                }
                subjects{
                  _id
                  name
                }
                mentorConfig {
                  configId
                  subjects
                  publiclyVisible
                  mentorType
                  orgPermissions{
                    org
                    viewPermission
                    editPermission
                  }
                }
                lockedToConfig
              }
            }
          }
        }`,
        // variables: {
        //   filter: {
        //     email: '123@gmail.com',
        //   },
        // },
      });
    expect(response2.status).to.equal(200);
    expect(response2.body).to.have.deep.nested.property(
      'data.mentors.edges[0].node.name',
      'test'
    );
    expect(
      response2.body.data.mentors.edges[0].node.subjects
    ).to.deep.include.members([
      {
        _id: '5ffdf41a1ee2c62320b49eb2',
        name: 'Background',
      },
      {
        _id: '5ffdf41a1ee2c62320b49eb1',
        name: 'Repeat After Me',
      },
      {
        _id: '5ffdf41a1ee2c62320b49eb3',
        name: 'STEM',
      },
    ]);
    expect(response2.body.data.mentors.edges[0].node.isPrivate).to.equal(false);
    expect(response2.body.data.mentors.edges[0].node.lockedToConfig).to.equal(
      true
    );
    expect(response2.body.data.mentors.edges[0].node.mentorType).to.equal(
      'CHAT'
    );
    expect(
      response2.body.data.mentors.edges[0].node.mentorConfig
    ).to.deep.equal({
      configId: '2023TestConfig',
      subjects: ['5ffdf41a1ee2c62320b49eb3'],
      publiclyVisible: true,
      mentorType: 'CHAT',
      orgPermissions: [
        {
          org: '511111111111111111111111',
          viewPermission: 'HIDDEN',
          editPermission: 'HIDDEN',
        },
      ],
    });
  });
});
