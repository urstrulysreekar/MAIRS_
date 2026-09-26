import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // Allow public landing, login, auth callbacks, and static assets
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.');

  // Check demo session cookie
  const isDemoSession = request.cookies.get('maris_demo_user')?.value === 'true';

  // Demo mode environment override - defaults to true for instant evaluation
  const isGlobalDemo =
    process.env.NEXT_PUBLIC_DEMO_MODE !== 'false' &&
    process.env.NEXT_PUBLIC_DEMO_MODE !== '0';


  // In demo mode or if user has demo cookie, allow access to dashboard routes
  if (isGlobalDemo || isDemoSession) {
    return response;
  }

  // Initialize Supabase auth check for production
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-maris.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is unauthenticated and attempting to access protected route
  if (!session && !isPublicRoute) {
    const rawNext = pathname + request.nextUrl.search;
    // Open redirect protection: must start with single '/', no double slashes, no backslashes
    const sanitizedNext =
      rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes('\\')
        ? encodeURIComponent(rawNext)
        : encodeURIComponent('/console');

    const redirectUrl = new URL(`/login?next=${sanitizedNext}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated user visits login, redirect to console
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/console', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};
