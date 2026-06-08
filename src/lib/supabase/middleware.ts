import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isMock = !supabaseUrl || supabaseUrl.includes('your-supabase') || supabaseUrl === '';

  if (isMock) {
    return NextResponse.next();
  }

  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This will refresh session if expired - required for Server Components
  // to read the correct session
  const { data: { user } } = await supabase.auth.getUser();

  // Route protection
  const url = request.nextUrl.clone();
  
  // If no user and trying to access dashboard/applications/calendar/analytics/profile
  const protectedRoutes = ['/dashboard', '/applications', '/calendar', '/analytics', '/profile'];
  const isProtectedRoute = protectedRoutes.some((route) => url.pathname.startsWith(route));

  if (!user && isProtectedRoute) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is logged in and tries to go to login/register/forgot-password
  const authRoutes = ['/login', '/register', '/forgot-password'];
  const isAuthRoute = authRoutes.some((route) => url.pathname.startsWith(route));

  if (user && isAuthRoute) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
};
