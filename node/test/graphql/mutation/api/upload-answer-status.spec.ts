/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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
import { getToken } from '../../../helpers';

describe('uploadTaskUpdate', () => {
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

  it(`throws an error if no api key`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation UpdateUploadTask($mentorId: ID!, $questionId: ID!, $status: UploadTaskInputType!) {
          api {
            uploadTaskUpdate(mentorId: $mentorId, questionId: $questionId, status: $status)
          }
        }`,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          status: { taskId: 'task_id', uploadStatus: 'TRANSCRIBE_IN_PROGRESS' },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`throws an error if invalid api key`, async () => {
    const response = await request(app)
      .post('/graphql')
      .set('mentor-graphql-req', 'true')
      .set('Authorization', `bearer asdfdsadf`)
      .send({
        query: `mutation UpdateUploadTask($mentorId: ID!, $questionId: ID!, $status: UploadTaskInputType!) {
          api {
            uploadTaskUpdate(mentorId: $mentorId, questionId: $questionId, status: $status)
          }
        }`,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          status: { taskId: 'task_id', uploadStatus: 'TRANSCRIBE_IN_PROGRESS' },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`doesn't accept unaccepted fields`, async () => {
    const response = await request(app)
      .post('/graphql')
      .set('mentor-graphql-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `mutation UpdateUploadTask($mentorId: ID!, $questionId: ID!, $status: UploadTaskInputType!) {
          api {
            uploadTaskUpdate(mentorId: $mentorId, questionId: $questionId, status: $status, hello: "hi")
          }
        }`,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          status: { taskId: 'task_id', uploadStatus: 'TRANSCRIBE_IN_PROGRESS' },
        },
      });
    expect(response.status).to.equal(400);
  });

  it(`doesn't accept invalid fields`, async () => {
    const response = await request(app)
      .post('/graphql')
      .set('mentor-graphql-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `mutation UpdateUploadTask($mentorId: ID!, $questionId: ID!, $status: UploadTaskInputType!) {
          api {
            uploadTaskUpdate(mentorId: $mentorId, questionId: $questionId, status: $status)
          }
        }`,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          status: 'no thanks',
        },
      });
    expect(response.status).to.equal(500);
  });

  it('updates upload task', async () => {
    const update = await request(app)
      .post('/graphql')
      .set('mentor-graphql-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `mutation UpdateUploadTask($mentorId: ID!, $questionId: ID!, $status: UploadTaskInputType!) {
          api {
            uploadTaskUpdate(mentorId: $mentorId, questionId: $questionId, status: $status)
          }
        }`,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          status: {
            taskId: 'task_id',
            uploadStatus: 'DONE',
            transcript: 'My name is Clinton Anderson',
            media: [{ type: 'video', tag: 'web', url: 'video.mp4' }],
          },
        },
      });
    expect(update.status).to.equal(200);
    expect(update.body.data.api.uploadTaskUpdate).to.eql(true);

    const token = getToken('5ffdf41a1ee2c62320b49ea1');
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
    expect(response.body.data.me.uploadTasks).to.eql([
      {
        mentor: '5ffdf41a1ee2c62111111111',
        question: '511111111111111111111112',
        uploadStatus: 'DONE',
        transcript: 'My name is Clinton Anderson',
        media: [
          {
            type: 'video',
            tag: 'web',
            url: 'https://static.mentorpal.org/video.mp4',
          },
        ],
      },
    ]);
  });

  it('creates upload task', async () => {
    const update = await request(app)
      .post('/graphql')
      .set('mentor-graphql-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `mutation UpdateUploadTask($mentorId: ID!, $questionId: ID!, $status: UploadTaskInputType!) {
          api {
            uploadTaskUpdate(mentorId: $mentorId, questionId: $questionId, status: $status)
          }
        }`,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111113',
          status: { taskId: 'task_id', uploadStatus: 'TRANSCRIBE_IN_PROGRESS' },
        },
      });
    expect(update.status).to.equal(200);
    expect(update.body.data.api.uploadTaskUpdate).to.eql(true);

    const token = getToken('5ffdf41a1ee2c62320b49ea1');
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
    expect(response.body.data.me.uploadTasks).to.eql([
      {
        mentor: '5ffdf41a1ee2c62111111111',
        question: '511111111111111111111112',
        uploadStatus: 'TRANSCRIBE_IN_PROGRESS',
        transcript: null,
        media: [],
      },
      {
        mentor: '5ffdf41a1ee2c62111111111',
        question: '511111111111111111111113',
        uploadStatus: 'TRANSCRIBE_IN_PROGRESS',
        transcript: null,
        media: [],
      },
    ]);
  });
});
