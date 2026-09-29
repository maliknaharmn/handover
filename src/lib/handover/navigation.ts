export function backWithMessage(path: string, error?: string, success?: string) {
  const query = new URLSearchParams();
  if (error) query.set("error", error.slice(0, 240));
  if (success) query.set("success", success);
  return `${path}${query.size ? `?${query.toString()}` : ""}`;
}

export function textValue(form: FormData, key: string, max = 4000) {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

export function safeNext(next: string | null) {
  return next === "/auth/invite" || next === "/reset-password" ? next : "/workspaces";
}

export function safeUuid(value: string | undefined) {
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value : null;
}
