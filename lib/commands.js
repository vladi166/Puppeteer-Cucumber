module.exports = {
  clickElement: async function (page, selector) {
    try {
      await page.waitForSelector(selector);
      await page.click(selector);
    } catch (error) {
      throw new Error(`Selector is not clickable: ${selector}`);
    }
  },
  /*getText: async function (page, selector) {
    try {
      await page.waitForSelector(selector);
      return await page.$eval(selector, (link) => link.textContent);
    } catch (error) {
      throw new Error(`Text is not available for selector: ${selector}`);
    }
  },*/
  putText: async function (page, selector, text) {
    try {
      const inputField = await page.$(selector);
      await inputField.focus();
      await inputField.type(text);
      await page.keyboard.press("Enter");
    } catch (error) {
      throw new Error(`Not possible to type text for selector: ${selector}`);
    }
  },
  /*isActive: async function (page, selector) {
    try {
      await page.waitForSelector(selector);
      return await page.$eval(selector, (el) => !el.disabled);
    } catch (error) {
      throw new Error(`Cannot check if element is active: ${selector}`);
    }
  },*/
  isVisible: async function (page, selector) {
    try {
      await page.waitForSelector(selector);
      return await page.$eval(selector, (el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      });
    } catch (error) {
      throw new Error(`Cannot check if element is visible: ${selector}`);
    }
  },
  /*clickByText: async function (page, text) {
    try {
      await page.waitForSelector(`text/${text}`);
      await page.click(`text/${text}`);
    } catch (error) {
      throw new Error(`Cannot click element with text: ${text}`);
    }
  },*/    
  clickElementInArray: async function (page, selector, index) {
    const elements = await page.$$(selector);
    if (elements.length > index) {
      await elements[index].click();
    } else {
      throw new Error(`Элемент с индексом ${index} не найден по селектору ${selector}`);
    }
  },
};
