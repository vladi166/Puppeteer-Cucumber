const puppeteer = require("puppeteer");
const chai = require("chai");
const expect = chai.expect;
const {
    Given,
    When,
    Then,
    Before,
    After,
    setDefaultTimeout,
} = require("@cucumber/cucumber");
const {
    clickElement,
    //isActive,
    isVisible,
    //getText,
    //clickByText,
    clickElementInArray,
} = require("../../lib/commands.js");

setDefaultTimeout(30000);

Before(async function () {
    const browser = await puppeteer.launch({ headless: false, slowMo: 100, args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    this.browser = browser;
    this.page = page;
});

After(async function () {
    if (this.browser) {
        await this.browser.close();
    }
});

Given("I am on the booking page", async function () {
    await this.page.goto("http://qamid.tmweb.ru/client/index.php", {
        timeout: 10000,
    });
});

Given("I select tomorrow's date", async function () {
    await clickElement(this.page, "a:nth-child(2)");
});

Given("I select the first available movie time", async function () {
    await clickElement(this.page, ".movie-seances__list li:first-child a");
    await this.page.waitForSelector('.buying-scheme__wrapper', {timeout: 10000});
});

Given("I select the movie time at {int}:{int}", async function (hours, minutes) {
    const timeText = `${hours}:${minutes.toString().padStart(2, '0')}`;
    const [timeButton] = await this.page.$x(`//a[contains(@class, 'movie-seances__time') and text()='${timeText}']`);
    if (!timeButton) throw new Error(`Time button ${timeText} not found`);
    await timeButton.click();
    await this.page.waitForSelector('.buying-scheme__wrapper', {timeout: 10000});
});

Given('I select the VIP hall movie time at {int}:{int}', async function (hours, minutes) {
    const timeText = `${hours}:${minutes.toString().padStart(2, '0')}`;
    const [timeButton] = await this.page.$x(`//a[contains(@class, 'movie-seances__time') and contains(text(), '${timeText}') and contains(., 'VIP')]`);
    if (!timeButton) throw new Error(`VIP hall time button ${timeText} not found`);
    await timeButton.click();
    await this.page.waitForSelector('.buying-scheme__wrapper', {timeout: 10000});
});

Given('I select the Beautiful hall movie time at {int}:{int}', async function (hours, minutes) {
    const timeText = `${hours}:${minutes.toString().padStart(2, '0')}`;
    const [timeButton] = await this.page.$x(`//a[contains(@class, 'movie-seances__time') and contains(text(), '${timeText}') and contains(., 'Beautiful')]`);
    if (!timeButton) throw new Error(`Beautiful hall time button ${timeText} not found`);
    await timeButton.click();
    await this.page.waitForSelector('.buying-scheme__wrapper', {timeout: 10000});
});

When("I select an available seat", async function () {
    await clickElement(this.page, ".buying-scheme__chair_standart:not(.buying-scheme__chair_taken)");
});

When("I select two available seats", async function () {
    const selectorNotTaken = ".buying-scheme__chair_standart:not(.buying-scheme__chair_taken)";
    await clickElementInArray(this.page, selectorNotTaken, 0);
    await clickElementInArray(this.page, selectorNotTaken, 1);
});

When("I try to select a taken seat", async function () {
    await clickElement(this.page, ".buying-scheme__chair_taken");
});

When("I click the booking button", async function () {
    await clickElement(this.page, ".acceptin-button");
});

When("I click the confirmation button", async function () {
    await clickElement(this.page, ".acceptin-button");
});

Then("I should see the QR code", async function () {
    const expectedState = true;
    const actualState = await isVisible(this.page, ".ticket__info-qr");
    expect(actualState).to.equal(expectedState);
});

Then("I should see the booking confirmation message", async function () {
    const expectedState = true;
    const actualState = await isVisible(this.page, ".ticket__info-wrapper");
    expect(actualState).to.equal(expectedState);
});

Then("the seat should not be selected", async function () {
    const takenSeat = await this.page.$(".buying-scheme__chair_taken");
    const isSelected = await takenSeat.evaluate(el => 
        el.classList.contains('buying-scheme__chair_selected')
    );
    expect(isSelected).to.be.false;
}); 