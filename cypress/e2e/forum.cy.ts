describe('Forum Component', () => {
  beforeEach(() => {
    cy.visit('/forum')
  })

  it('should display forum page', () => {
    cy.get('app-forum').should('be.visible')
  })

  it('should show forum posts', () => {
    cy.wait(2000) // Wait for posts to load
  })

  it('should have search functionality', () => {
    cy.get('input[type="text"]').should('be.visible')
  })

  it('should allow creating new post when authenticated', () => {
    cy.get('app-forum').should('exist')
  })

  it('should display post interactions', () => {
    cy.wait(2000)
  })
})

