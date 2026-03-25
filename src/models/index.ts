import { t } from "elysia";

const linkBody = t.Object({
  code: t.Optional(t.String({ maxLength: 10 })),
  url: t.String({ format: "uri" }),
});

export const LinkModel = {
  create: linkBody,
  update: linkBody,
  params: t.Object({ code: t.String() }),
};
