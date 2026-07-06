import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Dashboard route protection will go here after Supabase Auth is wired.
  return NextResponse.next({ request });
}

export const config = {
  matcher: ['/dashboard/:path*', '/wishlists/:path*'],
};
