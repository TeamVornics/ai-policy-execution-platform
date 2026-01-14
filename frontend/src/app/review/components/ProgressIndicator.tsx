interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedFields: number;
  totalFields: number;
}

const ProgressIndicator = ({
  currentStep,
  totalSteps,
  completedFields,
  totalFields,
}: ProgressIndicatorProps) => {
  const progressPercentage = (completedFields / totalFields) * 100;

  return (
    <div className="bg-card rounded-lg p-6 elevation-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-orbitron font-bold text-foreground">
          Form Progress
        </h3>
        <span className="text-sm font-jetbrains text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 box-glow-cyan"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="font-inter text-foreground">
          {completedFields} of {totalFields} fields completed
        </span>
        <span className="font-jetbrains font-bold text-primary">
          {Math.round(progressPercentage)}%
        </span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index < currentStep
                ? 'bg-success box-glow-cyan'
                : index === currentStep
                ? 'bg-primary animate-pulse' :'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;