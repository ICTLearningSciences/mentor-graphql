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

describe('uploadVideo', () => {
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
    const response = await request(app).post('/graphql').send({
      query: `mutation {
        me {
          uploadVideo(mentorId: "", questionId: "", video: "") {
            _id
          }
        }
      }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`throws an error if mentor is not the user's`, async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea2');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            uploadVideo(mentorId: "5ffdf41a1ee2c62320b49ea1", questionId: "A1", video: "A1") {
              _id
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'you do not have permission to update this mentor'
    );
  });

  it(`throws an error if no mentorId`, async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            uploadVideo(questionId: "A1", video: "A1") {
              _id
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param mentorId'
    );
  });

  it(`throws an error if no questionId`, async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            uploadVideo(mentorId: "5ffdf41a1ee2c62320b49ea1", video: "A1") {
              _id
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param questionId'
    );
  });

  it(`throws an error if no video`, async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            uploadVideo(mentorId: "5ffdf41a1ee2c62320b49ea1", questionId: "A1") {
              _id
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param video'
    );
  });

  it(`throws an error if questionId is invalid`, async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            uploadVideo(mentorId: "5ffdf41a1ee2c62320b49ea1", questionId: "D1", video: "A1") {
              _id
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'no question with id D1'
    );
  });

  it('uploads a video', async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            uploadVideo(mentorId: "5ffdf41a1ee2c62320b49ea1", questionId: "A1", video: "A1") {
              _id
              name
              firstName
              title
              subjects {
                _id
                name
              }
              questions {
                id
                question
                status
                video
                subject {
                  _id
                  name
                }
                topics {
                  _id
                  name
                }
              }  
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.uploadVideo).to.eql({
      _id: '5ffdf41a1ee2c62320b49ea1',
      name: 'Clinton Anderson',
      firstName: 'Clint',
      title: "Nuclear Electrician's Mate",
      subjects: [
        {
          _id: '5ffdf41a1ee2c62320b49eb1',
          name: 'Repeat After Me',
        },
        {
          _id: '5ffdf41a1ee2c62320b49eb2',
          name: 'Background',
        },
      ],
      questions: [
        {
          id: 'A1',
          question: "Don't talk and stay still.",
          status: 'Incomplete',
          video:
            'https://video.mentorpal.org/videos/mentors/clint/web/clintanderson_U1_1_1.mp4',
          subject: {
            _id: '5ffdf41a1ee2c62320b49eb1',
            name: 'Repeat After Me',
          },
          topics: [
            {
              _id: '5ffdf41a1ee2c62320b49ec1',
              name: 'Idle',
            },
          ],
        },
        {
          id: 'B1',
          question: 'Who are you and what do you do?',
          status: 'Incomplete',
          video: null,
          subject: {
            _id: '5ffdf41a1ee2c62320b49eb2',
            name: 'Background',
          },
          topics: [
            {
              _id: '5ffdf41a1ee2c62320b49ec2',
              name: 'Background',
            },
          ],
        },
      ],
    });
  });
});
