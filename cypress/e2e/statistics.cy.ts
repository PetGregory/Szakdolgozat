describe('Statistics Component', () => {
  beforeEach(() => {
    cy.visit('/statistics')
  })

  it('should display statistics page', () => {
    cy.get('app-statistics').should('be.visible')
  })

  it('should show statistics data when available', () => {
    cy.wait(2000)
    cy.get('app-statistics').should('exist')
  })

  it('should navigate from stats route', () => {
    cy.visit('/stats')
    cy.get('app-statistics').should('be.visible')
  })
})

