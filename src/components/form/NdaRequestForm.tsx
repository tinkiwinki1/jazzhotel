import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface Labels {
  name: string;
  email: string;
  phone: string;
  consent: string;
  submit: string;
  submitting: string;
  success: { title: string; body: string };
  error: string;
  errors: {
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    phoneRequired: string;
    consentRequired: string;
  };
  altLabel: string;
  whatsapp: string;
  telegram: string;
}

interface Props {
  labels: Labels;
  locale: 'ru' | 'en';
  whatsappUrl: string;
  telegramUrl: string;
}

type FormValues = {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
  companyWebsite: string;
};

export default function NdaRequestForm({ labels, locale, whatsappUrl, telegramUrl }: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: { name: '', email: '', phone: '', consent: false, companyWebsite: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setStatus('submitting');

    if (values.companyWebsite) {
      setStatus('success');
      reset();
      return;
    }

    try {
      let utm: Record<string, string> = {};
      if (typeof window !== 'undefined') {
        try {
          utm = JSON.parse(localStorage.getItem('utm') || '{}');
        } catch {}
      }
      const res = await fetch('/api/nda-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, utm, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('success');
        reset();
        if (typeof window !== 'undefined' && (window as any).plausible) {
          (window as any).plausible('nda_form_submit_success');
        }
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white border border-[#3A4A60]/60 rounded-3xl p-7 md:p-8">
        <div className="serif text-2xl md:text-3xl text-[#16243E] mb-3">{labels.success.title}</div>
        <p className="text-sm md:text-[15px] text-[#525252] leading-relaxed">{labels.success.body}</p>
        <div className="mt-6 pt-6 border-t border-[#3A4A60]/30">
          <ContactButtons whatsappUrl={whatsappUrl} telegramUrl={telegramUrl} labels={labels} />
        </div>
      </div>
    );
  }

  const inp =
    'w-full bg-white border border-[#3A4A60] px-4 py-3 text-[15px] text-[#222] placeholder-[#525252] focus:border-[#E6A25B] focus:outline-none transition-colors';
  const lbl = 'block text-[11px] font-medium uppercase tracking-[2px] text-[#222] mb-1.5';
  const err = 'text-xs text-[#B5443A] mt-1.5 block';

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="bg-white border border-[#3A4A60]/60 rounded-3xl p-6 md:p-8 flex flex-col gap-4"
      >
        <div className="hidden" aria-hidden="true">
          <label>
            Company website
            <input type="text" tabIndex={-1} autoComplete="off" {...register('companyWebsite')} />
          </label>
        </div>

        {status === 'error' && (
          <div className="bg-[#B5443A]/10 border border-[#B5443A]/40 px-4 py-3 text-sm text-[#222] rounded-lg">
            {labels.error}
          </div>
        )}

        <div>
          <label className={lbl} htmlFor="name">{labels.name}</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={inp}
            aria-invalid={!!errors.name}
            {...register('name', { required: true, minLength: 2 })}
          />
          {errors.name && <span className={err}>{labels.errors.nameRequired}</span>}
        </div>

        <div>
          <label className={lbl} htmlFor="email">{labels.email}</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inp}
            aria-invalid={!!errors.email}
            {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
          />
          {errors.email && (
            <span className={err}>
              {errors.email.type === 'pattern' ? labels.errors.emailInvalid : labels.errors.emailRequired}
            </span>
          )}
        </div>

        <div>
          <label className={lbl} htmlFor="phone">{labels.phone}</label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+995 ..."
            className={inp}
            aria-invalid={!!errors.phone}
            {...register('phone', { required: true, minLength: 5 })}
          />
          {errors.phone && <span className={err}>{labels.errors.phoneRequired}</span>}
        </div>

        <label className="flex items-start gap-3 text-[13px] md:text-sm text-[#525252] cursor-pointer leading-5">
          <input
            type="checkbox"
            className="mt-0.5 w-[13px] h-[13px] accent-[#E6A25B] border border-[#767676] rounded-[2.5px]"
            {...register('consent', { required: true })}
          />
          <span>{labels.consent}</span>
        </label>
        {errors.consent && <span className={err}>{labels.errors.consentRequired}</span>}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="mt-2 bg-[#E6A25B] hover:bg-[#B89651] border border-[#B89651] rounded-3xl px-6 py-3.5 text-sm font-bold uppercase tracking-[0.05em] text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? labels.submitting : labels.submit}
        </button>
      </form>

      <div className="flex items-center gap-4 my-1">
        <div className="flex-1 h-px bg-[#525252]"></div>
        <span className="text-[10px] tracking-[2px] uppercase text-white/70">{labels.altLabel}</span>
        <div className="flex-1 h-px bg-[#525252]"></div>
      </div>

      <ContactButtons whatsappUrl={whatsappUrl} telegramUrl={telegramUrl} labels={labels} />
    </div>
  );
}

function ContactButtons({
  whatsappUrl,
  telegramUrl,
  labels,
}: {
  whatsappUrl: string;
  telegramUrl: string;
  labels: Labels;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 px-4 py-3 border border-[#3A4A60] hover:border-[#E6A25B] rounded-3xl text-[15px] md:text-base text-white transition-colors group"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-[#25D366]">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.514 5.26l.36.572-1.001 3.658 3.756-.99zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.711.306 1.265.489 1.697.626.713.226 1.362.194 1.876.118.572-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
        </svg>
        <span>{labels.whatsapp}</span>
      </a>
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 px-4 py-3 border border-[#3A4A60] hover:border-[#E6A25B] rounded-3xl text-[15px] md:text-base text-white transition-colors group"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-[#229ED9]">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
        <span>{labels.telegram}</span>
      </a>
    </div>
  );
}
