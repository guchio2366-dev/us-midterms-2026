export interface SeatBarSegment {
  count: number;
  label: string;
  className: string;
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

export function seatBarMarkup(segments: SeatBarSegment[], total: number, ariaLabel: string, target?: SeatBarTarget) {
  const prepared = prepareSeatBar(segments,total);
  const track = prepared.map(segment => `<div class="seat-segment ${segment.className}${segment.percent < 7 ? ' tiny' : ''}" style="width:${segment.percent}%" title="${escapeAttribute(segment.label)}"><span>${segment.count}</span></div>`).join('');
  const marker = target
    ? `<i class="seat-target-marker" style="left:${seatBarTargetPosition(target,total)}%" title="${escapeAttribute(target.label)}" aria-hidden="true"></i>`
    : '';
  const legend = prepared.map(segment => `<span><i class="${segment.className}"></i>${escapeAttribute(segment.label)}</span>`).join('');
  const targetLegend = target ? `<span class="seat-target-label"><i></i>${escapeAttribute(target.label)}</span>` : '';
  return `<div class="seat-composition" role="img" aria-label="${escapeAttribute(ariaLabel)}"><div class="seat-composition-track">${track}${marker}</div><div class="seat-composition-legend">${legend}${targetLegend}</div></div>`;
}
