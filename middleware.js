import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(req) {
  const url = req.nextUrl.pathname;
  const token = req.headers.get('authorization')?.split(' ')[1];

  // Umożliwienie dostępu do odczytu dla wszystkich
  if (url === '/api/instructions' || url === '/api/measure' || url === '/api/data') {
    return NextResponse.next(); // Pozwól na dostęp bez tokenu
  }

  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next(); // Jeśli token jest poprawny, kontynuuj
  } catch (err) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
}

// Definiowanie tras, które mają być chronione
export const config = {
  matcher: ['/api/instructions', '/api/measure', '/api/data'], // Dodaj inne trasy, które chcesz chronić
};
