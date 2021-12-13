/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Request, Response, NextFunction, Express } from 'express';
import mongoose from 'mongoose';
import morgan, { TokenIndexer } from 'morgan';
import path from 'path';
import { logger } from 'utils/logging';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

export async function createApp(): Promise<Express> {
  const gqlMiddleware = (await import('gql/middleware')).default;
  if (!process.env.NODE_ENV?.includes('prod')) {
    require('longjohn'); // full stack traces when testing
  }
  const configureEnv = (await import('utils/configure-env')).default;
  configureEnv();
  if (process.env.APP_DISABLE_AUTO_START !== 'true') {
    await appStart();
  }
  require('./auth');
  const app = express();
  if (!process.env.NODE_ENV?.includes('test')) {
    app.use(
      morgan((tokens: TokenIndexer, req: Request, res: Response) =>
        JSON.stringify({
          message: 'http-request-log',
          method: tokens['method'](req, res),
          url: tokens['url'](req, res),
          status: tokens['status'](req, res),
          'response-time': tokens['response-time'](req, res),
          'content-length': tokens['res'](req, res, 'content-length'),
        })
      )
    );
  }
  if (process.env.IS_SENTRY_ENABLED === 'true') {
    logger.info(`sentry enabled, calling init on ${process.env.NODE_ENV}`);
    Sentry.init({
      dsn: process.env.SENTRY_DSN_MENTOR_GRAPHQL,
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app }),
      ],
      // configure sample of errors to send for performance monitoring (1.0 for 100%)
      // @see https://docs.sentry.io/platforms/javascript/configuration/sampling/
      tracesSampleRate: 0.25,
    });
    // RequestHandler creates a separate execution context using domains, so that every
    // transaction/span/breadcrumb is attached to its own Hub instance
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
  }

  const corsOptions = {
    credentials: true,
    origin: ['http://local.mentorpal.org:8000', 'http://localhost:8000'],
  };
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(express.urlencoded({ limit: '1mb', extended: true }));
  // in order to test behind nginx, these two must be under /graphql:
  app.get('/graphql/test-error-handler', (_, res) => {
    res.send(
      'This handler throws an error, go to Sentry console to check for new issues'
    );
    throw new Error('testing error handler, safe to ignore');
  });
  app.get('/graphql/test-error-unhandled', (_, res) => {
    res.send(
      'This handler does not handle promise rejection, go to Sentry console to check for new issues'
    );
    setTimeout(() => {
      new Promise((_, reject) =>
        reject(new Error('test unhandled rejection, safe to ignore'))
      );
    });
  });
  app.use('/graphql', gqlMiddleware);
  app.use(express.static(path.join(__dirname, 'public'))); // todo remove if not used

  if (process.env.IS_SENTRY_ENABLED === 'true') {
    // The error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler());
  }

  app.use(function (
    err: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    req: Request,
    res: Response,
    next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    let errorStatus = 500;
    let errorMessage = '';
    if (!isNaN(Number(err))) {
      errorStatus = err as number;
    }
    if (err instanceof Object) {
      errorStatus =
        (!isNaN(err.status) && Number(err.status) > 0) ||
        Number(err.status) < 600
          ? Number(err.status)
          : 500;
      errorMessage = err.message || '';
    }
    if (err instanceof Error && errorStatus >= 500) {
      logger.error(err.stack);
    }
    res.status(errorStatus);
    res.send({
      message: errorMessage,
      status: errorStatus,
    });
  });
  return app;
}

export async function appStart(): Promise<void> {
  const mongooseConnect = (await import('utils/mongoose-connect')).default;
  await mongooseConnect(process.env.MONGO_URI);
}

export async function appStop(): Promise<void> {
  try {
    mongoose.connection.removeAllListeners();
    await mongoose.disconnect();
  } catch (err) {
    logger.error('error on mongoose disconnect: ' + err);
  }
}

export default createApp;
