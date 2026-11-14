// framer/components/CostCalculator.tsx — Standalone Framer Code Component for the Cost & Value Calculator with Property Controls (Part 5.6)
import React, { useState } from 'react';
import { addPropertyControls, ControlType } from 'framer';

function roundSig2(n: number): number {
  if (n === 0 || !Number.isFinite(n)) return 0;
  const abs = Math.abs(n);
  const d = Math.ceil(Math.log10(abs));
  const mag = Math.pow(10, 2 - d);
  return Math.round(n * mag) / mag;
}

export default function FramerCostCalculator({
  defaultTeamSize = 5,
  defaultHoursSaved = 2,
  defaultHourlyCost = 40,
  planPricePerUser = 19,
  currencySymbol = '$',
}: {
  defaultTeamSize?: number;
  defaultHoursSaved?: number;
  defaultHourlyCost?: number;
  planPricePerUser?: number;
  currencySymbol?: string;
}) {
  const [team, setTeam] = useState(defaultTeamSize);
  const [hours, setHours] = useState(defaultHoursSaved);
  const [rate, setRate] = useState(defaultHourlyCost);

  const weekly = team * hours * rate;
  const monthlyFull = weekly * 4.33;
  const grossLow = roundSig2(monthlyFull * 0.6);
  const grossHigh = roundSig2(monthlyFull);
  const planCost = team * planPricePerUser;
  const netLow = roundSig2(monthlyFull * 0.6 - planCost);
  const netHigh = roundSig2(monthlyFull - planCost);

  const paybackText =
    hours > 0 && monthlyFull > 0
      ? `${(planCost / (monthlyFull / 21.7)).toFixed(1)} to ${(
          planCost /
          ((monthlyFull * 0.6) / 21.7)
        ).toFixed(1)} working days`
      : 'Not applicable';

  return (
    <div
      style={{
        padding: 24,
        backgroundColor: '#FBF8EF',
        border: '1px solid #DCD3BC',
        borderRadius: 2,
        color: '#1C1B18',
        fontFamily: '"Albert Sans", sans-serif',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <label style={{ fontFamily: 'monospace', fontSize: 12 }}>
          Team size: {team}
          <input
            type="range"
            min={1}
            max={500}
            value={team}
            onChange={(e) => setTeam(Number(e.target.value))}
            style={{ width: '100%', display: 'block', marginTop: 6 }}
          />
        </label>
        <label style={{ fontFamily: 'monospace', fontSize: 12 }}>
          Hours saved / wk: {hours}
          <input
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            style={{ width: '100%', display: 'block', marginTop: 6 }}
          />
        </label>
        <label style={{ fontFamily: 'monospace', fontSize: 12 }}>
          Hourly cost ({currencySymbol}):
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value) || 0)}
            style={{ width: '100%', display: 'block', marginTop: 6, padding: 4 }}
          />
        </label>
      </div>

      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid #DCD3BC',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          fontFamily: 'monospace',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#5C574D' }}>Monthly value (60–100%)</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {currencySymbol}
            {grossLow.toLocaleString()} to {grossHigh.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#5C574D' }}>Plan cost</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {currencySymbol}
            {planCost.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#1F4B99' }}>Net monthly range</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1F4B99' }}>
            {currencySymbol}
            {netLow.toLocaleString()} to {netHigh.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#5C574D' }}>Payback</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#246B41' }}>{paybackText}</div>
        </div>
      </div>
      <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#5C574D', marginTop: 12 }}>
        This is an estimate based on your inputs, not a promise. [sample]
      </p>
    </div>
  );
}

addPropertyControls(FramerCostCalculator, {
  defaultTeamSize: { type: ControlType.Number, title: 'Team Size', defaultValue: 5 },
  defaultHoursSaved: { type: ControlType.Number, title: 'Hours / Wk', defaultValue: 2 },
  defaultHourlyCost: { type: ControlType.Number, title: 'Hourly Cost', defaultValue: 40 },
  planPricePerUser: { type: ControlType.Number, title: 'Plan / User', defaultValue: 19 },
  currencySymbol: { type: ControlType.String, title: 'Currency', defaultValue: '$' },
});

