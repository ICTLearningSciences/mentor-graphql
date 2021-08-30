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

describe('subject', () => {
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
          subject(id: "111111111111111111111111") {
            _id
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'subject not found for args "{"id":"111111111111111111111111"}"'
    );
  });

  it('gets a subject by id', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query {
          subject(id: "5ffdf41a1ee2c62320b49eb1") {
            _id
            name
            description
          }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.subject).to.eql({
      _id: '5ffdf41a1ee2c62320b49eb1',
      name: 'Repeat After Me',
      description: "These are miscellaneous phrases you'll be asked to repeat.",
    });
  });

  it('get default categories, topics, and questions in subject', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query {
          subject(id: "5ffdf41a1ee2c62320b49eb2") {
            categories {
              name
            }
            topics {
              name
            }
            questions(mentor: "") {
              category
              topics
              question {
                question
              }
            }
          }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.subject.categories).to.eql([
      {
        name: 'Category',
      },
    ]);
    expect(response.body.data.subject.topics).to.eql([
      {
        name: 'Background',
      },
      {
        name: 'Advice',
      },
    ]);
    expect(response.body.data.subject.questions).to.eql([
      {
        question: {
          question: 'Who are you and what do you do?',
        },
        category: null,
        topics: ['background'],
      },
      {
        question: {
          question: 'How old are you?',
        },
        category: 'category',
        topics: ['background'],
      },
      {
        question: {
          question: 'Do you like your job?',
        },
        category: null,
        topics: ['advice'],
      },
      {
        question: {
          question: 'What is Aaron like?',
        },
        category: 'category',
        topics: [],
      },
    ]);
  });

  it('get mentor specific questions for a mentor', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query {
          subject(id: "5ffdf41a1ee2c62320b49eb2") {
            categories {
              name
            }
            topics {
              name
            }
            questions(mentor: "5ffdf41a1ee2c62111111112") {
              category
              topics
              question {
                question
              }
            }
          }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.subject.categories).to.eql([
      {
        name: 'Category',
      },
    ]);
    expect(response.body.data.subject.topics).to.eql([
      {
        name: 'Background',
      },
      {
        name: 'Advice',
      },
    ]);
    expect(response.body.data.subject.questions).to.eql([
      {
        question: {
          question: 'Who are you and what do you do?',
        },
        category: null,
        topics: ['background'],
      },
      {
        question: {
          question: 'How old are you?',
        },
        category: 'category',
        topics: ['background'],
      },
      {
        question: {
          question: 'Do you like your job?',
        },
        category: null,
        topics: ['advice'],
      },
      {
        question: {
          question: 'Julia?',
        },
        category: null,
        topics: [],
      },
      {
        question: {
          question: 'What is Aaron like?',
        },
        category: 'category',
        topics: [],
      },
    ]);
  });
});
