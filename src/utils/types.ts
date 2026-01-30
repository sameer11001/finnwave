export type JWTPayloadType = {
  sub: string;
  email: string;
  sid: string;
  iat?: number;
  exp?: number;
};
