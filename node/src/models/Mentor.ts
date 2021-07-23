/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import mongoose, { Schema, Document, Model } from 'mongoose';
import { MentorExportJson } from 'gql/query/export-mentor';
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
import { QuestionType } from './Question';
import { Subject, SubjectQuestion, Topic } from './Subject';
import { User } from './User';
import { MentorImportJson } from 'gql/mutation/me/import-mentor';

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
  getTopics({
    mentor,
    defaultSubject,
    subjectId,
  }: GetMentorDataParams): Topic[];
  getQuestions({
    mentor,
    defaultSubject,
    subjectId,
    topicId,
    type,
    categoryId,
  }: GetMentorDataParams): SubjectQuestion[];
  getAnswers({
    mentor,
    defaultSubject,
    subjectId,
    topicId,
    status,
    type,
    categoryId,
  }: GetMentorDataParams): Answer[];
  export(mentor: string): Promise<MentorExportJson>;
  import(mentor: string, json: MentorImportJson): Promise<Mentor>;
}

export const MentorSchema = new Schema<Mentor, MentorModel>(
  {
    name: { type: String },
    firstName: { type: String },
    title: { type: String },
    email: { type: String },
    thumbnail: { type: String, default: '' },
    allowContact: { type: Boolean },
    defaultSubject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    subjects: { type: [{ type: Schema.Types.ObjectId, ref: 'Subject' }] },
    lastTrainedAt: { type: Date },
    isDirty: { type: Boolean, default: true },
    mentorType: {
      type: String,
      enum: [MentorType.VIDEO, MentorType.CHAT],
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
  const subjects = await SubjectModel.find({
    _id: { $in: mentor.subjects },
  });
  const sQuestions: SubjectQuestion[] = subjects.reduce(
    (accumulator, subject) => {
      return accumulator.concat(subject.questions);
    },
    []
  );
  const questions = await QuestionModel.find({
    _id: { $in: sQuestions.map((q) => q.question) },
  });
  const answers: Answer[] = await AnswerModel.find({
    mentor: mentor._id,
    question: { $in: questions },
  });
  return {
    subjects,
    questions,
    answers,
  };
};

MentorSchema.statics.import = async function (
  m: string | Mentor,
  json: MentorImportJson
): Promise<Mentor> {
  const mentor: Mentor = typeof m === 'string' ? await this.findById(m) : m;
  if (!mentor) {
    throw new Error('mentor not found');
  }
  for (const s of json.subjects) {
    await SubjectModel.updateOrCreate(s);
  }
  for (const a of json.answers) {
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

// Return topics for all subjects or for one subject
//  - one subject: sorted in subject order
//  - all subjects: sorted alphabetically
MentorSchema.statics.getTopics = async function ({
  mentor,
  defaultSubject,
  subjectId,
}: GetMentorDataParams): Promise<Topic[]> {
  const userMentor: Mentor =
    typeof mentor === 'string' ? await this.findById(mentor) : mentor;
  if (!userMentor) {
    throw new Error(`mentor ${mentor} not found`);
  }
  const topics: Topic[] = [];
  subjectId = defaultSubject ? userMentor.defaultSubject : subjectId;
  if (subjectId) {
    if (userMentor.subjects.includes(subjectId)) {
      const subject = await SubjectModel.findById(subjectId);
      topics.push(...subject.topics);
    }
  } else {
    const subjects: Subject[] = await this.getSubjects(userMentor);
    for (const s of subjects) {
      topics.push(...s.topics);
    }
    topics.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }
  const topicsIds = [...new Set(topics.map((t) => `${t.id}`))];
  return topicsIds.map((tId) => topics.find((t) => `${t.id}` === tId));
};

MentorSchema.statics.getQuestions = async function ({
  mentor,
  defaultSubject,
  subjectId,
  topicId,
  type,
  categoryId,
}: GetMentorDataParams): Promise<SubjectQuestion[]> {
  const userMentor: Mentor =
    typeof mentor === 'string' ? await this.findById(mentor) : mentor;
  if (!userMentor) {
    throw new Error(`mentor ${mentor} not found`);
  }
  subjectId = defaultSubject ? userMentor.defaultSubject : subjectId;
  const subjectIds = subjectId
    ? userMentor.subjects.includes(subjectId)
      ? [subjectId]
      : []
    : (userMentor.subjects as string[]);
  if (subjectIds.length == 0) {
    return [];
  }
  const subjects = await SubjectModel.find({ _id: { $in: subjectIds } }, null, {
    sort: { name: 1 },
  });
  // TODO: explore whether can batch all calls below
  // into a single mongo query?
  return (
    await Promise.all(
      subjects.map((s) =>
        SubjectModel.getQuestions(s, topicId, userMentor._id, type, categoryId)
      )
    )
  ).reduce((acc: SubjectQuestion[], cur: SubjectQuestion[]) => {
    acc.push(...cur);
    return acc;
  }, [] as SubjectQuestion[]);
};

MentorSchema.statics.getAnswers = async function ({
  mentor,
  defaultSubject,
  subjectId,
  topicId,
  status,
  type,
  categoryId,
}: GetMentorDataParams) {
  const userMentor: Mentor =
    typeof mentor === 'string' ? await this.findById(mentor) : mentor;
  if (!userMentor) {
    throw new Error(`mentor ${mentor} not found`);
  }
  const sQuestions = await this.getQuestions({
    mentor: userMentor,
    defaultSubject: defaultSubject,
    subjectId: subjectId,
    topicId: topicId,
    type: type,
    categoryId: categoryId,
  });
  const questionIds = sQuestions.map(
    (sq: { question: { _id: string } }) => sq.question._id
  );
  const answers: Answer[] = await AnswerModel.find({
    mentor: userMentor._id,
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
  const answerResult = questionIds.map((qid: string) => {
    return (
      answersByQid[`${qid}`] || {
        mentor: userMentor._id,
        question: qid,
        transcript: '',
        status: Status.INCOMPLETE,
      }
    );
  });
  return status
    ? answerResult.filter((a: Answer) => a.status === status)
    : answerResult;
};

MentorSchema.index({ name: -1, _id: -1 });
MentorSchema.index({ firstName: -1, _id: -1 });
MentorSchema.index({ mentorType: -1, _id: -1 });
pluginPagination(MentorSchema);

export default mongoose.model<Mentor, MentorModel>('Mentor', MentorSchema);
