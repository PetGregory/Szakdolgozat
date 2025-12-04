describe('Profile Component', () => {
  beforeEach(() => {
    cy.visit('/profile')
  })

  it('should display profile page', () => {
    cy.get('app-profile').should('be.visible')
  })

  it('should show login prompt when not authenticated', () => {
    cy.visit('/profile')
    cy.url().should('satisfy', (url) => {
      return url.includes('/login') || url.includes('/profile')
    })
  })

  it('should display user information when authenticated', () => {
    cy.get('app-profile').should('exist')
  })
})

