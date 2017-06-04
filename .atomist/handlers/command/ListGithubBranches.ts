import { CommandHandler, Intent, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { CommandPlan, HandleCommand, HandlerContext, ResponseMessage } from "@atomist/rug/operations/Handlers";
import { Pattern } from "@atomist/rug/operations/RugOperation";

/**
 * A return a list of existing branches of your repo.
 */
@CommandHandler("ListGithubBranches", "return a list of existing branches of your repo")
@Tags("documentation")
@Intent("list branches")
export class ListGithubBranches implements HandleCommand {

    @Parameter({
        displayName: "Some Input",
        description: "example of how to specify a parameter using decorators",
        pattern: Pattern.any,
        validInput: "a description of the valid input",
        minLength: 1,
        maxLength: 100,
        required: false,
    })
    public inputParameter: string = "default value";

    public handle(context: HandlerContext): CommandPlan {
        const message = new ResponseMessage(`Successfully ran ListGithubBranches: ${this.inputParameter}`);
        return CommandPlan.ofMessage(message);
    }
}

export const listGithubBranches = new ListGithubBranches();
