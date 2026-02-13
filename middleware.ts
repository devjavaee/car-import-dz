import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; // Correction ici : next/server au lieu de next/request

export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session');

  // Optionnel : Tu peux ajouter une logique de redirection forcée ici 
  // si tu veux protéger des routes spécifiques.
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};