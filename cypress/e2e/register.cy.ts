describe('Register Component', () => {
  beforeEach(() => {
    cy.visit('/register')
  })

  it('should display registration form', () => {
    cy.get('#auth-container').should('be.visible')
    cy.get('h2').contains('Create Account')
    cy.get('#username').should('be.visible')
    cy.get('#email').should('be.visible')
    cy.get('#password').should('be.visible')
    cy.get('#confirm-password').should('be.visible')
  })

  it('should show error for empty username', () => {
    cy.get('#email').type('test@example.com')
    cy.get('#password').type('testpassword123')
    cy.get('#confirm-password').type('testpassword123')
    cy.get('button[type="button"]').contains('Create Account').click()
    cy.get('#username:invalid').should('exist')
  })

  it('should show error for empty email', () => {
    cy.get('#username').type('testuser')
    cy.get('#password').type('testpassword123')
    cy.get('#confirm-password').type('testpassword123')
    cy.get('button[type="button"]').contains('Create Account').click()
    cy.get('#email:invalid').should('exist')
  })

  it('should show error for invalid email format', () => {
    cy.get('#username').type('testuser')
    cy.get('#email').type('invalid-email')
    cy.get('#password').type('testpassword123')
    cy.get('#confirm-password').type('testpassword123')
    cy.get('button[type="button"]').contains('Create Account').click()
    cy.get('#email:invalid').should('exist')
  })

  it('should show error for empty password', () => {
    cy.get('#username').type('testuser')
    cy.get('#email').type('test@example.com')
    cy.get('#confirm-password').type('testpassword123')
    cy.get('button[type="button"]').contains('Create Account').click()
    cy.get('#password:invalid').should('exist')
  })

  it('should show error for empty confirm password', () => {
    cy.get('#username').type('testuser')
    cy.get('#email').type('test@example.com')
    cy.get('#password').type('testpassword123')
    cy.get('button[type="button"]').contains('Create Account').click()
    cy.get('#confirm-password:invalid').should('exist')
  })

  it('should navigate to login page', () => {
    cy.get('button').contains('Login').click()
    cy.url().should('include', '/login')
  })

  it('should have Google sign up button', () => {
    cy.contains('Google').should('be.visible')
    cy.get('button').contains('Google').should('be.visible')
  })
})

