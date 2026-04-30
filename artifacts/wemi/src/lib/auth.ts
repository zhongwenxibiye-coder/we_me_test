export interface User {
  id: string;
  name: string;
  email: string;
  university: string;
  major: string;
  graduationYear: number;
}

const USER_KEY = "wemi.user";
const USERS_KEY = "wemi.users";

interface StoredAccount extends User {
  password: string;
}

function readAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function signOut() {
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("wemi:auth"));
}

export function signUp(input: {
  name: string;
  email: string;
  password: string;
  university: string;
  major: string;
  graduationYear: number;
}): { ok: true; user: User } | { ok: false; error: string } {
  const accounts = readAccounts();
  if (accounts.some((a) => a.email === input.email)) {
    return { ok: false, error: "이미 가입된 이메일이에요." };
  }
  const user: StoredAccount = {
    id: `u-${Date.now()}`,
    name: input.name,
    email: input.email,
    password: input.password,
    university: input.university,
    major: input.major,
    graduationYear: input.graduationYear,
  };
  accounts.push(user);
  writeAccounts(accounts);
  const { password, ...publicUser } = user;
  void password;
  localStorage.setItem(USER_KEY, JSON.stringify(publicUser));
  window.dispatchEvent(new Event("wemi:auth"));
  return { ok: true, user: publicUser };
}

export function signIn(
  email: string,
  password: string,
): { ok: true; user: User } | { ok: false; error: string } {
  const accounts = readAccounts();
  const account = accounts.find((a) => a.email === email);
  if (!account) {
    return { ok: false, error: "가입되지 않은 이메일이에요." };
  }
  if (account.password !== password) {
    return { ok: false, error: "비밀번호가 일치하지 않아요." };
  }
  const { password: _pw, ...publicUser } = account;
  void _pw;
  localStorage.setItem(USER_KEY, JSON.stringify(publicUser));
  window.dispatchEvent(new Event("wemi:auth"));
  return { ok: true, user: publicUser };
}
