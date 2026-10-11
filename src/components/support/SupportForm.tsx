'use client';

import React, { useState, useEffect } from 'react';
import { sendSupportMessage } from '@/services/supportService';
import styles from './SupportForm.module.css';

const DRAFT_STORAGE_KEY = 'acuspeak_support_draft';
const COOLDOWN_STORAGE_KEY = 'acuspeak_support_last_submit';
const COOLDOWN_SECONDS = 10;

interface SupportFormProps {
  onClose?: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
  website: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

type StatusState =
  | { type: 'idle' }
  | { type: 'submitting' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_PATTERN = /^[+\s\d\-()]{7,20}$/;

export default function SupportForm({ onClose }: SupportFormProps) {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    message: '',
    website: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<StatusState>({ type: 'idle' });

  // Load unsent draft from sessionStorage on mount (wrapped in try/catch)
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setFormData((prev) => ({
          ...prev,
          name: typeof parsed.name === 'string' ? parsed.name : '',
          email: typeof parsed.email === 'string' ? parsed.email : '',
          phone: typeof parsed.phone === 'string' ? parsed.phone : '',
          message: typeof parsed.message === 'string' ? parsed.message : '',
        }));
      }
    } catch (err) {
      // sessionStorage blocked or unavailable (private browsing)
      console.warn('Unable to load draft from sessionStorage:', err);
    }
  }, []);

  // Save unsent draft to sessionStorage on field updates (wrapped in try/catch)
  const saveDraft = (updated: FormState) => {
    try {
      sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          message: updated.message,
        })
      );
    } catch (err) {
      console.warn('Unable to save draft to sessionStorage:', err);
    }
  };

  const validateField = (field: keyof FormState, value: string): string | undefined => {
    const trimmed = value.trim();

    if (field === 'name') {
      if (!trimmed) return 'Name is required.';
      if (trimmed.length < 2) return 'Name must be at least 2 characters.';
      if (trimmed.length > 80) return 'Name cannot exceed 80 characters.';
    }

    if (field === 'email') {
      if (!trimmed) return 'Email address is required.';
      if (trimmed.length > 254) return 'Email address is too long.';
      if (!EMAIL_PATTERN.test(trimmed)) return 'Please enter a valid email address.';
    }

    if (field === 'phone') {
      if (trimmed) {
        const digits = trimmed.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) {
          return 'Phone number must contain between 7 and 15 digits.';
        }
        if (!PHONE_PATTERN.test(trimmed)) {
          return 'Please enter a valid phone number.';
        }
      }
    }

    if (field === 'message') {
      if (!trimmed) return 'Message is required.';
      if (trimmed.length < 10) return 'Message must be at least 10 characters.';
      if (trimmed.length > 2000) return 'Message cannot exceed 2000 characters.';
    }

    return undefined;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (name !== 'website') {
      saveDraft(updated);
    }

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormState;
    if (fieldName === 'website') return;

    const error = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status.type === 'submitting') return;

    // Check optional client cooldown
    try {
      const lastSubmit = sessionStorage.getItem(COOLDOWN_STORAGE_KEY);
      if (lastSubmit) {
        const elapsed = (Date.now() - parseInt(lastSubmit, 10)) / 1000;
        if (elapsed < COOLDOWN_SECONDS) {
          setStatus({
            type: 'error',
            message: `Please wait ${Math.ceil(COOLDOWN_SECONDS - elapsed)} seconds before submitting again.`,
          });
          return;
        }
      }
    } catch {
      // Ignore sessionStorage error
    }

    // Validate all required fields
    const nameErr = validateField('name', formData.name);
    const emailErr = validateField('email', formData.email);
    const phoneErr = validateField('phone', formData.phone);
    const messageErr = validateField('message', formData.message);

    const newErrors: FormErrors = {
      name: nameErr,
      email: emailErr,
      phone: phoneErr,
      message: messageErr,
    };

    if (nameErr || emailErr || phoneErr || messageErr) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStatus({ type: 'submitting' });

    // Save submit timestamp for cooldown
    try {
      sessionStorage.setItem(COOLDOWN_STORAGE_KEY, Date.now().toString());
    } catch {
      // Ignore
    }

    const response = await sendSupportMessage({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      message: formData.message.trim(),
      website: formData.website.trim() || undefined,
    });

    if (response.success) {
      // Clear draft on confirmed success
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignore
      }

      setStatus({
        type: 'success',
        message: response.message || 'Your message has been sent successfully.',
      });

      // Clear form data
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        website: '',
      });
    } else {
      // Keep typed values on failure so user can retry
      setStatus({
        type: 'error',
        message: response.message || 'Failed to send message. Please try again later.',
      });
    }
  };

  const isSubmitting = status.type === 'submitting';

  // Render Success confirmation inside modal
  if (status.type === 'success') {
    return (
      <div className={styles.successWrapper} role="status" aria-live="polite">
        <div className={styles.successIconBox} aria-hidden="true">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className={styles.successTitle}>Message Sent!</h3>
        <p className={styles.successMessage}>{status.message}</p>
        <p className={styles.successSubtext}>
          We&apos;ve received your message and will respond to your email address shortly.
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={styles.successCloseBtn}
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <p className={styles.subtitle}>
        Have a question, feedback, or need help with Acuspeak? Send us a message and we&apos;ll get back to you promptly.
      </p>

      {status.type === 'error' && (
        <div className={styles.statusError} role="status" aria-live="polite">
          <span className={styles.statusIcon} aria-hidden="true">⚠️</span>
          <div>
            <strong>Unable to send message</strong>
            <p className={styles.statusErrorText}>{status.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Hidden Honeypot Field */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="support-website">Website</label>
          <input
            type="text"
            id="support-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        {/* Name Field */}
        <div className={styles.fieldGroup}>
          <label htmlFor="support-name" className={styles.label}>
            Name <span className={styles.requiredAsterisk}>*</span>
          </label>
          <input
            type="text"
            id="support-name"
            name="name"
            required
            minLength={2}
            maxLength={80}
            placeholder="e.g. Priya Sharma"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'support-name-error' : undefined}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          />
          {errors.name && (
            <span id="support-name-error" className={styles.errorHelperText} role="alert">
              {errors.name}
            </span>
          )}
        </div>

        {/* Email Field */}
        <div className={styles.fieldGroup}>
          <label htmlFor="support-email" className={styles.label}>
            Email <span className={styles.requiredAsterisk}>*</span>
          </label>
          <input
            type="email"
            id="support-email"
            name="email"
            required
            maxLength={254}
            placeholder="e.g. priya@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'support-email-error' : undefined}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          />
          {errors.email && (
            <span id="support-email-error" className={styles.errorHelperText} role="alert">
              {errors.email}
            </span>
          )}
        </div>

        {/* Phone Field (Optional) */}
        <div className={styles.fieldGroup}>
          <label htmlFor="support-phone" className={styles.label}>
            Phone number <span className={styles.optionalBadge}>(Optional)</span>
          </label>
          <input
            type="tel"
            id="support-phone"
            name="phone"
            maxLength={20}
            placeholder="e.g. +91 98765 43210"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'support-phone-error' : undefined}
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
          />
          {errors.phone && (
            <span id="support-phone-error" className={styles.errorHelperText} role="alert">
              {errors.phone}
            </span>
          )}
        </div>

        {/* Message Field */}
        <div className={styles.fieldGroup}>
          <label htmlFor="support-message" className={styles.label}>
            Message <span className={styles.requiredAsterisk}>*</span>
          </label>
          <textarea
            id="support-message"
            name="message"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            placeholder="Write your message here (10 to 2000 characters)..."
            value={formData.message}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!errors.message}
            aria-describedby={
              errors.message ? 'support-message-error' : 'support-message-counter'
            }
            className={`${styles.input} ${styles.textarea} ${
              errors.message ? styles.inputError : ''
            }`}
          />
          <div className={styles.messageFooter}>
            {errors.message ? (
              <span id="support-message-error" className={styles.errorHelperText} role="alert">
                {errors.message}
              </span>
            ) : (
              <span />
            )}
            <span id="support-message-counter" className={styles.counter}>
              {formData.message.length} / 2000
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnDisabled : ''}`}
        >
          {isSubmitting ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              <span>Sending...</span>
            </>
          ) : (
            <span>Send message</span>
          )}
        </button>
      </form>
    </div>
  );
}
