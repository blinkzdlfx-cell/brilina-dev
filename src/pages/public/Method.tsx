import Section from '../../components/public/Section';
import AnimatedSection from '../../components/public/AnimatedSection';
import './Method.css';

const STAGES = [
  { name: 'EXPLORE', description: 'Understand the problem space, users, and constraints.' },
  { name: 'ANALYZE', description: 'Break down requirements and identify critical paths.' },
  { name: 'CLARIFY', description: 'Resolve ambiguities and align on definitions of done.' },
  { name: 'DECIDE', description: 'Select the right architecture, tools, and trade-offs.' },
  { name: 'SPECIFY', description: 'Write precise specifications the implementation follows.' },
  { name: 'REVIEW', description: 'Validate specs against requirements and edge cases.' },
  { name: 'PLAN', description: 'Sequence tasks, assign ownership, and set milestones.' },
  { name: 'IMPLEMENT', description: 'Build in small, reviewable increments with tests.' },
  { name: 'VERIFY', description: 'Run quality checks, performance audits, and acceptance tests.' },
  { name: 'UPDATE', description: 'Ship, monitor, and iterate based on real feedback.' }
];

export default function Method() {
  return (
    <div className="method-page">
      <Section ariaLabel="Method">
        <AnimatedSection>
          <div className="method-page__header">
            <h1 className="method-page__title">Method</h1>
            <p className="method-page__subtitle">
              A structured process from concept to production. Specification-driven.
              Human-directed. AI-augmented.
            </p>
          </div>
        </AnimatedSection>

        <div className="method-page__stages">
          {STAGES.map((stage, index) => (
            <AnimatedSection key={stage.name} delay={index * 0.06}>
              <div className="method-stage">
                <div className="method-stage__number">{String(index + 1).padStart(2, '0')}</div>
                <div className="method-stage__content">
                  <h3 className="method-stage__name">{stage.name}</h3>
                  <p className="method-stage__description">{stage.description}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.5}>
          <div className="method-page__outro">
            <p>
              Every project follows this sequence. The depth of each stage varies by
              complexity, but the discipline of specification-first development
              remains constant.
            </p>
          </div>
        </AnimatedSection>
      </Section>
    </div>
  );
}
