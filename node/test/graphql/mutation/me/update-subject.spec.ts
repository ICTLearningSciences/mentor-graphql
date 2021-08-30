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

describe('updateSubject', () => {
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
        query: `mutation {
          me {
            updateSubject(subject: {}) {
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

  it(`throws an error if no subject`, async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSubject {
              _id
            }
          }
        }`,
      });
    expect(response.status).to.equal(400);
  });

  it('updates subject', async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const subject = JSON.stringify({
      _id: '5ffdf41a1ee2c62320b49eb3',
      name: 'stem',
      categories: [
        {
          id: 'newcategory',
          name: 'New category',
        },
      ],
      topics: [
        {
          id: 'advice',
          name: 'Advice',
          description: 'updated description?',
        },
        {
          id: 'newtopic',
          name: 'New topic',
          description: 'new description',
        },
      ],
      questions: [
        {
          question: {
            _id: '511111111111111111111113',
            question: 'How old are you?',
          },
          category: 'newcategory',
          topics: ['newtopic', 'advice'],
        },
        {
          question: {
            question: 'new question',
          },
          topics: ['advice'],
        },
      ],
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSubject(subject: ${subject}) {
              _id
              name
              description
              isRequired
              categories {
                id
                name
              }
              topics {
                id
                name
                description
              }
              questions {
                question {
                  question
                }
                category
                topics
              }
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateSubject).to.eql({
      _id: '5ffdf41a1ee2c62320b49eb3',
      name: 'stem',
      description: 'These questions will ask about STEM careers.',
      isRequired: false,
      categories: [
        {
          id: 'newcategory',
          name: 'New category',
        },
      ],
      topics: [
        {
          id: 'advice',
          name: 'Advice',
          description: 'updated description?',
        },
        {
          id: 'newtopic',
          name: 'New topic',
          description: 'new description',
        },
      ],
      questions: [
        {
          question: {
            question: 'How old are you?',
          },
          category: 'newcategory',
          topics: ['newtopic', 'advice'],
        },
        {
          question: { question: 'new question' },
          category: null,
          topics: ['advice'],
        },
      ],
    });
  });

  it('creates a new subject', async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const subject = JSON.stringify({
      name: '_new',
      description: 'new subject description',
      topics: [],
      questions: [
        {
          question: {
            question: 'new question',
          },
          topics: ['advice'], // shouldn't add this one (id not in subject topics list)
        },
        // shouldn't add this one (empty question)
        {
          question: {
            question: '',
          },
          topics: [],
        },
      ],
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSubject(subject: ${subject}) {
              name
              description
              isRequired
              categories {
                id
                name
              }
              topics {
                id
                name
                description
              }
              questions {
                question {
                  question
                }
                category
                topics
              }
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateSubject).to.eql({
      name: '_new',
      description: 'new subject description',
      isRequired: false,
      categories: [],
      topics: [],
      questions: [
        {
          question: { question: 'new question' },
          category: null,
          topics: [],
        },
      ],
    });
  });

  it('can create very large subjects', async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const subject = require('test/fixtures/large-subject.json');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateSubject($subject: SubjectUpdateInputType!) {
          me {
            updateSubject(subject: $subject) {
              _id
              name
              description
              isRequired
              categories {
                id
                name
              }
              topics {
                id
                name
                description
              }
              questions {
                question {
                  question
                }
                category
                topics
              }
            }
          }
        }`,
        variables: {
          subject: subject,
        },
      });
    expect(response.status).to.equal(200);
  });
});
