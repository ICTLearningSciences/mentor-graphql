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

describe('updateMentorSubjects', () => {
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
        query: `mutation UpdateMentorSubjects($mentor: UpdateMentorSubjectsType!) {
          me {
            updateMentorSubjects(mentor: $mentor)
          }
        }`,
        variables: { mentor: {} },
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
        query: `mutation UpdateMentorSubjects($mentor: UpdateMentorSubjectsType!) {
          me {
            updateMentorSubjects(mentor: $mentor)
          }
        }`,
        variables: { mentor: {} },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'you do not have a mentor'
    );
  });

  it(`throws an error if no mentor update passed`, async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateMentorSubjects($mentor: UpdateMentorSubjectsType!) {
          me {
            updateMentorSubjects
          }
        }`,
        variables: {},
      });
    expect(response.status).to.equal(400);
  });

  it('updates mentor subjects', async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateMentorSubjects($mentor: UpdateMentorSubjectsType!) {
          me {
            updateMentorSubjects(mentor: $mentor)
          }
        }`,
        variables: {
          mentor: {
            defaultSubject: '5ffdf41a1ee2c62320b49eb3',
            subjects: ['5ffdf41a1ee2c62320b49eb3'],
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'data.me.updateMentorSubjects',
      true
    );
    const mentor = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
            me {
              mentor {
                _id
                defaultSubject
                subjects {
                  _id
                }
              }
            }
          }`,
      });
    expect(mentor.status).to.equal(200);
    expect(mentor.body.data.me.mentor).to.eql({
      _id: '5ffdf41a1ee2c62111111111',
      defaultSubject: '5ffdf41a1ee2c62320b49eb3',
      subjects: [
        {
          _id: '5ffdf41a1ee2c62320b49eb3',
        },
      ],
    });
  });

  it('removes defaultSubject', async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateMentorSubjects($mentor: UpdateMentorSubjectsType!) {
          me {
            updateMentorSubjects(mentor: $mentor)
          }
        }`,
        variables: {
          mentor: {
            defaultSubject: null,
            subjects: ['5ffdf41a1ee2c62320b49eb3'],
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'data.me.updateMentorSubjects',
      true
    );
    const mentor = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
            me {
              mentor {
                _id
                defaultSubject
                subjects {
                  _id
                }
              }
            }
          }`,
      });
    expect(mentor.status).to.equal(200);
    expect(mentor.body.data.me.mentor).to.eql({
      _id: '5ffdf41a1ee2c62111111111',
      defaultSubject: null,
      subjects: [
        {
          _id: '5ffdf41a1ee2c62320b49eb3',
        },
      ],
    });
  });

  it('updates only default subject', async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateMentorSubjects($mentor: UpdateMentorSubjectsType!) {
          me {
            updateMentorSubjects(mentor: $mentor)
          }
        }`,
        variables: { mentor: { defaultSubject: '5ffdf41a1ee2c62320b49eb2' } },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'data.me.updateMentorSubjects',
      true
    );
    const mentor = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
            me {
              mentor {
                _id
                defaultSubject
                subjects {
                  _id
                }
              }
            }
          }`,
      });
    expect(mentor.status).to.equal(200);
    expect(mentor.body.data.me.mentor).to.eql({
      _id: '5ffdf41a1ee2c62111111111',
      defaultSubject: '5ffdf41a1ee2c62320b49eb2',
      subjects: [
        {
          _id: '5ffdf41a1ee2c62320b49eb2',
        },
        {
          _id: '5ffdf41a1ee2c62320b49eb1',
        },
      ],
    });
  });

  it("doesn't accept unaccepted fields", async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateMentorSubjects($mentor: UpdateMentorSubjectsType!) {
          me {
            updateMentorSubjects(mentor: $mentor)
          }
        }`,
        variables: { mentor: { lastTrainedAt: 'asdf' } },
      });
    expect(response.status).to.equal(500);
  });

  it("doesn't accept invalid fields", async () => {
    const token = getToken('5ffdf41a1ee2c62320b49ea1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation UpdateMentorSubjects($mentor: UpdateMentorSubjectsType!) {
          me {
            updateMentorSubjects(mentor: $mentor)
          }
        }`,
        variables: { mentor: { defaultSubject: {} } },
      });
    expect(response.status).to.equal(500);
  });
});
