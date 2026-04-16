'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { intakeFormSchema, type IntakeFormValues } from '@/lib/validation';
import { LogoUpload } from './logo-upload';
import { FileDropzone, type UploadedFile } from './file-dropzone';
import { DomainSection } from './domain-section';

export function IntakeForm({ token }: { token: string; clientId: string }) {
  const router = useRouter();
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      description: '',
      recommended_site: '',
      contact_email: '',
      contact_phone: '',
      contact_whatsapp: '',
      has_existing_domain: true,
      existing_domain: '',
      domain_suggestions: [],
    },
  });

  async function onSubmit(values: IntakeFormValues) {
    setSubmitting(true);
    setSubmitError(null);
    const res = await fetch(`/api/intake/${token}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, logo_path: logoPath }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setSubmitError(b.error || 'Submission failed');
      return;
    }
    router.replace(`/intake/${token}/success`);
  }

  const { register, handleSubmit, formState: { errors } } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <LogoUpload token={token} onChange={setLogoPath} />

        <div className="space-y-1">
          <Label htmlFor="description">About your project / business</Label>
          <Textarea id="description" rows={5} {...register('description')} />
          {errors.description && <p className="text-xs text-destructive">{String(errors.description.message)}</p>}
        </div>

        <fieldset className="space-y-3">
          <legend className="font-medium">How we reach you</legend>
          <div className="space-y-1">
            <Label htmlFor="contact_email">Email</Label>
            <Input id="contact_email" type="email" placeholder="you@company.com" {...register('contact_email')} />
            {errors.contact_email && <p className="text-xs text-destructive">{String(errors.contact_email.message)}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="contact_phone">Phone</Label>
              <Input id="contact_phone" type="tel" placeholder="+30 210 000 0000" {...register('contact_phone')} />
              {errors.contact_phone && <p className="text-xs text-destructive">{String(errors.contact_phone.message)}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact_whatsapp">
                WhatsApp <span className="text-xs font-normal text-muted-foreground">— optional</span>
              </Label>
              <Input id="contact_whatsapp" type="tel" placeholder="Leave blank if same as phone" {...register('contact_whatsapp')} />
              {errors.contact_whatsapp && <p className="text-xs text-destructive">{String(errors.contact_whatsapp.message)}</p>}
            </div>
          </div>
        </fieldset>

        <div className="space-y-1">
          <Label htmlFor="recommended_site">A website you like (for reference) <span className="text-xs font-normal text-muted-foreground">— optional</span></Label>
          <Input id="recommended_site" type="url" placeholder="https://..." {...register('recommended_site')} />
          {errors.recommended_site && <p className="text-xs text-destructive">{String(errors.recommended_site.message)}</p>}
        </div>

        <div className="space-y-1">
          <Label>Images, zips, or any other files</Label>
          <FileDropzone token={token} files={files} onChange={setFiles} />
        </div>

        <DomainSection />

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Submitting…' : 'Submit'}
        </Button>
      </form>
    </FormProvider>
  );
}
