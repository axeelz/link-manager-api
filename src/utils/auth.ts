import { env } from "../config/env";

export const requireAuth = ({ bearer, status }: { bearer?: string; status: any }) => {
  if (!bearer || bearer !== env.API_KEY) {
    return status(401, "Unauthorized");
  }
};
