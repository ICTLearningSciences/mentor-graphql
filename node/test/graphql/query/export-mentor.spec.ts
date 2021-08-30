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

const exportMentorQueryStub = `query ExportMentor($mentor: ID!) {
  mentorExport(mentor: $mentor) {
    subjects {
      _id
    }
  }
}`;

export const exportMentorQuery = `query ExportMentor($mentor: ID!) {
  mentorExport(mentor: $mentor) {
    id
    subjects {
      _id
      name
      description
      isRequired
      topics {
        id
        name
        description
      }
      categories {
        id
        name
        description
      }
      questions {
        question {
          _id
          question
        }
        category {
          id
        }
        topics {
          id
        }
      }
    }
    questions {
      _id
      question
      type
      name
      paraphrases
      mentor
      mentorType
      minVideoLength
    }
    answers {
      transcript
      status
      question {
        _id
        question
      }
      hasUntransferredMedia
      media {
        tag
        type
        url
        needsTransfer
      }
    }
  }
}`;

describe('export mentor', () => {
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
        query: exportMentorQueryStub,
        variables: { mentor: '5ffdf41a1ee2c62320b49ea1' },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'mentor not found'
    );
  });

  it(`throws an error if no json id`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: exportMentorQueryStub,
        variables: { mentor: '5ffdf41a1ee2c62320b49ea1' },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'mentor not found'
    );
  });

  it(`exports mentor's subjects, questions, and answers as JSON`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: exportMentorQuery,
        variables: { mentor: '5ffdf41a1ee2c62111111111' },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.mentorExport).to.eql({
      id: '5ffdf41a1ee2c62111111111',
      subjects: [
        {
          _id: '5ffdf41a1ee2c62320b49eb2',
          name: 'Background',
          description:
            'These questions will ask general questions about your background that might be relevant to how people understand your career.',
          isRequired: true,
          topics: [
            {
              id: 'background',
              name: 'Background',
              description:
                'These questions will ask general questions about your background, that might be relevant to how people understand your career',
            },
            {
              id: 'advice',
              name: 'Advice',
              description:
                'These questions will ask you to give advice to someone who is interested in your career',
            },
          ],
          categories: [
            {
              id: 'category',
              name: 'Category',
              description: 'A test category',
            },
          ],
          questions: [
            {
              question: {
                _id: '511111111111111111111112',
                question: 'Who are you and what do you do?',
              },
              category: null,
              topics: [{ id: 'background' }],
            },
            {
              question: {
                _id: '511111111111111111111113',
                question: 'How old are you?',
              },
              category: { id: 'category' },
              topics: [{ id: 'background' }],
            },
            {
              question: {
                _id: '511111111111111111111114',
                question: 'Do you like your job?',
              },
              category: null,
              topics: [{ id: 'advice' }],
            },
            {
              question: { _id: '511111111111111111111116', question: 'Julia?' },
              category: null,
              topics: [],
            },
            {
              question: {
                _id: '511111111111111111111117',
                question: 'What is Aaron like?',
              },
              category: { id: 'category' },
              topics: [],
            },
          ],
        },
        {
          _id: '5ffdf41a1ee2c62320b49eb1',
          name: 'Repeat After Me',
          description:
            "These are miscellaneous phrases you'll be asked to repeat.",
          isRequired: true,
          topics: [
            {
              id: 'idle',
              name: 'Idle',
              description: '30-second idle clip',
            },
          ],
          categories: [],
          questions: [
            {
              question: {
                _id: '511111111111111111111111',
                question: "Don't talk and stay still.",
              },
              category: null,
              topics: [{ id: 'idle' }],
            },
          ],
        },
      ],
      questions: [
        {
          _id: '511111111111111111111111',
          question: "Don't talk and stay still.",
          type: 'UTTERANCE',
          name: 'idle',
          paraphrases: [],
          mentor: null,
          mentorType: null,
          minVideoLength: null,
        },
        {
          _id: '511111111111111111111112',
          question: 'Who are you and what do you do?',
          type: 'QUESTION',
          name: null,
          paraphrases: [],
          mentor: null,
          mentorType: null,
          minVideoLength: null,
        },
        {
          _id: '511111111111111111111113',
          question: 'How old are you?',
          type: 'QUESTION',
          name: null,
          paraphrases: [],
          mentor: null,
          mentorType: null,
          minVideoLength: null,
        },
        {
          _id: '511111111111111111111114',
          question: 'Do you like your job?',
          type: 'QUESTION',
          name: null,
          paraphrases: [],
          mentor: null,
          mentorType: null,
          minVideoLength: null,
        },
        {
          _id: '511111111111111111111117',
          question: 'What is Aaron like?',
          type: 'QUESTION',
          name: null,
          paraphrases: [],
          mentor: null,
          mentorType: null,
          minVideoLength: null,
        },
      ],
      answers: [
        {
          transcript: '[being still]',
          status: 'COMPLETE',
          question: {
            _id: '511111111111111111111111',
            question: "Don't talk and stay still.",
          },
          hasUntransferredMedia: false,
          media: [
            {
              tag: 'web',
              type: 'video',
              url: 'https://static.mentorpal.org/videos/5ffdf41a1ee2c62111111111/511111111111111111111111/web.mp4',
              needsTransfer: false,
            },
            {
              tag: 'mobile',
              type: 'video',
              url: 'https://static.mentorpal.org/videos/5ffdf41a1ee2c62111111111/511111111111111111111111/mobile.mp4',
              needsTransfer: false,
            },
          ],
        },
        {
          transcript: 'Test Transcript',
          status: 'COMPLETE',
          question: {
            _id: '511111111111111111111117',
            question: 'What is Aaron like?',
          },
          hasUntransferredMedia: false,
          media: [
            {
              tag: 'web',
              type: 'video',
              url: 'https://static.mentorpal.org/videos/5ffdf41a1ee2c62111111111/511111111111111111111117/web.mp4',
              needsTransfer: false,
            },
            {
              tag: 'mobile',
              type: 'video',
              url: 'https://static.mentorpal.org/videos/5ffdf41a1ee2c62111111111/511111111111111111111117/mobile.mp4',
              needsTransfer: false,
            },
          ],
        },
      ],
    });
  });
});
