describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/home')
  })

  it('should display home page', () => {
    cy.get('app-index-page').should('be.visible')
  })

  it('should have navigation to login', () => {
    cy.contains('Login').should('be.visible')
  })

  it('should display workout plan section', () => {
    cy.get('app-workout-plan').should('be.visible')
  })

  it('should display progress section', () => {
    cy.get('app-progress').should('be.visible')
  })

  it('should display calorie counter section', () => {
    cy.get('app-caunt-calories').should('be.visible')
  })

  it('should navigate to login when clicking login button', () => {
    cy.contains('Login').click()
    cy.url().should('include', '/login')
  })
})

