/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import { describe } from 'mocha';
import mongoUnit from 'mongo-unit';
import request from 'supertest';

describe('mentor', () => {
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

  it(`throws an error if invalid id`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query {
          mentor(id: "111111111111111111111111") {
            _id
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'mentor not found for args "{"id":"111111111111111111111111"}"'
    );
  });

  it(`provides the mentor's thumbnail`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query MentorThumbnail($id: ID!) {
          mentor(id: $id) {
            _id
            thumbnail
          }
      }`,
        variables: { id: '5ffdf41a1ee2c62111111111' },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.mentor).to.eql({
      _id: '5ffdf41a1ee2c62111111111',
      thumbnail:
        'https://static.mentorpal.org/mentor/thumbnails/5ffdf41a1ee2c62111111111-20210621T000000.png',
    });
  });

  it('gets a mentor by id', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query {
          mentor(id: "5ffdf41a1ee2c62111111111") {
            _id
            name
            firstName
            title
            subjects {
              _id
              name
            }
          }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.mentor).to.eql({
      _id: '5ffdf41a1ee2c62111111111',
      name: 'Clinton Anderson',
      firstName: 'Clint',
      title: "Nuclear Electrician's Mate",
      subjects: [
        {
          _id: '5ffdf41a1ee2c62320b49eb2',
          name: 'Background',
        },
        {
          _id: '5ffdf41a1ee2c62320b49eb1',
          name: 'Repeat After Me',
        },
      ],
    });
  });

  it('mentor/subjects gets all subjects for mentor in alphabetical order', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query {
        mentor(id: "5ffdf41a1ee2c62111111112") {
          subjects {
            name
          }
        }
      }
    `,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.mentor).to.eql({
      subjects: [
        {
          name: 'Background',
        },
        {
          name: 'Repeat After Me',
        },
        {
          name: 'STEM',
        },
      ],
    });
  });

  it('mentor/answers gets answers for all questions', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query {
        mentor(id: "5ffdf41a1ee2c62111111111") {
          name
          answers {
            question
            transcript
            status
          }
        }
      }
    `,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.mentor).to.eql({
      name: 'Clinton Anderson',
      answers: [
        {
          question: '511111111111111111111112',
          transcript: '',
          status: 'INCOMPLETE',
        },
        {
          question: '511111111111111111111113',
          transcript: '',
          status: 'INCOMPLETE',
        },
        {
          question: '511111111111111111111114',
          transcript: '',
          status: 'INCOMPLETE',
        },
        {
          question: '511111111111111111111116',
          status: 'INCOMPLETE',
          transcript: '',
        },
        {
          question: '511111111111111111111117',
          status: 'COMPLETE',
          transcript: 'Test Transcript',
        },
        {
          question: '511111111111111111111111',
          transcript: '[being still]',
          status: 'COMPLETE',
        },
      ],
    });
  });

  it('gets media for a mentor answer', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query {
        mentor(id: "5ffdf41a1ee2c62111111111") {
          name
          answers {
            transcript
            media {
              type
              tag
              url
            }
          }
        }
      }
    `,
      });
    expect(response.status).to.equal(200);
    const answers = response.body.data.mentor.answers.filter(
      (a: any) => a.transcript !== ''
    );
    expect(answers).to.eql([
      {
        transcript: 'Test Transcript',
        media: [
          {
            type: 'video',
            tag: 'web',
            url: `${process.env.STATIC_URL_BASE}/videos/5ffdf41a1ee2c62111111111/511111111111111111111117/web.mp4`,
          },
          {
            type: 'video',
            tag: 'mobile',
            url: `${process.env.STATIC_URL_BASE}/videos/5ffdf41a1ee2c62111111111/511111111111111111111117/mobile.mp4`,
          },
        ],
      },
      {
        transcript: '[being still]',
        media: [
          {
            type: 'video',
            tag: 'web',
            url: `${process.env.STATIC_URL_BASE}/videos/5ffdf41a1ee2c62111111111/511111111111111111111111/web.mp4`,
          },
          {
            type: 'video',
            tag: 'mobile',
            url: `${process.env.STATIC_URL_BASE}/videos/5ffdf41a1ee2c62111111111/511111111111111111111111/mobile.mp4`,
          },
        ],
      },
    ]);
  });

  it('can get mentor by mentorId', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
        query Mentor($id: ID!) {
          mentor(id: $id) {
            _id
          }
        }
      `,
        variables: {
          id: '5ffdf41a1ee2c62111111111',
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.mentor).to.eql({
      _id: '5ffdf41a1ee2c62111111111',
    });
  });
});
