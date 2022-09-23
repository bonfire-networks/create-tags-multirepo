import * as core from '@actions/core'
import * as github from '@actions/github'
import * as semver from 'semver'

async function run(): Promise<void> {
  try {
    const repos = core.getInput('repos').split(',') || github.context.repo

    const owner = core.getInput('owner')
    const msg = core.getInput('message')

    const tag = core.getInput('version')
    if (semver.valid(tag) == null) {
      core.setFailed(
        `Tag ${tag} does not appear to be a valid semantic version`
      )
      return
    }

    const client = github.getOctokit(core.getInput('token'))

    for (var repo in repos) {
      const commits = client.rest.repos.listCommits({
        owner,
        repo,
        per_page: 1
      })[0]
      console.log(commits)
      const commit = commits[0]

      core.info(`Using latest commit #{commit} in ${repo}`)

      const tag_rsp = await client.git.createTag({
        repo,
        tag,
        owner: owner,
        message: msg,
        object: commit,
        type: 'commit'
      })

      if (tag_rsp.status !== 201) {
        core.setFailed(
          `Failed to create tag object (status=${tag_rsp.status}) in ${repo}`
        )
        return
      }

      const ref_rsp = await client.git.createRef({
        repo,
        owner: owner,
        ref: `refs/tags/${tag}`,
        sha: tag_rsp.data.sha
      })

      if (ref_rsp.status !== 201) {
        core.setFailed(
          `Failed to create tag ref(status = ${tag_rsp.status}) in ${repo}`
        )
        return
      }

      core.info(`Tagged ${tag_rsp.data.sha} as ${tag} in ${repo}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(JSON.stringify(error))
    }
  }
}

run()
