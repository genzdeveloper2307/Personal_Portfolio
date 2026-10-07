import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://personal-portfolio-jszx.onrender.com/api"
).replace(/\/$/, "");

const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" }
];

const fallbackProjects = [
  {
    _id: "fallback-1",
    title: "Personal Portfolio",
    description:
      "My personal developer portfolio website showcasing my projects, skills, and experience, built with React and Vite.",
    category: "Portfolio",
    technologies: ["HTML", "CSS", "JavaScript", "React", "Node", "MongoDB"],
    github: "https://github.com/genzdeveloper2307",
    liveDemo: "",
    image: "",
    featured: true,
    active: true,
    order: 1
  },
  {
    _id: "fallback-2",
    title: "Menskart E-commerce",
    description:
      "An e-commerce web application concept for a men's fashion store, built with core web technologies.",
    category: "E-commerce",
    technologies: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/genzdeveloper2307",
    liveDemo: "",
    image: "",
    featured: false,
    active: true,
    order: 2
  },
  {
    _id: "fallback-3",
    title: "AI WeatherWise",
    description:
      "A full-stack weather application that provides real-time weather information, built with the MERN-style stack.",
    category: "Full Stack",
    technologies: ["React", "Node.js", "Express.js", "MongoDB"],
    github: "https://github.com/genzdeveloper2307",
    liveDemo: "",
    image: "",
    featured: true,
    active: true,
    order: 3
  }
];

const skills = [
  { name: "HTML", level: 85, group: "Frontend" },
  { name: "CSS", level: 80, group: "Frontend" },
  { name: "JavaScript", level: 72, group: "Frontend" },
  { name: "React", level: 62, group: "Frontend" },
  { name: "Node.js", level: 58, group: "Backend" },
  { name: "Express.js", level: 55, group: "Backend" },
  { name: "MongoDB", level: 55, group: "Database" },
  { name: "Git & GitHub", level: 68, group: "Tools" }
];

