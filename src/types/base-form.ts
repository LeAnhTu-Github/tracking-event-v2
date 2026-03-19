import { FileUploaderProps } from '@/components/file-uploader';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

export interface BaseFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}
export interface FormOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FileUploadConfig extends FileUploaderProps {
  acceptedTypes?: string[];
}
export interface DatePickerConfig {
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  placeholder?: string;
}

export interface SliderConfig {
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
}

export interface CheckboxGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TextareaConfig {
  maxLength?: number;
  showCharCount?: boolean;
  rows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  maxHeight?: string;
}
