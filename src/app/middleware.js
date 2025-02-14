// import { NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';

// const secret = process.env.JWT_SECRET || 'your-secret-key';

// export function middleware(req) {
//     console.log("Middleware is running!");
//     const token = req.cookies.get('authToken')?.value || '';
//     const path = req.nextUrl.pathname;

//     // Define routes that don't require authentication
//     const publicRoutes = [
//         '/api/login',
//         '/api/registration',
//         '/login',
//         '/registration'
//     ];

//     // Skip token check for public routes
//     if (publicRoutes.includes(path)) {
//         console.log("Public Route, skipping authentication");
//         return NextResponse.next();
//     }

//     const isAdminRoute = path.startsWith('/api/admin');

//     try {
//         if (token) {
//             const decoded = jwt.verify(token, secret);
//             if (decoded) {
//                 const { role } = decoded;

//                 if (isAdminRoute && role !== 'admin') {
//                     return new NextResponse(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 403, headers: { 'content-type': 'application/json' } });
//                 }

//                 const requestHeaders = new Headers(req.headers);
//                 requestHeaders.set('userId', decoded.userId);
//                 requestHeaders.set('role', role);
//                 return NextResponse.next({
//                     request: {
//                         headers: requestHeaders,
//                     }
//                 });
//             }

//         }
//         // If no token or invalid token
//         return NextResponse.redirect(new URL('/login', req.nextUrl));


//     } catch (error) {
//         console.error("Auth Error", error);
//         return NextResponse.redirect(new URL('/login', req.nextUrl));
//     }
// }

// export const config = {
//     matcher: [
//         /*
//          * Match all request paths except for the ones starting with:
//          * - _next/ (Next.js internals)
//          * - static/ (public files)
//          * - favicon.ico, and images
//          */
//         '/((?!_next/|_static/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg)).*)'
//     ],
// }