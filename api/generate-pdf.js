let puppeteer;
let launchOpts = { headless: true, defaultViewport: { width: 794, height: 1123 } };

async function initPuppeteer() {
  try {
    const chromium = await import('@sparticuz/chromium');
    puppeteer = (await import('puppeteer-core')).default;
    launchOpts.args = chromium.args;
    launchOpts.executablePath = await chromium.executablePath();
    launchOpts.headless = chromium.headless;
  } catch {
    puppeteer = (await import('puppeteer')).default;
  }
}

let ready = initPuppeteer();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { html, nombre, apellido } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML es requerido' });
    }

    await ready;
    const browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      printBackground: true,
    });

    await browser.close();

    const filename = `${nombre || 'CV'}_${apellido || ''}_CV.pdf`.replace(/\s+/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(pdf);
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: 'Error al generar el PDF: ' + error.message });
  }
}
