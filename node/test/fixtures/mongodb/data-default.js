/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

module.exports = {
  users: [
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ea1'),
      name: 'Clinton Anderson',
      email: 'clint@anderson.com',
      userRole: 'ADMIN',
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ea2'),
      name: 'Dan Davis',
      email: 'dan@davis.com',
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
  ],

  mentors: [
    {
      _id: ObjectId('5ffdf41a1ee2c62111111111'),
      name: 'Clinton Anderson',
      firstName: 'Clint',
      title: "Nuclear Electrician's Mate",
      thumbnail:
        'mentor/thumbnails/5ffdf41a1ee2c62111111111-20210621T000000.png',
      defaultSubject: '5ffdf41a1ee2c62320b49eb1',
      subjects: [
        ObjectId('5ffdf41a1ee2c62320b49eb1'),
        ObjectId('5ffdf41a1ee2c62320b49eb2'),
      ],
      user: ObjectId('5ffdf41a1ee2c62320b49ea1'),
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
      user: ObjectId('5ffdf41a1ee2c62320b49ea3'),
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62111111113'),
      name: 'Dan Davis',
      firstName: 'Dan',
      user: ObjectId('5ffdf41a1ee2c62320b49ea2'),
      subjects: [ObjectId('5ffdf41a1ee2c62320b49eb1')],
    },
  ],

  subjects: [
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49eb1'),
      name: 'Repeat After Me',
      description: "These are miscellaneous phrases you'll be asked to repeat.",
      isRequired: true,
      categories: [],
      topics: [
        {
          id: 'idle',
          name: 'Idle',
          description: '30-second idle clip',
        },
      ],
      questions: [
        {
          question: ObjectId('511111111111111111111111'),
          topics: ['idle'],
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
          id: 'background',
          name: 'Background',
          description:
            'These questions will ask general questions about your background, that might be relevant to how people understand your career',
        },
        {
          id: 'advice',
          name: 'Advice',
          description:
            'These questions will ask you to give advice to someone who is interested in your career',
        },
      ],
      questions: [
        {
          question: ObjectId('511111111111111111111112'),
          topics: ['background'],
        },
        {
          question: ObjectId('511111111111111111111113'),
          category: 'category',
          topics: ['background'],
        },
        {
          question: ObjectId('511111111111111111111114'),
          topics: ['advice'],
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
          id: 'advice',
          name: 'Advice',
          description:
            'These questions will ask you to give advice to someone who is interested in your career',
        },
      ],
      questions: [{ question: ObjectId('511111111111111111111115') }],
    },
  ],

  questions: [
    {
      _id: ObjectId('511111111111111111111111'),
      question: "Don't talk and stay still.",
      type: 'UTTERANCE',
      name: 'idle',
    },
    {
      _id: ObjectId('511111111111111111111112'),
      question: 'Who are you and what do you do?',
    },
    {
      _id: ObjectId('511111111111111111111113'),
      question: 'How old are you?',
    },
    {
      _id: ObjectId('511111111111111111111114'),
      question: 'Do you like your job?',
    },
    {
      _id: ObjectId('511111111111111111111115'),
      question: 'Is STEM fun?',
    },
    {
      _id: ObjectId('511111111111111111111116'),
      question: 'Julia?',
      mentor: ObjectId('5ffdf41a1ee2c62111111112'),
    },
    {
      _id: ObjectId('511111111111111111111117'),
      question: 'What is Aaron like?',
    },
  ],

  answers: [
    {
      _id: ObjectId('511111111111111111111112'),
      mentor: ObjectId('5ffdf41a1ee2c62111111111'),
      question: ObjectId('511111111111111111111111'),
      transcript: '[being still]',
      video: 'https://idle/url',
      status: 'COMPLETE',
      media: [
        {
          type: 'video',
          tag: 'web',
          url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/web.mp4',
        },
        {
          type: 'video',
          tag: 'mobile',
          url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111111/mobile.mp4',
        },
      ],
    },
    {
      _id: ObjectId('511111111111111111111113'),
      mentor: ObjectId('5ffdf41a1ee2c62111111111'),
      question: ObjectId('511111111111111111111117'),
      transcript: 'Test Transcript',
      video: 'https://test/url',
      status: 'COMPLETE',
      media: [
        {
          type: 'video',
          tag: 'web',
          url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111117/web.mp4',
        },
        {
          type: 'video',
          tag: 'mobile',
          url: 'videos/5ffdf41a1ee2c62111111111/511111111111111111111117/mobile.mp4',
        },
      ],
    },
  ],

  userquestions: [
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ee1'),
      mentor: ObjectId('5ffdf41a1ee2c62111111111'),
      question: 'who are you?',
      feedback: 'NEUTRAL',
    },
    {
      _id: ObjectId('5ffdf41a1ee2c62320b49ee2'),
      question: 'how are you?',
      feedback: 'BAD',
    },
  ],

  uploadtasks: [
    {
      mentor: ObjectId('5ffdf41a1ee2c62111111111'),
      question: ObjectId('511111111111111111111112'),
      uploadStatus: 'TRANSCRIBE_IN_PROGRESS',
    },
  ],
};
