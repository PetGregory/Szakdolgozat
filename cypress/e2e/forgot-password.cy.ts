describe('Forgot Password Component', () => {
  beforeEach(() => {
    cy.visit('/forgot-password')
  })

  it('should display forgot password form', () => {
    cy.get('app-forgotpassword').should('be.visible')
  })

  it('should have email input field', () => {
    cy.get('input[type="email"]').should('be.visible')
  })

  it('should show error for invalid email', () => {
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('button[type="submit"]').click()
    cy.get('input[type="email"]:invalid').should('exist')
  })

  it('should allow submitting valid email', () => {
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('button[type="submit"]').should('be.visible')
  })
})

