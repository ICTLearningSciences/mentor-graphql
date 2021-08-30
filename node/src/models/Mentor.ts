/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  Answer as AnswerModel,
  Subject as SubjectModel,
  Question as QuestionModel,
} from 'models';
import {
  PaginatedResolveResult,
  PaginateOptions,
  PaginateQuery,
  pluginPagination,
} from './Paginatation';
import { Answer, Status } from './Answer';
import { Question, QuestionType } from './Question';
import { Subject, SubjectQuestion } from './Subject';
import { User } from './User';
import { idOrNew } from 'gql/mutation/me/helpers';
import { mediaNeedsTransfer, toRelativeUrl } from 'utils/static-urls';
import {
  AnswerExportJson,
  MentorExportJson,
  QuestionExportJson,
  SubjectExportJson,
} from 'gql/types/export';

export enum MentorType {
  VIDEO = 'VIDEO',
  CHAT = 'CHAT',
}

export interface Mentor extends Document {
  name: string;
  firstName: string;
  title: string;
  email: string;
  thumbnail: string;
  allowContact: boolean;
  defaultSubject: Subject['_id'];
  subjects: Subject['_id'][];
  lastTrainedAt: Date;
  isDirty: boolean;
  mentorType: string;
  user: User['_id'];
}

export interface GetMentorDataParams {
  mentor: string | Mentor;
  defaultSubject?: boolean;
  subjectId?: string;
  topicId?: string;
  type?: QuestionType;
  status?: Status;
  categoryId?: string;
}

export interface MentorModel extends Model<Mentor> {
  paginate(
    query?: PaginateQuery<Mentor>,
    options?: PaginateOptions
  ): Promise<PaginatedResolveResult<Mentor>>;
  getSubjects(mentor: string | Mentor): Subject[];
  getAnswers(mentor: string | Mentor): Answer[];
  export(mentor: string): Promise<MentorExportJson>;
  import(mentor: string, json: MentorExportJson): Promise<Mentor>;
}

export const MentorSchema = new Schema<Mentor, MentorModel>(
  {
    name: { type: String },
    firstName: { type: String },
    title: { type: String },
    email: { type: String },
    thumbnail: { type: String, default: '' },
    allowContact: { type: Boolean, default: false },
    defaultSubject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    subjects: { type: [{ type: Schema.Types.ObjectId, ref: 'Subject' }] },
    lastTrainedAt: { type: Date },
    isDirty: { type: Boolean, default: true },
    mentorType: {
      type: String,
      enum: [MentorType.VIDEO, MentorType.CHAT],
      default: MentorType.VIDEO,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: '{PATH} is required!',
      unique: true,
    },
  },
  { timestamps: true, collation: { locale: 'en', strength: 2 } }
);

MentorSchema.statics.export = async function (
  m: string | Mentor
): Promise<MentorExportJson> {
  const mentor: Mentor = typeof m === 'string' ? await this.findById(m) : m;
  if (!mentor) {
    throw new Error('mentor not found');
  }
  const subjects = await this.getSubjects(mentor);
  const sQuestions: SubjectQuestion[] = subjects.reduce(
    (accumulator, subject) => {
      return accumulator.concat(subject.questions);
    },
    []
  );
  const questions: Question[] = await QuestionModel.find({
    _id: { $in: sQuestions.map((q) => q.question) },
    $or: [
      { mentor: mentor._id },
      { mentor: { $exists: false } },
      { mentor: null }, // not sure if we need an explicit null check?
    ],
  });
  const answers: Answer[] = await AnswerModel.find({
    mentor: mentor._id,
    question: { $in: questions.map((q) => q._id) },
  });

  const subjectExports: SubjectExportJson[] = subjects.map((s) => {
    return {
      ...s,
      _id: s._id,
      questions: s.questions.map((sq) => {
        const question = questions.find((q) => `${q._id}` === `${sq.question}`);
        return {
          question: { ...question, _id: question._id },
          category: s.categories.find((c) => c.id === sq.category),
          topics: s.topics.filter((t) => sq.topics.includes(t.id)),
        };
      }),
    };
  });
  const answerExports: AnswerExportJson[] = answers.map((a) => {
    const question = questions.find((q) => `${q._id}` === `${a.question}`);
    return {
      ...a,
      _id: a._id,
      question: { ...question, _id: question._id },
    };
  });
  const questionExports: QuestionExportJson[] = questions.map((q) => {
    return {
      ...q,
      _id: q._id,
    };
  });
  return {
    id: mentor._id,
    subjects: subjectExports,
    questions: questionExports,
    answers: answerExports,
  };
};

