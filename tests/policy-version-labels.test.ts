import { describe, expect, it } from 'vitest';
import { policyPrototype, policyRefs } from '../src/data/policy-prototype';
import { policyAdditionRefs } from '../src/data/policy-additions';
import type { PolicyRef } from '../src/data/policy-prototype-model';
import { policyVersionLabel } from '../src/ui/policy-version-labels';

const policy=(ref:PolicyRef)=>{
  const found=policyPrototype.policies.find(p=>p.policyId===ref.policyId&&p.versionId===ref.versionId);
  if(!found)throw new Error(`Missing fixture ${ref.policyId}@${ref.versionId}`);
  return found;
};
const label=(ref:PolicyRef)=>policyVersionLabel(policy(ref));

describe('reader-facing policy version labels',()=>{
  it('describes all 31 catalog versions with Japanese dates while keeping identifiers unchanged',()=>{
    const before=JSON.stringify(policyPrototype.policies);
    expect(policyPrototype.policies).toHaveLength(31);
    for(const entry of policyPrototype.policies){
      const text=policyVersionLabel(entry);
      expect(text).not.toBe('版説明未収録');
      expect(text).toMatch(/^\d{4}年\d{1,2}月\d{1,2}日(?:・|確認の公約)/);
      expect(text).not.toContain(entry.versionId);
    }
    expect(JSON.stringify(policyPrototype.policies)).toBe(before);
  });

  it('separates the passed package from the statement’s design and exemption conditions',()=>{
    expect(label(policyRefs.hr1)).toBe('2025年7月1日・上院通過版');
    expect(label(policyRefs.medicaidFunding)).toBe('2025年7月1日・本人声明（資金削減への対応設計）');
    expect(label(policyRefs.medicaidWork)).toBe('2025年7月1日・本人声明（就労要件の例外条件）');
  });

  it('preserves the different durations and conditions of the five ACA versions',()=>{
    const versions=policyPrototype.policies.filter(p=>p.policyId==='aca-enhanced-premium-credit').map(policyVersionLabel);
    expect(versions).toHaveLength(5);
    expect(new Set(versions).size).toBe(5);
    expect(label(policyAdditionRefs.acaSullivan)).toContain('2年延長・条件付き設計');
    expect(label(policyAdditionRefs.acaHouse2028)).toContain('2028年まで延長');
    expect(label(policyAdditionRefs.acaPermanent)).toContain('恒久化方針');
    expect(label(policyAdditionRefs.acaCooper)).toBe('2026年3月9日・陣営発表（補助復活・期間未特定）');
    expect(label(policyAdditionRefs.acaHamilton)).toBe('2026年9月30日確認の公約（補助復活・期間未特定）');
  });

  it('distinguishes the Canada chambers and measures from the global tariff measure',()=>{
    expect(label(policyRefs.canadaEmergency)).toBe('2025年4月2日・上院採決版（S.J.Res.37）');
    expect(label(policyAdditionRefs.canadaHouse)).toBe('2026年2月11日・下院通過版（H.J.Res.72）');
    expect(label(policyAdditionRefs.globalEmergency)).toBe('2025年10月30日・上院採決版（S.J.Res.88）');
    expect(label(policyRefs.targetedTariffs)).toContain('対象限定・交渉利用');
    expect(label(policyRefs.blanketCanada)).toContain('広範な対カナダ関税');
  });

  it('labels as-of campaign records as checked material, without asserting a publication date',()=>{
    const checked=policyPrototype.policies.filter(p=>p.versionId.includes('-asof-'));
    expect(checked.length).toBeGreaterThan(0);
    for(const entry of checked){
      const date=entry.versionId.match(/(\d{4})-(\d{2})-(\d{2})$/)!;
      const text=policyVersionLabel(entry);
      expect(text).toContain(`${date[1]}年${Number(date[2])}月${Number(date[3])}日確認の公約`);
      expect(text).not.toContain('発表');
      expect(text).not.toContain('公開');
    }
  });

  it('uses the actual statement and interview dates rather than later reprints or publication',()=>{
    expect(label(policyAdditionRefs.hsaExpansion)).toBe('2026年1月20日・本人発言（HSA利用拡大）');
    expect(label(policyAdditionRefs.constructionTariffs)).toBe('2026年8月27日・取材での発言（建材関税の撤廃）');
    expect(label(policyAdditionRefs.ncMedicaid)).toBe('2023年3月27日・知事署名（NC州法HB76）');
  });

  it('identifies procedural actions without calling them final passage',()=>{
    const cloture=label(policyAdditionRefs.acaProceed),consent=label(policyAdditionRefs.priceConsentRequest);
    expect(cloture).toContain('審議入り動議への討論終結票');
    expect(consent).toContain('全会一致同意要求（異議により停止）');
    expect(cloture).not.toContain('通過');
    expect(consent).not.toContain('成立');
    expect(label(policyAdditionRefs.upfrontPrices)).toContain('開示設計');
  });

  it('returns a neutral fallback for future or mismatched versions without exposing internal IDs',()=>{
    const known=policy(policyRefs.hr1);
    expect(policyVersionLabel({...known,versionId:'senate-passage-2027-01-01',scopeDate:'2027-01-01'})).toBe('版説明未収録');
    expect(policyVersionLabel({...known,policyId:'unregistered-policy'})).toBe('版説明未収録');
  });
});
