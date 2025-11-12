import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { FaDumbbell, FaUsers, FaChartLine, FaCalendarAlt, FaCreditCard, FaMobileAlt, FaStar, FaQuoteLeft, FaQuoteRight, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaArrowRight, FaPlay, FaMedal, FaTrophy, FaFire, FaHeartbeat, FaRunning, FaCrown } from 'react-icons/fa';
import { FiChevronDown, FiCheck, FiArrowRight } from 'react-icons/fi';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import './LendingPage.css';

const LendingPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [activeTab, setActiveTab] = useState('members');
  const heroRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const features = [
    {
      icon: <FaUsers className="feature-icon" />,
      title: "Member Management",
      description: "Effortlessly manage member profiles, attendance, and membership plans.",
      color: "#FF6B6B",
      bg: "rgba(255, 107, 107, 0.1)"
    },
    {
      icon: <FaCalendarAlt className="feature-icon" />,
      title: "Class Scheduling",
      description: "Create and manage class schedules with easy booking and reminders.",
      color: "#4ECDC4",
      bg: "rgba(78, 205, 196, 0.1)"
    },
    {
      icon: <FaCreditCard className="feature-icon" />,
      title: "Payment Processing",
      description: "Secure payment processing with automated billing and invoicing.",
      color: "#FFD166",
      bg: "rgba(255, 209, 102, 0.1)"
    },
    {
      icon: <FaChartLine className="feature-icon" />,
      title: "Progress Tracking",
      description: "Track member progress with detailed analytics and reports.",
      color: "#6A0572",
      bg: "rgba(106, 5, 114, 0.1)"
    },
    {
      icon: <FaMobileAlt className="feature-icon" />,
      title: "Mobile App",
      description: "Full-featured mobile app for members and trainers on the go.",
      color: "#1A535C",
      bg: "rgba(26, 83, 92, 0.1)"
    },
    {
      icon: <FaDumbbell className="feature-icon" />,
      title: "Equipment Management",
      description: "Monitor equipment usage, maintenance schedules, and availability.",
      color: "#FF9F1C",
      bg: "rgba(255, 159, 28, 0.1)"
    }
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Gym Owner",
      content: "This system has transformed how we run our gym. Member retention has increased by 40% since implementation.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Priya Patel",
      role: "Fitness Manager",
      content: "The scheduling and reporting features save us hours each week. Our trainers love the mobile app!",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Vikram Singh",
      role: "Gym Member",
      content: "Booking classes and tracking my progress has never been easier. The app is intuitive and powerful.",
      rating: 4,
      avatar: "https://randomuser.me/api/portraits/men/67.jpg"
    }
  ];

  const benefits = [
    "Increase member retention by up to 40%",
    "Save 15+ hours per week on administrative tasks",
    "Improve staff efficiency and communication",
    "Boost revenue with automated billing and upselling",
    "Enhance member experience with self-service options",
    "Make data-driven decisions with detailed analytics"
  ];

  const stats = [
    { value: "500+", label: "Happy Gyms", icon: <FaCrown /> },
    { value: "50K+", label: "Active Members", icon: <FaUsers /> },
    { value: "99.9%", label: "Uptime", icon: <FaChartLine /> },
    { value: "24/7", label: "Support", icon: <FaHeartbeat /> }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "₹2,999",
      period: "per month",
      features: ["Up to 100 members", "Basic scheduling", "Payment processing", "Email support"],
      popular: false
    },
    {
      name: "Professional",
      price: "₹4,999",
      period: "per month",
      features: ["Up to 500 members", "Advanced scheduling", "Payment processing", "Priority support", "Mobile app", "Analytics"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      features: ["Unlimited members", "Custom scheduling", "Payment processing", "Dedicated support", "Mobile app", "Advanced analytics", "Custom integrations"],
      popular: false
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const heroItemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const dashboardData = {
    members: {
      title: "Member Overview",
      stats: [
        { label: "Total Members", value: "245", change: "+12%" },
        { label: "Active Today", value: "68", change: "+5%" },
        { label: "New This Month", value: "24", change: "+8%" }
      ],
      chart: [65, 59, 80, 81, 56, 55, 70]
    },
    revenue: {
      title: "Revenue Analytics",
      stats: [
        { label: "Monthly Revenue", value: "₹2.4L", change: "+18%" },
        { label: "Avg. Revenue/Member", value: "₹980", change: "+3%" },
        { label: "Pending Payments", value: "₹24K", change: "-5%" }
      ],
      chart: [28, 48, 40, 59, 66, 77, 80]
    },
    classes: {
      title: "Class Performance",
      stats: [
        { label: "Classes Today", value: "18", change: "+2" },
        { label: "Avg. Attendance", value: "85%", change: "+4%" },
        { label: "Popular Class", value: "HIIT", change: "N/A" }
      ],
      chart: [45, 52, 38, 65, 59, 70, 75]
    }
  };

  return (
    <div className="landing-page">
      {/* Animated Background Elements */}
      <div className="bg-elements">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-element"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 150 + 50}px`,
              height: `${Math.random() * 150 + 50}px`,
              background: `rgba(110, 178, 204, ${Math.random() * 0.15 + 0.05})`,
              borderRadius: `${Math.random() > 0.5 ? '50%' : '10%'}`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              rotate: [0, Math.random() * 20 - 10],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className={`navbar navbar-expand-lg fixed-top ${isScrolled ? 'scrolled' : ''}`}>
        <Container>
          <motion.a 
            className="navbar-brand" 
            href="#"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="brand-container">
              <div className="brand-icon-wrapper">
                <FaDumbbell className="brand-icon" />
              </div>
              <span>FitManager Pro</span>
            </div>
          </motion.a>
          
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation"
          >
            <span className={`navbar-toggler-icon ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
          
          <div className={`navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ml-auto">
              {['Home', 'Features', 'Benefits', 'Testimonials', 'Pricing', 'Contact'].map((item) => (
                <motion.li 
                  className="nav-item" 
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <a className="nav-link" href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)}>
                    {item}
                    <motion.div 
                      className="nav-underline"
                      layoutId="navUnderline"
                    />
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <Button
        variant="primary"
        className="ml-3 demo-btn"
        onClick={() => navigate("/login")}
      >
        Login
        <FiArrowRight className="btn-icon" />
      </Button>
    </motion.div>
          </div>
        </Container>
      </nav>

  {/* Hero Section */}
<section className="hero-section" ref={heroRef}>
  <Container className="">
    <Row className="align-items-center ">
      <Col lg={6} className="mb-5 mb-lg-0">
        <div className="align-item-center px-4">
          <div className="hero-badge ">
            <FaFire className="badge-icon me-2 " /> #1 Gym Management Software
          </div>
          <h1 className="hero-title px-4">
            Transform Your <span className="highlight">Gym Business</span>
          </h1>
          <p className="hero-subtitle px-3">
            The all-in-one solution for modern gyms and fitness centers. Streamline operations, 
            boost member engagement, and grow your business with our powerful management system.
          </p>
          
         
          
          <div className=" row row-cols-4 cols-sm-4 g-3">
            {stats.map((stat, index) => (
              <Col key={index}>
                <div className="hero-stat text-center">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </Col>
            ))}
          </div>
        </div>
      </Col>
      <Col lg={6}>
        <div className=" h-100 d-flex align-items-center justify-content-center">
          <div className="hero-image-wrapper position-relative overflow-hidden rounded-4 shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="Modern Gym" 
              className="hero-image img-fluid w-100"
            />
            <div className="hero-image-overlay position-absolute top-0 start-0 w-100 h-100"></div>
          </div>
        </div>
      </Col>
    </Row>
    
    <div className="scroll-indicator position-absolute bottom-0 start-50 translate-middle-x">
      <FiChevronDown className="fs-3" />
    </div>
  </Container>
</section>

      {/* Features Section */}
      <section id="features" className="features-section mt-0">
        <Container>
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-badge">
              <FaMedal className="badge-icon" /> Powerful Features
            </div>
            <h2>Everything You Need to <span className="highlight">Manage Your Gym</span></h2>
            <p>Comprehensive tools designed specifically for fitness centers and gyms</p>
          </motion.div>

          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div 
                className="feature-card" 
                key={index}
                variants={itemVariants}
                whileHover={{ y: -15 }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column">
                    <motion.div 
                      className="feature-icon-container"
                      style={{ 
                        background: hoveredFeature === index ? feature.color : feature.bg,
                        color: hoveredFeature === index ? 'white' : feature.color
                      }}
                      animate={{ rotate: hoveredFeature === index ? 10 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <Card.Title>{feature.title}</Card.Title>
                    <Card.Text className="mt-auto">{feature.description}</Card.Text>
                    <motion.div 
                      className="feature-arrow"
                      animate={{ x: hoveredFeature === index ? 5 : 0 }}
                    >
                      <FiArrowRight />
                    </motion.div>
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="benefits-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="section-badge">
                  <FaTrophy className="badge-icon" /> Why Choose Us
                </div>
                <h2>Why <span className="highlight">FitManager Pro</span> Stands Out</h2>
                <p>Our gym management system is designed to help you save time, increase revenue, and provide an exceptional experience for your members.</p>
                
                <div className="benefits-list">
                  {benefits.map((benefit, index) => (
                    <motion.div 
                      className="benefit-item"
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ x: 10 }}
                    >
                      <FiCheck className="check-icon" />
                      <span>{benefit}</span>
                    </motion.div>
                  ))}
                </div>
                
                <Button variant="primary" className="mt-4">
                  See All Benefits
                  <FiArrowRight className="btn-icon" />
                </Button>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div
                className="benefits-visual"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="stats-container">
                  <motion.div 
                    className="stat-card"
                    whileHover={{ y: -10, scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="stat-icon">
                      <FaTrophy />
                    </div>
                    <div className="stat-number">40%</div>
                    <div className="stat-label">Member Retention Increase</div>
                  </motion.div>
                  
                  <motion.div 
                    className="stat-card"
                    whileHover={{ y: -10, scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="stat-icon">
                      <FaFire />
                    </div>
                    <div className="stat-number">15+</div>
                    <div className="stat-label">Hours Saved Weekly</div>
                  </motion.div>
                  
                  <motion.div 
                    className="stat-card"
                    whileHover={{ y: -10, scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="stat-icon">
                      <FaChartLine />
                    </div>
                    <div className="stat-number">99.9%</div>
                    <div className="stat-label">System Uptime</div>
                  </motion.div>
                </div>
                
                <motion.div 
                  className="testimonial-preview"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="quote-icon">
                    <FaQuoteLeft />
                  </div>
                  <p>"This system has transformed how we run our gym. Member retention has increased by 40% since implementation."</p>
                  <div className="author">
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Author" className="author-avatar" />
                    <div className="author-info">
                      <div className="author-name">Rahul Sharma</div>
                      <div className="author-role">Gym Owner</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <Container>
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-badge">
              <FaStar className="badge-icon" /> Client Testimonials
            </div>
            <h2>What Our <span className="highlight">Clients Say</span></h2>
            <p>Join thousands of satisfied gym owners and managers</p>
          </motion.div>

          <div className="testimonials-container">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                className="testimonial-card"
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <div className="testimonial-header">
                  <img src={testimonial.avatar} alt={testimonial.name} className="testimonial-avatar" />
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
                <div className="quote-icon">
                  <FaQuoteLeft />
                </div>
                <p className="testimonial-content">{testimonial.content}</p>
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={i < testimonial.rating ? "star filled" : "star"} 
                    />
                  ))}
                </div>
                <div className="quote-icon right">
                  <FaQuoteRight />
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <Container>
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-badge">
              <FaCreditCard className="badge-icon" /> Simple Pricing
            </div>
            <h2>Choose Your <span className="highlight">Perfect Plan</span></h2>
            <p>Flexible pricing options for gyms of all sizes</p>
          </motion.div>

          <div className="pricing-container">
            {pricingPlans.map((plan, index) => (
              <motion.div 
                className={`pricing-card ${plan.popular ? 'popular' : ''}`}
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -15 }}
              >
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                <div className="pricing-header">
                  <h3>{plan.name}</h3>
                  <div className="pricing-price">
                    <span className="price">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                </div>
                <div className="pricing-features">
                  <ul>
                    {plan.features.map((feature, i) => (
                      <li key={i}>
                        <FiCheck className="check-icon" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  variant={plan.popular ? "primary" : "outline-primary"} 
                  className="pricing-btn"
                >
                  Get Started
                </Button>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="cta-badge">Ready to get started?</div>
            <h2>Transform Your Gym <span className="highlight">Today</span></h2>
            <p>Join thousands of gym owners who have already streamlined their operations with FitManager Pro.</p>
            <div className="cta-buttons">
              <Button variant="light" size="lg" className="mr-3">
                Start Free Trial
                <FiArrowRight className="btn-icon" />
              </Button>
              <Button variant="outline-light" size="lg">
                Schedule a Demo
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="footer">
        <Container>
          <Row>
            <Col lg={4} md={6}>
              <div className="footer-brand">
                <div className="brand-container">
                  <div className="brand-icon-wrapper">
                    <FaDumbbell className="brand-icon" />
                  </div>
                  <span>FitManager Pro</span>
                </div>
                <p>The all-in-one gym management solution for modern fitness centers.</p>
                <div className="social-icons">
                  <a href="#"><FaFacebook /></a>
                  <a href="#"><FaTwitter /></a>
                  <a href="#"><FaInstagram /></a>
                  <a href="#"><FaYoutube /></a>
                </div>
              </div>
            </Col>
            <Col lg={2} md={6}>
              <div className="footer-links">
                <h5>Product</h5>
                <ul>
                  <li><a href="#">Features</a></li>
                  <li><a href="#">Pricing</a></li>
                  <li><a href="#">Integrations</a></li>
                  <li><a href="#">Updates</a></li>
                </ul>
              </div>
            </Col>
            <Col lg={2} md={6}>
              <div className="footer-links">
                <h5>Company</h5>
                <ul>
                  <li><a href="#">About Us</a></li>
                  <li><a href="#">Careers</a></li>
                  <li><a href="#">Blog</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </div>
            </Col>
            <Col lg={2} md={6}>
              <div className="footer-links">
                <h5>Support</h5>
                <ul>
                  <li><a href="#">Help Center</a></li>
                  <li><a href="#">Documentation</a></li>
                  <li><a href="#">Community</a></li>
                  <li><a href="#">Status</a></li>
                </ul>
              </div>
            </Col>
            <Col lg={2} md={6}>
              <div className="footer-links">
                <h5>Legal</h5>
                <ul>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Cookie Policy</a></li>
                  <li><a href="#">Security</a></li>
                </ul>
              </div>
            </Col>
          </Row>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} FitManager Pro. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LendingPage;