import { z } from 'zod';

export const LOCALSTORAGE_GITHUB_CONFIG = 'githubConfig';

export const GithubConfigSchema = z.object({
  accessToken: z.string().nonempty(),
});
export type GithubConfig = z.infer<typeof GithubConfigSchema>;
