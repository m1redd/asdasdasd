import { z } from 'zod';

export const emailSchema = z.string().email('Невірний формат email');
export const passwordSchema = z.string().min(6, 'Пароль має містити мінімум 6 символів');
export const nameSchema = z.string().min(2, 'Ім\'я має містити мінімум 2 символи');
export const phoneSchema = z.string().regex(/^\+?[0-9]{10,15}$/, 'Невірний формат телефону');
export const passportSchema = z.string().min(5, 'Паспорт має містити мінімум 5 символів');
export const urlSchema = z.string().url('Невірний формат URL').optional().or(z.literal(''));