import { type JWTPayload, jwtVerify, SignJWT } from "jose";
import { type NextRequest, NextResponse } from "next/server";

if (!process.env.SECRET) {
	throw new Error("SECRET must be defined");
}

const key = new TextEncoder().encode(process.env.SECRET);
const SessionDuration = 24 * 60 * 60 * 1000;

interface User {
	email: string;
}

interface SessionData extends JWTPayload {
	user: User;
	expires: number;
}

export async function encrypt(payload: SessionData): Promise<string> {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(payload.expires)
		.sign(key);
}

export async function decrypt(session: string): Promise<SessionData | null> {
	try {
		const { payload } = await jwtVerify(session, key, {
			algorithms: ["HS256"],
		});
		return payload as SessionData;
	} catch {
		return null;
	}
}

export async function updateSession(request: NextRequest) {
	const session = request.cookies.get("session")?.value;
	if (!session) return;

	const data = await decrypt(session);
	if (!data) return;

	if (data.expires - Date.now() < 60 * 60 * 1000) {
		data.expires = Date.now() + SessionDuration;

		const res = NextResponse.next();
		res.cookies.set({
			name: "session",
			value: await encrypt(data),
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			expires: new Date(data.expires),
		});
		return res;
	}

	return NextResponse.next();
}