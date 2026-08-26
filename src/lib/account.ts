export type AccountProfile = {
  userId: string
  username: string
  createdAt: string
}

export type AccountPreferences = {
  minecraftVersion?: string
  loader?: string
}

export type SavedSetup = {
  id: string
  name: string
  minecraftVersion: string
  loader: string
  selectedMods: string[]
  createdAt: string
}

export type AccountRecord = AccountProfile & {
  libraries: string[][]
  setups: SavedSetup[]
  preferences: AccountPreferences
}

export type AuthResult =
  | { ok: true; account: AccountProfile }
  | { ok: false; reason: 'backend-unavailable' | 'invalid-request' }

export interface AccountService {
  getCurrentAccount(): Promise<AccountProfile | null>
  signIn(identifier: string): Promise<AuthResult>
  signUp(username: string, identifier: string): Promise<AuthResult>
  signOut(): Promise<void>
}

/** Replace this adapter with a real provider without changing UI components. */
export const accountService: AccountService = {
  async getCurrentAccount() {
    return null
  },
  async signIn(identifier) {
    void identifier
    return { ok: false, reason: 'backend-unavailable' }
  },
  async signUp(username, identifier) {
    void username
    void identifier
    return { ok: false, reason: 'backend-unavailable' }
  },
  async signOut() {
    return Promise.resolve()
  },
}
