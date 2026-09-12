import type { Election, HouseDistrict, Seat } from '../data/model';
import { cloneScenario, normalizeScenario, type SavedScenario, type ScenarioLoadResult, type ScenarioState } from './model';

export const DRAFT_STORAGE_KEY = 'us-midterms-2026:scenario-draft:v1';
export const SAVED_STORAGE_KEY = 'us-midterms-2026:scenarios:v1';
export const SAVED_SCENARIO_LIMIT = 5;

export interface StorageResult {
  ok: boolean;
  message?: string;
}

export function saveDraft(storage: Storage, state: ScenarioState): StorageResult {
  try {
    storage.setItem(DRAFT_STORAGE_KEY,JSON.stringify(state));
    return {ok:true};
  } catch {
    return {ok:false,message:'このブラウザでは仮定を自動保存できません。現在の画面では操作を続けられます。'};
  }
}

export function loadDraft(storage: Storage, seats: Seat[], elections: Election[], houseDistricts: HouseDistrict[]): ScenarioLoadResult|null {
  try {
    const text = storage.getItem(DRAFT_STORAGE_KEY);
    if (!text) return null;
    return normalizeScenario(JSON.parse(text),seats,elections,houseDistricts);
  } catch {
    return {state:normalizeScenario(null,seats,elections,houseDistricts).state,notices:['自動保存を読み取れなかったため、初期状態で開きました。'],staleBaseline:false};
  }
}

export function loadSavedScenarios(storage: Storage, seats: Seat[], elections: Election[], houseDistricts: HouseDistrict[]): {items:SavedScenario[];notices:string[]} {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(SAVED_STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return {items:[],notices:['保存案の一覧を読み取れませんでした。']};
    const notices: string[] = [];
    const items: SavedScenario[] = [];
    for (const raw of parsed.slice(0,SAVED_SCENARIO_LIMIT)) {
      if (!raw || typeof raw !== 'object') continue;
      const record = raw as Record<string,unknown>;
      if (typeof record.id !== 'string' || typeof record.name !== 'string' || typeof record.savedAt !== 'string') continue;
      const result = normalizeScenario(record.state,seats,elections,houseDistricts);
      notices.push(...result.notices.map(message => `${record.name}：${message}`));
      items.push({id:record.id,name:record.name.slice(0,40),savedAt:record.savedAt,state:result.state});
    }
    return {items,notices};
  } catch {
    return {items:[],notices:['保存案の一覧を読み取れませんでした。']};
  }
}

export function persistSavedScenarios(storage: Storage, items: SavedScenario[]): StorageResult {
  try {
    storage.setItem(SAVED_STORAGE_KEY,JSON.stringify(items.slice(0,SAVED_SCENARIO_LIMIT)));
    return {ok:true};
  } catch {
    return {ok:false,message:'このブラウザでは保存案を記録できません。'};
  }
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replaceAll('-','+').replaceAll('_','/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary,character => character.charCodeAt(0));
}

export function encodeScenario(state: ScenarioState): string {
  const shareState = cloneScenario(state);
  shareState.updatedAt = '';
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(shareState)));
}

export function decodeScenario(payload: string, seats: Seat[], elections: Election[], houseDistricts: HouseDistrict[]): ScenarioLoadResult {
  if (!payload || payload.length > 12_000 || !/^[A-Za-z0-9_-]+$/.test(payload)) {
    return {state:normalizeScenario(null,seats,elections,houseDistricts).state,notices:['共有URLの形式を確認できませんでした。'],staleBaseline:false};
  }
  try {
    const text = new TextDecoder().decode(base64UrlToBytes(payload));
    return normalizeScenario(JSON.parse(text),seats,elections,houseDistricts);
  } catch {
    return {state:normalizeScenario(null,seats,elections,houseDistricts).state,notices:['共有URLを読み取れませんでした。'],staleBaseline:false};
  }
}

export function createSavedScenario(name: string, state: ScenarioState): SavedScenario {
  const savedAt = new Date().toISOString();
  const id = globalThis.crypto?.randomUUID?.() ?? `scenario-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {id,name:name.trim().slice(0,40) || `案 ${savedAt.slice(0,10)}`,savedAt,state:cloneScenario(state)};
}
