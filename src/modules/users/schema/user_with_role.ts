import { Prisma } from "@prisma/client";

export type UserWithRole = Prisma.UserGetPayload<{
  include: {
    role: {
      select: {
        name: true;
      };
    };
  };
}>;