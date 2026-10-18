import React, { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Orbit } from 'lucide-react';
import { SplitText } from './animations/SplitText.jsx';
import './BlackHoleHero.css';

export function BlackHoleHero() {
  const stars = useMemo(() => Array.from({ length: 92 }, (_, index) => ({
    id: index,
    left: (index * 37.17 + 11) % 100,
    top: (index * 61.73 + 7) % 100,
    delay: (index % 19) * -0.37,
    size: index % 13 === 0 ? 3 : index % 4 === 0 ? 2 : 1
  })), []);

  return (
    <section className="vups-home" aria-label="VupsRouter introduction">
      <div className="vups-home__panel">
        <div className="vups-home__stars" aria-hidden="true">
          {stars.map((star) => (
            <span
              key={star.id}
              className={star.id % 7 === 0 ? 'vups-star vups-star--violet' : 'vups-star'}
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`
              }}
            />
          ))}
        </div>

        <header className="vups-home__nav">
          <RouterLink to="/" className="vups-home__brand" aria-label="VupsRouter home">
            <span className="vups-home__brand-mark"><Orbit size={17} strokeWidth={1.8} /></span>
            <span>Vups<span className="vups-home__brand-accent">Router</span></span>
          </RouterLink>
          <nav className="vups-home__links" aria-label="Main navigation">
            <RouterLink className="is-active" to="/">Home</RouterLink>
            <RouterLink to="/about">About</RouterLink>
            <RouterLink to="/models">Free Models</RouterLink>
            <RouterLink to="/compare">Compare</RouterLink>
            <RouterLink to="/providers">Providers</RouterLink>
          </nav>
          <RouterLink to="/signup" className="vups-home__nav-cta">
            Get started <ChevronRight size={15} />
          </RouterLink>
        </header>

        <div className="vups-home__content">
          <div className="vups-home__copy">
            <div className="vups-home__eyebrow"><span /> FREE AI MODEL ROUTER</div>
            <SplitText
              text="Think beyond limits."
              tag="h1"
              className="vups-home__title"
              textAlign="left"
              splitType="words"
              delay={65}
              duration={0.72}
            />
            <p className="vups-home__subtitle">Free AI models. One intelligent place.</p>
            <p className="vups-home__description">
              Discover, compare, and chat with capable AI models from one clean workspace.
              Find the right model for writing, coding, reasoning, and everyday ideas.
            </p>
            <div className="vups-home__actions">
              <RouterLink className="vups-button vups-button--primary" to="/models">
                Explore free models <ArrowUpRight size={17} />
              </RouterLink>
              <RouterLink className="vups-button vups-button--secondary" to="/signup">
                Start for free
              </RouterLink>
            </div>
            <div className="vups-home__proof">
              <span className="vups-home__proof-dot" />
              Explore free model options
              <span className="vups-home__proof-divider" />
              No subscription required to browse
            </div>
          </div>

          <div className="vups-blackhole" aria-label="Animated purple black hole illustration" role="img">
            <div className="vups-blackhole__nebula" />
            <div className="vups-blackhole__dust vups-blackhole__dust--one" />
            <div className="vups-blackhole__dust vups-blackhole__dust--two" />
            <div className="vups-blackhole__halo vups-blackhole__halo--outer" />
            <div className="vups-blackhole__halo vups-blackhole__halo--inner" />
            <div className="vups-blackhole__disk vups-blackhole__disk--back" />
            <div className="vups-blackhole__lensing" />
            <div className="vups-blackhole__horizon" />
            <div className="vups-blackhole__disk vups-blackhole__disk--front" />
            <div className="vups-blackhole__reflection" />
            <div className="vups-blackhole__spark vups-blackhole__spark--one" />
            <div className="vups-blackhole__spark vups-blackhole__spark--two" />
            <div className="vups-blackhole__spark vups-blackhole__spark--three" />
          </div>
        </div>

        <div className="vups-planet vups-planet--top" aria-hidden="true" />
        <div className="vups-planet vups-planet--small" aria-hidden="true" />
        <div className="vups-planet vups-planet--bottom" aria-hidden="true" />
        <div className="vups-home__corner-note">OPEN INTELLIGENCE <span>•</span> BUILT FOR CURIOSITY</div>
      </div>
    </section>
  );
}

export default BlackHoleHero;
