import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from './api';

// Public home-page content, edited by admins in CRM → Master Settings → "Mobile App Home".
// Served by GET /api/public/app-content (no login). Mirrors CRM/src/lib/appHomeContent.ts.

export type HomeIcon =
  | 'building' | 'target' | 'shield' | 'trending' | 'key'
  | 'user' | 'briefcase' | 'wallet' | 'chart' | 'landmark';

export interface HomeCard { title: string; description: string; icon: HomeIcon }
export interface HomeSection { title: string; cards: HomeCard[] }
export interface HomeHighlight { value: string; label: string }

export interface HomeContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  heroDescription: string;
  highlights: HomeHighlight[];
  sections: HomeSection[];
  consultUrl: string;
  contactUrl: string;
  profilePdfUrl: string;
  footerNote: string;
}

export interface HomeCompany {
  name: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface HomeData { company: HomeCompany; content: HomeContent }

// Shown on first launch with no network, and while the first request is in flight.
export const DEFAULT_HOME_DATA: HomeData = {
  company: {
    name: 'Niventra Capital Advisory India Pvt. Ltd.',
    logoUrl: '',
    address: 'Mezzanine Level, Shivaji Stadium Metro Station, Baba Kharak Singh Road, Connaught Place, New Delhi 110001',
    phone: '',
    email: 'info@niventracapitaladvisory.com',
    website: 'www.niventracapitaladvisory.com',
  },
  content: {
    heroBadge: 'Official Investor Portal',
    heroTitle: 'Niventra Capital Advisory',
    heroSubtitle: 'India Pvt. Ltd.',
    heroTagline: 'Smart Investments for a Better Tomorrow',
    heroDescription:
      'Build long-term wealth with personalized investment strategies, expert financial guidance, and transparent advisory services.',
    highlights: [
      { value: '11.5%', label: 'NCD yield p.a.' },
      { value: '+14.2%', label: 'Real estate growth' },
      { value: '100%', label: 'Asset-backed' },
      { value: '₹1+ Cr', label: 'Assets managed' },
    ],
    sections: [
      {
        title: 'Company',
        cards: [
          { icon: 'building', title: 'Company Overview', description: 'Professionally managed Real Estate Investment Advisory Company. Trusted partner for residential & commercial real estate investments with focus on long-term wealth creation & transparent services.' },
          { icon: 'target', title: 'Vision & Mission', description: "Become one of India's most trusted real estate investment advisory companies. Create sustainable wealth, expand opportunities, maintain transparency, and ensure high standards of ethics and compliance." },
          { icon: 'shield', title: 'Core Values', description: 'Transparency & Trust · Integrity & Accountability · Professionalism & Customer First · Innovation & Long-Term Relationships' },
        ],
      },
      {
        title: 'Invest',
        cards: [
          { icon: 'trending', title: 'Investment Benefits', description: 'Attractive investment opportunities, capital appreciation, regular rental income potential, wealth preservation, passive income generation, and long-term value creation.' },
          // { icon: 'key', title: 'Why Invest in PPF', description: 'Invest in PPF with attractive interest rates and secure returns.' },
          { icon: 'wallet', title: 'Why Invest in Debentures', description: 'Build long-term wealth with professionally managed investment strategies designed for sustainable growth.' },
          { icon: 'landmark', title: 'Why Invest in Real Estate', description: 'Tangible asset class offering robust inflation hedge, portfolio diversification, strong capital appreciation, and reliable long-term financial security.' },
          { icon: 'user', title: 'Who Can Invest', description: 'Salaried Professionals, Business Owners, NRIs, HNIs, Family Offices, Corporate Investors, First-Time and Experienced Investors.' },
        ],
      },
      {
        title: 'Services',
        cards: [
          { icon: 'briefcase', title: 'Our Key Services', description: 'Residential & Commercial property investments, Office Spaces, Retail Shops, Luxury Apartments, Business Parks, Portfolio Advisory & Exit Strategies.' },
          { icon: 'target', title: 'Investment Process', description: 'Investor Registration → Digital KYC Verification → Transparent Documentation → Agreement Execution → Investment Confirmation → Dedicated RM Updates.' },
          { icon: 'shield', title: 'Due Diligence', description: 'Rigorous market research, legal & title verification, financial analysis, technical feasibility assessments, documentation reviews, and continuous project monitoring.' },
        ],
      },
      {
        title: 'Features',
        cards: [
          { icon: 'shield', title: 'Security & Compliance', description: 'Complete regulatory compliance, transparent transaction records, secure data handling, and strict confidentiality of investor info.' },
          { icon: 'chart', title: 'Digital Platform', description: 'Digital KYC, verified opportunities, investment calculator, portfolio dashboard, payment tracking, property listings & live support.' },
          { icon: 'user', title: 'Investor Benefits', description: 'Verified opportunities, complete legal due diligence, dedicated Relationship Managers, personalized investment planning, regular updates, and end-to-end support.' },
        ],
      },
    ],
    consultUrl: 'https://niventracapitaladvisory.com/contact/',
    contactUrl: 'https://niventracapitaladvisory.com/contact/',
    profilePdfUrl: '',
    footerNote: 'Secured enterprise infrastructure',
  },
};

// Bump the version to drop copies saved on phones (e.g. after changing the defaults).
const CACHE_KEY = 'home-content-cache-v2';

function normalize(raw: any): HomeData | null {
  const d = raw?.data ?? raw;
  if (!d || typeof d !== 'object' || !d.content) return null;
  return {
    company: { ...DEFAULT_HOME_DATA.company, ...(d.company || {}) },
    content: { ...DEFAULT_HOME_DATA.content, ...d.content },
  };
}

/** Cached-first: shows the last saved content instantly, then refreshes from the API. */
export function useHomeContent() {
  const [data, setData] = useState<HomeData>(DEFAULT_HOME_DATA);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  const fetchRemote = useCallback(async () => {
    const res = await apiCall('/api/public/app-content');
    const fresh = res.success ? normalize(res.data) : null;
    if (fresh) {
      setData(fresh);
      setOffline(false);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh)).catch(() => {});
    } else {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(CACHE_KEY)
      .then((s) => {
        const cached = s ? normalize(JSON.parse(s)) : null;
        if (alive && cached) setData(cached);
      })
      .catch(() => {})
      .finally(() => { if (alive) fetchRemote(); });
    return () => { alive = false; };
  }, [fetchRemote]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRemote();
    setRefreshing(false);
  }, [fetchRemote]);

  return { data, refreshing, offline, refresh };
}
