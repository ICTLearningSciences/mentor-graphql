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

describe('updateMentorKeywords', () => {
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
        query: `mutation UpdateMentorKeywords($keywords: [UpdateKeywordType]) {
          me {
            updateMentorKeywords(keywords: $keywords)
          }
        }`,
        variables: { keywords: [] },
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
        query: `mutation UpdateMentorKeywords($keywords: [UpdateKeywordType]) {
          me {
            updateMentorKeywords(keywords: $keywords)
          }
        }`,
        variables: { keywords: [] },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'invalid mentor'
    );
  });

  it('updates and creates keywords', async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateMentorKeywords($keywords: [UpdateKeywordType]) {
          me {
            updateMentorKeywords(keywords: $keywords)
          }
        }`,
        variables: {
          keywords: [
            {
              name: 'STEM', // does not create keyword because name already exists
              type: 'Updated type', // change type of existing keyword
            },
            {
              name: 'Male', // does not create or change type of existing keyword
            },
            {
              name: 'New Keyword', // creates a brand new keyword
              type: 'New Type',
            },
          ],
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'data.me.updateMentorKeywords',
      true
    );

    const keywords = await request(app)
      .post('/graphql')
      .send({
        query: `query {
          keywords {
            edges {
              node {
                name
                type
              }
            }
          }
        }`,
      });
    expect(keywords.status).to.equal(200);
    expect(keywords.body.data.keywords).to.eql({
      edges: [
        {
          node: {
            name: 'New Keyword',
            type: 'New Type',
          },
        },
        {
          node: {
            name: 'STEM',
            type: 'Updated type',
          },
        },
        {
          node: {
            name: 'Nonbinary',
            type: 'Gender',
          },
        },
        {
          node: {
            name: 'Female',
            type: 'Gender',
          },
        },
        {
          node: {
            name: 'Male',
            type: 'Gender',
          },
        },
      ],
    });

    const mentor = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
            me {
              mentor {
                keywords {
                  name
                  type
                }
              }
            }
          }`,
      });
    expect(mentor.status).to.equal(200);
    expect(mentor.body.data.me.mentor).to.eql({
      keywords: [
        {
          name: 'Male',
          type: 'Gender',
        },
        {
          name: 'STEM',
          type: 'Updated type',
        },
        {
          name: 'New Keyword',
          type: 'New Type',
        },
      ],
    });
  });

  it('removes keywords from mentor', async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateMentorKeywords($keywords: [UpdateKeywordType]) {
          me {
            updateMentorKeywords(keywords: $keywords)
          }
        }`,
        variables: {
          keywords: [],
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'data.me.updateMentorKeywords',
      true
    );

    const keywords = await request(app)
      .post('/graphql')
      .send({
        query: `query {
          keywords {
            edges {
              node {
                name
                type
              }
            }
          }
        }`,
      });
    expect(keywords.status).to.equal(200);
    expect(keywords.body.data.keywords).to.eql({
      edges: [
        {
          node: {
            name: 'STEM',
            type: 'Career',
          },
        },
        {
          node: {
            name: 'Nonbinary',
            type: 'Gender',
          },
        },
        {
          node: {
            name: 'Female',
            type: 'Gender',
          },
        },
        {
          node: {
            name: 'Male',
            type: 'Gender',
          },
        },
      ],
    });

    const mentor = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
            me {
              mentor {
                keywords {
                  name
                  type
                }
              }
            }
          }`,
      });
    expect(mentor.status).to.equal(200);
    expect(mentor.body.data.me.mentor).to.eql({
      keywords: [],
    });
  });

  it("doesn't accept unaccepted fields", async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateMentorKeywords($keywords: [UpdateKeywordType]) {
          me {
            updateMentorKeywords(keywords: $keywords)
          }
        }`,
        variables: { keywords: [{ lastTrainedAt: 'asdf' }] },
      });
    expect(response.status).to.equal(500);
  });

  it("doesn't accept invalid fields", async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateMentorKeywords($keywords: [UpdateKeywordType]) {
          me {
            updateMentorKeywords(keywords: $keywords)
          }
        }`,
        variables: { keywords: [{ name: {} }] },
      });
    expect(response.status).to.equal(500);
  });

  it('"USER"\'s cannot update other mentors', async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea2'); //mentor with role "User"
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateMentorKeywords($keywords: [UpdateKeywordType], $mentorId: ID!) {
          me {
            updateMentorKeywords(keywords: $keywords, mentorId: $mentorId)
          }
        }`,
        variables: {
          keywords: [],
          mentorId: '5ffdf41a1ee2c62111111112',
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.errors[0].message).to.equal(
      'you do not have permission to edit this mentor'
    );
  });

  it('"CONTENT_MANAGERS"\'s can update other mentors', async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea5'); //mentor with role "Content Manager"
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateMentorKeywords($keywords: [UpdateKeywordType], $mentorId: ID!) {
          me {
            updateMentorKeywords(keywords: $keywords, mentorId: $mentorId)
          }
        }`,
        variables: {
          keywords: [],
          mentorId: '5ffdf41a1ee2c62111111112',
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateMentorKeywords).to.eql(true);
  });

  it('"ADMIN"\'s can update other mentors', async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1'); //mentor with role "Content Manager"
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateMentorKeywords($keywords: [UpdateKeywordType], $mentorId: ID!) {
          me {
            updateMentorKeywords(keywords: $keywords, mentorId: $mentorId)
          }
        }`,
        variables: {
          keywords: [],
          mentorId: '5ffdf41a1ee2c62111111112',
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateMentorKeywords).to.eql(true);
  });
});