function App() {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [projectFilter, setProjectFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [copied, setCopied] = useState(false);
  const [formStatus, setFormStatus] = useState({
    type: "",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mouse, setMouse] = useState({ x: -100, y: -100 });

  const typingIndex = useRef(0);
  const typingChar = useRef(0);
  const deleting = useRef(false);
  const typingTimer = useRef(null);

  const words = useMemo(
    () => ["a BCA student", "a learner", "a beginner", "a web developer"],
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotion = () => setReducedMotion(motionQuery.matches);

    updateMotion();

    motionQuery.addEventListener?.("change", updateMotion);

    return () =>
      motionQuery.removeEventListener?.("change", updateMotion);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setTypedText(words[0]);
      return;
    }

    const tick = () => {
      const word = words[typingIndex.current];

      if (!deleting.current) {
        typingChar.current += 1;

        setTypedText(word.slice(0, typingChar.current));

        if (typingChar.current >= word.length) {
          deleting.current = true;

          typingTimer.current = setTimeout(tick, 1300);
          return;
        }
      } else {
        typingChar.current -= 1;

        setTypedText(word.slice(0, typingChar.current));

        if (typingChar.current <= 0) {
          deleting.current = false;
          typingIndex.current =
            (typingIndex.current + 1) % words.length;
        }
      }

      typingTimer.current = setTimeout(
        tick,
        deleting.current ? 55 : 95
      );
    };

    typingTimer.current = setTimeout(tick, 500);

    return () => clearTimeout(typingTimer.current);
  }, [reducedMotion, words]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      const height =
        document.documentElement.scrollHeight - window.innerHeight;

      setScrolled(y > 40);
      setShowTop(y > 450);

      setProgress(
        height > 0 ? Math.min(100, (y / height) * 100) : 0
      );
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true
    });

    return () =>
      window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onHash = () => {
      const next = window.location.hash.replace("#", "");

      if (navItems.some((item) => item.id === next)) {
        setActiveTab(next);
      }
    };

    window.addEventListener("hashchange", onHash);

    return () =>
      window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSelectedProject(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () =>
      window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const onMouseMove = (event) =>
      setMouse({
        x: event.clientX,
        y: event.clientY
      });

    window.addEventListener("mousemove", onMouseMove, {
      passive: true
    });

    return () =>
      window.removeEventListener("mousemove", onMouseMove);
  }, [reducedMotion]);

  // Backend: GET /api/projects
  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      setProjectsLoading(true);
      setProjectsError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/projects`
        );

        const result = await response.json().catch(() => ({}));

        if (
          !response.ok ||
          !result.success ||
          !Array.isArray(result.data)
        ) {
          throw new Error(
            result.message || "Unable to load projects."
          );
        }

        if (!cancelled) {
          // Use backend projects when available.
          // If MongoDB has no projects, show fallback projects.
          setProjects(
            result.data.length > 0
              ? result.data
              : fallbackProjects
          );

          if (result.data.length === 0) {
            setProjectsError(
              "No projects were found in the backend, so the saved portfolio projects are being shown."
            );
          }
        }
      } catch (error) {
        if (!cancelled) {
          setProjects(fallbackProjects);

          setProjectsError(
            "Projects could not be loaded from the backend, so the saved portfolio projects are being shown."
          );
        }
      } finally {
        if (!cancelled) {
          setProjectsLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  // Backend: POST /api/visitors/track
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        await fetch(`${API_BASE_URL}/visitors/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            page: window.location.pathname || "/",
            referrer: document.referrer || "direct"
          }),
          keepalive: true
        });
      } catch {
        // Visitor tracking is non-critical.
      }
    };

    trackVisitor();
  }, []);

  const navigate = (id) => {
    setActiveTab(id);
    setMenuOpen(false);

    window.history.pushState(
      { tab: id },
      "",
      `#${id}`
    );

    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  };

  const availableFilters = useMemo(() => {
    const values = new Set();

    projects.forEach((project) => {
      if (project.category) {
        values.add(project.category);
      }

      (project.technologies || []).forEach((technology) => {
        values.add(technology);
      });
    });

    const preferred = [
      "Frontend",
      "Full Stack",
      "React",
      "Backend"
    ];

    const matchingPreferred = preferred.filter((item) =>
      values.has(item)
    );

    const remaining = [...values]
      .filter((item) => !preferred.includes(item))
      .sort((a, b) => a.localeCompare(b));

    return [
      "All",
      ...matchingPreferred,
      ...remaining
    ];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (projectFilter === "All") {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.category === projectFilter ||
        (project.technologies || []).includes(projectFilter)
    );
  }, [projectFilter, projects]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(
        "fullstackdeveloper2307@gmail.com"
      );

      setCopied(true);

      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  // Backend: POST /api/contact
  const handleContact = async (event) => {
    event.preventDefault();

    setFormStatus({
      type: "",
      message: ""
    });

    const form = event.currentTarget;

    const data = Object.fromEntries(
      new FormData(form).entries()
    );

    if (
      !data.name?.trim() ||
      !data.email?.trim() ||
      !data.message?.trim()
    ) {
      setFormStatus({
        type: "error",
        message:
          "Please fill in your name, email and message."
      });

      return;
    }

    if (data.name.trim().length < 2) {
      setFormStatus({
        type: "error",
        message:
          "Name must be at least 2 characters."
      });

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        data.email.trim()
      )
    ) {
      setFormStatus({
        type: "error",
        message:
          "Please enter a valid email address."
      });

      return;
    }

    if (
      data.subject &&
      data.subject.trim().length > 150
    ) {
      setFormStatus({
        type: "error",
        message:
          "Subject cannot exceed 150 characters."
      });

      return;
    }

    if (data.message.trim().length < 10) {
      setFormStatus({
        type: "error",
        message:
          "Message must be at least 10 characters."
      });

      return;
    }

    if (data.message.trim().length > 2000) {
      setFormStatus({
        type: "error",
        message:
          "Message cannot exceed 2000 characters."
      });

      return;
    }

    setSending(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: data.name.trim(),
            email: data.email.trim(),
            subject: data.subject?.trim() || "",
            message: data.message.trim()
          })
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to send message."
        );
      }

      setFormStatus({
        type: "success",
        message:
          result.message ||
          "Message sent successfully!"
      });

      form.reset();
    } catch (error) {
      setFormStatus({
        type: "error",
        message:
          error.message ||
          "Backend is not reachable. Check VITE_API_BASE_URL and start the Node.js server."
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="app">
      <div
        className="cursor-glow"
        aria-hidden="true"
        style={{
          left: mouse.x,
          top: mouse.y
        }}
      />

      <div
        className="scroll-progress"
        style={{
          width: `${progress}%`
        }}
      />

      {loading && (
        <div
          className="loader"
          aria-label="Loading portfolio"
        >
          <div className="loader-logo">
            @PORTFOLIO.
          </div>

          <div className="loader-bar">
            <span />
          </div>

          <small>
            Loading Akash's portfolio...
          </small>
        </div>
      )}

      <div
        className="bar-animation"
        aria-hidden="true"
      >
        {Array.from(
          { length: 6 },
          (_, index) => (
            <div
              className="bar"
              style={{
                "--i": index + 1
              }}
              key={index}
            />
          )
        )}
      </div>

      <header
        className={`navbar ${
          scrolled ? "scrolled" : ""
        }`}
      >
        <button
          className="logo logo-button"
          onClick={() => navigate("home")}
        >
          @PORTFOLIO.
        </button>

        <nav
          className={`nav-links ${
            menuOpen ? "open" : ""
          }`}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              className={
                activeTab === item.id
                  ? "active"
                  : ""
              }
              onClick={() =>
                navigate(item.id)
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            className={`hamburger ${
              menuOpen ? "active" : ""
            }`}
            onClick={() =>
              setMenuOpen((value) => !value)
            }
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main className="app-shell">
        <div className="panels">

          {/* HOME */}
          {activeTab === "home" && (
            <section className="panel active home-panel">
              <div className="sec-info">
                <span className="eyebrow">
                  WELCOME TO MY DIGITAL SPACE
                </span>

                <h1>AKASH P</h1>

                <h2>
                  I am{" "}
                  <span className="typing-target">
                    {typedText}
                  </span>
                </h2>

                <p>
                  A passionate BCA student turning
                  ideas into real-world applications
                  through code. Learning, building and
                  growing one project at a time.
                </p>

                <div className="button-row">
                  <a
                    href="https://canva.link/gkgllfi16rje3ps"
                    className="primary-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download resume↗
                  </a>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      navigate("contact")
                    }
                  >
                    Let's talk
                  </button>

                  <SocialLinks compact />
                </div>

                <div className="quick-stats">
                  <div>
                    <strong>
                      {projects.length}+
                    </strong>
                    <span>Projects</span>
                  </div>

                  <div>
                    <strong>4+</strong>
                    <span>
                      Core technologies
                    </span>
                  </div>

                  <div>
                    <strong>∞</strong>
                    <span>
                      Learning mindset
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ABOUT */}
          {activeTab === "about" && (
            <section className="panel active">
              <SectionHeading
                title="About Me"
                subtitle="A quick snapshot of my journey and current focus."
              />

              <div className="about-layout">
                <div className="about-list">
                  <InfoRow
                    icon="🎓"
                    title="Education"
                    value="Final year BCA student"
                  />

                  <InfoRow
                    icon="📍"
                    title="Location"
                    value="India"
                  />

                  <InfoRow
                    icon="💻"
                    title="Career focus"
                    value="Web / Full Stack Development"
                  />

                  <InfoRow
                    icon="🌱"
                    title="Currently learning"
                    value="React, Node.js & MongoDB"
                  />

                  <InfoRow
                    icon="🚀"
                    title="Goal"
                    value="Build useful, user-friendly web applications"
                  />
                </div>

                <div className="glass-card about-note">
                  <span className="card-label">
                    MY APPROACH
                  </span>

                  <h3>
                    Learn → Build → Test → Improve
                  </h3>

                  <p>
                    I enjoy learning by building
                    practical projects. My current focus
                    is strengthening frontend development
                    while connecting it with Node.js,
                    Express and MongoDB.
                  </p>

                  <div className="availability">
                    <span />
                    Open to learning opportunities
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* PROJECTS */}
          {activeTab === "projects" && (
            <section className="panel active">
              <SectionHeading
                title="Portfolio"
                subtitle="Projects are loaded directly from the backend Projects API."
              />

              {projectsError && (
                <p className="form-status error">
                  {projectsError}
                </p>
              )}

              <div
                className="filter-row"
                role="group"
                aria-label="Filter projects"
              >
                {availableFilters.map(
                  (filter) => (
                    <button
                      key={filter}
                      className={
                        projectFilter === filter
                          ? "filter active"
                          : "filter"
                      }
                      onClick={() =>
                        setProjectFilter(filter)
                      }
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>

              {projectsLoading ? (
                <div className="glass-card about-note">
                  <span className="card-label">
                    LOADING PROJECTS
                  </span>

                  <p>
                    Fetching active projects from
                    the backend...
                  </p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="glass-card about-note">
                  <span className="card-label">
                    NO PROJECTS
                  </span>

                  <p>
                    No active projects match this
                    filter.
                  </p>
                </div>
              ) : (
                <div className="card-grid">
                  {filteredProjects.map(
                    (project, index) => (
                      <article
                        className="mini-card project-card"
                        key={
                          project._id ||
                          project.id
                        }
                      >
                        <div className="card-icon">
                          {project.image ? (
                            <img
                              src={project.image}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius:
                                  "12px"
                              }}
                            />
                          ) : project.featured ? (
                            "★"
                          ) : (
                            "⌘"
                          )}
                        </div>

                        <div className="project-meta">
                          <span>
                            {project.category ||
                              "Web Development"}
                          </span>

                          <span>
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </span>
                        </div>

                        <h3>
                          {project.title}
                        </h3>

                        <p>
                          {project.description}
                        </p>

                        <div className="tag-list">
                          {(
                            project.technologies ||
                            []
                          )
                            .slice(0, 4)
                            .map((tech) => (
                              <span key={tech}>
                                {tech}
                              </span>
                            ))}
                        </div>

                        <div className="card-actions">
                          <button
                            className="text-button"
                            onClick={() =>
                              setSelectedProject(
                                project
                              )
                            }
                          >
                            View details →
                          </button>

                          {project.github && (
                            <a
                              href={
                                project.github
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              GitHub ↗
                            </a>
                          )}
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          )}

          {/* SKILLS */}
          {activeTab === "skills" && (
            <section className="panel active">
              <SectionHeading
                title="Skills"
                subtitle="Technologies I am learning and using in projects."
              />

              <div className="skills-grid">
                {skills.map((skill) => (
                  <div
                    className="skill-card"
                    key={skill.name}
                  >
                    <div className="skill-head">
                      <strong>
                        {skill.name}
                      </strong>

                      <span>
                        {skill.group}
                      </span>
                    </div>

                    <div className="skill-track">
                      <span
                        style={{
                          width: `${skill.level}%`
                        }}
                      />
                    </div>

                    <small>
                      {skill.level}% learning
                      progress
                    </small>
                  </div>
                ))}
              </div>

              <div className="learning-card">
                <div>
                  <span className="card-label">
                    CURRENT ROADMAP
                  </span>

                  <h3>
                    React → Node.js → MongoDB →
                    Full Stack Projects
                  </h3>
                </div>

                <button
                  className="secondary-button"
                  onClick={() =>
                    navigate("projects")
                  }
                >
                  See projects
                </button>
              </div>
            </section>
          )}

          {/* SERVICES */}
          {activeTab === "services" && (
            <section className="panel active">
              <SectionHeading
                title="Services"
                subtitle="Areas where I can build, improve or maintain web experiences."
              />

              <div className="card-grid service-grid">
                <Service
                  icon="🌐"
                  title="Web Development"
                  text="Responsive websites using HTML, CSS, JavaScript and React."
                />

                <Service
                  icon="🎨"
                  title="UI Development"
                  text="Clean, modern interfaces with attention to spacing, responsiveness and usability."
                />

                <Service
                  icon="⚡"
                  title="Frontend Development"
                  text="Interactive React interfaces with reusable components and state-driven UI."
                />

                <Service
                  icon="🔧"
                  title="Website Maintenance"
                  text="Fix UI bugs, improve layouts, update content and refine existing websites."
                />
              </div>
            </section>
          )}

          {/* CONTACT */}
          {activeTab === "contact" && (
            <section className="panel active">
              <SectionHeading
                title="Contact"
                subtitle="Your message is sent to the backend and stored in MongoDB."
              />

              <div className="contact-layout">
                <form
                  className="contact-form glass-card"
                  onSubmit={handleContact}
                  noValidate
                >
                  <div className="form-grid">
                    <FormField
                      label="Name"
                      name="name"
                      placeholder="Your name"
                    />

                    <FormField
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                    />
                  </div>

                  <FormField
                    label="Subject"
                    name="subject"
                    placeholder="What's this about?"
                  />

                  <FormField
                    label="Message"
                    name="message"
                    placeholder="Write your message..."
                    textarea
                  />

                  <div className="form-footer">
                    <button
                      className="primary-button"
                      type="submit"
                      disabled={sending}
                    >
                      {sending
                        ? "Sending..."
                        : "Send message ↗"}
                    </button>

                    <span
                      className={`form-status ${formStatus.type}`}
                    >
                      {formStatus.message}
                    </span>
                  </div>
                </form>

                <div className="contact-info">
                  <ContactItem
                    icon="✉"
                    title="Email"
                    value="fullstackdeveloper2307@gmail.com"
                    action={copyEmail}
                  >
                    {copied
                      ? "Copied!"
                      : "Copy email"}
                  </ContactItem>

                  <ContactItem
                    icon="in"
                    title="LinkedIn"
                    value="Connect on LinkedIn"
                    href="https://www.linkedin.com/in/akash-p-565009418?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                  />

                  <ContactItem
                    icon="⌖"
                    title="Location"
                    value="India"
                  />

                  <SocialLinks />
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="app-image">
          <div className="img-box">
            <div className="img-item">
              <img
                src="/mine.png"
                alt="Akash"
              />
            </div>
          </div>

          {activeTab !== "home" && (
            <div className="image-caption">
              <span>AKASH P</span>
              <small>
                Developer • Learner • Builder
              </small>
            </div>
          )}
        </aside>
      </main>

      <footer className="site-footer">
        <button
          className="logo logo-button"
          onClick={() => navigate("home")}
        >
          @PORTFOLIO.
        </button>

        <p>
          © {new Date().getFullYear()} Akash.
          Built with React.
        </p>

        <SocialLinks />
      </footer>

      {showTop && (
        <button
          className="scroll-top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth"
            })
          }
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}

      {selectedProject && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedProject(null);
            }
          }}
        >
          <div
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-title"
          >
            <button
              className="modal-close"
              onClick={() =>
                setSelectedProject(null)
              }
              aria-label="Close"
            >
              ×
            </button>

            <span className="card-label">
              PROJECT DETAILS
            </span>

            <h2 id="project-title">
              {selectedProject.title}
            </h2>

            {selectedProject.category && (
              <p className="project-modal-category">
                {selectedProject.category}
              </p>
            )}

            <p>
              {selectedProject.description}
            </p>

            <div className="tag-list">
              {(
                selectedProject.technologies ||
                []
              ).map((technology) => (
                <span key={technology}>
                  {technology}
                </span>
              ))}
            </div>

            <div className="button-row">
              {selectedProject.github && (
                <a
                  className="primary-button modal-link"
                  href={
                    selectedProject.github
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open GitHub ↗
                </a>
              )}

              {selectedProject.liveDemo && (
                <a
                  className="secondary-button modal-link"
                  href={
                    selectedProject.liveDemo
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live Demo ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getInitialTab() {
  const value =
    window.location.hash.replace("#", "");

  return navItems.some(
    (item) => item.id === value
  )
    ? value
    : "home";
}

function SectionHeading({
  title,
  subtitle
}) {
  return (
    <>
      <h2 className="section-title">
        {title}
      </h2>

      <p className="section-subtitle">
        {subtitle}
      </p>
    </>
  );
}

function InfoRow({
  icon,
  title,
  value
}) {
  return (
    <div className="info-row">
      <span className="info-icon">
        {icon}
      </span>

      <div>
        <strong>{title}</strong>
        <span>{value}</span>
      </div>
    </div>
  );
}

function Service({
  icon,
  title,
  text
}) {
  return (
    <article className="mini-card service-card">
      <div className="card-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      <span className="service-arrow">
        ↗
      </span>
    </article>
  );
}

function FormField({
  label,
  name,
  placeholder,
  type = "text",
  textarea = false
}) {
  const Component = textarea
    ? "textarea"
    : "input";

  return (
    <label className="form-group">
      <span>{label}</span>

      <Component
        name={name}
        type={
          textarea
            ? undefined
            : type
        }
        placeholder={placeholder}
        required={name !== "subject"}
        rows={textarea ? 5 : undefined}
        maxLength={
          textarea
            ? 2000
            : name === "subject"
            ? 150
            : name === "name"
            ? 100
            : undefined
        }
      />
    </label>
  );
}

function ContactItem({
  icon,
  title,
  value,
  href,
  action,
  children
}) {
  return (
    <div className="contact-item">
      <span className="contact-icon">
        {icon}
      </span>

      <div>
        <strong>{title}</strong>

        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        ) : (
          <p>{value}</p>
        )}

        {action && (
          <button
            className="copy-button"
            onClick={action}
            type="button"
          >
            {children}
          </button>
        )}
      </div>
    </div>
  );
}

function SocialLinks({
  compact = false
}) {
  return (
    <div
      className={`social-links ${
        compact ? "compact" : ""
      }`}
    >
      <a
        href="https://github.com/genzdeveloper2307"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        title="GitHub"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 .7a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.42-4.04-1.42-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.84 2.8 1.31 3.48 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .7Z" />
        </svg>
      </a>

      <a
        href="https://www.linkedin.com/in/akash-p-565009418?utm_source=share_via&utm_content=profile&utm_medium=member_android"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        title="LinkedIn"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M5.05 3.5A2.45 2.45 0 1 1 5 8.4a2.45 2.45 0 0 1 .05-4.9ZM3.1 9.8h3.9V21H3.1V9.8Zm6.35 0h3.74v1.53h.05c.52-.99 1.8-2.03 3.7-2.03 3.95 0 4.68 2.6 4.68 5.98V21h-3.9v-5.07c0-1.21-.02-2.77-1.69-2.77-1.7 0-1.96 1.32-1.96 2.68V21H9.45V9.8Z" />
        </svg>
      </a>

      <a
        href="https://www.instagram.com/mr._.akash._.07__?igsh=MTc5aDFuMDNmZzBuaQ=="
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        title="Instagram"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
          />

          <circle
            cx="12"
            cy="12"
            r="4"
          />

          <circle
            cx="17.4"
            cy="6.6"
            r="1.1"
            className="social-dot"
          />
        </svg>
      </a>
    </div>
  );
}

export default App;