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
import fs from 'fs';

const exportV1MentorQuery = `query ExportV1Mentor($yaml: String!) {
  v1MentorExport(yaml: $yaml){
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

describe.only('export v1 mentor', () => {
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

  it(`returns v1 mentor in import format`, async () => {
    const yaml = fs.readFileSync('test/fixtures/utterances.yaml', 'utf8');
    const response = await request(app).post('/graphql').send({
      query: exportV1MentorQuery,
      variables: { yaml },
    });
    console.log(response);
    expect(response.status).to.equal(200);
  });
});
