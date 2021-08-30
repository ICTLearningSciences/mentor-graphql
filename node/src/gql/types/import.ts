/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';

import {
  QuestionUpdateInput,
  QuestionUpdateInputType,
} from 'gql/mutation/me/question-update';
import {
  CategoryInputType,
  TopicInputType,
} from 'gql/mutation/me/subject-update';
import { Subject } from 'models/Subject';
import { Question } from 'models/Question';
import { Answer } from 'models/Answer';
import AnswerType from './answer';
import QuestionType from './question';
import SubjectType, { TopicType, CategoryType } from './subject';
import { AnswerExportJson, SubjectExportJson } from './export';

export const MentorImportJsonType = new GraphQLInputObjectType({
  name: 'MentorImportJsonType',
  fields: () => ({
    id: { type: GraphQLString },
    subjects: { type: GraphQLList(SubjectImportJsonType) },
    questions: { type: GraphQLList(QuestionUpdateInputType) },
    answers: { type: GraphQLList(AnswerImportJsonType) },
  }),
});

export const SubjectImportJsonType = new GraphQLInputObjectType({
  name: 'SubjectImportJsonType',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    isRequired: { type: GraphQLBoolean },
    categories: { type: GraphQLList(CategoryInputType) },
    topics: { type: GraphQLList(TopicInputType) },
    questions: { type: GraphQLList(SubjectQuestionImportJsonType) },
  }),
});

export const SubjectQuestionImportJsonType = new GraphQLInputObjectType({
  name: 'SubjectQuestionImportJsonType',
  fields: () => ({
    question: { type: QuestionUpdateInputType },
    category: { type: CategoryInputType },
    topics: { type: GraphQLList(TopicInputType) },
  }),
});

export const AnswerImportJsonType = new GraphQLInputObjectType({
  name: 'AnswerImportJsonType',
  fields: () => ({
    question: { type: GraphQLNonNull(QuestionUpdateInputType) },
    transcript: { type: GraphQLNonNull(GraphQLString) },
    status: { type: GraphQLNonNull(GraphQLString) },
    hasUntransferredMedia: { type: GraphQLBoolean },
    media: { type: GraphQLList(AnswerMediaImportJsonType) },
  }),
});

export const AnswerMediaImportJsonType = new GraphQLInputObjectType({
  name: 'AnswerMediaImportJsonType',
  fields: {
    type: { type: GraphQLString },
    tag: { type: GraphQLString },
    url: { type: GraphQLString },
    needsTransfer: { type: GraphQLBoolean },
  },
});

export enum EditType {
  NONE = 'NONE',
  ADDED = 'ADDED',
  REMOVED = 'REMOVED',
  CREATED = 'CREATED',
}

export interface ImportPreview<T, U> {
  importData?: T;
  curData?: U;
  editType: EditType;
}

export interface MentorImportPreview {
  id: string;
  subjects: ImportPreview<SubjectExportJson, Subject>[];
  questions: ImportPreview<QuestionUpdateInput, Question>[];
  answers: ImportPreview<AnswerExportJson, Answer>[];
}

export const MentorImportPreviewType = new GraphQLObjectType({
  name: 'MentorImportPreviewType',
  fields: () => ({
    id: { type: GraphQLString },
    subjects: { type: GraphQLList(SubjectImportPreviewType) },
    questions: { type: GraphQLList(QuestionImportPreviewType) },
    answers: { type: GraphQLList(AnswerImportPreviewType) },
  }),
});

export const SubjectImportPreviewType = new GraphQLObjectType({
  name: 'SubjectImportPreviewType',
  fields: () => ({
    importData: { type: SubjectPreviewType },
    curData: { type: SubjectType },
    editType: { type: GraphQLString },
  }),
});

export const QuestionImportPreviewType = new GraphQLObjectType({
  name: 'QuestionImportPreviewType',
  fields: () => ({
    importData: { type: QuestionType },
    curData: { type: QuestionType },
    editType: { type: GraphQLString },
  }),
});

export const AnswerImportPreviewType = new GraphQLObjectType({
  name: 'AnswerImportPreviewType',
  fields: () => ({
    importData: { type: AnswerPreviewType },
    curData: { type: AnswerType },
    editType: { type: GraphQLString },
  }),
});

export const SubjectPreviewType = new GraphQLObjectType({
  name: 'SubjectPreview',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    isRequired: { type: GraphQLBoolean },
    topics: { type: GraphQLList(TopicType) },
    categories: { type: GraphQLList(CategoryType) },
    questions: { type: GraphQLList(SubjectQuestionPreviewType) },
  }),
});

export const SubjectQuestionPreviewType = new GraphQLObjectType({
  name: 'SubjectQuestionPreview',
  fields: {
    category: { type: CategoryType },
    topics: { type: GraphQLList(TopicType) },
    question: { type: QuestionType },
  },
});

export const AnswerPreviewType = new GraphQLObjectType({
  name: 'AnswerPreview',
  fields: () => ({
    question: { type: QuestionType },
    transcript: { type: GraphQLString },
    status: { type: GraphQLString },
    hasUntransferredMedia: { type: GraphQLBoolean },
    media: { type: GraphQLList(AnswerMediaPreviewType) },
  }),
});

export const AnswerMediaPreviewType = new GraphQLObjectType({
  name: 'AnswerMediaPreview',
  fields: {
    type: { type: GraphQLString },
    tag: { type: GraphQLString },
    needsTransfer: { type: GraphQLBoolean },
    url: { type: GraphQLString },
  },
});
