Feature: Movie Ticket Booking
  As a user
  I want to book movie tickets
  So that I can watch movies in the cinema

  Scenario: Book a single ticket
    Given I am on the booking page
    And I select tomorrow's date
    And I select the first available movie time
    When I select an available seat
    And I click the booking button
    And I click the confirmation button
    Then I should see the QR code
    And I should see the booking confirmation message

  Scenario: Book two tickets for Ведьмак in VIP hall
    Given I am on the booking page
    And I select tomorrow's date
    And I select the VIP hall movie time at 20:00
    When I select two available seats
    And I click the booking button
    And I click the confirmation button
    Then I should see the QR code
    And I should see the booking confirmation message

  Scenario: Attempt to book an already taken seat
    Given I am on the booking page
    And I select tomorrow's date
    And I select the Beautiful hall movie time at 11:00
    When I try to select a taken seat
    Then the seat should not be selected 