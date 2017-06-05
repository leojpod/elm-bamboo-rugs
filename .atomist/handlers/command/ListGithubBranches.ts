import {
  CommandHandler,
  Intent,
  MappedParameter,
  Parameter,
  ParseJson,
  ResponseHandler,
  Tags
} from '@atomist/rug/operations/Decorators'
import {
  CommandPlan,
  HandleCommand,
  HandleResponse,
  HandlerContext,
  MappedParameters,
  MessageMimeTypes,
  Response,
  ResponseMessage
} from '@atomist/rug/operations/Handlers'
import {Pattern} from '@atomist/rug/operations/RugOperation'
import * as mustache from 'mustache'

/**
 * A return a list of existing branches of your repo.
 */
@CommandHandler('ListGithubBranches', 'return a list of existing branches of your repo')
@Tags('documentation')
@Intent('list branches')
export class ListGithubBranches implements HandleCommand {

  @Parameter({
    displayName: 'start with',
    pattern: Pattern.any,
    required: false
  })
  public startWith: string = ''

  @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
  public repo: string

  @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
  public owner: string

  @MappedParameter('atomist://correlation_id')
  public corrid: string

  public handle (context: HandlerContext): CommandPlan {
    const plan = new CommandPlan()
    // step 1 - send a request to github
    plan.add({
      instruction: {
        kind: 'execute',
        name: 'http',
        parameters: {
          url: `https://api.github.com/repos/${this.owner}/${this.repo}/branches`,
          method: 'get',
          config: {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `token #{github://user_token?scopes=repo}`
            }
          }
        }
      },
      onSuccess: {
        kind: 'respond',
        name: 'SendReposBranches',
        parameters: this
      },
      onError: new ResponseMessage("Buggar, it didn't work")
    })
    // step 2 - send a message once that's done
    return plan
  }
}
export const listGithubBranches = new ListGithubBranches()

@ResponseHandler('SendReposBranches',
    'Shows answers to a query on Stack Overflow')
class ReposBranchesResponder implements HandleResponse<any> {

  @Parameter({
    displayName: 'start with',
    pattern: Pattern.any,
    required: false
  })
  public startWith: string = ''

  @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
  public repo: string

  @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
  public owner: string

  @MappedParameter('atomist://correlation_id')
  public corrid: string

  public handle ( @ParseJson response: Response<any>): CommandPlan {
    return CommandPlan.ofMessage(
        renderResults(response.body, this.startWith)
    )
  }
}
export let responder = new ReposBranchesResponder()

function renderResults (result: any, query: string): ResponseMessage {

  // if (result.items.length === 0) {
  //   return new ResponseMessage('No results found.',
  //       MessageMimeTypes.PLAIN_TEXT)
  // }

  // mark the last item for rendering purpose by mustache
  // result.items[result.items.length - 1].last = true

  return new ResponseMessage(JSON.stringify(result), MessageMimeTypes.PLAIN_TEXT)
}
