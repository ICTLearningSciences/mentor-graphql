/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import mongoose, { Schema, Document, Model } from 'mongoose';
import { Question as QuestionModel, Subject } from 'models';
import {
  PaginatedResolveResult,
  PaginateOptions,
  PaginateQuery,
  pluginPagination,
} from './Paginatation';
import { Question, QuestionType } from './Question';
import {
  questionInputToUpdate,
  SubjectUpdateInput,
} from 'gql/mutation/me/subject-update';
import { idOrNew } from 'gql/mutation/me/helpers';

export interface CategoryProps {
  id: string;
  name: string;
  description: string;
}

export interface Category extends CategoryProps, Document {
  id: string;
}

const CategorySchema = new Schema({
  id: { type: String },
  name: { type: String },
  description: { type: String },
});

export interface TopicProps {
  id: string;
  name: string;
  description: string;
}

export interface Topic extends TopicProps, Document {
  id: string;
}

const TopicSchema = new Schema({
  id: { type: String },
  name: { type: String },
  description: { type: String },
});

export interface SubjectQuestionProps {
  question: Question['_id'];
  category: Category['id'];
  topics: Topic['id'][];
}

export interface SubjectQuestion extends SubjectQuestionProps, Document {}

export const SubjectQuestionSchema = new Schema({
  question: { type: mongoose.Types.ObjectId, ref: 'Question' },
  category: { type: String },
  topics: { type: [String] },
});

export interface Subject extends Document {
  name: string;
  description: string;
  isRequired: boolean;
  categories: Category[];
  topics: Topic[];
  questions: SubjectQuestion[];
}

export interface SubjectInsert {
  name: string;
  description: string;
  isRequired: boolean;
  categories: CategoryProps[];
  topics: TopicProps[];
  questions: SubjectQuestionProps[];
}

export type SubjectUpdate = Partial<SubjectInsert>;

export const SubjectSchema = new Schema<Subject, SubjectModel>(
  {
    name: { type: String },
    description: { type: String },
    isRequired: { type: Boolean, default: false },
    categories: { type: [CategorySchema] },
    topics: { type: [TopicSchema] },
    questions: { type: [SubjectQuestionSchema] },
  },
  { timestamps: true, collation: { locale: 'en', strength: 2 } }
);

export interface SubjectModel extends Model<Subject> {
  paginate(
    query?: PaginateQuery<Subject>,
    options?: PaginateOptions
  ): Promise<PaginatedResolveResult<Subject>>;
  getQuestions(
    subject: string | Subject,
    topicId?: string,
    mentorId?: string,
    type?: QuestionType,
    categoryID?: string
  ): SubjectQuestion[];
  updateOrCreate(subject: SubjectUpdateInput): Promise<Subject>;
}

SubjectSchema.statics.getQuestions = async function (
  s: string | Subject,
  topicId?: string,
  mentorId?: string,
  type?: QuestionType,
  categoryID?: string
) {
  const subject: Subject = typeof s === 'string' ? await this.findById(s) : s;
  if (!subject) {
    throw new Error(`subject ${s} not found`);
  }
  let sQuestions: SubjectQuestion[] = subject.questions;
  if (topicId) {
    sQuestions = sQuestions.filter((sq) => sq.topics.includes(topicId));
  }
  if (categoryID) {
    sQuestions = sQuestions.filter((sq) => sq.category == categoryID);
  }
  const questions = await QuestionModel.find({
    ...{
      _id: { $in: sQuestions.map((q) => q.question) },
    },
    ...(type ? { type } : {}),
  });
  if (mentorId !== undefined) {
    sQuestions = sQuestions.filter((sq) =>
      questions.find(
        (q) =>
          `${q._id}` === `${sq.question}` &&
          (!q.mentor || `${q.mentor}` === `${mentorId}`)
      )
    );
  }
  return sQuestions.map((sq) => ({
    question: questions.find((q) => `${q._id}` === `${sq.question}`),
    topics: sq.topics,
    category: sq.category,
  }));
};

SubjectSchema.statics.updateOrCreate = async function (
  subject: SubjectUpdateInput
) {
  // don't include questions that have no question text
  const questions = subject.questions.filter((q) => q.question.question);
  const subjectTopics = subject.topics.map((t) => t.id);
  const subjectUpdate: SubjectUpdate = {
    ...subject,
    questions: await Promise.all(
      questions.map((qi) => questionInputToUpdate(qi, subjectTopics))
    ),
  };
  return await this.findOneAndUpdate(
    { _id: idOrNew(subject._id) },
    {
      $set: subjectUpdate,
    },
    {
      new: true,
      upsert: true,
    }
  );
};

SubjectSchema.index({ name: -1, _id: -1 });
SubjectSchema.index({ isRequired: -1, _id: -1 });
pluginPagination(SubjectSchema);

export default mongoose.model<Subject, SubjectModel>('Subject', SubjectSchema);
