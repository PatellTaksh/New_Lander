const puppeteer = require('puppeteer');

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    page.on('requestfailed', request => console.log('NETWORK FAILED:', request.url(), request.failure().errorText));
    page.on('response', response => {
        if (response.url().includes('dashboard.php') || response.url().includes('profile.php')) {
            console.log('API RESPONSE:', response.url(), response.status());
        }
    });

    try {
        console.log("Navigating to login...");
        await page.goto('http://localhost/NewLander1/NewLander-frontend/login.html');
        
        console.log("Logging in...");
        await page.type('#loginEmail', 'taksh4785@gmail.com');
        await page.type('#loginPassword', 'Taksh@123'); // Try taksh's password, if it fails we can create a new user.
        await page.click('button[type="submit"]');

        console.log("Waiting for navigation...");
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => console.log("Navigation timeout."));
        
        console.log("Current URL after login:", page.url());
        
        if (!page.url().includes('dashboard.html')) {
            console.log("Trying john@gmail.com...");
            await page.goto('http://localhost/NewLander1/NewLander-frontend/login.html');
            await page.type('#loginEmail', 'john@gmail.com');
            await page.type('#loginPassword', 'password123'); 
            await page.click('button[type="submit"]');
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {});
            console.log("Current URL after john login:", page.url());
        }

        if (page.url().includes('dashboard.html')) {
            console.log("We are on dashboard.html. Waiting to see what happens...");
            await new Promise(r => setTimeout(r, 3000));
            
            const loadingDisplay = await page.evaluate(() => {
                const el = document.getElementById("loading");
                return el ? el.style.display : "not found";
            });
            console.log("Loading element display:", loadingDisplay);
            
            const loadingHtml = await page.evaluate(() => {
                const el = document.getElementById("loading");
                return el ? el.innerHTML : "not found";
            });
            console.log("Loading element HTML:", loadingHtml.trim());
        }
    } catch (e) {
        console.error("Puppeteer Script Error:", e);
    } finally {
        await browser.close();
    }
})();
