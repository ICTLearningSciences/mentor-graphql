/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
} from 'graphql';
import { Mentor as MentorModel } from 'models';
import { Status } from 'models/Answer';
import { Mentor } from 'models/Mentor';
import DateType from './date';
import AnswerType from './answer';
import SubjectType from './subject';
import { QuestionType } from 'models/Question';

export const MentorType = new GraphQLObjectType({
  name: 'Mentor',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    firstName: { type: GraphQLString },
    title: { type: GraphQLString },
    lastTrainedAt: { type: DateType },
    mentorType: { type: GraphQLString },
    subjects: {
      type: GraphQLList(SubjectType),
      resolve: async function (mentor: Mentor) {
        return await MentorModel.getSubjects(mentor);
      },
    },
    topics: {
      type: GraphQLList(SubjectType),
      args: {
        subject: { type: GraphQLID },
      },
      resolve: async function (mentor: Mentor, args: { subject: string }) {
        return await MentorModel.getTopics(mentor, args.subject);
      },
    },
    answers: {
      type: GraphQLList(AnswerType),
      args: {
        subject: { type: GraphQLID },
        topic: { type: GraphQLID },
        status: { type: GraphQLString },
      },
      resolve: async function (
        mentor: Mentor,
        args: { subject: string; topic: string; status: string }
      ) {
        return await MentorModel.getAnswers(
          mentor,
          args.subject,
          args.topic,
          args.status as Status
        );
      },
    },
    utterances: {
      type: GraphQLList(AnswerType),
      args: {
        status: { type: GraphQLString },
      },
      resolve: async function (mentor: Mentor, args: { status: string }) {
        return await MentorModel.getAnswers(
          mentor,
          undefined,
          undefined,
          args.status as Status,
          QuestionType.UTTERANCE
        );
      },
    },
  }),
});

export default MentorType;
