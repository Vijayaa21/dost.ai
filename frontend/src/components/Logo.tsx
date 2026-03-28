import clsx from 'clsx';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className, size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-14 h-14',
    lg: 'w-18 h-18',
  };

  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-2xl p-1',
        sizeMap[size],
        className
      )}
    >
      <img 
        src="/dost-logo.svg" 
        alt="Dost AI - Mental Health Companion" 
        className="w-full h-full object-contain drop-shadow-sm"
      />
    </div>
  );
}
