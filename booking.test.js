const puppeteer = require('puppeteer');
const { expect } = require('chai');
const {
    clickElement,
    isVisible,
} = require('./lib/commands');

// Global browser setup
let browser;
let page;

beforeAll(async () => {
    browser = await puppeteer.launch({
        headless: false,
        slowMo: 200,
        defaultViewport: null,
        args: ['--start-maximized']
    });
});

beforeEach(async () => {
    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000);
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
});

afterEach(async () => {
    await page.close();
});

afterAll(async () => {
    if (browser) {
        await browser.close();
    }
});

describe('Бронирование билетов в веб-приложении', () => {
    beforeEach(async () => {
        await page.goto('http://qamid.tmweb.ru/client/index.php', {
            timeout: 30000,
        });
        
        // Выбираем завтрашний день
        await clickElement(page, 'a:nth-child(2)');
        // Выбираем первый доступный сеанс
        await clickElement(page, '.movie-seances__list li:first-child a');
    });

    test('Бронирование одного билета', async () => {
        const expectedStateButton = true;
        const expectedTextButton = 'Забронировать';

        // Выбираем свободное место
        const selectorNotTaken = '.buying-scheme__chair:not(.buying-scheme__chair_taken)';
        await page.waitForSelector(selectorNotTaken);
        const seats = await page.$$(selectorNotTaken);
        await seats[0].click();

        // Проверяем состояние кнопки
        const actualState = await isActive(page, '.acceptin-button');
        const actualText = await getText(page, '.acceptin-button');
        expect(actualState).to.equal(expectedStateButton);
        expect(actualText).to.equal(expectedTextButton);

        // Бронируем билет
        await clickElement(page, '.acceptin-button');

        // Кликаем по кнопке 'Получить код бронирования'
        await clickElement(page, '.acceptin-button');

        // Проверяем наличие QR-кода
        const qrVisible = await isVisible(page, 'img.ticket__info-qr');
        expect(qrVisible).to.be.true;

        // Проверяем наличие текста под QR-кодом
        const hintNodes = await page.$$('.ticket__hint');
        const hintTexts = await Promise.all(hintNodes.map(node => node.evaluate(el => el.textContent)));
        expect(hintTexts.some(text => text.includes('Покажите QR-код нашему контроллеру для подтверждения бронирования.'))).to.be.true;
        expect(hintTexts.some(text => text.includes('Приятного просмотра!'))).to.be.true;
    }, 30000);

    test('Бронирование двух билетов', async () => {
        // Переходим на главную страницу
        await page.goto('http://qamid.tmweb.ru/client/index.php', { timeout: 30000 });
        // Выбираем завтрашний день
        await clickElement(page, 'a:nth-child(2)');
        // Находим VIP зал для "Ведьмака" и кликаем по времени 20:00
        const vipHall = await page.$x("//h3[contains(@class, 'movie-seances__hall-title') and contains(text(), 'Вип зал')]/following-sibling::ul/li/a[contains(@class, 'movie-seances__time') and contains(text(), '20:00')]");
        await vipHall[0].click();

        const expectedStateButton = true;
        const expectedTextButton = 'Забронировать';
        const selectorNotTaken = '.buying-scheme__chair:not(.buying-scheme__chair_taken)';
        await page.waitForSelector(selectorNotTaken);
        const seats = await page.$$(selectorNotTaken);
        await seats[0].click();
        await seats[1].click();
        const actualState = await isActive(page, '.acceptin-button');
        const actualText = await getText(page, '.acceptin-button');
        expect(actualState).to.equal(expectedStateButton);
        expect(actualText).to.equal(expectedTextButton);
        await clickElement(page, '.acceptin-button');
        await clickElement(page, '.acceptin-button');
        const qrVisible = await isVisible(page, 'img.ticket__info-qr');
        expect(qrVisible).to.be.true;
        const hintNodes = await page.$$('.ticket__hint');
        const hintTexts = await Promise.all(hintNodes.map(node => node.evaluate(el => el.textContent)));
        expect(hintTexts.some(text => text.includes('Покажите QR-код нашему контроллеру для подтверждения бронирования.'))).to.be.true;
        expect(hintTexts.some(text => text.includes('Приятного просмотра!'))).to.be.true;
    }, 30000);

    test('Проверка невозможности выбора занятого места', async () => {
        // Переходим на главную страницу
        await page.goto('http://qamid.tmweb.ru/client/index.php', { timeout: 30000 });
        // Выбираем завтрашний день
        await clickElement(page, 'a:nth-child(2)');
        // Находим Красивый зал для "Микки Мауса" и кликаем по времени 11:00
        const prettyHall = await page.$x("//h3[contains(@class, 'movie-seances__hall-title') and contains(text(), 'Красивый зал')]/following-sibling::ul/li/a[contains(@class, 'movie-seances__time') and contains(text(), '11:00')]");
        await prettyHall[0].click();

        await page.waitForSelector('.buying-scheme__chair_taken');
        const takenSeats = await page.$$('.buying-scheme__chair_taken');
        for (const seat of takenSeats) {
            await seat.click();
            const isSelected = await seat.evaluate(el => 
                el.classList.contains('buying-scheme__chair_selected')
            );
            expect(isSelected).to.be.false;
        }
    }, 30000);
}); 