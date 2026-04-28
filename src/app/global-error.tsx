'use client';

// Top-level error boundary for the App Router.
// Captures React rendering errors and forwards them to Sentry.
// See: https://nextjs.org/docs/app/api-reference/file-conventions/error
import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
