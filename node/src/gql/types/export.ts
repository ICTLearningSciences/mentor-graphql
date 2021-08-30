/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { Category, Topic } from 'models/Subject';
import { Status, AnswerMediaProps } from 'models/Answer';
import DateType from './date';

export interface MentorExportJson {
  id: string;
  subjects: SubjectExportJson[];
  questions: QuestionExportJson[];
  answers: AnswerExportJson[];
}

export interface SubjectExportJson {
  _id: string;
  name: string;
  description: string;
  isRequired: boolean;
  categories: CategoryExportJson[];
  topics: TopicExportJson[];
  questions: SubjectQuestionExportJson[];
}

export interface CategoryExportJson {
  id: string;
  name: string;
  description: string;
}

export interface TopicExportJson {
  id: string;
  name: string;
  description: string;
}

export interface SubjectQuestionExportJson {
  question: QuestionExportJson;
  category?: Category;
  topics?: Topic[];
}

export interface AnswerExportJson {
  _id: string;
  question: QuestionExportJson;
  transcript: string;
  status: Status;
  hasUntransferredMedia: boolean;
  media: AnswerMediaProps[];
}

export interface QuestionExportJson {
  _id: string;
  question: string;
  type: string;
  name: string;
  paraphrases: string[];
  mentor: string;
  mentorType: string;
  minVideoLength: number;
}

export const QuestionExportJsonType = new GraphQLObjectType({
  name: 'QuestionExportJsonType',
  fields: () => ({
    _id: { type: GraphQLID },
    question: { type: GraphQLString },
    type: { type: GraphQLString },
    name: { type: GraphQLString },
    paraphrases: { type: GraphQLList(GraphQLString) },
    mentor: { type: GraphQLID },
    mentorType: { type: GraphQLString },
    minVideoLength: { type: GraphQLInt },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
  }),
});

export const MentorExportJsonType = new GraphQLObjectType({
  name: 'MentorExportJsonType',
  fields: () => ({
    id: { type: GraphQLID },
    subjects: { type: GraphQLList(SubjectExportJsonType) },
    questions: { type: GraphQLList(QuestionExportJsonType) },
    answers: { type: GraphQLList(AnswerExportJsonType) },
  }),
});

export const SubjectExportJsonType = new GraphQLObjectType({
  name: 'SubjectExportJsonType',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    isRequired: { type: GraphQLBoolean },
    categories: { type: GraphQLList(CategoryExportJsonType) },
    topics: { type: GraphQLList(TopicExportJsonType) },
    questions: { type: GraphQLList(SubjectQuestionExportJsonType) },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
  }),
});

export const CategoryExportJsonType = new GraphQLObjectType({
  name: 'CategoryExportJsonType',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
  },
});

export const TopicExportJsonType = new GraphQLObjectType({
  name: 'TopicExportJsonType',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
  },
});

export const SubjectQuestionExportJsonType = new GraphQLObjectType({
  name: 'SubjectQuestionExportJsonType',
  fields: {
    question: { type: QuestionExportJsonType },
    category: { type: CategoryExportJsonType },
    topics: { type: GraphQLList(TopicExportJsonType) },
  },
});

export const AnswerExportJsonType = new GraphQLObjectType({
  name: 'AnswerExportJsonType',
  fields: () => ({
    _id: { type: GraphQLID },
    question: { type: QuestionExportJsonType },
    transcript: { type: GraphQLString },
    status: { type: GraphQLString },
    hasUntransferredMedia: { type: GraphQLBoolean },
    media: { type: GraphQLList(AnswerMediaExportJsonType) },
    createdAt: { type: DateType },
    updatedAt: { type: DateType },
  }),
});

export const AnswerMediaExportJsonType = new GraphQLObjectType({
  name: 'AnswerMediaExportJsonType',
  fields: {
    type: { type: GraphQLString },
    tag: { type: GraphQLString },
    needsTransfer: { type: GraphQLBoolean },
    url: { type: GraphQLString },
  },
});
