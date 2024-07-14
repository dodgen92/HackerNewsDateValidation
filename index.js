const { chromium } = require("playwright");

async function saveHackerNewsArticles() {
  // Launches browser...nice advantage over selenium is not dealing with webdrivers
  const browser = await chromium.launch({ headless: false }); 
  const context = await browser.newContext(); 
  const page = await context.newPage(); 

  // Goes to hackernews
  await page.goto("https://news.ycombinator.com/newest");

  // function to capture dates
  async function captureDateTimes() {
    
    const dateTimeElements = await page.locator("//span[@class='age']");
    const count = await dateTimeElements.count(); 
    const dateTimes = []; 
    // Loop through each element and extract the 'title' attribute
    for (let i = 0; i < count; i++) {
      const dateTimeElement = dateTimeElements.nth(i); 
      const dateTime = await dateTimeElement.getAttribute("title"); // the title attribute in console has more acccurate time than the text displayed on website
      if (dateTime) { 
        dateTimes.push(new Date(dateTime)); // Javascript built in date object
      }
    }

    // USE THIS LINE FOR TESTING
   // dateTimes.push(new Date("2023-01-01T12:00:00"));

    return dateTimes; 
  }

  // Capture initial date/times from the first page load
  let allDateTimes = await captureDateTimes();

  // Define the XPath for the "more" button
  const moreButtonXPath = "/html/body/center/table/tbody/tr[3]/td/table/tbody/tr[92]/td[2]/a";

  // Click the "more" button three times to load more articles
  for (let i = 0; i < 3; i++) {
    await page.locator(`xpath=${moreButtonXPath}`).click(); // Clicks the 'more' button to capture all the necessary dates
    await page.waitForTimeout(2000); // Explicit wait 
    const newDateTimes = await captureDateTimes(); 
    allDateTimes = allDateTimes.concat(newDateTimes); 
  }

  // 
  allDateTimes = allDateTimes.slice(0, 100); // Keep only the first 100 dates

  // validate descending order
  let isDescending = true;
  for (let i = 1; i < allDateTimes.length; i++) {
    if (allDateTimes[i] > allDateTimes[i - 1]) { 
      isDescending = false; 
      break; 
    }
  }

  // Print the captured date/times and validation result to the console
  console.log("Captured Date/Times:", allDateTimes); // Log captured dates
  console.log("Dates are in descending order:", isDescending);
  // Close the browser
  await browser.close(); // Close the browser instance
}

(async () => {
  await saveHackerNewsArticles(); // Execute the main function
})();
