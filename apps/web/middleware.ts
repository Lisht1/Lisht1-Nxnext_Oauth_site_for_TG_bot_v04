import { auth } from '@nxnext/auth/server';

export const middleware = auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
