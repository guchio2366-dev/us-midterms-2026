export interface SeatBarSegment {
  count: number;
  label: string;
  className: string;
  shortLabel?: string;
}

export interface SeatBarTarget {
  value: number;
  from: 'left'|'right';
  label: string;
}

export interface PreparedSeatBarSegment extends SeatBarSegment {
  percent: number;
}

export function prepareSeatBar(segments: SeatBarSegment[], total: number): PreparedSeatBarSegment[] {
  if (!Number.isFinite(total) || total <= 0) throw new Error('seat bar total must be positive');
  if (segments.some(segment => !Number.isFinite(segment.count) || segment.count < 0)) {
    throw new Error('seat bar segments must be non-negative');
  }
  const sum = segments.reduce((value,segment) => value + segment.count,0);
  if (Math.abs(sum - total) > 1e-9) throw new Error(`seat bar segments total ${sum}, expected ${total}`);
  return segments.filter(segment => segment.count > 0).map(segment => ({
    ...segment,
    percent: segment.count / total * 100,
  }));
}

export function seatBarTargetPosition(target: SeatBarTarget, total: number): number {
  if (!Number.isFinite(total) || total <= 0) throw new Error('seat bar total must be positive');
  if (!Number.isFinite(target.value) || target.value < 0 || target.value > total) {
    throw new Error('seat bar target must be within the total');
  }
  return (target.from === 'left' ? target.value : total - target.value) / total * 100;
}

function escapeAttribute(value: string) {
  return value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

export function seatBarMarkup(segments: SeatBarSegment[], total: number, ariaLabel: string, target?: SeatBarTarget, range?: {start:number;count:number;label:string}) {
  const prepared = prepareSeatBar(segments,total);
  const track = prepared.map(segment => `<div class="seat-segment ${escapeAttribute(segment.className)}${segment.percent < 7 ? ' tiny' : ''}" style="width:${segment.percent}%" title="${escapeAttribute(segment.label)}"><span>${escapeAttribute(segment.shortLabel ?? String(segment.count))}</span></div>`).join('');
  const marker = target
    ? `<i class="seat-target-marker" style="left:${seatBarTargetPosition(target,total)}%" title="${escapeAttribute(target.label)}" aria-hidden="true"></i>`
    : '';
  const legend = prepared.map(segment => `<span><i class="${escapeAttribute(segment.className)}"></i>${escapeAttribute(segment.label)}</span>`).join('');
  const targetLegend = target ? `<span class="seat-target-label"><i></i>${escapeAttribute(target.label)}</span>` : '';
  if (range && (range.start < 0 || range.count < 0 || range.start + range.count > total)) throw new Error('Invalid seat range');
  const band = range ? `<div class="seat-range" aria-hidden="true"><span style="margin-left:${range.start / total * 100}%;width:${range.count / total * 100}%">${escapeAttribute(range.label)}</span></div>` : '';
  const description = `${ariaLabel}。全${total}議席。${prepared.map(segment => segment.label).join('、')}${target ? `。${target.label}` : ''}`;
  return `<div class="seat-composition" role="img" aria-label="${escapeAttribute(description)}">${band}<div class="seat-composition-track" aria-hidden="true">${track}${marker}</div><div class="seat-composition-legend" aria-hidden="true">${legend}${targetLegend}</div></div>`;
}
