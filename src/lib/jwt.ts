import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
const defaultExp = process.env.JWT_EXPIRES || "7d";

export type JwtPayload = { uid: string; rid?: number; rname?: string };

export async function signJwt(payload: JwtPayload, exp: string = defaultExp) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(exp)
    .sign(secret);
}

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as JwtPayload;
}
