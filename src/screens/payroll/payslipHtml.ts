// Salary slip PDF download + email for the app. The slip itself is built by
// payslipTemplate.ts (same design as the CRM web salary slip and the emailed slip).
import { Alert, Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { apiCall } from '../../services/api';
import { BOND_LOGO } from '../investorPortal/bondAssets';
import { buildPayslipHtml, payslipMonthLabel, PayslipCompany } from './payslipTemplate';

/** "NOVEMBER 2026" style label used on the slip (falls back to the raw value). */
export const slipMonthName = (monthYear?: string) =>
  monthYear
    ? new Date(`${monthYear}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
    : monthYear;

/** A4 portrait in points, for expo-print's printToFileAsync({ width, height }). */
const A4 = { width: 595, height: 842 };

let companyCache: PayslipCompany | null = null;

/** Company profile from settings (public endpoint, no secrets). Cached for the session. */
async function loadCompany(): Promise<PayslipCompany | undefined> {
  if (companyCache) return companyCache;
  try {
    const res: any = await apiCall('/api/public/app-content');
    const co = res?.data?.data?.company;
    if (co) companyCache = co;
  } catch { /* fall back to template defaults */ }
  return companyCache || undefined;
}

/**
 * The list endpoint only populates name/code/department/designation; the slip also needs
 * PAN, bank details and date of joining, so load the full record by id.
 */
async function loadFullSlip(slip: any) {
  if (!slip?._id) return slip;
  try {
    const res: any = await apiCall(`/api/payroll/${slip._id}`);
    const full = res?.data?.data;
    if (res?.success && full && typeof full === 'object') return full;
  } catch { /* use what we have */ }
  return slip;
}

/** Full-design HTML for a slip (loads the full record + company profile first). */
export async function getPayslipHtml(slip: any) {
  const [full, company] = await Promise.all([loadFullSlip(slip), loadCompany()]);
  return { full, html: buildPayslipHtml(full, company, BOND_LOGO) };
}

/**
 * For the on-screen preview only: shrink the 794px-wide A4 slip to fit the phone width.
 * Print/PDF output is unaffected (the zoom is screen-only).
 */
export function fitPayslipToScreen(html: string) {
  const fit = `<style>@media screen { body { zoom: var(--fit, 1); } }</style>
<script>(function(){function f(){var w=window.innerWidth||document.documentElement.clientWidth||794;document.documentElement.style.setProperty('--fit',String(Math.min(1,w/794)));}f();window.addEventListener('resize',f);})();</script>`;
  return html.replace('</head>', `${fit}</head>`);
}

const slipFileName = (s: any) =>
  `SalarySlip_${s?.monthYear || 'Slip'}_${s?.employeeId?.employeeCode || 'Employee'}.pdf`;

/** Print the slip to an A4 PDF and open the share sheet (save to Files, WhatsApp, etc.). */
export async function downloadPayslipPdf(slip: any) {
  if (!slip) return;
  try {
    const { full, html } = await getPayslipHtml(slip);
    if (Platform.OS === 'web') {
      const w = window.open('', '_blank');
      if (!w) throw new Error('Allow pop-ups to download the slip.');
      w.document.write(html.replace('</body>', '<script>window.onload=function(){window.print();}</script></body>'));
      w.document.title = slipFileName(full).replace(/\.pdf$/, '');
      w.document.close();
      return;
    }
    const { uri } = await Print.printToFileAsync({ html, base64: false, ...A4 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Salary Slip PDF', UTI: 'com.adobe.pdf' });
    } else {
      Alert.alert('PDF saved', `Slip saved to: ${uri}`);
    }
  } catch (e: any) {
    Alert.alert('Error', e?.message || 'Could not generate the salary slip PDF.');
  }
}

/** Open the phone's mail app with the PDF attached (used if the server email fails). */
async function composeWithAttachment(full: any, html: string) {
  const emp = full?.employeeId || {};
  const month = payslipMonthLabel(full?.monthYear);
  const { uri } = await Print.printToFileAsync({ html, base64: false, ...A4 });
  if (await MailComposer.isAvailableAsync()) {
    await MailComposer.composeAsync({
      recipients: emp.email ? [emp.email] : [],
      subject: `Salary Slip for ${month}`,
      body: `Dear ${emp.firstName || 'Employee'},\n\nPlease find your salary slip for ${month} attached.\n\nRegards,\nHR & Payroll Team`,
      attachments: [uri],
    });
  } else {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Send Salary Slip', UTI: 'com.adobe.pdf' });
  }
}

/**
 * Email the slip to the employee's registered email from the CRM server (same as the web).
 * The email body is the slip itself, in the same design, with the PDF attached.
 */
export async function emailPayslip(slip: any) {
  if (!slip) return;
  let full: any = slip;
  let html = '';
  try {
    ({ full, html } = await getPayslipHtml(slip));
    const emp = full?.employeeId || {};
    if (!emp.email) {
      Alert.alert('No email on file', 'This employee has no email address. Add one in Employees, then try again.');
      return;
    }

    let pdfBase64: string | undefined;
    if (Platform.OS !== 'web') {
      try {
        const out = await Print.printToFileAsync({ html, base64: true, ...A4 });
        if (out.base64) pdfBase64 = `data:application/pdf;base64,${out.base64}`;
      } catch { /* server still sends the slip in the email body */ }
    }

    const res: any = await apiCall(`/api/payroll/${full._id || slip._id}/email`, {
      method: 'POST',
      body: JSON.stringify({ pdfBase64 }),
    });
    if (res?.success && res?.data?.success !== false) {
      Alert.alert('Email sent', res?.data?.message || `Salary slip emailed to ${emp.email}`);
      return;
    }
    throw new Error(res?.data?.error || res?.error || 'Email could not be sent from the server.');
  } catch (e: any) {
    if (Platform.OS === 'web' || !html) {
      Alert.alert('Error', e?.message || 'Could not email the salary slip.');
      return;
    }
    Alert.alert(
      'Server email failed',
      `${e?.message || 'The CRM server could not send the email.'}\n\nSend it from your phone's mail app instead?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open mail app', onPress: () => composeWithAttachment(full, html).catch(() => Alert.alert('Error', 'Could not open the mail app.')) },
      ],
    );
  }
}
