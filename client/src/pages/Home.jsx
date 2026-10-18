import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, BrainCircuit, Code2, Eye, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { BlackHoleHero } from '../components/BlackHoleHero.jsx';
import { useAuth } from '../context/AuthContext.js';
import { modelsApi } from '../services/api.js';
import './HomeSections.css';

const capabilities = [
  { icon: BrainCircuit, title: 'Reasoning & research', text: 'Explore models suited to analysis, problem solving, and thoughtful answers.' },
  { icon: Code2, title: 'Coding assistance', text: 'Find models for code generation, debugging, refactoring, and learning.' },
  { icon: Eye, title: 'Creative workflows', text: 'Compare model options for writing, ideas, and supported multimodal tasks.' },
  { icon: ShieldCheck, title: 'One clear workspace', text: 'Keep model discovery and chat entry points together in one simple interface.' }
];

const steps = [
  { number: '01', title: 'Explore', text: 'Browse the available free model options and review their capabilities.' },
  { number: '02', title: 'Choose', text: 'Select a model that fits the task you want to complete.' },
  { number: '03', title: 'Start creating', text: 'Open the chat workspace and start working with your selected model.' }
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.75, 0.25, 1] } }
};

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(true);

  useEffect(() => {
    let active = true;
    modelsApi.getModels({ freeOnly: 'true' })
      .then((response) => {
        if (active && response?.success) setModels((response.data?.models || []).slice(0, 4));
      })
      .catch((error) => console.error('Could not load featured free models:', error))
      .finally(() => { if (active) setLoadingModels(false); });
    return () => { active = false; };
  }, []);

  const startChat = () => navigate(isAuthenticated ? '/chat' : '/models');
  const MotionSection = motion.section;

  return (
    <div className="vups-home-page">
      <BlackHoleHero />

      <MotionSection
        className="vups-section vups-model-section"
        variants={reveal}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <div className="vups-section__heading">
          <span className="vups-section__eyebrow"><Sparkles size={14} /> MODEL DISCOVERY</span>
          <h2>Good models. Clear choices.</h2>
          <p>Explore free model options and choose a starting point for your next idea.</p>
        </div>
        {loadingModels ? (
          <div className="vups-model-grid">
            {[0, 1, 2, 3].map((item) => <div className="vups-model-card vups-model-card--loading" key={item} />)}
          </div>
        ) : models.length ? (
          <div className="vups-model-grid">
            {models.map((model, index) => (
              <motion.button
                type="button"
                className="vups-model-card"
                key={model.id || model.name || index}
                onClick={() => navigate(`/chat?model=${encodeURIComponent(model.id)}`)}
                whileHover={reduceMotion ? undefined : { y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <span className="vups-model-card__top"><span className="vups-model-card__icon"><BrainCircuit size={19} /></span><span className="vups-model-card__tag">FREE OPTION</span></span>
                <strong>{model.name || 'AI model'}</strong>
                <span className="vups-model-card__provider">{model.provider || model.providerId || 'Available provider'}</span>
                <span className="vups-model-card__description">{model.description || 'Open the model explorer to review details and capabilities.'}</span>
                <span className="vups-model-card__link">Open model <ArrowUpRight size={15} /></span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="vups-empty-models">
            <span className="vups-model-card__icon"><BrainCircuit size={19} /></span>
            <p>Connect a model provider to show live models here. You can still browse the model explorer.</p>
            <RouterLink to="/models">Open model explorer <ArrowRight size={15} /></RouterLink>
          </div>
        )}
        <div className="vups-section__action"><RouterLink to="/models">Explore all models <ArrowRight size={16} /></RouterLink></div>
      </MotionSection>

      <MotionSection
        className="vups-section vups-capabilities-section"
        variants={reveal}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <div className="vups-section__heading">
          <span className="vups-section__eyebrow"><Zap size={14} /> MADE FOR YOUR WORKFLOW</span>
          <h2>One place for your AI work.</h2>
          <p>VupsRouter helps you find an appropriate model without making the experience feel complicated.</p>
        </div>
        <div className="vups-feature-grid">
          {capabilities.map(({ icon: Icon, title, text }, index) => (
            <motion.article className="vups-feature-card" key={title} whileHover={reduceMotion ? undefined : { y: -4 }} transition={{ duration: 0.2 }}>
              <span className="vups-feature-card__icon"><Icon size={21} /></span>
              <span className="vups-feature-card__number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
        </div>
      </MotionSection>

      <MotionSection
        className="vups-section vups-steps-section"
        variants={reveal}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <div className="vups-section__heading">
          <span className="vups-section__eyebrow">A SIMPLE WAY TO BEGIN</span>
          <h2>From idea to AI in three steps.</h2>
        </div>
        <div className="vups-steps-grid">
          {steps.map((step) => (
            <article className="vups-step" key={step.number}>
              <span className="vups-step__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </MotionSection>

      <section className="vups-bottom-cta">
        <div className="vups-bottom-cta__glow" />
        <span className="vups-section__eyebrow"><Sparkles size={14} /> YOUR NEXT IDEA STARTS HERE</span>
        <h2>Make room for better ideas.</h2>
        <p>Explore available free AI models and find one that fits what you want to do.</p>
        <div className="vups-home__actions">
          <button className="vups-button vups-button--primary" onClick={startChat}>Get started <ArrowRight size={16} /></button>
          <RouterLink className="vups-button vups-button--secondary" to="/about">About VupsRouter</RouterLink>
        </div>
      </section>

      <footer className="vups-home-footer">
        <RouterLink to="/" className="vups-home__brand"><span className="vups-home__brand-mark"><Sparkles size={15} /></span><span>Vups<span className="vups-home__brand-accent">Router</span></span></RouterLink>
        <span>Explore free AI model options in one place.</span>
        <div><RouterLink to="/about">About</RouterLink><RouterLink to="/models">Models</RouterLink><RouterLink to="/providers">Providers</RouterLink><RouterLink to="/signin">Sign in</RouterLink></div>
      </footer>
    </div>
  );
};

export default Home;
