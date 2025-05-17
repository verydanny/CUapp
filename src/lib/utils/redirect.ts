import { type ActionResult, redirect } from '@sveltejs/kit';

export const normalizeRedirect = <
    SuccessMessage extends Record<string, unknown> | undefined,
    ErrorMessage extends Record<string, unknown> | undefined
>(
    action: ActionResult<SuccessMessage, ErrorMessage>
): ActionResult<SuccessMessage, ErrorMessage> => {
    if (action.type === 'redirect') {
        return redirect(action.status, action.location);
    }

    return action;
};
