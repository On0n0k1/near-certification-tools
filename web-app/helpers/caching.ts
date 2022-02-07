/* eslint-disable import/prefer-default-export */

import { ServerResponse } from 'http';

// Note: When running your application locally with next dev, your headers are overwritten to prevent caching locally.
// https://nextjs.org/docs/going-to-production#caching
// https://vercel.com/docs/concepts/edge-network/caching#serverless-functions-(lambdas)
export function addCacheHeader(res: ServerResponse, seconds: number) {
  res.setHeader('Cache-Control', `public, s-maxage=${seconds}`);
}
