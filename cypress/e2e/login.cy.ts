describe('Login Component', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should display login form', () => {
    cy.get('#auth-container').should('be.visible')
    cy.get('h2').contains('Sign In')
    cy.get('#email').should('be.visible')
    cy.get('#password').should('be.visible')
    cy.get('button[type="submit"]').should('contain', 'Sign In')
  })

  it('should show error for empty email', () => {
    cy.get('#password').type('testpassword')
    cy.get('button[type="submit"]').click()
    cy.get('#email:invalid').should('exist')
  })

  it('should show error for empty password', () => {
    cy.get('#email').type('test@example.com')
    cy.get('button[type="submit"]').click()
    cy.get('#password:invalid').should('exist')
  })

  it('should show error for invalid email format', () => {
    cy.get('#email').type('invalid-email')
    cy.get('#password').type('testpassword')
    cy.get('button[type="submit"]').click()
    cy.get('#email:invalid').should('exist')
  })

  it('should navigate to register page', () => {
    cy.get('#signup-link-login').click()
    cy.url().should('include', '/register')
  })

  it('should navigate to forgot password page', () => {
    cy.contains('Forgot Password?').click()
    cy.url().should('include', '/forgot-password')
  })

  it('should have Google login button', () => {
    cy.contains('Google').should('be.visible')
    cy.get('button').contains('Google').should('be.visible')
  })

  it('should toggle dark mode', () => {
    cy.get('app-light-button').should('exist')
  })
})

