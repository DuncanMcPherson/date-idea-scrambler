import { Injectable } from "@angular/core";
import {Action, State, StateContext} from "@ngxs/store";
import { User } from "firebase/auth";
import { Users } from "../../account/actions/user.actions";

@State<User>({
	name: "user",
	defaults: null!
})
@Injectable()
export class UserState {
	@Action(Users.SignIn)
	public signIn(ctx: StateContext<User>, action: Users.SignIn): void {
		const newUser = action.payload as User;
		ctx.setState(newUser)
	}
}
