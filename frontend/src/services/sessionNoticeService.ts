const SESSION_NOTICE_KEY = "eisenhower_session_notice";

export function setSessionNotice(message: string) {
  sessionStorage.setItem(SESSION_NOTICE_KEY, message);
}

export function consumeSessionNotice(): string | null {
  const value = sessionStorage.getItem(SESSION_NOTICE_KEY);
  if (!value) return null;
  sessionStorage.removeItem(SESSION_NOTICE_KEY);
  return value;
}
