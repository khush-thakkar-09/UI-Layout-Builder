import React, { useState, useEffect, useRef } from 'react';

// === Generated Section Components ===

// --- Section 1: Hero Section ---
function Section1() {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = React.useState(false);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) * 0.02;
    const moveY = (clientY - window.innerHeight / 2) * 0.02;
    setMousePosition({ x: moveX, y: moveY });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 text-slate-100"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background gradient mesh */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl mix-blend-screen animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)`,
            transition: 'transform 0.2s ease-out',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl mix-blend-screen"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            transition: 'transform 0.2s ease-out',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl mix-blend-screen"
          style={{
            transform: `translate(${mousePosition.x * -0.8}px, ${mousePosition.y * -0.8}px)`,
            transition: 'transform 0.2s ease-out',
          }}
        />
      </div>

      {/* Content container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column: Text content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-2">
              AI/ML Engineer & Creative Technologist
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400">
                Architecting Intelligence
              </span>
              <span className="block text-slate-100 mt-2">
                Where Code Meets Creativity
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Specializing in Neural Networks, Computer Vision, and Generative AI to solve tomorrow’s problems today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/40 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Explore My Projects
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>

              <button className="px-8 py-4 rounded-full border border-slate-600 text-slate-300 font-semibold hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10">
                Let’s Connect
              </button>
            </div>
          </div>

          {/* Right column: Dynamic visual element */}
          <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center">
            {/* Abstract generative art container */}
            <div className="relative w-full h-full max-w-md mx-auto">
              {/* Rotating rings */}
              <div
                className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-spin-slow"
                style={{ animationDuration: '20s' }}
              />
              <div
                className="absolute inset-4 border-2 border-violet-500/30 rounded-full animate-spin-reverse"
                style={{ animationDuration: '15s' }}
              />
              <div
                className="absolute inset-8 border border-emerald-500/20 rounded-full animate-spin-slow"
                style={{ animationDuration: '25s' }}
              />

              {/* Interactive nodes */}
              <div
                className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-full shadow-lg shadow-cyan-500/30 flex items-center justify-center"
                style={{
                  transform: `translate(calc(-50% + ${mousePosition.x}px), calc(-50% + ${mousePosition.y}px))`,
                  transition: 'transform 0.1s ease-out',
                }}
              >
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div
                className="absolute top-1/4 right-1/4 w-8 h-8 bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/30"
                style={{
                  transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
                  transition: 'transform 0.1s ease-out',
                }}
              />

              <div
                className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-cyan-300 rounded-full shadow-lg shadow-cyan-500/30"
                style={{
                  transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)`,
                  transition: 'transform 0.1s ease-out',
                }}
              />

              <div
                className="absolute top-1/3 left-1/2 w-4 h-4 bg-violet-300 rounded-full shadow-lg shadow-violet-500/30"
                style={{
                  transform: `translate(${mousePosition.x * 0.2}px, ${-mousePosition.y * 0.2}px)`,
                  transition: 'transform 0.1s ease-out',
                }}
              />
            </div>
          </div>
        </div>

        {/* Tech stack marquee */}
        <div className="mt-20 overflow-hidden">
          <div className="relative flex items-center">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-10" />

            <div className="flex gap-12 animate-marquee whitespace-nowrap">
              {/* Tech stack icons */}
              {[
                { name: 'Python', icon: 'P' },
                { name: 'PyTorch', icon: 'P' },
                { name: 'TensorFlow', icon: 'T' },
                { name: 'OpenCV', icon: 'O' },
                { name: 'AWS', icon: 'A' },
                { name: 'Docker', icon: 'D' },
                { name: 'Kubernetes', icon: 'K' },
                { name: 'Scikit-learn', icon: 'S' },
                { name: 'Hugging Face', icon: 'H' },
                { name: 'FastAPI', icon: 'F' },
                { name: 'React', icon: 'R' },
                { name: 'Node.js', icon: 'N' },
              ].map((tech, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                    {tech.icon}
                  </div>
                  <span className="text-slate-400 font-medium group-hover:text-slate-200 transition-colors">
                    {tech.name}
                  </span>
                </div>
              ))}

              {/* Duplicate for seamless loop */}
              {[
                { name: 'Python', icon: 'P' },
                { name: 'PyTorch', icon: 'P' },
                { name: 'TensorFlow', icon: 'T' },
                { name: 'OpenCV', icon: 'O' },
                { name: 'AWS', icon: 'A' },
                { name: 'Docker', icon: 'D' },
                { name: 'Kubernetes', icon: 'K' },
                { name: 'Scikit-learn', icon: 'S' },
                { name: 'Hugging Face', icon: 'H' },
                { name: 'FastAPI', icon: 'F' },
                { name: 'React', icon: 'R' },
                { name: 'Node.js', icon: 'N' },
              ].map((tech, i) => (
                <div key={`dup-${i}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                    {tech.icon}
                  </div>
                  <span className="text-slate-400 font-medium group-hover:text-slate-200 transition-colors">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS for custom animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

// --- Section 2: Project Showcase ---
function Section2() {
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = ["All", "Computer Vision", "NLP", "Generative AI"];

  const projects = [
    {
      id: 1,
      title: "Real-Time Medical Diagnosis Assistant",
      excerpt: "Deployed a vision-based model that detects early signs of diabetic retinopathy with 96% accuracy, reducing screening time by 70%.",
      category: "Computer Vision",
      tech: ["PyTorch", "FastAPI", "OpenCV"],
      image: "https://placehold.co/600x400/1e293b/6366f1?text=Medical+Vision",
      caseStudy: "/case-studies/medical-diagnosis",
      repo: "https://github.com/ai-lab/retinopathy-detector"
    },
    {
      id: 2,
      title: "Legal Document Summarizer",
      excerpt: "Built an NLP pipeline that condenses 50-page contracts into actionable summaries using transformer-based abstractive summarization.",
      category: "NLP",
      tech: ["Hugging Face", "Transformers", "LangChain"],
      image: "https://placehold.co/600x400/1e293b/22d3ee?text=Legal+Summarizer",
      caseStudy: "/case-studies/legal-summarizer",
      repo: "https://github.com/ai-lab/legal-summarizer"
    },
    {
      id: 3,
      title: "AI Art Generator Studio",
      excerpt: "Created a generative model that produces high-fidelity artwork from text prompts, enabling rapid prototyping for digital creators.",
      category: "Generative AI",
      tech: ["Stable Diffusion", "Diffusers", "Gradio"],
      image: "https://placehold.co/600x400/1e293b/a855f7?text=AI+Art+Studio",
      caseStudy: "/case-studies/ai-art-studio",
      repo: "https://github.com/ai-lab/ai-art-studio"
    },
    {
      id: 4,
      title: "Autonomous Drone Navigation",
      excerpt: "Developed real-time obstacle avoidance system using depth estimation and reinforcement learning for indoor drone navigation.",
      category: "Computer Vision",
      tech: ["TensorFlow", "ROS", "YOLOv8"],
      image: "https://placehold.co/600x400/1e293b/06b6d4?text=Drone+Nav",
      caseStudy: "/case-studies/drone-nav",
      repo: "https://github.com/ai-lab/drone-ai"
    },
    {
      id: 5,
      title: "Customer Sentiment Pulse",
      excerpt: "Real-time sentiment analysis dashboard processing 10K+ social media comments daily to track brand perception across platforms.",
      category: "NLP",
      tech: ["BERT", "Kafka", "React"],
      image: "https://placehold.co/600x400/1e293b/10b981?text=Sentiment+Pulse",
      caseStudy: "/case-studies/sentiment-pulse",
      repo: "https://github.com/ai-lab/sentiment-pulse"
    },
    {
      id: 6,
      title: "Music Composition Assistant",
      excerpt: "AI co-creator that generates musical motifs and harmonies in real-time, trained on 10,000+ classical compositions.",
      category: "Generative AI",
      tech: ["Magenta", "TensorFlow", "Web Audio API"],
      image: "https://placehold.co/600x400/1e293b/ec4899?text=Music+AI",
      caseStudy: "/case-studies/music-ai",
      repo: "https://github.com/ai-lab/music-composer"
    }
  ];

  const filteredProjects = activeFilter === "All"
    ? projects
    : projects.filter(p => p.category === activeFilter);

  const CategoryPill = ({ category, isActive, onClick }) => (
    <button
      onClick={() => onClick(category)}
      className={`
        px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-in-out
        ${isActive
          ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
        }
      `}
    >
      {category}
    </button>
  );

  const TechBadge = ({ tech }) => (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-cyan-400 border border-cyan-500/20">
      {tech}
    </span>
  );

  const ProjectCard = ({ project }) => (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="flex flex-col flex-grow p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-violet-400 transition-colors">
            {project.title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {project.excerpt}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.tech.map((t, i) => (
            <TechBadge key={i} tech={t} />
          ))}
        </div>

        <div className="mt-auto flex items-center gap-3">
          <a
            href={project.caseStudy}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/20"
          >
            View Case Study
          </a>
          <a
            href={project.repo}
            className="inline-flex items-center justify-center p-2.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 hover:border-slate-600"
            aria-label="View GitHub repository"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-100 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">
              AI in Action
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Real-world applications of machine learning that transform complex problems into elegant solutions.
          </p>
        </header>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <CategoryPill
              key={category}
              category={category}
              isActive={activeFilter === category}
              onClick={setActiveFilter}
            />
          ))}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-16 text-center">
          <a
            href="/projects"
            className="inline-flex items-center px-8 py-3.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800/50 transition-all duration-300 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            View All Projects
          </a>
        </div>
      </div>
    </section>
  );
}

