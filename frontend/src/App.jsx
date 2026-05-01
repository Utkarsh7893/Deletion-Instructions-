import React, { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [formData, setFormData] = useState({
    project: '',
    email: '',
    reason: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  // Three.js Background Effect
  useEffect(() => {
    if (!window.THREE) return;
    
    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new window.THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Create particles
    const particlesGeometry = new window.THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new window.THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new window.THREE.PointsMaterial({
      size: 0.015,
      color: 0x60A5FA,
      transparent: true,
      opacity: 0.8,
      blending: window.THREE.AdditiveBlending
    });

    const particlesMesh = new window.THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Add ambient soft glow (Sphere)
    const sphereGeometry = new window.THREE.SphereGeometry(2, 32, 32);
    const sphereMaterial = new window.THREE.MeshBasicMaterial({
      color: 0x4F46E5,
      wireframe: true,
      transparent: true,
      opacity: 0.05
    });
    const sphere = new window.THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    camera.position.z = 3;

    // Animation loop
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event) => {
      mouseX = (event.clientX - windowHalfX);
      mouseY = (event.clientY - windowHalfY);
    };
    document.addEventListener('mousemove', onDocumentMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      
      targetX = mouseX * 0.001;
      targetY = mouseY * 0.001;
      
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;
      
      particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
      particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
      
      sphere.rotation.y -= 0.002;
      sphere.rotation.x -= 0.001;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      document.getElementById('canvas-container').innerHTML = '';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: formData.project,
          email: formData.email,
          reason: formData.reason
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessData(data);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect to the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div id="canvas-container"></div>
      
      <div className="app-container">
        <div className="glass-card">
          
          {!successData ? (
            <>
              <div className="header">
                <h1>Data Deletion Request</h1>
                <p>Submit a request to permanently delete your account and associated data from our projects.</p>
              </div>

              {error && (
                <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="project">Select Project</label>
                  <select 
                    name="project" 
                    id="project"
                    className="form-control"
                    value={formData.project}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>-- Choose a project --</option>
                    <option value="lifeStream">LifeStream</option>
                    <option value="agroSenseIoT">AgroSenseIoT</option>
                    <option value="Centsible">Centsible</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Registered Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    id="email"
                    className="form-control"
                    placeholder="Enter the email associated with your account"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reason">Reason for Deletion / Feedback</label>
                  <textarea 
                    name="reason" 
                    id="reason"
                    className="form-control"
                    placeholder="Please tell us why you are leaving and any issues you faced..."
                    value={formData.reason}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="checkbox-group">
                  <input 
                    type="checkbox" 
                    name="agreeTerms" 
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="agreeTerms">
                    I understand that this action is irreversible. All my personal data, preferences, and history will be permanently deleted.
                  </label>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? <div className="spinner"></div> : 'Submit Deletion Request'}
                </button>
              </form>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Alternatively, for manual deletion requests, you can email us directly at: <br/>
                  <a href="mailto:jaycob4498@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>jaycob4498@gmail.com</a>
                </p>
              </div>
            </>
          ) : (
            <div className="success-message">
              <div className="success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              
              <h2 style={{ marginBottom: '1rem', fontSize: '1.75rem', fontWeight: '700' }}>Request Submitted</h2>
              
              <p className="instruction-text">
                Thank you for being a valuable user. We have received your data deletion request.
              </p>

              <div className="ticket-box">
                <h3>Your Ticket ID</h3>
                <div className="ticket-number">{successData.ticketId}</div>
              </div>

              <p className="instruction-text">
                Your request will be processed and resolved within <strong style={{ color: '#E2E8F0' }}>48 to 72 hours</strong>.
              </p>

              <p className="instruction-text" style={{ fontSize: '0.85rem', marginTop: '2rem' }}>
                If you have any further questions, please contact <br/>
                <span className="email-highlight">jaycob4498@gmail.com</span>
              </p>

              <button 
                className="btn-submit" 
                style={{ marginTop: '1.5rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}
                onClick={() => window.location.reload()}
              >
                Submit Another Request
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default App;
