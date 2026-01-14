'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import FormField from './FormField';
import ProgressIndicator from './ProgressIndicator';
import AmbiguityCard from './AmbiguityCard';
import FormSection from './FormSection';
import SuccessConfetti from './SuccessConfetti';
import TaskSummary, { Task } from './TaskSummary';
import { clarifyPolicy, submitPolicy, ClarificationData, NLPResponse } from '@/lib/api';

interface FormData {
  [key: string]: string;
}

interface Ambiguity {
  id: string;
  fieldName: string;
  originalValue: string;
  suggestedValues: string[];
  context: string;
}

interface FormFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'date' | 'number';
  options?: string[];
  required: boolean;
  placeholder: string;
  section: string;
}

const ReviewInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    basic: true,
    details: false,
    compliance: false,
    review: false,
  });
  const [ambiguities, setAmbiguities] = useState<Ambiguity[]>([]);
  const [nlpData, setNlpData] = useState<NLPResponse | null>(null);
  const [showSuccessConfetti, setShowSuccessConfetti] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showTaskSummary, setShowTaskSummary] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  const formFields: FormFieldConfig[] = [
    {
      id: 'policyTitle',
      label: 'Policy Title',
      type: 'text',
      required: true,
      placeholder: 'Enter policy title',
      section: 'basic',
    },
    {
      id: 'policyNumber',
      label: 'Policy Number',
      type: 'text',
      required: true,
      placeholder: 'e.g., POL-2026-001',
      section: 'basic',
    },
    {
      id: 'department',
      label: 'Department',
      type: 'select',
      options: ['Information Technology', 'Human Resources', 'Finance', 'Operations', 'Legal'],
      required: true,
      placeholder: '',
      section: 'basic',
    },
    {
      id: 'effectiveDate',
      label: 'Effective Date',
      type: 'date',
      required: true,
      placeholder: 'DD-MM-YYYY',
      section: 'details',
    },
    {
      id: 'expirationDate',
      label: 'Expiration Date',
      type: 'date',
      required: false,
      placeholder: 'DD-MM-YYYY',
      section: 'details',
    },
    {
      id: 'policyOwner',
      label: 'Policy Owner',
      type: 'text',
      required: true,
      placeholder: 'Enter policy owner name',
      section: 'details',
    },
    {
      id: 'description',
      label: 'Policy Description',
      type: 'textarea',
      required: true,
      placeholder: 'Provide a detailed description of the policy',
      section: 'details',
    },
    {
      id: 'complianceLevel',
      label: 'Compliance Level',
      type: 'select',
      options: ['Mandatory', 'Recommended', 'Optional'],
      required: true,
      placeholder: '',
      section: 'compliance',
    },
    {
      id: 'regulatoryFramework',
      label: 'Regulatory Framework',
      type: 'select',
      options: ['GDPR', 'HIPAA', 'SOX', 'ISO 27001', 'NIST', 'Other'],
      required: false,
      placeholder: '',
      section: 'compliance',
    },
    {
      id: 'reviewFrequency',
      label: 'Review Frequency (months)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 12',
      section: 'review',
    },
    {
      id: 'approver',
      label: 'Approver',
      type: 'text',
      required: true,
      placeholder: 'Enter approver name',
      section: 'review',
    },
  ];

  useEffect(() => {
    setIsHydrated(true);

    // Load NLP Results
    const storedResults = localStorage.getItem('nlpResults');
    if (storedResults) {
      try {
        const data: NLPResponse = JSON.parse(storedResults);
        setNlpData(data);

        // Map NLP rules to ambiguities
        const extractedAmbiguities: Ambiguity[] = data.rules
          .filter(r => r.ambiguity_flag)
          .map(r => ({
            id: r.rule_id,
            fieldName: 'Responsible Role',
            originalValue: r.responsible_role || 'Unassigned',
            suggestedValues: ['Clerk', 'Officer', 'Admin'],
            context: `Rule: ${r.action}. Reason: ${r.ambiguity_reason || 'Unclear responsibility'}`
          }));
        setAmbiguities(extractedAmbiguities);

        // Pre-fill form data with non-ambiguous rules or policy info
        setFormData(prev => ({
          ...prev,
          policyTitle: data.policy_title || '',
          policyNumber: data.policy_id || ''
        }));
      } catch (e) {
        console.error('Error parsing NLP results:', e);
      }
    }

    const initialData: FormData = {};
    formFields.forEach((field) => {
      initialData[field.id] = '';
    });
    setFormData(prev => ({ ...initialData, ...prev }));
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-64 bg-card rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const handleFieldChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleResolveAmbiguity = async (
    id: string,
    clarification: {
      responsible_role: string;
      deadline?: string;
      conditions?: string[];
    }
  ) => {
    try {
      if (nlpData) {
        const clarificationData: ClarificationData = {
          policy_id: nlpData.policy_id,
          rule_id: id,
          clarified_responsible_role: clarification.responsible_role,
          clarified_deadline: clarification.deadline || '',
          clarified_conditions: clarification.conditions || []
        };

        console.log('📤 Submitting clarification to NLP backend...');
        await clarifyPolicy(clarificationData);
        console.log('✅ Clarification submitted successfully');
      }

      // Remove the ambiguity from the list
      setAmbiguities((prev) => prev.filter((amb) => amb.id !== id));
      setShowSuccessConfetti(true);
      setTimeout(() => setShowSuccessConfetti(false), 2000);
    } catch (error) {
      console.error('❌ Error submitting clarification:', error);
      alert('Failed to submit clarification. Please try again.');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getCompletedFields = () => {
    return formFields.filter((field) => formData[field.id]?.trim() !== '').length;
  };

  const handleSaveDraft = () => {
    setIsDraftSaved(true);
    setTimeout(() => setIsDraftSaved(false), 3000);
  };

  const handleSubmit = async () => {
    const requiredFields = formFields.filter((field) => field.required);
    const allRequiredFilled = requiredFields.every((field) => formData[field.id]?.trim() !== '');

    if (!allRequiredFilled) {
      alert('Please fill in all required fields before submitting.');
      return;
    }

    if (ambiguities.length > 0) {
      alert('Please resolve all ambiguities before submitting.');
      return;
    }

    try {
      // Submit policy to sync with execution backend
      if (nlpData) {
        console.log('📤 Submitting policy to execution backend...');
        await submitPolicy(nlpData.policy_id);
        console.log('✅ Policy successfully synced to execution backend!');
      }
    } catch (error) {
      console.error('❌ Error submitting policy:', error);
      alert('Failed to submit policy to execution backend. Please try again.');
      return;
    }

    setShowSuccessConfetti(true);

    // Simulate task creation from backend
    const mockTasks: Task[] = [
      { id: 'T001', policyId: formData.policyNumber || 'P-2026-X', ruleId: 'R-001', assignedRole: 'Clerk', status: 'CREATED' },
      { id: 'T002', policyId: formData.policyNumber || 'P-2026-X', ruleId: 'R-005', assignedRole: 'Officer', status: 'CREATED' },
      { id: 'T003', policyId: formData.policyNumber || 'P-2026-X', ruleId: 'R-012', assignedRole: 'Manager', status: 'CREATED' },
    ];
    setTasks(mockTasks);

    setTimeout(() => {
      setShowSuccessConfetti(false);
      setShowTaskSummary(true);
    }, 2000);
  };

  const sections = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Core policy identification details',
      icon: 'DocumentTextIcon',
    },
    {
      id: 'details',
      title: 'Policy Details',
      description: 'Comprehensive policy information',
      icon: 'InformationCircleIcon',
    },
    {
      id: 'compliance',
      title: 'Compliance Requirements',
      description: 'Regulatory and compliance specifications',
      icon: 'ShieldCheckIcon',
    },
    {
      id: 'review',
      title: 'Review & Approval',
      description: 'Review cycle and approval workflow',
      icon: 'CheckBadgeIcon',
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <SuccessConfetti show={showSuccessConfetti} />
      {showTaskSummary && (
        <TaskSummary
          tasks={tasks}
          onProceed={() => router.push('/results')}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/20 rounded-full mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-jetbrains text-primary">Interactive Review Arena</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold text-foreground mb-4 text-glow-cyan">
            Policy Form Review
          </h1>
          <p className="text-lg md:text-xl font-inter text-muted-foreground max-w-3xl mx-auto">
            Review and complete the extracted policy information. Resolve ambiguities through our intuitive 3D interface.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {ambiguities.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Icon name="ExclamationTriangleIcon" size={24} variant="solid" className="text-warning" />
                  <h2 className="text-2xl font-orbitron font-bold text-foreground">
                    Ambiguities Detected ({ambiguities.length})
                  </h2>
                </div>
                {ambiguities.map((ambiguity) => (
                  <AmbiguityCard
                    key={ambiguity.id}
                    {...ambiguity}
                    onResolve={handleResolveAmbiguity}
                  />
                ))}
              </div>
            )}

            <div className="space-y-4">
              {sections.map((section) => (
                <FormSection
                  key={section.id}
                  title={section.title}
                  description={section.description}
                  icon={section.icon}
                  isExpanded={expandedSections[section.id]}
                  onToggle={() => toggleSection(section.id)}
                >
                  {formFields
                    .filter((field) => field.section === section.id)
                    .map((field) => (
                      <FormField
                        key={field.id}
                        {...field}
                        value={formData[field.id] || ''}
                        onChange={handleFieldChange}
                      />
                    ))}
                </FormSection>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={4}
              completedFields={getCompletedFields()}
              totalFields={formFields.length}
            />

            <div className="bg-card rounded-lg p-6 elevation-subtle">
              <h3 className="text-lg font-orbitron font-bold text-foreground mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="w-full px-6 py-3 bg-muted text-foreground rounded-lg font-rajdhani font-bold text-sm hover:bg-muted/80 transition-all duration-200 spring-animation flex items-center justify-center space-x-2"
                >
                  <Icon name="DocumentArrowDownIcon" size={20} />
                  <span>{isDraftSaved ? 'Draft Saved!' : 'Save Draft'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full px-6 py-3 bg-success text-success-foreground rounded-lg font-rajdhani font-bold text-sm hover:scale-105 transition-transform duration-200 spring-animation box-glow-cyan flex items-center justify-center space-x-2"
                >
                  <Icon name="CheckCircleIcon" size={20} variant="solid" />
                  <span>Submit Review</span>
                </button>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 elevation-subtle">
              <div className="flex items-center space-x-3 mb-4">
                <Icon name="LightBulbIcon" size={24} className="text-accent" />
                <h3 className="text-lg font-orbitron font-bold text-foreground">
                  Pro Tips
                </h3>
              </div>
              <ul className="space-y-3 text-sm font-inter text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <Icon name="CheckIcon" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span>Resolve all ambiguities before submitting</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icon name="CheckIcon" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span>Use keyboard navigation for faster form completion</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icon name="CheckIcon" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span>Save drafts frequently to preserve your work</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icon name="CheckIcon" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span>Hover over fields for contextual help</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewInteractive;