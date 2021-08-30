/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { Types } from 'mongoose';
import { User } from 'models/User';
import {
  Mentor as MentorModel,
  Answer as AnswerModel,
  Question as QuestionModel,
} from 'models';
import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { Status } from 'models/Answer';

const response = new GraphQLObjectType({
  name: 'response',
  fields: {
    answerText: { type: GraphQLString },
    questionText: { type: GraphQLString },
  },
});

export const categoryAnswers = {
  type: GraphQLList(response),
  args: {
    category: { type: GraphQLString },
  },
  resolve: async (
    _: GraphQLObjectType,
    args: { category: string },
    context: { user: User }
  ): Promise<{ answerText: string; questionText: string }[]> => {
    if (!context.user) {
      throw new Error('Only authenticated users');
    }
    const mentor = await MentorModel.findOne({
      user: Types.ObjectId(`${context.user._id}`),
    });
    const subjects = await MentorModel.getSubjects(mentor);
    const sQuestions = subjects
      .reduce((accumulator, subject) => {
        return accumulator.concat(subject.questions);
      }, [])
      .filter((sq) => sq.category === args.category);
    const questionIds = sQuestions.map((sq) => sq.question);
    const questions = await QuestionModel.find({
      _id: { $in: questionIds },
    });
    const answers = await AnswerModel.find({
      mentor: mentor._id,
      question: { $in: questionIds },
      status: Status.COMPLETE,
    });
    answers.sort((a, b) => {
      return (
        questionIds.indexOf(a.question._id) -
        questionIds.indexOf(b.question._id)
      );
    });
    return answers.map((a) => {
      return {
        questionText: questions.find(
          (q) => JSON.stringify(q._id) == JSON.stringify(a.question)
        )?.question,
        answerText: a.transcript,
      };
    });
  },
};

export default categoryAnswers;
