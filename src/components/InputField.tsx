import { FieldError } from "react-hook-form";
import { cn } from "@/lib/cn";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  hidden,
  inputProps,
  className,
}: InputFieldProps) => {
  return (
    <div className={cn(hidden && "hidden", "form-field", className)}>
      <label className="input-label">{label}</label>
      <input
        type={type}
        {...register(name)}
        className="form-input"
        {...inputProps}
        defaultValue={defaultValue}
      />
      {error?.message && (
        <p className="text-xs font-medium text-red-500">
          {error.message.toString()}
        </p>
      )}
    </div>
  );
};

export default InputField;
