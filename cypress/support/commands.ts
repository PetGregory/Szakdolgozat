/// <reference types="cypress" />

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('#email').should('be.visible').type(email)
  cy.get('#password').should('be.visible').type(password)
  cy.get('button[type="submit"]').should('be.visible').click()
  cy.wait(3000)
  cy.url().should('not.include', '/login')
})

Cypress.Commands.add('logout', () => {
  cy.get('body').then(($body) => {
    if ($body.find('button:contains("Logout")').length > 0) {
      cy.get('button:contains("Logout")').first().click()
    } else if ($body.find('[data-cy="logout"]').length > 0) {
      cy.get('[data-cy="logout"]').click()
    } else {
      cy.get('button[aria-label="Profil"]').click()
      cy.get('button:contains("Logout")').click()
    }
  })
  cy.wait(1000)
})

Cypress.Commands.add('waitForAppLoad', () => {
  cy.get('app-root', { timeout: 10000 }).should('be.visible')
})

Cypress.Commands.add('fillWorkoutForm', (userData: {
  gender?: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  fitnessLevel?: string;
  availableDays?: number;
}) => {
  if (userData.gender) {
    cy.contains(userData.gender === 'male' ? 'Male' : userData.gender === 'female' ? 'Female' : 'Other').click()
    cy.get('button:contains("Next")').click()
  }

  if (userData.age) {
    cy.get('input[type="number"]').first().clear().type(userData.age.toString())
  }
  if (userData.weight) {
    cy.get('input[type="number"]').eq(1).clear().type(userData.weight.toString())
  }
  if (userData.height) {
    cy.get('input[type="number"]').eq(2).clear().type(userData.height.toString())
  }
  if (userData.age || userData.weight || userData.height) {
    cy.get('button:contains("Next")').click()
  }

  if (userData.goal) {
    const goalLabels: { [key: string]: string } = {
      'weight_loss': 'Weight Loss',
      'muscle_gain': 'Muscle Gain',
      'endurance': 'Endurance',
      'general_fitness': 'General Fitness'
    }
    cy.contains(goalLabels[userData.goal] || userData.goal).click()
    cy.get('button:contains("Next")').click()
  }

  if (userData.fitnessLevel) {
    const levelLabels: { [key: string]: string } = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced'
    }
    cy.contains(levelLabels[userData.fitnessLevel] || userData.fitnessLevel).click()
    cy.get('button:contains("Next")').click()
  }

  if (userData.availableDays) {
    cy.get('input[type="number"]').clear().type(userData.availableDays.toString())
    cy.get('button:contains("Generate")').click()
  }
})

Cypress.Commands.add('toggleDarkMode', () => {
  cy.get('app-light-button button').click()
})

Cypress.Commands.add('loginAsTestUser', () => {
  cy.login('testuser4@test.com', 'testuser4')
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
      waitForAppLoad(): Chainable<void>
      fillWorkoutForm(userData: {
        gender?: string;
        age?: number;
        weight?: number;
        height?: number;
        goal?: string;
        fitnessLevel?: string;
        availableDays?: number;
      }): Chainable<void>
      toggleDarkMode(): Chainable<void>
      loginAsTestUser(): Chainable<void>
    }
  }
}

export {}
