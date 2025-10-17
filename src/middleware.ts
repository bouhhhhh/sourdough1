import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { decrypt, updateSession } from "./lib/auth";

const ProtectedPaths = ["/orders"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const isProtectedPath = ProtectedPaths.some((p) => pathname.startsWith(p));

	// Handle language preference
	const languageCookie = request.cookies.get("NEXT_LOCALE")?.value;
	const response = NextResponse.next();
	
	// Pass language preference to the environment if it exists
	if (languageCookie) {
		response.headers.set("x-preferred-locale", languageCookie);
	}

	if (!isProtectedPath) {
		return response;
	}

	const session = request.cookies.get("session")?.value;
	if (!session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	const data = await decrypt(session);
	if (!data || data.expires < Date.now()) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	const sessionResponse = await updateSession(request);
	
	// Preserve language header in session response
	if (languageCookie && sessionResponse) {
		sessionResponse.headers.set("x-preferred-locale", languageCookie);
	}
	
	return sessionResponse || response;
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
