describe('Application Routing', () => {
  it('should redirect root to home', () => {
    cy.visit('/')
    cy.url().should('include', '/home')
  })

  it('should navigate to login page', () => {
    cy.visit('/login')
    cy.url().should('include', '/login')
    cy.get('#auth-container').should('be.visible')
  })

  it('should navigate to register page', () => {
    cy.visit('/register')
    cy.url().should('include', '/register')
    cy.get('#auth-container').should('be.visible')
  })

  it('should navigate to workouts page', () => {
    cy.visit('/workouts')
    cy.url().should('include', '/workouts')
  })

  it('should navigate to profile page', () => {
    cy.visit('/profile')
    cy.url().should('include', '/profile')
  })

  it('should navigate to nutrition page', () => {
    cy.visit('/nutrition')
    cy.url().should('include', '/nutrition')
  })

  it('should navigate to forum page', () => {
    cy.visit('/forum')
    cy.url().should('include', '/forum')
  })

  it('should navigate to statistics page', () => {
    cy.visit('/statistics')
    cy.url().should('include', '/statistics')
  })

  it('should navigate to stats page (alias)', () => {
    cy.visit('/stats')
    cy.url().should('include', '/stats')
  })

  it('should navigate to workout-tracker page', () => {
    cy.visit('/workout-tracker')
    cy.url().should('include', '/workout-tracker')
  })

  it('should navigate to forgot-password page', () => {
    cy.visit('/forgot-password')
    cy.url().should('include', '/forgot-password')
  })
})

