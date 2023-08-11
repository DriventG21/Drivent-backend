import sessionRepository from "@/repositories/session-repository";
import userRepository from "@/repositories/user-repository";
import { exclude } from "@/utils/prisma-utils";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { invalidCredentialsError } from "./errors";
import { badRequestError } from "@/errors/bad-request.error";
import axios from "axios";
import { randomUUID } from "crypto";

async function signIn(params: SignInParams): Promise<SignInResult> {
  const { email, password } = params;

  const user = await getUserOrFail(email);

  await validatePasswordOrFail(password, user.password);

  const token = await createSession(user.id);

  return {
    user: exclude(user, "password"),
    token,
  };
}

async function getUserOrFail(email: string): Promise<GetUserOrFailResult> {
  const user = await userRepository.findByEmail(email, { id: true, email: true, password: true });
  if (!user) throw invalidCredentialsError();

  return user;
}

async function createSession(userId: number) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  await sessionRepository.create({
    token,
    userId,
  });

  return token;
}

async function validatePasswordOrFail(password: string, userPassword: string) {
  const isPasswordValid = await bcrypt.compare(password, userPassword);
  if (!isPasswordValid) throw invalidCredentialsError();
}

async function GitHubSignIn(code: string) {
  if (!code) {
    throw badRequestError();
  }

  const accessToken = await exchangeCodeForAccessToken(code);
  const gitHubUser = await fetchUserFromGitHub(accessToken);

  const user = await userRepository.upsertByEmail({
    email: gitHubUser.login + "@github.com",
    password: randomUUID(),
  });
  const token = await createSession(user.id);
  return {
    user: exclude(user, "password"),
    token,
  };
}

async function exchangeCodeForAccessToken(code: string) {
  const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
  const { CLIENT_ID, CLIENT_SECRET } = process.env;

  const params: GitHubAcessTokenParams = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
  };

  const response = await axios.post<GitHubAccessTokenResponse>(GITHUB_TOKEN_URL, null, {
    params,
    headers: {
      Accept: " application/json",
    },
  });

  return response.data.access_token;
}

async function fetchUserFromGitHub(token: string) {
  const GITHUB_USER_URL = "https://api.github.com/user";
  const githubUser = await axios.get(GITHUB_USER_URL, {
    headers: {
      Authorization: `bearer ${token}`,
    },
  });

  return githubUser.data;
}

type GitHubAcessTokenParams = {
  client_id: string;
  client_secret: string;
  code: string;
};

type GitHubAccessTokenResponse = {
  access_token: string;
  scope: string;
  token_type: string;
};

export type SignInParams = Pick<User, "email" | "password">;

type SignInResult = {
  user: Pick<User, "id" | "email">;
  token: string;
};

type GetUserOrFailResult = Pick<User, "id" | "email" | "password">;

const authenticationService = {
  signIn,
  GitHubSignIn,
};

export default authenticationService;
export * from "./errors";
