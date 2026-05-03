/**
 * Standardized 402 response shape for limit-exceeded errors (AI-8778).
 *
 * Every metered API mutation calls `enforceLimit()` and catches
 * `LimitExceededError` -> uses this helper to return a consistent body the
 * client `<UpgradePrompt />` component knows how to render.
 */
import { NextResponse } from 'next/server';
import { LimitExceededError } from './limits';

export interface LimitExceededBody {
  error: 'limit_exceeded';
  resource: LimitExceededError['resource'];
  limit: number;
  used: number;
  plan: LimitExceededError['plan'];
  upgradeUrl: string;
  message: string;
}

export function limitExceededResponse(err: LimitExceededError): NextResponse<LimitExceededBody> {
  const body: LimitExceededBody = {
    error: 'limit_exceeded',
    resource: err.resource,
    limit: err.limit === Infinity ? -1 : err.limit,
    used: err.used,
    plan: err.plan,
    upgradeUrl: '/pricing',
    message: err.message,
  };
  return NextResponse.json(body, { status: 402 });
}
