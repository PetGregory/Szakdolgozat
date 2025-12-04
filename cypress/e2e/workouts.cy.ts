describe('Workouts Component', () => {
  beforeEach(() => {
    cy.visit('/workouts')
  })

  it('should display workout plan generation form', () => {
    cy.get('app-workouts').should('be.visible')
  })

  it('should show step 1 - Gender selection', () => {
    cy.contains('Gender').should('be.visible')
    cy.contains('Male').should('be.visible')
    cy.contains('Female').should('be.visible')
    cy.contains('Other').should('be.visible')
  })

  it('should proceed to step 2 after selecting gender', () => {
    cy.contains('Male').click()
    cy.get('button').contains('Next').click()
    cy.contains('Age').should('be.visible')
  })

  it('should show step 2 - Age input', () => {
    cy.contains('Male').click()
    cy.get('button').contains('Next').click()
    cy.get('input[type="number"]').first().should('be.visible')
  })

  it('should validate age input', () => {
    cy.contains('Male').click()
    cy.get('button').contains('Next').click()
    cy.get('input[type="number"]').first().type('5')
    cy.get('button').contains('Next').should('be.disabled')
  })

  it('should show step 3 - Weight and Height', () => {
    cy.contains('Male').click()
    cy.get('button').contains('Next').click()
    cy.get('input[type="number"]').first().type('25')
    cy.get('button').contains('Next').click()
    cy.contains('Weight').should('be.visible')
    cy.contains('Height').should('be.visible')
  })

  it('should show step 4 - Goal selection', () => {
    cy.contains('Male').click()
    cy.get('button').contains('Next').click()
    cy.get('input[type="number"]').first().type('25')
    cy.get('button').contains('Next').click()
    cy.get('input[type="number"]').first().type('70')
    cy.get('input[type="number"]').last().type('175')
    cy.get('button').contains('Next').click()
    cy.contains('Weight Loss').should('be.visible')
    cy.contains('Muscle Gain').should('be.visible')
    cy.contains('Endurance').should('be.visible')
    cy.contains('General Fitness').should('be.visible')
  })

  it('should show step 5 - Fitness Level and Available Days', () => {
    cy.contains('Male').click()
    cy.get('button').contains('Next').click()
    cy.get('input[type="number"]').first().type('25')
    cy.get('button').contains('Next').click()
    cy.get('input[type="number"]').first().type('70')
    cy.get('input[type="number"]').last().type('175')
    cy.get('button').contains('Next').click()
    cy.contains('Weight Loss').click()
    cy.get('button').contains('Next').click()
    cy.contains('Beginner').should('be.visible')
    cy.contains('Intermediate').should('be.visible')
    cy.contains('Advanced').should('be.visible')
  })

  it('should allow going back to previous steps', () => {
    cy.contains('Male').click()
    cy.get('button').contains('Next').click()
    cy.get('button').contains('Back').should('be.visible')
    cy.get('button').contains('Back').click()
    cy.contains('Gender').should('be.visible')
  })
})

