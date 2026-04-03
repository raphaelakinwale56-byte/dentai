import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'dental-secret-key-2026';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Mock Database
  let appointments = [
    { id: '1', patientName: 'John Doe', service: 'Cleaning', time: '2026-04-02T10:00:00Z', duration: '30', status: 'confirmed', phone: '555-0101' },
    { id: '2', patientName: 'Jane Smith', service: 'Braces Checkup', time: '2026-04-02T11:30:00Z', duration: '45', status: 'confirmed', phone: '555-0102' },
    { id: '3', patientName: 'Robert Brown', service: 'Root Canal', time: '2026-04-01T14:00:00Z', duration: '60', status: 'missed', phone: '555-0103' },
    { id: '4', patientName: 'Alice Johnson', service: 'Whitening', time: '2026-04-02T13:00:00Z', duration: '30', status: 'confirmed', phone: '555-0104' },
    { id: '5', patientName: 'Michael Wilson', service: 'Consultation', time: '2026-04-02T15:30:00Z', duration: '15', status: 'pending', phone: '555-0105' },
    { id: '6', patientName: 'Sarah Davis', service: 'Cleaning', time: '2026-04-01T09:00:00Z', duration: '30', status: 'missed', phone: '555-0106' },
  ];

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  // API Routes
  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // Mock login
    if (email === 'admin@clinic.com' && password === 'password') {
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      return res.json({ success: true, user: { email, name: 'Clinic Admin' } });
    }
    res.status(401).json({ error: 'Invalid credentials' });
  });

  app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/user', authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  app.get('/api/appointments', authenticateToken, (req, res) => {
    res.json(appointments);
  });

  app.post('/api/appointments', authenticateToken, (req, res) => {
    const newAppointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientName: req.body.patientName || 'Unknown',
      service: req.body.service || 'General Consultation',
      time: req.body.time || new Date().toISOString(),
      duration: req.body.duration || '30',
      phone: req.body.phone || '',
      email: req.body.email || '',
      notes: req.body.notes || '',
      status: req.body.status || 'confirmed'
    };
    appointments.push(newAppointment);
    res.status(201).json(newAppointment);
  });

  app.post('/api/appointments/bulk', authenticateToken, (req, res) => {
    const newItems = req.body.map((item: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      patientName: item.patientName || 'Unknown',
      service: item.service || 'General Consultation',
      time: item.time || new Date().toISOString(),
      duration: item.duration || '30',
      phone: item.phone || '',
      email: item.email || '',
      notes: item.notes || '',
      status: item.status || 'confirmed'
    }));
    appointments = [...appointments, ...newItems];
    res.status(201).json({ count: newItems.length, items: newItems });
  });

  app.delete('/api/appointments/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    appointments = appointments.filter(a => a.id !== id);
    res.json({ success: true });
  });

  app.patch('/api/appointments/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...req.body };
      res.json(appointments[index]);
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  });

  app.post('/api/reminders/send', authenticateToken, (req, res) => {
    const { appointmentId, type } = req.body;
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    console.log(`Sending ${type} reminder to ${appointment.patientName} at ${appointment.phone}`);
    res.json({ success: true, message: `${type} reminder sent successfully` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
