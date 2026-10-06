# GitHub publishing

## Local production build and Pages deployment

Production output in `website/build/` is committed alongside source. The
tracked [pre-commit hook](../.githooks/pre-commit) runs the local production build,
blocks the commit on failure, and stages the generated directory, including
deleted assets. It does not stage source files: include all saved source changes
that contribute to the build in the commit. Avoid partial commits with this workflow.

The production URL prefix is configured as `/practice-gcse-maths`. The hook is
active in the current checkout. Enable it once per new clone from the repository root:

```sh
git config core.hooksPath .githooks
```

Install website dependencies with `npm ci` from `website/` before the first
commit. Node and npm must be on Git's PATH, including when committing in VS Code.

The production URL prefix is stored in `pages-base-path` in this directory:
use `/REPO-NAME` for `https://OWNER.github.io/REPO-NAME/`, or an empty file for
an account site or a custom domain hosted at its root. Update it before committing
if the hosting path changes. Local development keeps its normal root URL.

GitHub Pages is enabled with **Settings → Pages → Source → GitHub Actions**
for this repository. The site URL is https://joe312213.github.io/practice-gcse-maths/.
The [deployment workflow](workflows/deploy-pages.yml) runs on pushes to `main`
and uploads only the committed `website/build/`. It does not install dependencies
or build source on GitHub. Manual deployment from `main` is also available.
If you rename the deployment branch, update both branch conditions in the workflow.

Builds made by other local commands can overwrite `website/build/`; the hook
rebuilds it with the production URL prefix before each commit. Bypassing hooks
also bypasses this freshness guarantee. A failed build leaves the commit blocked;
fix it and retry the commit.

## Repository topics

Repository topics are maintained in [topics.json](topics.json). GitHub does not
automatically apply this file when code is pushed. Applying the topics is part
of publishing this repository to GitHub, and should be repeated when the list
changes.

After creating the GitHub repository and pushing the code, run the following
from the repository root with an authenticated GitHub CLI. Replace `OWNER/REPO`
with the intended GitHub repository:

```sh
gh api --method PUT repos/OWNER/REPO/topics --input .github/topics.json
```

This replaces the repository's entire topic list with the configured list.
Keep any additional topics you want in `topics.json` before applying it. The
response lists the resulting topics; they also appear in the repository's
About section.

The account must have permission to manage repository topics. If using a
fine-grained access token, it needs Administration: write for that repository.
Keep authentication outside the repository, using `gh auth login` or your
existing credential setup.

This topic-setting step changes discovery metadata only; it does not deploy
the website or change its license.

References: [GitHub topics API](https://docs.github.com/en/rest/repos/repos#replace-all-repository-topics)
and [GitHub CLI API command](https://cli.github.com/manual/gh_api).
