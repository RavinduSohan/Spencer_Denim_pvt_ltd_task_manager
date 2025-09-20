import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - api/test-db (database test route)
     * - api/todos (todo API routes - temporarily disabled for testing)
     * - api/todo-lists (todo list API routes - temporarily disabled for testing)
     * - auth (authentication pages)
     * - test-db.html (database test page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/test-db|api/todos|api/todo-lists|auth|test-db.html|_next/static|_next/image|favicon.ico).*)',
  ],
};
