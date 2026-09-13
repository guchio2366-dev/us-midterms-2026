import type { ObservationDataset, ObservationEvent } from './data/observation-model';

export function localDate(now: Date, timezone: string): string {
  const p = new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  return `${p.find(x=>x.type==='year')!.value}-${p.find(x=>x.type==='month')!.value}-${p.find(x=>x.type==='day')!.value}`;
}

/** Wall time to instant, with the event's IANA timezone (including DST). */
export function eventInstant(event: ObservationEvent): Date | null {
  if (!event.date || !event.time) return null;
  const [y,m,d] = event.date.split('-').map(Number);
  const [hh,mm] = event.time.split(':').map(Number);
  const wall = Date.UTC(y,m-1,d,hh,mm);
  let instant = wall;
  for (let i=0;i<3;i++) {
    const parts = new Intl.DateTimeFormat('en-CA',{timeZone:event.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(instant));
    const n=(type:string)=>Number(parts.find(x=>x.type===type)!.value);
    const represented = Date.UTC(n('year'),n('month')-1,n('day'),n('hour'),n('minute'));
    instant += wall-represented;
  }
  return new Date(instant);
}

export function eventStatus(event: ObservationEvent, now = new Date()): string {
  if (event.status === 'completed') return '実施確認';
  if (event.status === 'cancelled') return '中止';
  if (event.status === 'postponed') return '延期・新日程待ち';
  if (!event.date) return '発表済み・日程未定';
  const instant = eventInstant(event);
  const passed = instant ? instant.getTime() <= now.getTime() : event.date < localDate(now,event.timezone);
  return passed ? '予定日経過・結果確認待ち' : '日程確定';
}

export function eventsForRace(data: ObservationDataset, electionId: string, now = new Date()) {
  const all = data.events.filter(e=>e.publicationStatus==='published' && e.relevance.some(r=>r.electionId===electionId));
  const end = new Date(now.getTime()+30*86400000);
  const sorted = all.filter(e=>e.status==='scheduled' && e.date).sort((a,b)=>a.date!.localeCompare(b.date!) || (a.time??'').localeCompare(b.time??'') || a.eventId.localeCompare(b.eventId));
  const upcoming = sorted.filter(e=>eventStatus(e,now)==='日程確定');
  const initial = upcoming.filter(e=>e.date!<=localDate(end,e.timezone)).slice(0,3);
  return {
    initial,
    later: upcoming.filter(e=>!initial.includes(e)),
    pending: sorted.filter(e=>eventStatus(e,now)==='予定日経過・結果確認待ち'),
    undated: all.filter(e=>e.status==='scheduled' && !e.date),
    history: all.filter(e=>e.status!=='scheduled').sort((a,b)=>(b.date??'').localeCompare(a.date??'')),
  };
}

export function monitoringStatus(data: ObservationDataset, now = new Date()): string[] {
  const m=data.monitor, labels:string[]=[];
  if (m.state!=='scheduled') labels.push('定期確認は未接続');
  if (m.latestRun.outcome==='partial') labels.push('一部の情報源を未確認');
  if (m.latestRun.outcome==='reviewing') labels.push('更新内容を確認中');
  if (m.latestRun.outcome==='failed') labels.push('今回の確認に失敗');
  if (!m.lastCompletedAt || now.getTime()-Date.parse(m.lastCompletedAt)>36*3600000) labels.push('確認が遅れています');
  if (!labels.length) labels.push(m.latestRun.outcome==='unchanged' ? '確認した範囲で重要な変更なし' : '登録情報源の確認を完了');
  return labels;
}

export function publishedUpdates(data: ObservationDataset, electionId?: string) {
  return data.updates.filter(u=>u.status==='published' && (!electionId || u.electionIds.includes(electionId)))
    .sort((a,b)=>b.eventDate.localeCompare(a.eventDate) || b.updatedAt.localeCompare(a.updatedAt) || a.updateId.localeCompare(b.updateId));
}
