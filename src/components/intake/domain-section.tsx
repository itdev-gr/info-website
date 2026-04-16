'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { IntakeFormValues } from '@/lib/validation';

export function DomainSection() {
  const { register, setValue, formState: { errors } } = useFormContext<IntakeFormValues>();
  const has = useWatch<IntakeFormValues, 'has_existing_domain'>({ name: 'has_existing_domain' });
  const suggestions = useWatch<IntakeFormValues, 'domain_suggestions'>({ name: 'domain_suggestions' }) ?? [];

  function addSuggestion() {
    if (suggestions.length >= 3) return;
    setValue('domain_suggestions', [...suggestions, ''], { shouldValidate: false });
  }
  function removeSuggestion(index: number) {
    setValue('domain_suggestions', suggestions.filter((_, i) => i !== index), { shouldValidate: true });
  }

  return (
    <fieldset className="space-y-3">
      <legend className="font-medium">Domain</legend>

      <div className="flex items-center gap-2">
        <Checkbox
          id="has-domain"
          checked={has}
          onCheckedChange={(checked) => {
            setValue('has_existing_domain', checked === true);
            if (checked === true) setValue('domain_suggestions', []);
            else setValue('existing_domain', '');
          }}
        />
        <Label htmlFor="has-domain">I already own a domain</Label>
      </div>

      {has ? (
        <div className="space-y-1">
          <Label htmlFor="existing_domain">Your domain</Label>
          <Input id="existing_domain" placeholder="example.com" {...register('existing_domain')} />
          {errors.existing_domain && <p className="text-xs text-destructive">{String(errors.existing_domain.message)}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Suggested domains (up to 3) — we&apos;ll try to purchase one for you</Label>
          {suggestions.map((_, i) => (
            <div key={i} className="flex gap-2">
              <Input placeholder={`suggestion ${i + 1}.com`} {...register(`domain_suggestions.${i}` as const)} />
              <Button type="button" variant="outline" size="sm" onClick={() => removeSuggestion(i)}>Remove</Button>
            </div>
          ))}
          {suggestions.length < 3 && (
            <Button type="button" variant="outline" size="sm" onClick={addSuggestion}>Add suggestion</Button>
          )}
          {errors.domain_suggestions && <p className="text-xs text-destructive">{String(errors.domain_suggestions.message)}</p>}
        </div>
      )}
    </fieldset>
  );
}
