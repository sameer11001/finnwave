export type JWTPayloadType = {
  sub: string;
  email: string;
  sid: string;
  role: string;
  iat?: number;
  exp?: number;
};
