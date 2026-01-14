import Icon from '@/components/ui/AppIcon';

interface FormSectionProps {
  title: string;
  description: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FormSection = ({
  title,
  description,
  icon,
  isExpanded,
  onToggle,
  children,
}: FormSectionProps) => {
  return (
    <div className="bg-card rounded-lg overflow-hidden elevation-subtle transition-all duration-300 hover:elevation-medium">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-muted transition-colors duration-200"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <Icon name={icon as any} size={24} className="text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-orbitron font-bold text-foreground mb-1">
              {title}
            </h3>
            <p className="text-sm font-inter text-muted-foreground">{description}</p>
          </div>
        </div>
        <Icon
          name="ChevronDownIcon"
          size={24}
          className={`text-foreground transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`
          overflow-hidden transition-all duration-300
          ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-6 pt-0 border-t border-border">{children}</div>
      </div>
    </div>
  );
};

export default FormSection;