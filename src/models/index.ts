import { t } from "elysia";

export const LinkModel = {
  create: t.Object({
    code: t.Optional(t.String({ maxLength: 10 })),
    url: t.String({ format: "uri" }),
  }),
  update: t.Object({
    code: t.Optional(t.String({ maxLength: 10 })),
    url: t.String({ format: "uri" }),
  }),
  params: t.Object({
    code: t.String(),
  }),
};
