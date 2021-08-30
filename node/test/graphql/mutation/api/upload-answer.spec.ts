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

const answerMutation = `mutation UploadAnswer($mentorId: ID!, $questionId: ID!, $answer: UploadAnswerType!) {
  api {
    uploadAnswer(mentorId: $mentorId, questionId: $questionId, answer: $answer)
  }
}`;

describe('uploadAnswer', () => {
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
        query: answerMutation,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          answer: {},
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
        query: answerMutation,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          answer: {},
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
        query: `mutation UploadAnswer($mentorId: ID!, $questionId: ID!, $answer: UploadAnswerType!) {
          api {
            uploadAnswer(mentorId: $mentorId, questionId: $questionId, answer: $answer, hello: "hi")
          }
        }`,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          answer: {},
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
        query: answerMutation,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          answer: 'no',
        },
      });
    expect(response.status).to.equal(500);
  });

  it('updates answer transcript', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('mentor-graphql-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: answerMutation,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          answer: {
            transcript:
              "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.api.uploadAnswer).to.eql(true);
    const r2 = await request(app)
      .post('/graphql')
      .send({
        query: `query {
          mentor(id: "5ffdf41a1ee2c62111111111") {
            answers {
              transcript
              status
              media {
                type
                tag
                url
              }
              question
            }
          }
      }`,
      });
    expect(r2.status).to.equal(200);
    const updatedAnswer = r2.body.data.mentor.answers.find(
      (a: any) => a.question === '511111111111111111111112'
    );
    expect(updatedAnswer).to.eql({
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      status: 'COMPLETE',
      media: [],
      question: '511111111111111111111112',
    });
  });

  it('uploads video with transcript', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('mentor-graphql-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: answerMutation,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          answer: {
            transcript:
              "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
            media: [
              {
                type: 'video',
                tag: 'web',
                url: `${process.env.STATIC_URL_BASE}/video.mp4`,
              },
            ],
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.api.uploadAnswer).to.eql(true);
    const r2 = await request(app)
      .post('/graphql')
      .send({
        query: `query {
          mentor(id: "5ffdf41a1ee2c62111111111") {
            answers {
              transcript
              status
              media {
                type
                tag
                url
              }
              question
            }
          }
      }`,
      });
    expect(r2.status).to.equal(200);
    const updatedAnswer = r2.body.data.mentor.answers.find(
      (a: any) => a.question === '511111111111111111111112'
    );
    expect(updatedAnswer).to.eql({
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      status: 'COMPLETE',
      media: [
        {
          type: 'video',
          tag: 'web',
          url: `${process.env.STATIC_URL_BASE}/video.mp4`,
        },
      ],
      question: '511111111111111111111112',
    });
  });

  it('sets needsTransfer to false for any relative media path', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('mentor-graphql-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: answerMutation,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          answer: {
            transcript:
              "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
            media: [
              {
                type: 'video',
                tag: 'web',
                url: `video.mp4`,
              },
            ],
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.api.uploadAnswer).to.eql(true);
    const answer = await request(app)
      .post('/graphql')
      .send({
        query: `query Answer($mentor: ID!, $question: ID!) {
          answer(mentor: $mentor, question: $question) {
            hasUntransferredMedia
            media {
              type
              tag
              url
              needsTransfer
            }
          }
        }`,
        variables: {
          mentor: '5ffdf41a1ee2c62111111111',
          question: '511111111111111111111112',
        },
      });
    expect(answer.status).to.equal(200);
    expect(answer.body.data.answer).to.eql({
      hasUntransferredMedia: false,
      media: [
        {
          type: 'video',
          tag: 'web',
          url: `${process.env.STATIC_URL_BASE}/video.mp4`,
          needsTransfer: false,
        },
      ],
    });
  });

  it('sets needsTransfer to true for any absolute media url that is not the current-site static domain', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('mentor-graphql-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: answerMutation,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          answer: {
            transcript:
              "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
            media: [
              {
                type: 'video',
                tag: 'web',
                url: `https://different.mentorpal.org/video.mp4`,
              },
            ],
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.api.uploadAnswer).to.eql(true);
    const answer = await request(app)
      .post('/graphql')
      .send({
        query: `query Answer($mentor: ID!, $question: ID!) {
      answer(mentor: $mentor, question: $question) {
        hasUntransferredMedia
        media {
          type
          tag
          url
          needsTransfer
        }
      }
    }`,
        variables: {
          mentor: '5ffdf41a1ee2c62111111111',
          question: '511111111111111111111112',
        },
      });
    expect(answer.status).to.equal(200);
    expect(answer.body.data.answer).to.eql({
      hasUntransferredMedia: true,
      media: [
        {
          type: 'video',
          tag: 'web',
          url: `https://different.mentorpal.org/video.mp4`,
          needsTransfer: true,
        },
      ],
    });
  });

  it('parses absolute urls for the current site domain and makes them relative', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('mentor-graphql-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: answerMutation,
        variables: {
          mentorId: '5ffdf41a1ee2c62111111111',
          questionId: '511111111111111111111112',
          answer: {
            transcript:
              "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
            media: [
              {
                type: 'video',
                tag: 'web',
                url: `${process.env.STATIC_URL_BASE}/video.mp4`,
              },
            ],
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.api.uploadAnswer).to.eql(true);
    const answer = await request(app)
      .post('/graphql')
      .send({
        query: `query Answer($mentor: ID!, $question: ID!) {
        answer(mentor: $mentor, question: $question) {
          hasUntransferredMedia
          media {
            type
            tag
            url
            needsTransfer
          }
        }
      }`,
        variables: {
          mentor: '5ffdf41a1ee2c62111111111',
          question: '511111111111111111111112',
        },
      });
    expect(answer.status).to.equal(200);
    expect(answer.body.data.answer).to.eql({
      hasUntransferredMedia: false,
      media: [
        {
          type: 'video',
          tag: 'web',
          url: `${process.env.STATIC_URL_BASE}/video.mp4`,
          needsTransfer: false,
        },
      ],
    });
  });
});