// --- Section 3: Experience Timeline ---
function Section3() {
  const [expandedIndex, setExpandedIndex] = React.useState(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const timelineRef = React.useRef(null);

  const experiences = [
    {
      id: 1,
      role: "Senior AI Engineer",
      company: "NeuroFlow AI",
      dates: "2023 — Present",
      techStack: ["PyTorch", "Hugging Face", "AWS SageMaker", "LangChain"],
      summary: [
        "Led development of a real-time NLP pipeline processing 10K+ queries/sec",
        "Reduced inference latency by 42% through model quantization and caching strategies",
        "Architected a multi-tenant LLM platform serving 50+ enterprise clients"
      ],
      details: "Currently building next-gen conversational agents for healthcare providers, integrating HIPAA-compliant data pipelines with fine-tuned Llama 3 models."
    },
    {
      id: 2,
      role: "Machine Learning Engineer",
      company: "Quantum Dynamics",
      dates: "2021 — 2023",
      techStack: ["TensorFlow", "Keras", "Google Cloud AI", "Apache Kafka"],
      summary: [
        "Designed and deployed computer vision models for autonomous inspection systems",
        "Optimized model training workflows using distributed training across 16 GPU nodes",
        "Implemented real-time anomaly detection reducing false positives by 37%"
      ],
      details: "Developed a predictive maintenance solution for manufacturing clients, achieving 99.2% detection accuracy on production floor equipment."
    },
    {
      id: 3,
      role: "Data Scientist",
      company: "Innovate Labs",
      dates: "2019 — 2021",
      techStack: ["Python", "Scikit-learn", "Azure ML", "Tableau"],
      summary: [
        "Built predictive models for customer churn reduction improving retention by 22%",
        "Created automated ML pipelines for feature engineering and model retraining",
        "Delivered data-driven insights leading to 3 new product features"
      ],
      details: "Pioneered the company's first end-to-end ML deployment, transitioning from Jupyter notebooks to production-ready APIs with <100ms latency."
    },
    {
      id: 4,
      role: "Junior ML Developer",
      company: "StartUp Nexus",
      dates: "2018 — 2019",
      techStack: ["NumPy", "Pandas", "Flask", "PostgreSQL"],
      summary: [
        "Developed initial recommendation engine increasing user engagement by 18%",
        "Cleaned and preprocessed 500K+ data points for initial model training",
        "Collaborated with product team to define success metrics for AI features"
      ],
      details: "Joined as employee #7, building the first version of the recommendation system that became the company's flagship feature."
    }
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const totalHeight = rect.height - window.innerHeight;
        const scrollPosition = window.scrollY - rect.top;
        const progress = Math.min(Math.max(scrollPosition / totalHeight, 0), 1);
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleExpand = (id) => {
    setExpandedIndex(expandedIndex === id ? null : id);
  };

  const TimelineNode = ({ isLeft }) => (
    <div className={`absolute top-0 w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10 ${isLeft ? "-left-2" : "-right-2"}`}>
      <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75"></div>
    </div>
  );

  const ExperienceCard = ({ experience, isLeft }) => {
    const isExpanded = expandedIndex === experience.id;

    return (
      <div className={`relative mb-16 md:mb-24 ${isLeft ? "md:order-1 md:pl-16 md:text-left" : "md:order-2 md:pr-16 md:text-right"}`}>
        {/* Timeline Node */}
        <div className={`absolute top-0 ${isLeft ? "left-0 md:left-1/2 md:-ml-2" : "right-0 md:right-1/2 md:-mr-2"}`}>
          <TimelineNode isLeft={isLeft} />
        </div>

        {/* Card */}
        <div className="relative group">
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-100 tracking-tight">{experience.role}</h3>
                <p className="text-cyan-400 font-medium text-lg">{experience.company}</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mt-2 md:mt-0">
                {experience.dates}
              </span>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {experience.techStack.map((tech, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
                  {tech}
                </span>
              ))}
            </div>

            {/* Summary */}
            <ul className="space-y-2 mb-4">
              {experience.summary.map((item, idx) => (
                <li key={idx} className="flex items-start text-slate-300 leading-relaxed">
                  <span className="mr-2 mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Expand Button */}
            <button
              onClick={() => toggleExpand(experience.id)}
              className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium group-hover:underline"
            >
              <span className="mr-1">{isExpanded ? "Show less" : "View details"}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-slate-300 leading-relaxed">
                  {experience.details}
                </p>
                <div className="mt-3">
                  <a href="#" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                    <span>View project case study</span>
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="experience" ref={timelineRef} className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-950">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.6)]">
                <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full animate-ping bg-cyan-400 opacity-20"></div>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-100 tracking-tight mb-4">
            The Journey So Far
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A visual narrative of my professional evolution in AI/ML engineering — where technical depth meets real-world impact.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-emerald-500 to-violet-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] transform -translate-x-1/2"></div>

          {/* Experience Cards */}
          <div className="space-y-16 md:space-y-24">
            {experiences.map((exp, idx) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                isLeft={idx % 2 === 0}
              />
            ))}
          </div>
        </div>

        {/* Scroll Progress Indicator */}
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
          <div className="relative w-2 h-64 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-cyan-400 to-emerald-400 transition-all duration-300 ease-out"
              style={{ height: `${scrollProgress * 100}%` }}
            ></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-900 rounded-b-full"></div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-xs font-mono text-slate-400 mb-1">PROGRESS</div>
            <div className="text-sm font-bold text-cyan-400">{Math.round(scrollProgress * 100)}%</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Section 4: Contact Footer ---
function Section4() {
  const [copied, setCopied] = React.useState(false);

  const handleCopyEmail = () => {
    const email = "hello@futurebuilder.dev";
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900" />
      <div className="absolute inset-0 opacity-20 bg-[url('https://placehold.co/1920x1080/000000/FFFFFF/png?text=')] bg-cover bg-center mix-blend-overlay" />

      {/* Availability badge */}
      <div className="absolute top-6 right-6 sm:right-12">
        <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-sm border border-cyan-500/30 rounded-full px-4 py-1.5 shadow-lg shadow-cyan-500/10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-300 tracking-wide uppercase">
            Open to new opportunities
          </span>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Primary heading */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-violet-300 mb-8">
          Let’s Build the Future Together.
        </h2>

        {/* Email button */}
        <div className="mb-12">
          <button
            onClick={handleCopyEmail}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-slate-900 bg-cyan-400 rounded-full shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:bg-cyan-300 hover:shadow-cyan-500/50 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <span className="font-mono text-slate-900">hello@futurebuilder.dev</span>
            <svg
              className={`ml-3 w-5 h-5 transition-transform duration-300 ${copied ? "scale-110" : "group-hover:scale-110"
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            {copied && (
              <span className="absolute -top-10 right-1/2 -translate-x-1/2 bg-emerald-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                Copied!
              </span>
            )}
          </button>
        </div>

        {/* Social icons */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {[
            {
              name: "LinkedIn", url: "#", icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              )
            },
            {
              name: "GitHub", url: "#", icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              )
            },
            {
              name: "HuggingFace", url: "#", icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h2v2H7v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm-6 3h2v2H7v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2z" />
                </svg>
              )
            },
            {
              name: "Twitter/X", url: "#", icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              )
            }
          ].map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/40 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
            >
              {social.icon}
            </a>
          ))}
        </div>

        {/* Copyright and tech stack */}
        <div className="border-t border-slate-700/50 pt-8">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Future Builder. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 mt-2 font-mono">
            Built with React, Tailwind CSS, and a passion for innovation.
          </p>
        </div>
      </div>
    </section>
  );
}

// === Main App Component ===
export default function App() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200">
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
    </div>
  );
}