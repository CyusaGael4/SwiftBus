import logo from '../../assets/icons/bus logo.png';

// The supplied mark is a single-colour PNG. Rendering it through a CSS mask
// means one asset serves both the cream version on navy and the navy version
// on light backgrounds, instead of shipping a second recoloured file.
const maskStyle = {
  WebkitMaskImage: `url(${logo})`,
  maskImage: `url(${logo})`,
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
};

export default function Brand({
  large = false,
  onLight = false,
  subtitle = 'SMART BUS TICKETING',
  className = '',
}) {
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      <span
        aria-hidden="true"
        className={`block shrink-0 ${large ? 'h-[74px] w-[74px]' : 'h-11 w-11'}`}
        style={{ ...maskStyle, backgroundColor: onLight ? '#282B4A' : '#F3F1E7' }}
      />
      <div>
        <p
          className={`font-bold uppercase leading-none tracking-[0.02em] ${
            onLight ? 'text-navy' : 'text-cream'
          } ${large ? 'text-[30px]' : 'text-[19px]'}`}
        >
          SwiftBus
        </p>
        <p
          className={`font-medium uppercase leading-none tracking-[0.17em] text-accent ${
            large ? 'mt-2 text-[10px]' : 'mt-1.5 text-[8px]'
          }`}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
