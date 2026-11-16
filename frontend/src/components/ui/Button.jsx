import plusIcon from '../../assets/icons/addition.png';
import Spinner from './Spinner.jsx';

const variants = {
  primary:
    'bg-accent text-white hover:bg-accent-dark focus-visible:outline-accent disabled:bg-accent/60',
  secondary:
    'border border-border bg-surface text-navy hover:border-navy/30 hover:bg-black/[0.015] focus-visible:outline-navy',
  ghost: 'text-navy/70 hover:bg-black/[0.035] hover:text-navy focus-visible:outline-navy',
  danger:
    'bg-[#A94A30] text-white hover:bg-[#943F28] focus-visible:outline-[#A94A30] disabled:bg-[#A94A30]/60',
};

const sizes = {
  sm: 'h-8 px-3 text-[12px]',
  md: 'h-[38px] px-5 text-[12.5px]',
  lg: 'h-12 w-full px-6 text-[15px]',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  plus = false,
  loading = false,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[4px] font-medium transition-transform ease-out duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant]} ${sizes[size]} ${className} active:scale-95`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner
          size="sm"
          tone={variant === 'primary' || variant === 'danger' ? 'light' : 'accent'}
        />
      ) : (
        plus && <img src={plusIcon} alt="" className="h-3.5 w-3.5" />
      )}
      {children}
    </button>
  );
}
