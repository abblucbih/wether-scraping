const express = require("express")
const app = express()
const puppeteer = require("puppeteer");
const fs = require("fs");
var cors = require('cors')
app.use(cors())

app.use(express.json())
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))

app.post("/klart", async (req, res) => {
        const city = req.body.city
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto("https://www.klart.se/", {
          waitUntil: "networkidle2",
          timeout: 120000,
        });
        await page.type(
          "#search-modal #search-form .search .search__inputs-container .search__input",city);
        await Promise.all([
          page.keyboard.press("Enter"),
          page.waitForNavigation({ timeout: 60000 }),
        ]);
        const firstLinks = await page.$$(
          ".site-content .search-result .search-result-list li"
        );
      
        for (const link of firstLinks) {
          const icon = await link.$(".icon.icon-position-search-dims");
          if (icon) {
            const aElement = await link.$("a");
            await aElement.click();
            break; // Clicked on the first matching element, so exit the loop
          }
        }
        await page.waitForSelector('[data-qa-id="navigation-hours-tab"]');
        await page.click('[data-qa-id="navigation-hours-tab"]');
        const dayElements = await page.$$(".place-hours .day");
        const tempData = {};
        for (const dayElement of dayElements) {
          const dateElement = await dayElement.$(
            ".content .content__headings .heading time"
          );
          const date = await dateElement.getProperty("textContent");
          const actualDate = (await date.jsonValue()).replace(/\s+/g, " ").trim();
          const rows = await dayElement.$$(".row");
          const dayData = {};
          for (const row of rows) {
            const timeElement = await row.$(".col.-time time");
            const tempElement = await row.$(".col.-temp .value");
            if (timeElement && tempElement) {
              const time = await timeElement.evaluate((node) =>
                node.innerText.trim()
              );
              const temp = await tempElement.evaluate((node) =>
                node.innerText.trim()
              );
              dayData[time] = temp;
            }
          }
          tempData[actualDate] = dayData;
        }
   
        
     
      
        fs.readFile("weather.json", "utf8", (err, jsonString) => {
          let weatherData = {};
          if (!err) {
            weatherData = JSON.parse(jsonString);
          }
        
          weatherData.Klart = { [city]: tempData };
          res.json(tempData)
          const json = JSON.stringify(weatherData, null, 2);
          fs.writeFile("weather.json", json, "utf8", (err) => {
            if (err) {
              console.error("Error writing JSON file:", err);
            } else {
              console.log("KLART data saved to weather.json file.");
            }
          });
        });
        await browser.close();
      
        
       
  
})

app.post("/smhi", async (req, res) => {
    const city = req.body.city
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.smhi.se/", {
    waitUntil: "networkidle2",
    timeout: 120000,
  });
  await page.type(
    ".fullPage #root ._2iwYz ._3PmF5 ._2gHMK #downshift-0-input",
    city
  );
  await Promise.all([page.keyboard.press("Enter")]);
  await page.waitForSelector("._3JvZ9 li", { visible: true });
  const firstLink = await page.$("._3JvZ9 li");
  await firstLink.click();
  await page.waitForSelector("a.opWmC");

  const flerDagsKnapp = await page.$("a.opWmC");
  await flerDagsKnapp.click();
  await page.waitForNavigation();

  const ÖppnaAllaKnapp = await page.$("._2AvpL ._2qKDq .pUpND");
  if (ÖppnaAllaKnapp) {
    await ÖppnaAllaKnapp.click();
  }

  const buttons = await page.$$("button.xkPpi.oniiX._27-sD");
  const tables = await page.$$("div._2K-9O._3qBmj table");

  buttons.splice(-2);
  tables.splice(-2);

  const data = {}; // Object to store the data

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const table = tables[i];
    const date = await button.$eval(
      "span.TUekU",
      (element) => element.textContent
    );
    const rows = await table.$$("tbody tr");
    const dayData = {};

    for (const row of rows) {
      const tid = await row.$eval("th", (element) => element.textContent);
      const time = tid + ":00";
      const temp = await row.$eval(
        "td .RXE5T span",
        (element) => element.textContent
      );
      dayData[time] = temp; // Store time and temperature in dayData object
    }
    
    data[date] = dayData; // Store dayData object in the data object
    
    
  }

  
  fs.readFile("weather.json", "utf8", (err, jsonString) => {
    let weatherData = {};
    if (!err) {
      weatherData = JSON.parse(jsonString);
    }
    weatherData.SMHI = { [city]: data };
    res.json(data)
    const json = JSON.stringify(weatherData, null, 2);

    fs.writeFile("weather.json", json, "utf8", (err) => {
      if (err) {
        console.error("Error writing JSON file:", err);
      } else {
        console.log("SMHI data saved to weather.json file.");
      }
    });
  });

  await browser.close();
})


