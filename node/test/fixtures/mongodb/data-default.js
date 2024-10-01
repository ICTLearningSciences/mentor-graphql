/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import mongoose from 'mongoose';
import { TrainStatus } from '../../constants';
const { ObjectId } = mongoose.Types;

module.exports = {
  mentorconfigs: [
    {
      _id: ObjectId('5ffdf41a1ee2c62111111132'),
      configId: '2023TestConfig',
      subjects: [
        '5ffdf41a1ee2c62320b49eb3', //STEM
      ],
      lockedToSubjects: true,
      publiclyVisible: true,
      mentorType: 'CHAT',
      introRecordingText: 'TestIntroRecordingText',
      orgPermissions: [
        {
          org: ObjectId('511111111111111111111111'),
          viewPermission: 'HIDDEN',
          editPermission: 'HIDDEN',
        },
      ],
    },
  ],

  mentortraintasks: [
    {
      _id: ObjectId('5ffdf1231ee2c62320b49ea1'),
      mentor: ObjectId('5ffdf41a1ee2c62111111119'),
      status: TrainStatus.SUCCESS,
      createdAt: '2000-10-12T20:49:41.599+00:00',
    },
    {
      _id: ObjectId('5ffdf1241ee2c62320b49ea1'),
      mentor: ObjectId('5ffdf41a1ee2c62111111119'),
      status: TrainStatus.PENDING,
      createdAt: '2023-05-12T20:49:41.599+00:00',
    },
    {
      _id: ObjectId('5ffdf1251ee2c62320b49ea1'),
      mentor: ObjectId('5ffdf41a1ee2c62111111110'),
      status: TrainStatus.SUCCESS,
      createdAt: '2000-10-12T20:49:41.599+00:00',
    },
    {
      _id: ObjectId('5ffdf1261ee2c62320b49ea1'),
      mentor: ObjectId('5ffdf41a1ee2c62111111110'),
      status: TrainStatus.FAILURE,
      createdAt: '2023-05-12T20:49:41.599+00:00',
    },
  ],

  users: [
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ea1'),
      name: 'Clinton Anderson',
      email: 'clint@anderson.com',
      userRole: 'SUPER_ADMIN',
      firstTimeTracking: {
        myMentorSplash: false,
        tooltips: true,
      },
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ea2'),
      name: 'Dan Davis',
      email: 'dan@davis.com',
      mentorIds: ['5ffdf41a1ee2c62111111113'],
      userRole: 'USER',
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ea3'),
      name: 'Julianne Nordhagen',
      email: 'julianne@nordhagen.com',
      userRole: 'USER',
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ea4'),
      name: 'No Mentor',
      email: 'no@mentor.com',
      userRole: 'CONTENT_MANAGER',
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ea5'),
      name: 'Jacob Ferguson',
      email: 'jacob@ferguson.com',
      userRole: 'SUPER_CONTENT_MANAGER',
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ea6'),
      name: 'Aaron Klunder',
      email: 'aaron@klunder.com',
      userRole: 'ADMIN',
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ea7'),
      name: 'Private Mentor',
      email: 'private@mentor.com',
      userRole: 'USER',
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ea8'),
      name: 'Locked Down Mentor',
      email: 'locked@mentor.com',
      mentorIds: ['5ffdf41a1ee2c62119991114'],
      userRole: 'USER',
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ea9'),
      googleId: 'someidtest',
      firebaseId: '5ffdf1231ee2c62320b49e99',
      name: 'somenametest',
      email: 'xtest@y.com',
      mentorIds: ['5ffdf41a1ee2c62119991114'],
      userRole: 'USER',
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62119991235'),
      name: 'Test Default Topics User',
      email: 'defaultTopics@mentor.com',
      mentorIds: ['5ffdf41a1ee2c62119991234'],
      userRole: 'USER',
    },
  ],

  mentors: [
    {
      _id: ObjectId('5ffdf41a1ee2c62111111119'),
      name: 'Aaron Klunder',
      firstName: 'Aaron',
      title: 'Admin',
      thumbnail:
        'mentor/thumbnails/5ffdf41a1ee2c62111111111-20210621T000000.png',
      defaultSubject: '5ffdf41a1ee2c62320b49eb1',
      subjects: [
        ObjectId('5ffdf41a1ee2c62320b49eb1'),
        ObjectId('5ffdf41a1ee2c62320b49eb2'),
      ],
      keywords: ['Male'],
      user: ObjectId('5ffdf41a1ee2c62320b49ea6'),
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62111111110'),
      name: 'Jacob Ferguson',
      firstName: 'Jacob',
      title: 'Managing all the content',
      thumbnail:
        'mentor/thumbnails/5ffdf41a1ee2c62111111111-20210621T000000.png',
      defaultSubject: '5ffdf41a1ee2c62320b49eb1',
      subjects: [
        ObjectId('5ffdf41a1ee2c62320b49eb1'),
        ObjectId('5ffdf41a1ee2c62320b49eb2'),
      ],
      keywords: ['Male'],
      user: ObjectId('5ffdf41a1ee2c62320b49ea5'),
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62111111111'),
      name: 'Clinton Anderson',
      email: 'clint@email.com',
      firstName: 'Clint',
      title: "Nuclear Electrician's Mate",
      thumbnail:
        'mentor/thumbnails/5ffdf41a1ee2c62111111111-20210621T000000.png',
      defaultSubject: '5ffdf41a1ee2c62320b49eb1',
      subjects: [
        ObjectId('5ffdf41a1ee2c62320b49eb1'),
        ObjectId('5ffdf41a1ee2c62320b49eb2'),
      ],
      keywords: ['Male', 'STEM'],
      user: ObjectId('5ffdf41a1ee2c62320b49ea1'),
      hasVirtualBackground: true,
      virtualBackgroundUrl: 'https://www.fakeurl.com',
      isAdvanced: true,
      isPublicApproved: false,
      isDirty: false,
      recordQueue: [
        ObjectId('511111111111111111111112'),
        ObjectId('511111111111111111111111'),
      ],
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62111111112'),
      name: 'Julianne Nordhagen',
      firstName: 'Julianne',
      title: 'Pilot',
      defaultSubject: '5ffdf41a1ee2c62320b49eb2',
      subjects: [
        ObjectId('5ffdf41a1ee2c62320b49eb1'),
        ObjectId('5ffdf41a1ee2c62320b49eb2'),
        ObjectId('5ffdf41a1ee2c62320b49eb3'),
      ],
      keywords: ['Female'],
      user: ObjectId('5ffdf41a1ee2c62320b49ea3'),
      recordQueue: [
        ObjectId('511111111111111111111112'),
        ObjectId('511111111111111111111111'),
      ],
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62111111113'),
      name: 'Dan Davis',
      firstName: 'Dan',
      user: ObjectId('5ffdf41a1ee2c62320b49ea2'),
      subjects: [ObjectId('5ffdf41a1ee2c62320b49eb1')],
      keywords: ['Male'],
      directLinkPrivate: false,
      orgPermissions: [
        {
          org: ObjectId('511111111111111111111111'),
          viewPermission: 'HIDDEN',
        },
        {
          org: ObjectId('511111111111111111111112'),
          editPermission: 'MANAGE',
        },
      ],
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62111111114'),
      name: 'Private Mentor',
      firstName: 'Private',
      isPrivate: true,
      user: ObjectId('5ffdf41a1ee2c62320b49ea7'),
      subjects: [ObjectId('5ffdf41a1ee2c62320b49eb1')],
      keywords: ['Nonbinary'],
      orgPermissions: [
        {
          org: ObjectId('511111111111111111111112'),
          viewPermission: 'SHARE',
        },
        {
          org: ObjectId('511111111111111111111111'),
          editPermission: 'ADMIN',
        },
      ],
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62119991114'),
      name: 'Locked Down Mentor',
      firstName: 'Locked Down',
      isPrivate: false,
      user: ObjectId('5ffdf41a1ee2c62320b49ea8'),
      subjects: [ObjectId('5ffdf41a1ee2c62320b49eb3')],
      keywords: ['Nonbinary'],
      orgPermissions: [
        {
          org: ObjectId('511111111111111111111112'),
          viewPermission: 'SHARE',
        },
        {
          org: ObjectId('511111111111111111111111'),
          editPermission: 'ADMIN',
        },
      ],
      mentorConfig: ObjectId('5ffdf41a1ee2c62111111132'),
      lockedToConfig: true,
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62119991234'),
      name: 'Test Default Topics Mentor',
      firstName: 'DefaultTopics',
      isPrivate: false,
      user: ObjectId('5ffdf41a1ee2c62119991235'),
      subjects: [ObjectId('5ffdf41a1ee2c62119991236')],
      keywords: ['Nonbinary'],
      orgPermissions: [],
      lockedToConfig: false,
    },
  ],

  mentorpanels: [
    {
      _id: ObjectId('5ffdf41a1ee2c62111111111'),
      subject: ObjectId('5ffdf41a1ee2c62320b49eb3'),
      mentors: [ObjectId('5ffdf41a1ee2c62111111112')],
      title: 'fake panel title',
      subtitle: 'fake panel subtitle',
    },
  ],

  subjects: [
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49eb1'),
      name: 'Repeat After Me',
      type: 'UTTERANCES',
      description: "These are miscellaneous phrases you'll be asked to repeat.",
      isRequired: true,
      categories: [],
      topics: [
        {
          id: ObjectId('5ffdf41a1ee2c62320b49ec1'),
          name: 'Idle',
          description: '30-second idle clip',
        },
      ],
      questions: [
        {
          question: ObjectId('511111111111111111111111'),
          topics: [ObjectId('5ffdf41a1ee2c62320b49ec1')],
        },
      ],
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49eb2'),
      name: 'Background',
      description:
        'These questions will ask general questions about your background that might be relevant to how people understand your career.',
      isRequired: true,
      categories: [
        {
          id: 'category',
          name: 'Category',
          description: 'A test category',
        },
      ],
      topics: [
        {
          id: ObjectId('5ffdf41a1ee2c62320b49ec2'),
          name: 'Background',
          description:
            'These questions will ask general questions about your background, that might be relevant to how people understand your career',
        },
        {
          id: ObjectId('5ffdf41a1ee2c62320b49ec3'),
          name: 'Advice',
          description:
            'These questions will ask you to give advice to someone who is interested in your career',
        },
      ],
      questions: [
        {
          question: ObjectId('511111111111111111111112'),
          topics: [ObjectId('5ffdf41a1ee2c62320b49ec2')],
        },
        {
          question: ObjectId('511111111111111111111113'),
          category: 'category',
          topics: [ObjectId('5ffdf41a1ee2c62320b49ec2')],
        },
        {
          question: ObjectId('511111111111111111111114'),
          topics: [ObjectId('5ffdf41a1ee2c62320b49ec3')],
        },
        {
          question: ObjectId('511111111111111111111116'),
        },
        {
          question: ObjectId('511111111111111111111117'),
          category: 'category',
        },
      ],
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49eb3'),
      name: 'STEM',
      description: 'These questions will ask about STEM careers.',
      categories: [],
      topics: [
        {
          id: ObjectId('5ffdf41a1ee2c62320b49ec3'),
          name: 'Advice',
          description:
            'These questions will ask you to give advice to someone who is interested in your career',
        },
      ],
      questions: [{ question: ObjectId('511111111111111111111115') }],
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ec9'),
      name: 'Deleted Subject',
      description: 'Testing a deleted subject.',
      categories: [],
      topics: [
        {
          id: ObjectId('5ffdf41a1ee2c62320b49ec3'),
          name: 'Advice',
          description:
            'These questions will ask you to give advice to someone who is interested in your career',
        },
      ],
      questions: [{ question: ObjectId('511111111111111111111115') }],
      deleted: true,
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62119991236'),
      name: 'Subject Topic Question Test',
      description: 'Testing subject question test',
      categories: [
        {
          id: 'category',
          name: 'Test Category',
          description: 'A test category',
          defaultTopics: ['5ffdf41a1ee2c62119991237'],
        },
      ],
      topics: [
        {
          id: ObjectId('5ffdf41a1ee2c62320b21ec3'),
          name: 'Unused Category',
          description: 'Unused Category',
        },
        {
          id: ObjectId('5ffdf41a1ee2c62119991237'),
          name: '(Default Topic) Test Category',
          description: 'Categories default topic',
        },
      ],
      questions: [
        {
          question: ObjectId('511111111111111111111115'),
          topics: [],
          category: 'category',
          useDefaultTopics: 'TRUE',
        },
        {
          question: ObjectId('511111111111111111111113'),
          topics: [],
          category: 'category',
          // useDefaultTopics: 'DEFAULT',  should automatically be default
        },
        {
          question: ObjectId('511111111111111111111117'),
          topics: [],
          category: 'category',
          useDefaultTopics: 'FALSE',
        },
        {
          question: ObjectId('511111111111111111111114'),
          topics: [],
          category: '',
          useDefaultTopics: 'DEFAULT',
        },
      ],
    },
  ],

  questions: [
    {
      _id: ObjectId('511111111111111111111111'),
      question: "Don't talk and stay still.",
      type: 'UTTERANCE',
      name: 'idle',
      subType: 'cant_answer',
    },
    {
      _id: ObjectId('511111111111111111111112'),
      question: 'Who are you and what do you do?',
      type: 'QUESTION',
    },
    {
      _id: ObjectId('511111111111111111111113'),
      question: 'How old are you?',
      type: 'QUESTION',
    },
    {
      _id: ObjectId('511111111111111111111114'),
      question: 'Do you like your job?',
      type: 'QUESTION',
    },
    {
      _id: ObjectId('511111111111111111111115'),
      question: 'Is STEM fun?',
      type: 'QUESTION',
    },
    {
      _id: ObjectId('511111111111111111111116'),
      question: 'Julia?',
      mentor: ObjectId('5ffdf41a1ee2c62111111112'),
      type: 'QUESTION',
    },
    {
      _id: ObjectId('511111111111111111111117'),
      question: 'What is Aaron like?',
      type: 'QUESTION',
    },
    {
      _id: ObjectId('511111111111111111111193'),
      question: 'This is an orphaned question (does not belong to a subject).',
      type: 'QUESTION',
    },
  ],

  answers: [
    {
      _id: ObjectId('511111111111111111111174'),
      mentor: ObjectId('5ffdf41a1ee2c62111111119'),
      question: ObjectId('511111111111111111111112'),
      hasEditedTranscript: true,
      transcript:
        "**My** [*name*](http://clint.com) __is__ Clint __Anderson and I'm a__ **Nuclear Electrician's Mate**",
      video: 'https://idle/url',
      status: 'COMPLETE',
      webMedia: {
        type: 'video',
        tag: 'web',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/web.mp4',
      },
      mobileMedia: {
        type: 'video',
        tag: 'mobile',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/mobile.mp4',
      },
    },
    {
      _id: ObjectId('511111111111111111111112'),
      mentor: ObjectId('5ffdf41a1ee2c62111111111'),
      question: ObjectId('511111111111111111111111'),
      hasEditedTranscript: true,
      transcript: '[being still]',
      video: 'https://idle/url',
      status: 'COMPLETE',
      webMedia: {
        type: 'video',
        tag: 'web',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/web.mp4',
        transparentVideoUrl:
          'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/web.webm',
      },
      mobileMedia: {
        type: 'video',
        tag: 'mobile',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/mobile.mp4',
      },
      externalVideoIds: {
        wistiaId: '5ffdf41a1ee2c62111111111-wistia-id',
        paraproId: '5ffdf41a1ee2c62111111111-parapro-id',
      },
    },
    {
      _id: ObjectId('511111111111111111111114'),
      mentor: ObjectId('5ffdf41a1ee2c62111111112'),
      question: ObjectId('511111111111111111111116'),
      hasEditedTranscript: false,
      transcript: 'Julia transcript',
      video: 'https://test/url',
      status: 'COMPLETE',
      webMedia: {
        type: 'video',
        tag: 'web',
        url: 'videos/5ffdf41a1ee2c62111111112/511111111111111111111116/web.mp4',
      },
      mobileMedia: {
        type: 'video',
        tag: 'mobile',
        url: 'videos/5ffdf41a1ee2c62111111112/511111111111111111111116/mobile.mp4',
      },
    },
    {
      _id: ObjectId('511111111111111111111113'),
      mentor: ObjectId('5ffdf41a1ee2c62111111111'),
      question: ObjectId('511111111111111111111117'),
      hasEditedTranscript: false,
      transcript: 'Test Transcript',
      video: 'https://test/url',
      status: 'COMPLETE',
      webMedia: {
        type: 'video',
        tag: 'web',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111117/web.mp4',
      },
      mobileMedia: {
        type: 'video',
        tag: 'mobile',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111117/mobile.mp4',
      },
    },
    {
      _id: ObjectId('511111111111111111111119'),
      mentor: ObjectId('5ffdf41a1ee2c62111111114'),
      question: ObjectId('511111111111111111111111'),
      hasEditedTranscript: true,
      transcript: '[being still]',
      video: 'https://idle/url',
      status: 'COMPLETE',
      webMedia: {
        type: 'video',
        tag: 'web',
        url: 'videos/5ffdf41a1ee2c62111111114/511111111111111111111111/web.mp4',
      },
      mobileMedia: {
        type: 'video',
        tag: 'mobile',
        url: 'videos/5ffdf41a1ee2c62111111114/511111111111111111111111/mobile.mp4',
      },
    },
    {
      _id: ObjectId('511111111111111111111195'),
      mentor: ObjectId('5ffdf41a1ee2c62111111119'),
      question: ObjectId('511111111111111111111193'),
      hasEditedTranscript: true,
      transcript:
        'This is an orphaned answer (the respective question does not belong to a subject)',
      video: 'https://idle/url',
      status: 'COMPLETE',
      webMedia: {
        type: 'video',
        tag: 'web',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/web.mp4',
      },
      mobileMedia: {
        type: 'video',
        tag: 'mobile',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/mobile.mp4',
      },
    },
    {
      _id: ObjectId('511111111111111111111196'),
      mentor: ObjectId('5ffdf41a1ee2c62119991234'),
      question: ObjectId('511111111111111111111115'),
      hasEditedTranscript: true,
      transcript: 'answer transcript',
      video: 'https://idle/url',
      status: 'COMPLETE',
      webMedia: {
        type: 'video',
        tag: 'web',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/web.mp4',
      },
      mobileMedia: {
        type: 'video',
        tag: 'mobile',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/mobile.mp4',
      },
    },
    {
      _id: ObjectId('511111111111111111111197'),
      mentor: ObjectId('5ffdf41a1ee2c62119991234'),
      question: ObjectId('511111111111111111111113'),
      hasEditedTranscript: true,
      transcript: 'answer transcript',
      video: 'https://idle/url',
      status: 'COMPLETE',
      webMedia: {
        type: 'video',
        tag: 'web',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/web.mp4',
      },
      mobileMedia: {
        type: 'video',
        tag: 'mobile',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/mobile.mp4',
      },
    },
    {
      _id: ObjectId('511111111111111111111198'),
      mentor: ObjectId('5ffdf41a1ee2c62119991234'),
      question: ObjectId('511111111111111111111117'),
      hasEditedTranscript: true,
      transcript: 'answer transcript',
      video: 'https://idle/url',
      status: 'COMPLETE',
      webMedia: {
        type: 'video',
        tag: 'web',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/web.mp4',
      },
      mobileMedia: {
        type: 'video',
        tag: 'mobile',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/mobile.mp4',
      },
    },
    {
      _id: ObjectId('511111111111111111111199'),
      mentor: ObjectId('5ffdf41a1ee2c62119991234'),
      question: ObjectId('511111111111111111111114'),
      hasEditedTranscript: true,
      transcript: 'answer transcript',
      video: 'https://idle/url',
      status: 'COMPLETE',
      webMedia: {
        type: 'video',
        tag: 'web',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/web.mp4',
      },
      mobileMedia: {
        type: 'video',
        tag: 'mobile',
        url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/mobile.mp4',
      },
    },
  ],

  userquestions: [
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ee1'),
      mentor: ObjectId('5ffdf41a1ee2c62111111111'),
      classifierAnswer: ObjectId('511111111111111111111112'),
      question: 'who are you?',
      feedback: 'NEUTRAL',
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ee3'),
      mentor: ObjectId('5ffdf41a1ee2c62111111111'),
      classifierAnswer: ObjectId('511111111111111111111174'),
      classifierAnswerType: 'OFF_TOPIC',
      question: 'who are you?',
      feedback: 'NEUTRAL',
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ee2'),
      question: 'how are you?',
      feedback: 'BAD',
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49e33'),
      mentor: ObjectId('5ffdf41a1ee2c62111111113'),
      question: 'how are you?',
      feedback: 'BAD',
    },
  ],

  uploadtasks: [
    {
      mentor: ObjectId('5ffdf41a1ee2c62111111111'),
      question: ObjectId('511111111111111111111112'),
      transcribeTask: {
        task_name: 'transcribe',
        task_id: 'transcribe_task_id',
        status: 'IN_PROGRESS',
        payload: 'text payload',
      },
      transcript: 'fake_transcript',
    },
    {
      mentor: ObjectId('5ffdf41a1ee2c62111111113'),
      question: ObjectId('511111111111111111111112'),
      transcribeTask: {
        task_name: 'transcribe',
        task_id: 'transcribe_task_id',
        status: 'IN_PROGRESS',
        payload: 'text payload',
      },
      transcript: 'fake_transcript',
    },
  ],

  keywords: [
    {
      _id: ObjectId('511111111111111111111111'),
      type: 'Gender',
      keywords: ['Male', 'Female', 'Nonbinary'],
    },
    {
      _id: ObjectId('511111111111111111111112'),
      type: 'Career',
      keywords: ['STEM'],
    },
  ],

  organizations: [
    {
      _id: ObjectId('511111111111111111111111'),
      uuid: 'usc',
      name: 'USC',
      subdomain: 'usc',
      isPrivate: true,
      accessCodes: ['asdf', 'test'],
      members: [
        {
          user: ObjectId('5ffdf41a1ee2c62320b49ea2'),
          role: 'ADMIN',
        },
        {
          user: ObjectId('5ffdf41a1ee2c62320b49ea4'),
          role: 'CONTENT_MANAGER',
        },
        {
          user: ObjectId('5ffdf41a1ee2c62320b49ea3'),
          role: 'USER',
        },
      ],
      config: [
        {
          key: 'activeMentorPanels',
          value: [ObjectId('5ffdf41a1ee2c62111111111')],
        },
        {
          key: 'featuredMentorPanels',
          value: [ObjectId('5ffdf41a1ee2c62111111111')],
        },
      ],
    },
    {
      _id: ObjectId('511111111111111111111112'),
      uuid: 'csuf',
      name: 'CSUF',
      subdomain: 'careerfair',
      isPrivate: false,
      accessCodes: [],
      members: [
        {
          user: ObjectId('5ffdf41a1ee2c62320b49ea1'),
          role: 'ADMIN',
        },
        {
          user: ObjectId('5ffdf41a1ee2c62320b49ea5'),
          role: 'CONTENT_MANAGER',
        },
        {
          user: ObjectId('5ffdf41a1ee2c62320b49ea3'),
          role: 'USER',
        },
      ],
      config: [
        {
          key: 'activeMentorPanels',
          value: [ObjectId('5ffdf41a1ee2c62111111111')],
        },
        {
          key: 'featuredMentorPanels',
          value: [ObjectId('5ffdf41a1ee2c62111111111')],
        },
      ],
    },
  ],

  refreshtokens: [
    {
      _id: ObjectId('511111111111111111111678'),
      user: ObjectId('5ffdf41a1ee2c62320b49ea1'),
      token:
        '6c3c54a0eab05e133b2425137a11111ce0b5f0053e62140bf7086477d1111191cd2fc2679724b111',
      expires: '2100-10-12T20:49:41.599+00:00',
      created: '',
    },
  ],
};
