//// Generates Axe scans for multiple urls. Zips results.
// Reportfolder is in the /scripts/ folder. This folder here...
//// separate urls. 

/*
surge --> publish (na login en ww)

je krijgt subdomein.
koppel subdomein in mijndomein.nl --> DNS settings : CNAME 'subdomein.accessibilityscans.nl' 'na-west1.surge.sh.'

publish folder naar hosting:
surge c:\www\a11yreport\scripts\axe-reports\essent-a11y-28okt essent.accessibilityscans.nl 

1- essent.accessibilityscans.nl

*/



import { chromium } from 'playwright';
import { createHtmlReport } from 'axe-html-reporter';
import { writeFile, writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zipper from 'zip-local'
import { createRequire } from "module";
const require = createRequire(
    import.meta.url);

const appRoot = require('app-root-path');
const appRootString = appRoot.toString()

const jsonFileExtension = ".json"
const htmlFileExtension = ".html"
const projectKey = "energiebedrijven"
const outputDirName = "axe-reports"
const dynamicName = 'essent-a11y-30okt'
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);


// Create folder /axe-reports/
const outputDir = path.resolve(path.join(__dirname, outputDirName));

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Create Folder '/axe-results/{dynamicname}/json' (for raw json output of the Axe scan)
const jsonFolderName = "json"
const jsonOutputDir = path.resolve(path.join(__dirname, outputDirName + '/' + dynamicName + '/' + jsonFolderName));

if (!fs.existsSync(jsonOutputDir)) {
    fs.mkdirSync(jsonOutputDir, { recursive: true });
}


// Create Folder '/axe-results/{dynamicname}/html' (for html output of the Axe scan)
const htmlFolderName = "html"
const htmlOutputDir = path.resolve(path.join(__dirname, outputDirName + '/' + dynamicName + '/' + htmlFolderName));

if (!fs.existsSync(htmlOutputDir)) {
    fs.mkdirSync(htmlOutputDir, { recursive: true });
}





// List with urls to test. External file or array.
// const siteListJson = require("../src/static/url/ESSENT.json");
const siteList = [
    // { site: "https://www.essent.nl/", name: "Essent.nl" },
    // { site: "https://www.essent.nl/klantenservice/", name: "Essent.nl/klantenservice" },
    // { site: "https://www.essent.nl/energie", name: "Essent.nl/energie" },
    // { site: "https://www.energiedirect.nl/", name: "energiedirect.nl" },
    // { site: "https://www.vandebron.nl/", name: "Vandebron.nl", "value": 1 },
    // { site: "https://www.oxxio.nl/", name: "Oxxio.nl" },
    // { site: "https://www.eneco.nl/", name: "Eneco.nl" },
    // { site: "https://www.nederlandisoleert.nl/", name: "NederlandIsoleert.nl" },
    // { site: "https://www.klimaatroute.nl/", name: "Klimaatroute.nl" },
    // { site: "https://www.zon7.nl/", name: "Zon7" },
    // { site: "https://www.energiewacht.nl/", name: "Energiewacht.nl" },
    // { site: "https://www.energiewachtwest.nl/", name: "EnergiewachtWest.nl" },
    // { site: "https://www.kemkens.nl/", name: "Kemkens.nl" },
    // { site: "https://www.voltalimburg.nl/", name: "VoltaLimburg.nl" },
    // { site: "https://www.voltasolar.nl/", name: "VoltaSolar.nl" },
    { site: "https://www.energiewonen.nl/", name: "Energiewonen.nl" },
    // { site: "https://www.isoprofs.nl/", name: "Isoprofs.nl" },
    // { site: "https://www.cvtotaal.nl/", name: "CV-totaal.nl" },
    // { site: "https://www.gaslicht.com/", name: "GasLicht.com" },
    { site: "https://www.nle.nl/", name: "nle.nl" },
    // { site: "https://www.deltaenergie.nl/", name: "Deltaenergie.nl" },
    // { site: "https://www.amazon.nl/", name: "Amazon.nl" },
    // { site: "https://www.greenchoice.nl/", name: "GreenChoice.nl" },
    // { site: "https://www.budgetthuis.nl/energie/", name: "Budgetthuis.nl/energie" },
    // { site: "https://www.frankenergie.nl/", name: "Frankenergie.nl" },
    // { site: "https://www.engie.nl/", name: "Engie.nl" },
    // { site: "https://www.shellenergy.nl/", name: "ShellEnergy.nl" },
    // { site: "https://pure-energie.nl/", name: "Pure-energy.nl" },
    // { site: "https://www.coolblue.nl/energie", name: "Coolblue.nl/energie" },
];


const axefails = ['colorContrast', 'imageAlt']

// for (const item in axefails) {
//     const item = []
//     console.log(`Created empty array '${item}' for counting detailed erros`, item)
// }

for (let i = 0; i < axefails.length; i++) {
    axefails[i] = [];
    console.log(axefails[i])
    console.log(typeof axefails[i])
}



