// framer/components/PricingTable.tsx — Standalone Framer Code Component for Bottom-Aligned Unequal Pricing Cards (Part 5.6)
import React, { useState } from 'react';
import { addPropertyControls, ControlType } from 'framer';

export default function FramerPricingTable({
  teamMonthlyPrice = 19,
  businessMonthlyPrice = 49,
  yearlyDiscountPercent = 20,
  currencySymbol = '$',
}: {
  teamMonthlyPrice?: number;
  businessMonthlyPrice?: number;
  yearlyDiscountPercent?: number;
  currencySymbol?: string;
}) {
  // Always defaults to monthly (Honesty Rule 4.9)
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const factor = 1 - yearlyDiscountPercent / 100;

  const plans = [
    { name: 'Free', monthly: 0, height: 320, desc: '40 runs a month, 1 seat, 7-day history' },
    {
      name: 'Team',
      monthly: teamMonthlyPrice,
      height: 360,
      desc: '500 runs/user, shared folders, 30-day history',
    },
    {
      name: 'Business',
      monthly: businessMonthlyPrice,
      height: 400,
      desc: '2,500 runs/user, EU/US/JP pinning, SAML SSO',
    },
  ];

  return (
    <div style={{ fontFamily: '"Albert Sans", sans-serif', color: '#1C1B18' }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => setPeriod('monthly')}
          style={{
            padding: '6px 12px',
            fontFamily: 'monospace',
            backgroundColor: period === 'monthly' ? '#1F4B99' : '#FBF8EF',
            color: period === 'monthly' ? '#FBF8EF' : '#1C1B18',
            border: '1px solid #DCD3BC',
            cursor: 'pointer',
          }}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setPeriod('yearly')}
          style={{
            padding: '6px 12px',
            fontFamily: 'monospace',
            backgroundColor: period === 'yearly' ? '#1F4B99' : '#FBF8EF',
            color: period === 'yearly' ? '#FBF8EF' : '#1C1B18',
            border: '1px solid #DCD3BC',
            cursor: 'pointer',
          }}
        >
          Yearly (save {yearlyDiscountPercent}%)
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          alignItems: 'end',
        }}
      >
        {plans.map((p) => {
          const effMonthly =
            period === 'yearly' && p.monthly > 0
              ? (p.monthly * factor).toFixed(2)
              : String(p.monthly);
          const yearlyTotal = (p.monthly * 12 * factor).toFixed(2);
          const yearlySaving = (p.monthly * 12 - Number(yearlyTotal)).toFixed(2);

          return (
            <div
              key={p.name}
              style={{
                minHeight: p.height,
                padding: 20,
                backgroundColor: '#FBF8EF',
                border: p.name === 'Team' ? '2px solid #1F4B99' : '1px solid #DCD3BC',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontFamily: '"Literata", serif', fontSize: 20, fontWeight: 600 }}>
                  {p.name} [sample]
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 32, fontWeight: 700, margin: '12px 0' }}>
                  {currencySymbol}
                  {effMonthly}
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#5C574D' }}>
                    {' '}
                    / user / mo
                  </span>
                </div>
                {period === 'yearly' && p.monthly > 0 && (
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#246B41' }}>
                    Billed {currencySymbol}
                    {yearlyTotal}/yr (saves {currencySymbol}
                    {yearlySaving}/yr)
                  </div>
                )}
                <p style={{ fontSize: 13, color: '#5C574D', marginTop: 12 }}>{p.desc}</p>
              </div>
              <button
                type="button"
                style={{
                  padding: '10px',
                  backgroundColor: '#1F4B99',
                  color: '#FBF8EF',
                  border: 'none',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Start {p.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

addPropertyControls(FramerPricingTable, {
  teamMonthlyPrice: { type: ControlType.Number, title: 'Team / mo', defaultValue: 19 },
  businessMonthlyPrice: { type: ControlType.Number, title: 'Business / mo', defaultValue: 49 },
  yearlyDiscountPercent: { type: ControlType.Number, title: 'Yearly Disc %', defaultValue: 20 },
  currencySymbol: { type: ControlType.String, title: 'Currency', defaultValue: '$' },
});

