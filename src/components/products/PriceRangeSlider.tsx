import React, { useEffect, useState } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  /** Called once the visitor lets go of a handle or finishes typing */
  onCommit: (value: [number, number]) => void;
}

const formatRs = (n: number) => n.toLocaleString('en-IN');

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({ min, max, step = 500, value, onCommit }) => {
  const [range, setRange] = useState<[number, number]>(value);
  const [inputs, setInputs] = useState<[string, string]>([String(value[0]), String(value[1])]);

  // Follow outside changes (clearing filters, back button)
  useEffect(() => {
    setRange(value);
    setInputs([String(value[0]), String(value[1])]);
  }, [value[0], value[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  const span = Math.max(max - min, 1);
  const left = ((range[0] - min) / span) * 100;
  const right = 100 - ((range[1] - min) / span) * 100;

  const setLow = (v: number) => {
    const low = Math.min(Math.max(v, min), range[1] - step);
    setRange([low, range[1]]);
    setInputs([String(low), inputs[1]]);
  };

  const setHigh = (v: number) => {
    const high = Math.max(Math.min(v, max), range[0] + step);
    setRange([range[0], high]);
    setInputs([inputs[0], String(high)]);
  };

  const commit = () => onCommit(range);

  // Typed values are clamped and applied on blur or Enter
  const commitInputs = () => {
    const low = Math.min(Math.max(Number(inputs[0]) || min, min), max);
    const high = Math.max(Math.min(Number(inputs[1]) || max, max), min);
    const next: [number, number] = low <= high ? [low, high] : [high, low];
    setRange(next);
    setInputs([String(next[0]), String(next[1])]);
    onCommit(next);
  };

  const onKeyCommit = (e: React.KeyboardEvent) => {
    if (['Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
      if (e.currentTarget instanceof HTMLInputElement && e.currentTarget.type === 'number') {
        if (e.key === 'Enter') commitInputs();
      } else {
        commit();
      }
    }
  };

  return (
    <div>
      <div className="relative h-6">
        {/* Track and selected range */}
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary-500"
          style={{ left: `${left}%`, right: `${right}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          step={step}
          value={range[0]}
          onChange={(e) => setLow(Number(e.target.value))}
          onPointerUp={commit}
          onKeyUp={onKeyCommit}
          className="range-thumb absolute inset-0 w-full"
          style={{ zIndex: range[0] > max - step * 2 ? 5 : 3 }}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          step={step}
          value={range[1]}
          onChange={(e) => setHigh(Number(e.target.value))}
          onPointerUp={commit}
          onKeyUp={onKeyCommit}
          className="range-thumb absolute inset-0 w-full"
          style={{ zIndex: 4 }}
        />
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <label className="relative">
          <span className="sr-only">From</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Rs.</span>
          <input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={inputs[0]}
            onChange={(e) => setInputs([e.target.value, inputs[1]])}
            onBlur={commitInputs}
            onKeyDown={onKeyCommit}
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-2 text-sm text-ink focus:border-primary-500 focus:outline-none"
          />
        </label>
        <span className="text-slate-400">–</span>
        <label className="relative">
          <span className="sr-only">To</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Rs.</span>
          <input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={inputs[1]}
            onChange={(e) => setInputs([inputs[0], e.target.value])}
            onBlur={commitInputs}
            onKeyDown={onKeyCommit}
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-2 text-sm text-ink focus:border-primary-500 focus:outline-none"
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Rs. {formatRs(range[0])} – Rs. {formatRs(range[1])}
      </p>
    </div>
  );
};

export default PriceRangeSlider;
