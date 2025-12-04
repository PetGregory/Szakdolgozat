import './commands'

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
      waitForAppLoad(): Chainable<void>
      loginAsTestUser(): Chainable<void>
    }
  }
}
