/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLID, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import {
  Mentor as MentorModel,
  Subject as SubjectModel,
  Question as QuestionModel,
  Answer as AnswerModel,
} from 'models';
import { Question } from 'models/Question';
import { Answer } from 'models/Answer';
import { isId } from 'gql/mutation/me/helpers';
import { mediaNeedsTransfer } from 'utils/static-urls';
import {
  MentorImportPreviewType,
  MentorImportPreview,
  EditType,
  MentorImportJsonType,
} from 'gql/types/import';
import { MentorExportJson } from 'gql/types/export';

export const mentorImportPreview = {
  type: MentorImportPreviewType,
  args: {
    mentor: { type: GraphQLNonNull(GraphQLID) },
    json: { type: GraphQLNonNull(MentorImportJsonType) },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { mentor: string; json: MentorExportJson }
  ): Promise<MentorImportPreview> => {
    const importJson = args.json;
    const exportJson = await MentorModel.export(args.mentor);
    const curSubjects = await SubjectModel.find({
      _id: {
        $in: importJson.subjects.map((s) => s._id).filter((id) => isId(id)),
      },
    });
    const subjectChanges = [];
    for (const subjectImport of importJson.subjects) {
      const cur = curSubjects.find(
        (s) => `${s._id}` === `${subjectImport._id}`
      );
      subjectChanges.push({
        importData: subjectImport,
        curData: cur,
        editType: !cur
          ? EditType.CREATED
          : !exportJson.subjects.find(
              (s) => `${s._id}` === `${subjectImport._id}`
            )
          ? EditType.ADDED
          : EditType.NONE,
      });
    }
    const removedSubjects = exportJson.subjects.filter(
      (s) => !importJson.subjects.find((ss) => `${ss._id}` === `${s._id}`)
    );
    subjectChanges.push(
      ...removedSubjects.map((s) => ({
        curData: s,
        editType: EditType.REMOVED,
      }))
    );

    const curQuestions: Question[] = await QuestionModel.find({
      _id: {
        $in: importJson.questions.map((q) => q._id).filter((id) => isId(id)),
      },
    });
    const questionChanges = [];
    for (const questionImport of importJson.questions) {
      const curQuestion = curQuestions.find(
        (q) => `${q._id}` === `${questionImport._id}`
      );
      questionChanges.push({
        importData: questionImport,
        curData: curQuestion,
        editType: !curQuestion
          ? EditType.CREATED
          : !exportJson.questions.find(
              (q) => `${q._id}` === `${questionImport._id}`
            )
          ? EditType.ADDED
          : EditType.NONE,
      });
    }
    const removedQuestions = exportJson.questions.filter(
      (q) => !importJson.questions.find((qq) => `${qq._id}` === `${q._id}`)
    );
    questionChanges.push(
      ...removedQuestions.map((q) => ({
        curData: q,
        editType: EditType.REMOVED,
      }))
    );

    const curAnswers: Answer[] = await AnswerModel.find({
      mentor: args.mentor,
      question: {
        $in: importJson.answers
          .map((a) => a.question._id)
          .filter((id) => isId(id)),
      },
    });
    const answerChanges = [];
    for (const answerImport of importJson.answers) {
      const curAnswer = curAnswers.find(
        (a) => `${a.question}` === `${answerImport.question._id}`
      );
      for (const m of answerImport.media || []) {
        m.needsTransfer = mediaNeedsTransfer(m.url);
        answerImport.hasUntransferredMedia =
          answerImport.hasUntransferredMedia || m.needsTransfer;
      }
      answerChanges.push({
        importData: answerImport,
        curData: curAnswer,
        editType: !curAnswer
          ? EditType.CREATED
          : !exportJson.answers.find(
              (a) => `${a.question}` === `${answerImport.question._id}`
            )
          ? EditType.ADDED
          : EditType.NONE,
      });
    }
    const removedAnswers = exportJson.answers.filter(
      (a) =>
        !importJson.answers.find(
          (aa) => `${aa.question._id}` === `${a.question}`
        )
    );
    answerChanges.push(
      ...removedAnswers.map((a) => ({
        curData: a,
        editType: EditType.REMOVED,
      }))
    );
    return {
      id: exportJson.id,
      subjects: [],
      questions: [],
      answers: [],
      // subjects: subjectChanges,
      // questions: questionChanges,
      // answers: answerChanges,
    };
  },
};

export default mentorImportPreview;
