export const onSigninCallback = () => {
    const url = new URL(window.location.href);
    for (const parameter of ['code', 'state', 'session_state']) {
      url.searchParams.delete(parameter);
    }
    window.history.replaceState(window.history.state, '', url.toString());
};
