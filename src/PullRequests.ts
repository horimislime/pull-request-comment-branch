import { context, getOctokit } from "@actions/github";

interface PullRequestDetailsResponse {
  repository: {
    pullRequest: {
      headRef: {
        name: string;
        target: {
          oid: string;
        };
      };
      baseRef: {
        name: string;
        target: {
          oid: string;
        };
      };
    };
  };
}

export async function isPullRequest(token: string) {
  const client = getOctokit(token);
  console.log(`client: ${client}`);

  const {
    data: { pull_request },
  } = await client.rest.issues.get({
    ...context.repo,
    issue_number: context.issue.number,
  });
  console.log("success");

  return !!pull_request;
}

export async function pullRequestDetails(token: string) {
  const client = getOctokit(token);

  console.log(
    `repo: ${context.repo.repo} owner: ${context.repo.owner} issue: ${context.issue.number}`
  );

  const {
    repository: {
      pullRequest: { baseRef, headRef },
    },
  } = await client.graphql<PullRequestDetailsResponse>(
    `
      query pullRequestDetails($repo:String!, $owner:String!, $number:Int!) {
        repository(name: $repo, owner: $owner) {
          pullRequest(number: $number) {
            baseRef {
              name
              target {
                oid
              }
            }
            headRef {
              name
              target {
                oid
              }
            }
          }
        }
      }
    `,
    {
      ...context.repo,
      number: context.issue.number,
    }
  );

  return {
    base_ref: baseRef.name,
    base_sha: baseRef.target.oid,
    head_ref: headRef.name,
    head_sha: headRef.target.oid,
  };
}
