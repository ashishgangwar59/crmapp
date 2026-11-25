// Payment Bond certificate: same design as the CRM web dashboard
// (CRM/src/app/dashboard/investors/PaymentBondModal.tsx). Used by the admin Investors
// screen and the investor's own portal, for preview (WebView/iframe) and PDF (expo-print).
import QRCode from 'qrcode';
import { getApiBaseUrl } from '../../services/api';
import { BOND_STYLES, BOND_LOGO, BOND_SEAL } from './bondAssets';

export interface BondCompanyInfo {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

const DEFAULT_COMPANY: Required<BondCompanyInfo> = {
  name: 'Niventra Capital Advisory India Pvt Ltd',
  address: 'MEZZANINE LEVEL SHIVAJI STADIUM METRO STATION BABA KHARAK SINGH ROAD CONNAUGHT PLACE NEW DELHI 110001',
  phone: '1800 8900 818',
  email: 'info@niventracapitaladviasory.com',
  website: 'www.niventracapitaladvisory.com',
};

/** A4 landscape in points, for expo-print's printToFileAsync({ width, height }). */
export const BOND_PAGE = { width: 842, height: 595 };

export function numberToWords(num: number): string {
  if (!num || num === 0) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  };
  return inWords(Math.floor(num)).trim();
}

const esc = (v: any) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** "YYYY-MM-DD" as a local date (avoids the UTC shift of new Date('2026-11-24')); other values via Date. */
function toDate(v: any): Date | null {
  if (!v) return null;
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
const inr = (n: number) => Math.round(n).toLocaleString('en-IN');

/** Same wording as the web: "395 Days (1 Year 30 Days)" or "31 Days". */
function formatPeriod(start: Date, end: Date, totalDays: number) {
  let years = end.getFullYear() - start.getFullYear();
  let temp = new Date(start);
  temp.setFullYear(start.getFullYear() + years);
  if (temp.getTime() > end.getTime()) {
    years--;
    temp = new Date(start);
    temp.setFullYear(start.getFullYear() + years);
  }
  if (years > 0) {
    const rem = Math.round((end.getTime() - temp.getTime()) / 86400000);
    let text = `${years} Year${years > 1 ? 's' : ''}`;
    if (rem > 0) text += ` ${rem} Day${rem > 1 ? 's' : ''}`;
    return `${totalDays} Days (${text})`;
  }
  return `${totalDays} Days`;
}

/** QR code as inline SVG (sync, no canvas), navy on paper colour like the web. */
function qrSvg(text: string) {
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
    const size = qr.modules.size;
    let path = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (qr.modules.get(r, c)) path += `M${c},${r}h1v1h-1z`;
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${size + 2} ${size + 2}" width="64" height="64" shape-rendering="crispEdges"><rect x="-1" y="-1" width="${size + 2}" height="${size + 2}" fill="#fffdf2"/><path d="${path}" fill="#134086"/></svg>`;
  } catch {
    return '';
  }
}