// axefails.forEach(element => console.log(element));

// axefails.forEach(element => new Array(element));


// const obj = []
// axefails.forEach((ele, i) => {
//     [ele] = []
//     console.log(ele)
// })



// Start function
const siteLoop = async() => {
        // Define arrays to fill
        const axeScans = []
        const filenameAxeArray = []

        for (const url of siteList) {

            const browser = await chromium.launch({ headless: true });
            const context = await browser.newContext({});

            const page = await context.newPage();
            const goToUrl = url.site
            const siteName = url.name
            await page.goto(goToUrl);

            // Block analytics scripts
            await page.route(/.google-analytics.com./, route => route.abort()); // WERKT
            await page.route(/.c.contentsquare.net./, route => route.abort()); // WERKT
            await page.route(/.visualwebsiteoptimizer./, route => route.abort()); // WERKT
            await page.route(/.siteimproveanalytics./, route => route.abort()); // WERKT
            await page.route(/.r42tag./, route => route.abort()); // WERKT
            await page.route(/.krxd./, route => route.abort()); // WERKT
            await page.route(/.googletagmanager./, route => route.abort()); // WERKT
            await page.route(/.adobedtm./, route => route.abort()); // WERKT
            await page.route(/.hotjar./, route => route.abort()); // WERKT
            await page.route(/.googleadservices./, route => route.abort()); // WERKT

            try {
                // await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/3.3.2/axe.min.js' });
                // loading script from CDN might give CSP errors.
                // copy file locally. add to head when loading a page:
                await page.addScriptTag({ path: 'axe.min.js' });

            } catch {
                console.log('Error adding script')
            }
            const results = await page.evaluate(() => axe.run(document));

            if (results.violations.length > 0) {
                console.log(`Found ${results.violations.length} accessibility violations`);
                // console.log(results.violations);
            }


            // console.log('res', results);


            // convert url 'slugify' to use as filename 
            const slugify = str =>
                str
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .replace(/www/g, '')
                .replace(/https/g, '')
                .replace(/http/g, '')

            const slugDomain = slugify(goToUrl)

            // use date in the filename:
            let date = new Date();
            let myDateTime = (date.getUTCFullYear()) + "-" + (date.getMonth() + 1) + "-" + (date.getUTCDate()) + "-" + (date.getTime());

            // Write results to /json/slugified-url-date.json
            writeFileSync(jsonOutputDir + '/' + slugDomain + '-' + myDateTime + jsonFileExtension, JSON.stringify(results));


            (() => {
                const rawAxeResults = JSON.parse(readFileSync(jsonOutputDir + '/' + slugDomain + '-' + myDateTime + jsonFileExtension, 'utf8'))
                createHtmlReport({
                    results: rawAxeResults,
                    //options available to further customize reports
                    options: {
                        projectKey: projectKey,
                        outputDir: outputDirName + '/' + dynamicName + '/' + htmlFolderName,
                        reportFileName: slugDomain + '-axe-' + myDateTime + htmlFileExtension,
                    }
                });
            })();


            const localFileName = dynamicName + '/' + htmlFolderName + '/' + slugDomain + '-axe-' + myDateTime + '.html'
            console.log('Local filename DynamicNameHtmlFolderNameSluDomain-axe-etc', localFileName)
            filenameAxeArray.push(localFileName)

            // // Push List Items with html in Array :
            const axeFilename = `
                <li class="relative list-decimal">
                    <a 
                    target="targetIframe" 
                    class="flex items-center text-sm py-2 px-6  text-gray-700 text-ellipsis whitespace-normal rounded hover:text-gray-900 hover:bg-gray-100 transition duration-300 ease-in-out" 
                    href="${htmlFolderName}/${slugDomain}-axe-${myDateTime}.html">
                            ${siteName}
                    </a>
                </li>`
                // console.log(axeFilename)
            axeScans.push(axeFilename)


            //// Delete JSON 
            try {
                // console.log('PATH:', jsonOutputDir + '/' + slugDomain + '-' + myDateTime + jsonFileExtension)
                fs.unlinkSync(jsonOutputDir + '/' + slugDomain + '-' + myDateTime + jsonFileExtension)
                    //file removed
            } catch (err) {
                console.error(err)
            }

            await page.close();
            await browser.close();
            // })



        } // end For loop
        // console.log('FILE names local', filenameAxeArray)


        const listLinkElements = axeScans.join('');

        let date = new Date();
        let myDate = (date.getUTCFullYear()) + "-" + (date.getMonth() + 1) + "-" + (date.getUTCDate());




        // Start New browser and Loop through Local html files....

        // Define array for error-count
        const totalErrors = []
            // Define array for sum of all errors
        const sumErrors = []





        async function main() {
            const browser = await chromium.launch({ headless: true, slowMo: 250 });
            const page = await browser.newPage();

            for (const url of filenameAxeArray) {

                let localhtmlfile = `file://${process.cwd()}/axe-reports/` + url
                console.log('Process CWD + filename', localhtmlfile)
                await page.waitForTimeout(500)
                await page.goto(localhtmlfile);
                await page.waitForTimeout(500)

                let axeErrPage = await page.evaluate(() => document.querySelector('body > div > h5 > span').innerHTML);
                axeErrPage = Number.parseFloat(axeErrPage)
                    // console.log('Typeof errorcount', axeErrPage)
                    // console.log('Typeof errorcount', typeof axeErrPage)
                sumErrors.push(axeErrPage)
                const siteNamePage = await page.evaluate(() => document.querySelector('body > div > div.summarySection > div > a').getAttribute('href'))
                const htmlTable = `<tr><td>  ${siteNamePage}</td><td>   ${axeErrPage}</td></tr>`

                totalErrors.push(htmlTable)

                try {

                    for (let i = 0; i < axefails.length; i++) {
                        // axefails[i] = [];
                        axefails[i].push('one')
                        console.log(axefails[i])
                        console.log(typeof axefails[i])
                    }

                    // for (const failed in axefails) {
                    //     failed.push('push one')
                    // }



                } catch {}



            }
            await browser.close();

            // Sum of all errors on all pages:
            // console.log('totalErrors:', totalErrors)
            // console.log('Array with all errors', sumErrors)
            const totalErrorsNumber = sumErrors.reduce((partialSum, a) => partialSum + a, 0);
            // console.log('Added all errors for all pages:', totalErrorsNumber)

            // Joined array with the Table rows with urls and total-errors-per page:
            const totalErrorsR = totalErrors.join('');


            /// 
            for (const failed in axefails) {
                // let failed = []
                console.log('Created filled array for counting detailed errors:', failed)
            }


            // Set HTML and add List items. To create an overview page with links to all the scans. Added Tailwind for some quick styling of the left-menu.
            const html = `
        <!doctype html>
         <html>
         <head>
             <title>Axe scans</title>
             <script src="https://cdn.tailwindcss.com"></script>
         </head>
         <body>
             <div class="flex flex-row">
                 <div class="w-96 h-screen overflow-y-auto shadow-md bg-white px-1">
                     <h1 class="py-4 px-6 h-12 font-semibold"><a href="index.html">Accessibility scans</a></h1>
                     <p class="px-6 text-[10px] mb-4 text-gray-500">Scanned on ${myDate} with Axe-Core 4.4.3</p>
                     <ol class="relative list-decimal">
                     ${listLinkElements}
                    </ol>
 
                 </div>
                 <div class="w-full px-1">
                     <iframe class="w-full h-screen" id="axeFrame" name="targetIframe" src="" frameborder="0">
                     
                     </iframe>
                 </div>
             </div>    <!-- End Flex-Col -->
             <script>
             const innerTextForIframe = document.getElementById('axeFrame');
             innerTextForIframe.contentDocument.write("Click on a link in the left sidebar to view the Axe html-report.");
             innerTextForIframe.contentDocument.write("<br><br>");
             innerTextForIframe.contentDocument.write("Refresh the browser if reports don't load. Some external files used to style the report take some time to load....");
             innerTextForIframe.contentDocument.write("<br><br><h2>Totaal aantal 'overtredingen' per url</h2>");
             innerTextForIframe.contentDocument.write("<table class='table-auto'><thead><tr><th style='text-align:left' width='50%'>url</th><th style='text-align:left' width='16.667%'>overtredingen</th></tr></thead>");
             innerTextForIframe.contentDocument.write("<tbody>${totalErrorsR}</tbody></table><br>");
             innerTextForIframe.contentDocument.write("<strong>Totaal aantal overtredingen :</strong> ${ totalErrorsNumber}<br>");
             
             

            
             </script>
         </body>
         </html>`

            // Write a file with HTML and List Items:
            writeFile(`${outputDir}/${dynamicName}/index.html`, html, function(err) {
                // writeFile(`${process.cwd()}/${outputDir}/index.html`, html, function(err) {
                if (err) throw err;
                console.log('Index file is created successfully. Open it with Live Server.');
                console.log('File:', `${process.cwd()}/${outputDir}/${dynamicName}/index.html`)
            });


            // 
            const staticDownloadFolder = "/src/static/downloads/"
            const staticDownloadDir = path.resolve(path.join(appRootString, staticDownloadFolder));


            if (!fs.existsSync(staticDownloadDir)) {
                fs.mkdirSync(staticDownloadDir, { recursive: true });
            }

            // Zip folder:
            zipper.zip(`${outputDir}/${dynamicName}`, function(error, zipped) {

                if (!error) {
                    zipped.compress(); // compress before exporting

                    //  save the zipped file to disk in root/src/statics/downloads....zip
                    zipped.save(`${appRootString}/src/static/downloads/${dynamicName}.zip`, function(error) {
                        if (!error) {
                            console.log("zip saved successfully !");
                        }
                    });
                }
            });




        } // Slotje van tweede Function






        main();



    } // OUTER Function



// ();

siteLoop(siteList)