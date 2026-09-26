import './Section.css';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: keyof JSX.IntrinsicElements;
  ariaLabel?: string;
}

export default function Section({ children, className = '', id, as: Component = 'section', ariaLabel }: SectionProps) {
  return (
    <Component id={id} className={`section ${className}`} aria-label={ariaLabel}>
      <div className="section__inner">
        {children}
      </div>
    </Component>
  );
}
