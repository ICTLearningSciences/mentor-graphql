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

describe('import mentor preview', () => {
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

  it(`view changes made if imported`, async () => {
    const json = {
      id: '5ffdf41a1ee2c62111111111',
      subjects: [
        {
          _id: '5ffdf41a1ee2c62320b49eb1',
          name: 'Repeat After Me',
          questions: [
            {
              question: {
                _id: '511111111111111111111111',
                question: "Don't talk and stay still.",
              },
            },
            {
              question: { _id: 'newquestion', question: 'new question' },
            },
          ],
        },
        {
          _id: 'newsubject',
          name: 'New Subject',
          questions: [
            {
              question: { _id: 'newquestion', question: 'new question' },
            },
          ],
        },
      ],
      questions: [
        {
          _id: '511111111111111111111111',
          question: "Don't talk and stay still.",
        },
        {
          _id: 'newquestion',
          question: 'new question',
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
          media: [
            {
              type: 'video',
              tag: 'web',
              url: 'https://static.mentorpal.org/videos/5ffdf41a1ee2c62111111111/511111111111111111111111/web.mp4',
            },
            {
              type: 'video',
              tag: 'mobile',
              url: 'https://mentorpal.org/videos/5ffdf41a1ee2c62111111111/511111111111111111111111/mobile.mp4',
            },
          ],
        },
        {
          transcript: 'new answer',
          status: 'COMPLETE',
          question: { _id: 'newquestion', question: 'new question' },
        },
      ],
    };
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query ImportMentorPreview($mentor: ID!, $json: MentorImportJsonType!) {
          mentorImportPreview(mentor: $mentor, json: $json) {
            id
            subjects {
              importData {
                name
              }
              curData {
                name
              }
              editType
            }
            questions {
              importData {
                question
              }
              curData {
                question
              }
              editType
            }
            answers {
              importData {
                transcript
                question {
                  question
                }
                hasUntransferredMedia
                media {
                  type
                  tag
                  url
                  needsTransfer
                }
              }
              curData {
                transcript
                question {
                  question
                }
              }
              editType
            }
          }
        }`,
        variables: { mentor: '5ffdf41a1ee2c62111111111', json },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.mentorImportPreview).to.eql({
      id: '5ffdf41a1ee2c62111111111',
      subjects: [
        {
          importData: { name: 'Repeat After Me' },
          curData: { name: 'Repeat After Me' },
          editType: 'NONE',
        },
        {
          importData: { name: 'New Subject' },
          curData: null,
          editType: 'CREATED',
        },
        {
          importData: null,
          curData: 'background',
          editType: 'REMOVED',
        },
      ],
      questions: [
        {
          importData: { question: "Don't talk and stay still." },
          curData: { question: "Don't talk and stay still." },
          editType: 'NONE',
        },
        {
          importData: { question: 'new question' },
          curData: null,
          editType: 'CREATED',
        },
        {
          importData: null,
          curData: { question: 'Who are you and what do you do?' },
          editType: 'REMOVED',
        },
        {
          importData: null,
          curData: { question: 'How old are you?' },
          editType: 'REMOVED',
        },
        {
          importData: null,
          curData: { question: 'Do you like your job?' },
          editType: 'REMOVED',
        },
        {
          importData: null,
          curData: { question: 'What is Aaron like?' },
          editType: 'REMOVED',
        },
      ],
      answers: [
        {
          importData: {
            transcript: '[being still]',
            question: { question: "Don't talk and stay still." },
            hasUntransferredMedia: true,
            media: [
              {
                type: 'video',
                tag: 'web',
                url: 'https://static.mentorpal.org/videos/5ffdf41a1ee2c62111111111/511111111111111111111111/web.mp4',
                needsTransfer: false,
              },
              {
                type: 'video',
                tag: 'mobile',
                url: 'https://mentorpal.org/videos/5ffdf41a1ee2c62111111111/511111111111111111111111/mobile.mp4',
                needsTransfer: true,
              },
            ],
          },
          curData: {
            transcript: '[being still]',
            question: { question: "Don't talk and stay still." },
          },
          editType: 'NONE',
        },
        {
          importData: {
            transcript: 'new answer',
            question: { question: 'new question' },
            hasUntransferredMedia: null,
            media: null,
          },
          curData: null,
          editType: 'CREATED',
        },
        {
          importData: null,
          curData: {
            transcript: 'Test Transcript',
            question: { question: 'What is Aaron like?' },
          },
          editType: 'REMOVED',
        },
      ],
    });
  });
});
