import { Prisma } from "src/generated/client";

export type UserWithRole = Prisma.UserGetPayload<{
  include: {
    role: {
      select: {
        name: true;
      };
    };
  };
}>;