import logo from '../../assets/icons/bus logo.png';

export default function Brand({ large = false, onLight = false, className = '' }) {
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      <img
        src={logo}
        alt=""
        className={large ? 'h-[74px] w-[74px] object-contain' : 'h-11 w-11 object-contain'}
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
          Intercity travel
        </p>
      </div>
    </div>
  );
}