MentorSchema.statics.import = async function (
  m: string | Mentor,
  json: MentorExportJson
): Promise<Mentor> {
  const mentor: Mentor = typeof m === 'string' ? await this.findById(m) : m;
  if (!mentor) {
    throw new Error('mentor not found');
  }
  // TODO: currently, if one fails all the subsequent calls fail
  // need to have a list of promises, but still need to create questions before anything else
  for (const q of json.questions) {
    const updatedQuestion = await QuestionModel.updateOrCreate(q);
    if (`${updatedQuestion._id}` !== `${q._id}`) {
      for (const subject of json.subjects) {
        const subjectQuestion = subject.questions.find(
          (sq) => `${sq.question._id}` === `${q._id}`
        );
        if (subjectQuestion) {
          subjectQuestion.question._id = updatedQuestion._id;
        }
      }
      const answer = json.answers.find(
        (a) => `${a.question._id}` === `${q._id}`
      );
      if (answer) {
        answer.question._id = updatedQuestion._id;
      }
    }
  }
  for (const s of json.subjects) {
    const updatedSubject = await SubjectModel.findOneAndUpdate(
      { _id: idOrNew(s._id) },
      {
        $set: {
          name: s.name,
          description: s.description,
          isRequired: s.isRequired,
          categories: s.categories,
          topics: s.topics,
          questions: s.questions.map((sq) => ({
            question: sq.question._id,
            category: sq.category?.id,
            topics: sq.topics?.map((t) => t.id),
          })),
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    if (`${updatedSubject._id}` !== `${s._id}`) {
      const subject = json.subjects.find((js) => `${js._id}` === `${s._id}`);
      if (subject) {
        subject._id = updatedSubject._id;
      }
    }
  }
  for (const a of json.answers || []) {
    a.hasUntransferredMedia = false;
    for (const m of a.media || []) {
      m.needsTransfer = mediaNeedsTransfer(m.url);
      m.url = toRelativeUrl(m.url);
      a.hasUntransferredMedia = a.hasUntransferredMedia || m.needsTransfer;
    }
    await AnswerModel.findOneAndUpdate(
      {
        mentor: mentor._id,
        question: a.question._id,
      },
      {
        $set: {
          transcript: a.transcript,
          status: a.status,
          media: a.media,
          hasUntransferredMedia: a.hasUntransferredMedia,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
  }
  return await this.findByIdAndUpdate(mentor._id, {
    $set: {
      subjects: json.subjects.map((s) => s._id as Subject['_id']),
    },
  });
};

// Return subjects in alphabetical order
MentorSchema.statics.getSubjects = async function (
  m: string | Mentor
): Promise<Subject[]> {
  const mentor: Mentor = typeof m === 'string' ? await this.findById(m) : m;
  if (!mentor) {
    throw new Error(`mentor ${m} not found`);
  }
  return await SubjectModel.find(
    {
      _id: { $in: mentor.subjects },
    },
    null,
    { sort: { name: 1 } }
  );
};

MentorSchema.statics.getAnswers = async function (m: string | Mentor) {
  const mentor: Mentor = typeof m === 'string' ? await this.findById(m) : m;
  if (!mentor) {
    throw new Error(`mentor ${m} not found`);
  }
  const subjects = await this.getSubjects(mentor);
  const questionIds = subjects
    .reduce((accumulator, subject) => {
      return accumulator.concat(subject.questions);
    }, [])
    .map((sq) => sq.question);
  const answers: Answer[] = await AnswerModel.find({
    mentor: mentor._id,
    question: { $in: questionIds },
  });
  answers.sort((a: Answer, b: Answer) => {
    return (
      questionIds.indexOf(a.question._id) - questionIds.indexOf(b.question._id)
    );
  });
  const answersByQid = answers.reduce((acc: Record<string, Answer>, cur) => {
    acc[`${cur.question}`] = cur;
    return acc;
  }, {});
  return questionIds.map((qid: string) => {
    return (
      answersByQid[`${qid}`] || {
        mentor: mentor._id,
        question: qid,
        transcript: '',
        status: Status.INCOMPLETE,
      }
    );
  });
};

MentorSchema.index({ name: -1, _id: -1 });
MentorSchema.index({ firstName: -1, _id: -1 });
MentorSchema.index({ mentorType: -1, _id: -1 });
pluginPagination(MentorSchema);

export default mongoose.model<Mentor, MentorModel>('Mentor', MentorSchema);
