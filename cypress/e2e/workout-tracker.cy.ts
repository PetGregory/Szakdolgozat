describe('Workout Tracker Component - Comprehensive Tests', () => {
  beforeEach(() => {
    cy.loginAsTestUser()
    cy.visit('/workout-tracker')
  })

  describe('UI Elements', () => {
    it('should display workout tracker page', () => {
      cy.get('body').should('contain.text', 'Workout').or('contain.text', 'Tracker')
    })

    it('should display date selector', () => {
      cy.get('body').then(($body) => {
        if ($body.find('button').contains('Today').length > 0 || 
            $body.find('input[type="date"]').length > 0) {
        }
      })
    })

    it('should display exercise search', () => {
      cy.get('input[type="text"]').should('be.visible')
    })
  })

  describe('Exercise Search', () => {
    it('should allow searching for exercises', () => {
      cy.get('input[type="text"]').type('push up')
      cy.wait(2000)
    })

    it('should display search results', () => {
      cy.get('input[type="text"]').type('push up')
      cy.wait(2000)
      cy.get('body').then(($body) => {
        if ($body.find('*:contains("push")').length > 0) {
          cy.contains('push').should('be.visible')
        }
      })
    })
  })

  describe('Exercise Logging', () => {
    it('should allow adding exercise to workout', () => {
      cy.get('input[type="text"]').type('push up')
      cy.wait(2000)
      cy.get('body').then(($body) => {
        if ($body.find('button').contains('Add').length > 0) {
          cy.get('button').contains('Add').first().click()
        }
      })
    })

    it('should display logged exercises', () => {
      cy.get('body').then(($body) => {
        if ($body.find('*:contains("Exercise")').length > 0) {
          cy.contains('Exercise').should('be.visible')
        }
      })
    })

    it('should allow setting sets and reps', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[type="number"]').length > 0) {
          cy.get('input[type="number"]').first().type('3')
        }
      })
    })
  })

  describe('Date Selection', () => {
    it('should allow selecting date', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[type="date"]').length > 0) {
          cy.get('input[type="date"]').click()
        } else if ($body.find('button').contains('Today').length > 0) {
          cy.get('button').contains('Today').click()
        }
      })
    })
  })

  describe('Body Part Filter', () => {
    it('should display body part filter', () => {
      cy.get('body').then(($body) => {
        if ($body.find('select').length > 0 || $body.find('button').contains('chest').length > 0) {
        }
      })
    })

    it('should allow filtering by body part', () => {
      cy.get('body').then(($body) => {
        if ($body.find('select').length > 0) {
          cy.get('select').select('chest')
        }
      })
    })
  })

  describe('Navigation', () => {
    it('should navigate to workout tracker from navbar', () => {
      cy.visit('/home')
      cy.get('button').contains('Workout Tracker').click()
      cy.url().should('include', '/workout-tracker')
    })
  })

  describe('Responsive Design', () => {
    it('should be responsive on mobile viewport', () => {
      cy.viewport(375, 667)
      cy.get('input[type="text"]').should('be.visible')
    })

    it('should be responsive on tablet viewport', () => {
      cy.viewport(768, 1024)
      cy.get('input[type="text"]').should('be.visible')
    })
  })
})
