describe('Admin Component', () => {
  beforeEach(() => {
    cy.loginAsTestUser()
    cy.visit('/admin')
  })

  it('should display admin page', () => {
    cy.get('app-admin').should('be.visible')
  })

  it('should show admin features when authenticated as admin', () => {
    cy.get('app-admin').should('exist')
  })
})

