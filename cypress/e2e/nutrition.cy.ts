describe('Nutrition Component', () => {
  beforeEach(() => {
    cy.visit('/nutrition')
  })

  it('should display nutrition page', () => {
    cy.get('app-nutrition').should('be.visible')
  })

  it('should have food search functionality', () => {
    cy.get('input[type="text"]').should('be.visible')
  })

  it('should allow searching for food', () => {
    cy.get('input[type="text"]').type('apple')
    cy.wait(1000)
  })

  it('should display search results', () => {
    cy.get('input[type="text"]').type('chicken')
    cy.wait(2000)
  })
})