export const generatePaymentBondHtml = (inv: any, companyInfo?: BondCompanyInfo) => {
  const company = { ...DEFAULT_COMPANY, ...Object.fromEntries(Object.entries(companyInfo || {}).filter(([, v]) => !!v)) };
  const df = inv?.debentureForm || {};

  const principal = Number(inv?.investmentAmount || df.totalApplicationAmount || 0);
  const rate = Number(inv?.monthlyGrowthPercentage || 2);
  const months = Number(inv?.bondMaturityMonths) || 1;

  // Issue date: verified → investment date → created → today (same order as the web).
  const issue = toDate(inv?.verifiedAt) || toDate(inv?.investmentDate) || toDate(inv?.createdAt) || new Date();
  issue.setHours(0, 0, 0, 0);

  let maturity = toDate(inv?.bondMaturityDate);
  if (!maturity) {
    maturity = new Date(issue);
    maturity.setMonth(maturity.getMonth() + months);
  }
  maturity.setHours(0, 0, 0, 0);

  // Inclusive day count between the dates actually printed on the certificate.
  // (The web counts between investmentDate and bondMaturityDate, which gives "NaN Days" when either is missing.)
  const days = Math.max(1, Math.round((maturity.getTime() - issue.getTime()) / 86400000) + 1);
  const periodText = formatPeriod(issue, maturity, days);
  const interest = (principal * rate * days) / (100 * 30);
  const maturityAmount = Math.round(principal + interest);

  const rawSeq = String(inv?.investorCode || '').replace(/\D/g, '');
  const bondNo = `MDS DWK ${rawSeq ? rawSeq.slice(-4).padStart(4, '0') : '0001'}`;

  const fatherName = df.fatherSpouseName || inv?.fatherName || '—';
  const address = df.address || [df.city, df.state].filter(Boolean).join(', ') || '—';
  const nomineeName = df.nomineeName || inv?.nomineeName || '—';
  const nomineeRelation = df.nomineeRelation || inv?.nomineeRelation || '—';
  const nomineeAge = df.nomineeAge || inv?.nomineeAge || '';

  const verifyUrl = `${getApiBaseUrl()}/api/investors/download-bond?id=${inv?._id || inv?.id || ''}`;
  const qr = qrSvg(verifyUrl);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1150" />
  <title>Payment Bond - ${esc(inv?.fullName)}</title>
  <style>
${BOND_STYLES}
    html, body { margin: 0; padding: 0; background: #fff; }
    .certificate { width: 1120px; min-height: 790px; margin: 0 auto; }
    .logo img { height: 100%; object-fit: contain; }
    .seal-inner img { height: 100%; object-fit: contain; }
    .qr-pattern svg { width: 64px; height: 64px; display: block; }
    /* On a phone screen, shrink the whole 1150px-wide certificate to fit; print/PDF keeps full A4 size. */
    @media screen { .certificate-wrapper { zoom: var(--fit, 1); } }
  </style>
  <script>
    (function () {
      function fit() {
        var w = window.innerWidth || document.documentElement.clientWidth || 1150;
        document.documentElement.style.setProperty('--fit', String(Math.min(1, w / 1150)));
      }
      fit();
      window.addEventListener('resize', fit);
    })();
  </script>
</head>
<body>
<div class="certificate-wrapper" style="background:#fff">
  <main class="certificate">
    <header class="header">
      <div class="logo" aria-label="NC logo"><div class="logo-ring"></div><img src="${BOND_LOGO}" alt="Company Logo" /></div>
      <section class="company">
        <h1>${esc(company.name)}</h1>
        <div class="tagline"><span class="tag-line"></span>Invest Today<span class="tag-separator"></span>Prosper Tomorrow<span class="tag-line"></span></div>
        <p>${esc(company.address)}</p>
      </section>
      <section class="bond-meta">
        <div><b>Bond No.</b><span>${bondNo}</span></div>
        <div><b>Issue Date</b><span>${fmt(issue)}</span></div>
        <div class="maturity-highlight"><b>Maturity Date</b><span>${fmt(maturity)}</span></div>
      </section>
    </header>

    <section class="ribbon">
      <div class="ribbon-flourish">✦</div>
      <div><h2>SECURED NON-CONVERTIBLE DEBENTURE</h2><h3>C E R T I F I C A T E</h3></div>
      <div class="ribbon-flourish">✦</div>
    </section>

    <section class="intro">
      <p>This is to certify that the bearer is the registered holder of a Secured Non-Convertible Debenture issued by</p>
      <strong>${esc(company.name.toUpperCase())}</strong>
      <p>hereinafter referred to as the “Company” for the principal sum of</p>
      <div class="principal">₹ ${inr(principal)}/- <small>(Rupees ${numberToWords(principal)} Only)</small></div>
      <p>on the terms and conditions set out herein and in the Debenture Trust Deed / Offer Document.</p>
    </section>

    <section class="main-grid">
      <section class="details panel">
        <div class="panel-title">BOND DETAILS</div>
        <div class="detail-table">
          <div><b>Investor Name</b><span>:</span><p>${esc(inv?.fullName)}</p></div>
          <div><b>Father's Name/Spouse Name</b><span>:</span><p>${esc(fatherName)}</p></div>
          <div><b>Address</b><span>:</span><p>${esc(address)}</p></div>
          <div><b>Mobile No.</b><span>:</span><p>${esc(inv?.phone || '—')}</p></div>
          <div><b>Email ID</b><span>:</span><p>${esc(inv?.email || 'N/A')}</p></div>
          <div><b>Nominee Name</b><span>:</span><p>${esc(nomineeName)}</p></div>
          <div><b>Nominee Relation</b><span>:</span><p>${esc(nomineeRelation)}${nomineeAge ? ` (${esc(nomineeAge)})` : ''}</p></div>
          <div><b>Principal Amount</b><span>:</span><p>₹ ${inr(principal)}/- (Rupees ${numberToWords(principal)} Only)</p></div>
          <div><b>Maturity Period</b><span>:</span><p>${periodText}</p></div>
          <div><b>Amount Payable on Maturity</b><span>:</span><p>₹ ${inr(maturityAmount)}/- (Rupees ${numberToWords(maturityAmount)} Only)</p></div>
        </div>
        <p class="acknowledgement">For value received, the Company hereby acknowledges the terms of this Secured Non-Convertible Debenture Certificate and agrees to abide by the terms and conditions mentioned herein and in the Debenture Trust Deed.</p>
        <div class="issuer">For ${esc(company.name)}</div>
        <div class="seal"><div class="seal-inner"><img src="${BOND_SEAL}" alt="Company Seal" /></div></div>
      </section>

      <section class="terms panel">
        <div class="panel-title">TERMS &amp; CONDITIONS</div>
        <ol class="terms-list">
          <li><b>Interest</b><span>The Company shall pay interest @ 14-16% per yearly on the principal amount.</span></li>
          <li><b>Security</b><span>The Debenture is secured by a charge on the Company's specified assets, as per the Debenture Trust Deed.</span></li>
          <li><b>Transferability</b><span>The Debenture is non-convertible and non-transferable without the prior written consent of the Company.</span></li>
          <li><b>Default</b><span>In case of default, the Company shall be liable to pay penal interest as per the terms in the Debenture Trust Deed.</span></li>
          <li><b>Governing Law</b><span>This Certificate shall be governed by and construed in accordance with the laws of India.</span></li>
          <li><b>Dispute Resolution</b><span>Any dispute arising shall be subject to the jurisdiction of competent courts at Delhi.</span></li>
        </ol>
        <div class="right-signature"><div class="hand-sign">Deepak Dayal</div><div class="sign-line"></div><div class="sign-label">Authorised Signatory<br /><span>(Director)</span></div></div>
        ${qr ? `<div class="qr"><div class="qr-pattern">${qr}</div><span>Scan to Verify<br />Authenticity</span></div>` : ''}
      </section>
    </section>

    <footer class="footer" style="display:flex;justify-content:space-between;align-items:center;font-size:8px;font-style:italic;font-weight:500;font-family:Arial,Helvetica,sans-serif;padding:8px 12px;color:#fff;word-break:break-word">
      <div style="font-size:6.5px">🌐 WEBSITE: ${esc(company.website)}</div>
      <div style="font-size:6.5px">📞 CUSTOMER CARE: ${esc(company.phone)}</div>
      <div style="font-size:6.5px">✉️ EMAIL: ${esc(company.email)}</div>
    </footer>
  </main>
</div>
</body>
</html>`;
};
