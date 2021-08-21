/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { Question as QuestionModel } from 'models';
import YAML from 'yaml';
import { idOrNew } from 'gql/mutation/me/helpers';
import {
  MentorImportJson,
  MentorImportJsonType,
} from 'gql/mutation/me/mentor-import';
import { Status } from 'models/Answer';
import { MentorExportJsonType } from './mentor-export';

async function yamlMentorToJson(yaml: string): Promise<MentorImportJson> {
  const yamlMentor = YAML.parse(yaml);
  const mentor: MentorImportJson = {
    id: '',
    subjects: [],
    questions: [],
    answers: [],
  };
  if (!yamlMentor.utterances[0]) {
    return mentor;
  }
  mentor.id = yamlMentor.utterances[0].mentor;
  const newSubjectId = idOrNew('undefined');
  mentor.subjects.push({
    _id: newSubjectId,
    name: 'New Subject',
    description: 'These are your uncategorized imported questions.',
    isRequired: false,
    categories: [],
    topics: [],
    questions: [],
  });
  yamlMentor.utterances.map(async (utterance: any) => {
    const q = await QuestionModel.findOne({ question: utterance.question });

    if (!q) {
      const newQuestion = {
        _id: idOrNew(''),
        question: utterance.question || '',
        type: '_QUESTION_',
        name: utterance.question || '',
        paraphrases: utterance.paraphrases || [],
        mentor: mentor.id,
        mentorType: 'VIDEO',
        minVideoLength: 0,
      };
      mentor.questions.push(newQuestion);
      mentor.subjects[0].questions.push({ question: newQuestion });
      mentor.answers.push({
        question: newQuestion,
        transcript: utterance.transcript || '',
        status: Status.INCOMPLETE,
        hasUntransferredMedia: true,
        media: [
          {
            type: 'video',
            tag: 'web',
            url: utterance.utteranceVideo || '',
            needsTransfer: true,
          },
        ],
      });
    } else {
      mentor.questions.push({ ...q, _id: q._id || '' });
      mentor.subjects[0].questions.push({
        question: { ...q, _id: q._id || '' },
      });
      mentor.answers.push({
        question: { ...q, _id: q._id || '' },
        transcript: utterance.transcript || '',
        status: Status.INCOMPLETE,
        hasUntransferredMedia: true,
        media: [
          {
            type: 'video',
            tag: 'web',
            url: utterance.utteranceVideo || '',
            needsTransfer: true,
          },
        ],
      });
    }
  });

  return mentor;
}

export const exportV1Mentor = {
  type: MentorExportJsonType,
  args: {
    yaml: { type: GraphQLString },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { yaml: string }
  ): Promise<MentorImportJson> => {
    return await yamlMentorToJson(args.yaml);
  },
};

export default exportV1Mentor;
