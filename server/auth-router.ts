import * as cookie from "cookie";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { createUser, findUserByEmail, updateLastSignInAt } from "./queries/users";
import { signSessionToken } from "./auth/session";

const credentialsInput = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z.string().optional(),
});

function isLocalhost(headers: Headers): boolean {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

async function setSessionCookie(userId: number, headers: Headers) {
  const token = await signSessionToken({ userId });
  const localhost = isLocalhost(headers);
  return cookie.serialize(Session.cookieName, token, {
    httpOnly: true,
    path: "/",
    sameSite: localhost ? "lax" : "none",
    secure: !localhost,
    maxAge: Session.maxAgeMs / 1000,
  });
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  register: publicQuery.input(credentialsInput).mutation(async ({ input, ctx }) => {
    const email = input.email.toLowerCase();
    const existing = await findUserByEmail(email);
    if (existing) {
      throw new TRPCError({ code: "CONFLICT", message: "An account with that email already exists." });
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await createUser({
      email,
      name: input.name ?? email.split("@")[0],
      passwordHash,
    });
    await updateLastSignInAt(user.id);
    ctx.resHeaders.append("set-cookie", await setSessionCookie(user.id, ctx.req.headers));
    return { user };
  }),

  login: publicQuery.input(credentialsInput.omit({ name: true })).mutation(async ({ input, ctx }) => {
    const email = input.email.toLowerCase();
    const user = await findUserByEmail(email);
    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
    }
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
    }
    await updateLastSignInAt(user.id);
    ctx.resHeaders.append("set-cookie", await setSessionCookie(user.id, ctx.req.headers));
    return { user };
  }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const localhost = isLocalhost(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: true,
        path: "/",
        sameSite: localhost ? "lax" : "none",
        secure: !localhost,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
