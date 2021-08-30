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
import { getToken } from 'test/helpers';

describe('uploadTaskDelete', () => {
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

  it(`throws an error if not logged in`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation DeleteUploadTask($questionId: ID!) {
        me {
          uploadTaskDelete(questionId: $questionId)
        }
      }`,
        variables: { questionId: '511111111111111111111112' },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`throws an error if user does not have a mentor`, async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea4');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation DeleteUploadTask($questionId: ID!) {
          me {
            uploadTaskDelete(questionId: $questionId)
          }
        }`,
        variables: { questionId: '511111111111111111111112' },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'you do not have a mentor'
    );
  });

  it(`throws an error if no questionId`, async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation DeleteUploadTask($questionId: ID!) {
          me {
            uploadTaskDelete()
          }
        }`,
        variables: { questionId: '511111111111111111111112' },
      });
    expect(response.status).to.equal(400);
  });

  it('does not accept api key user', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('mentor-graphql-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `mutation DeleteUploadTask($questionId: ID!) {
          me {
            uploadTaskDelete(questionId: $questionId)
          }
        }`,
        variables: {
          questionId: '511111111111111111111112',
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'you do not have a mentor'
    );
  });

  it('mentor deletes an upload task', async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const update = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation DeleteUploadTask($questionId: ID!) {
          me {
            uploadTaskDelete(questionId: $questionId)
          }
        }`,
        variables: {
          questionId: '511111111111111111111112',
        },
      });
    expect(update.status).to.equal(200);
    expect(update.body.data.me.uploadTaskDelete).to.eql(true);

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
            me {
              uploadTasks {
                mentor
                question
                uploadStatus
                transcript
                media {
                  type
                  tag
                  url
                }
              }
            }
          }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.uploadTasks).to.eql([]);
  });

  it(`returns false if question does not exist`, async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
        me {
          uploadTaskDelete(questionId: "511111111111111111999999")
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.uploadTaskDelete).to.eql(null);
  });
});
