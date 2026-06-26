import React, { useState, useEffect, useRef } from 'react';

// --- Helper Components ---

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const createParticles = () => {
      particles = [];
      const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? '#06b6d4' : '#d946ef',
          opacity: Math.random() * 0.5 + 0.3
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            const opacity = (1 - distance / 150) * particles[i].opacity * particles[j].opacity;
            ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(particle => {
        const dx = particle.x - mousePos.x;
        const dy = particle.y - mousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          particle.vx += dx / distance * 0.05;
          particle.vy += dy / distance * 0.05;
        }
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(drawParticles);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });
    window.addEventListener('mousemove', handleMouseMove);
    resizeCanvas();
    createParticles();
    drawParticles();
    return () => {
      window.removeEventListener('resize', () => { resizeCanvas(); createParticles(); });
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl" />
    </div>
  );
};

const GlassBadge = ({ text }) => (
  <div className="absolute top-6 right-6 md:right-12 lg:right-24 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg z-20">
    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
    <span className="text-sm font-medium text-gray-200">{text}</span>
  </div>
);

// --- Main Sections ---

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0f14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0a0f14] to-[#0a0f14]" />
      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={`space-y-8 transition-all duration-1000 transform ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Available for new opportunities
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">Architecting Intelligence.</span>
              <span className="block mt-2">Transforming Data into Decisions.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-lg leading-relaxed">Specializing in Deep Learning and Scalable MLOps to solve complex business challenges.</p>
          </div>
          <div className={`relative h-[500px] lg:h-[600px] transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative h-full w-full bg-[#0f151c] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
              <GlassBadge text="PyTorch Expert" />
              <ParticleCanvas />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProjectShowcase = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const projects = [
    { id: 1, title: 'Medical Diagnosis Assistant', category: 'Computer Vision', summary: 'Real-time tumor detection in mammograms', techStack: ['PyTorch', 'OpenCV'], image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80' },
    { id: 2, title: 'Sentiment Analysis Engine', category: 'NLP', summary: 'Multilingual customer feedback analyzer', techStack: ['Transformers', 'TensorFlow'], image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80' },
    { id: 3, title: 'Autonomous Trading Bot', category: 'Reinforcement Learning', summary: 'Deep Q-Network for stock trading', techStack: ['Stable Baselines3', 'Pandas'], image: 'https://images.unsplash.com/photo-1554224155-679633a77f83?auto=format&fit=crop&w=1000&q=80' }
  ];
  const filtered = activeFilter === 'All' ? projects : projects.filter(p => p.category === activeFilter);
  return (
    <section className="py-32 bg-[#0f111a] relative">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-white mb-16">Selected Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filtered.map(p => (
            <div key={p.id} className="bg-[#161924] p-6 rounded-2xl border border-gray-800 hover:border-blue-500 transition-all">
              <img src={p.image} alt={p.title} className="w-full h-40 object-cover rounded-lg mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{p.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{p.summary}</p>
              <div className="flex gap-2">{p.techStack.map(t => <span key={t} className="text-xs bg-black px-2 py-1 rounded text-blue-300">{t}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ExperienceSection = () => {
  const experiences = [
    { id: 1, company: "NeuroFlow AI", role: "Senior ML Engineer", dates: "2022 — Present", summary: "Leading development of real-time predictive models." },
    { id: 2, company: "DataSphere", role: "ML Engineer", dates: "2020 — 2022", summary: "Developed NLP solutions for enterprise sentiment." }
  ];
  return (
    <section className="py-32 bg-[#0f1115]">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white mb-16 text-center">Experience</h2>
        <div className="space-y-8">
          {experiences.map(exp => (
            <div key={exp.id} className="bg-[#161b22] p-8 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-blue-400">{exp.role} @ {exp.company}</h3>
              <p className="text-gray-400 mt-2">{exp.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactFooter = () => (
  <footer className="bg-slate-900 py-24 text-center text-white">
    <h2 className="text-4xl font-bold mb-8">Let’s Build the Future</h2>
    <a href="mailto:hello@ai.dev" className="text-2xl text-cyan-400 font-mono hover:underline">hello@ai.dev</a>
  </footer>
);

// --- App Component ---

export default function App() {
  return (
    <div className="bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 min-h-screen">
      <HeroSection />
      <ProjectShowcase />
      <ExperienceSection />
      <ContactFooter />
    </div>
  );
}