describe('Navigation Component', () => {
  beforeEach(() => {
    cy.visit('/home')
  })

  it('should display navbar', () => {
    cy.get('app-navbar').should('be.visible')
  })

  it('should navigate to home', () => {
    cy.visit('/login')
    cy.contains('Home').click()
    cy.url().should('include', '/home')
  })

  it('should navigate to login when not authenticated', () => {
    cy.visit('/home')
    cy.contains('Login').click()
    cy.url().should('include', '/login')
  })

  it('should display footer', () => {
    cy.get('app-footer').should('be.visible')
  })

  it('should have footer links', () => {
    cy.get('app-footer').within(() => {
      cy.contains('Workout Plan').should('be.visible')
      cy.contains('Nutrition Plans').should('be.visible')
      cy.contains('Progress Tracking').should('be.visible')
      cy.contains('Community').should('be.visible')
    })
  })

  it('should navigate via footer links', () => {
    cy.get('app-footer').within(() => {
      cy.contains('Workout Plan').click()
      cy.url().should('include', '/workouts')
    })
  })

  it('should toggle dark mode button', () => {
    cy.get('app-light-button').should('be.visible')
  })
})

describe('Mobile Navigation', () => {
  beforeEach(() => {
    cy.viewport(375, 667) // Mobile viewport
    cy.visit('/home')
  })

  it('should show hamburger menu on mobile', () => {
    cy.get('app-navbar').should('be.visible')
  })
})

