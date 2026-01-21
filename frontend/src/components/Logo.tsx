import clsx from 'clsx';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className, size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={clsx('flex items-center justify-center', sizeMap[size], className)}>
      <img 
        src="/dost-logo.svg" 
        alt="Dost AI - Mental Health Companion" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}
