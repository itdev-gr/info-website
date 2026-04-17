'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { IntakeFormValues } from '@/lib/validation';

export function WhatsappButtonSection() {
  const { register, setValue, formState: { errors } } = useFormContext<IntakeFormValues>();
  const wants = useWatch<IntakeFormValues, 'wants_whatsapp_button'>({ name: 'wants_whatsapp_button' });

  return (
    <fieldset className="space-y-3">
      <legend className="font-medium">WhatsApp button</legend>

      <div className="flex items-center gap-2">
        <Checkbox
          id="wants-whatsapp-btn"
          checked={wants}
          onCheckedChange={(checked) => {
            setValue('wants_whatsapp_button', checked === true);
            if (!checked) setValue('whatsapp_button_number', '');
          }}
        />
        <Label htmlFor="wants-whatsapp-btn">
          I want a WhatsApp chat button on my website
        </Label>
      </div>

      {wants && (
        <div className="space-y-1">
          <Label htmlFor="whatsapp_button_number">WhatsApp number for the button</Label>
          <Input
            id="whatsapp_button_number"
            type="tel"
            placeholder="+30 690 000 0000"
            {...register('whatsapp_button_number')}
          />
          <p className="text-xs text-muted-foreground">
            Visitors who click the button on your site will open a WhatsApp chat with this number.
          </p>
          {errors.whatsapp_button_number && (
            <p className="text-xs text-destructive">{String(errors.whatsapp_button_number.message)}</p>
          )}
        </div>
      )}
    </fieldset>
  );
}
