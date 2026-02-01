import React, { useState, useEffect, useRef } from 'react';

// API Configuration
const API_KEYS = {
  openrouter: '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',
  gemini: 'AIzaSyD8j6OwH2sj33Hp9Tcrji4fJV2ssuOKEuM',
};

// Parts Database
const PARTS = {
  microcontrollers: [
    { id: 'arduino-uno', name: 'Arduino Uno R3', price: 27.60, color: '#0066CC' },
    { id: 'arduino-nano', name: 'Arduino Nano', price: 24.90, color: '#0055AA' },
    { id: 'esp32', name: 'ESP32 DevKit', price: 9.99, color: '#E74C3C', wifi: true },
    { id: 'esp8266', name: 'ESP8266 NodeMCU', price: 6.99, color: '#2C3E50', wifi: true },
    { id: 'rpi-pico', name: 'Raspberry Pi Pico', price: 4.00, color: '#75A928' },
  ],
  sensors: [
    { id: 'hc-sr04', name: 'HC-SR04 Ultrasonic', price: 3.95, color: '#00BCD4' },
    { id: 'ir-line', name: 'IR Line Sensor', price: 1.50, color: '#333333' },
    { id: 'dht11', name: 'DHT11 Temp/Humidity', price: 4.95, color: '#2196F3' },
    { id: 'dht22', name: 'DHT22 Temp/Humidity', price: 9.95, color: '#ECEFF1' },
    { id: 'bme280', name: 'BME280 Environment', price: 14.95, color: '#9C27B0' },
    { id: 'mpu6050', name: 'MPU6050 IMU', price: 6.95, color: '#673AB7' },
    { id: 'pir', name: 'PIR Motion Sensor', price: 3.95, color: '#4CAF50' },
    { id: 'soil', name: 'Soil Moisture Sensor', price: 2.95, color: '#795548' },
  ],
  actuators: [
    { id: 'dc-motor', name: 'DC Motor 3-6V', price: 1.95, color: '#9E9E9E' },
    { id: 'servo-sg90', name: 'SG90 Micro Servo', price: 3.95, color: '#1976D2' },
    { id: 'servo-mg996', name: 'MG996R Servo', price: 12.95, color: '#37474F' },
    { id: 'stepper', name: '28BYJ-48 Stepper', price: 4.95, color: '#03A9F4' },
    { id: 'led-5mm', name: 'LED 5mm Pack', price: 2.00, color: '#F44336' },
    { id: 'ws2812b', name: 'WS2812B LED Strip', price: 9.95, color: '#E91E63' },
    { id: 'buzzer', name: 'Piezo Buzzer', price: 1.50, color: '#424242' },
    { id: 'relay', name: 'Relay Module', price: 3.95, color: '#1565C0' },
    { id: 'pump', name: 'Mini Water Pump', price: 2.95, color: '#00ACC1' },
  ],
  drivers: [
    { id: 'l298n', name: 'L298N Motor Driver', price: 6.95, color: '#D32F2F' },
    { id: 'l293d', name: 'L293D Shield', price: 14.95, color: '#1976D2' },
    { id: 'uln2003', name: 'ULN2003 Stepper Driver', price: 2.95, color: '#0288D1' },
    { id: 'pca9685', name: 'PCA9685 PWM Driver', price: 6.95, color: '#0277BD' },
  ],
  displays: [
    { id: 'lcd1602', name: 'LCD 16x2 I2C', price: 8.95, color: '#388E3C' },
    { id: 'oled', name: 'OLED 0.96" 128x64', price: 7.95, color: '#212121' },
    { id: 'tft18', name: 'TFT 1.8" Display', price: 9.95, color: '#455A64' },
  ],
  communication: [
    { id: 'hc05', name: 'HC-05 Bluetooth', price: 7.95, color: '#1E88E5' },
    { id: 'nrf24', name: 'NRF24L01 RF', price: 3.95, color: '#43A047' },
    { id: 'gps', name: 'GPS NEO-6M', price: 14.95, color: '#00695C' },
  ],
  power: [
    { id: 'battery-9v', name: '9V Battery Clip', price: 1.50, color: '#FFC107' },
    { id: 'battery-4aa', name: '4xAA Battery Holder', price: 2.95, color: '#37474F' },
    { id: 'lipo', name: 'LiPo 3.7V 2000mAh', price: 12.50, color: '#FF5722' },
    { id: 'buck', name: 'Buck Converter', price: 4.95, color: '#1565C0' },
  ],
  prototyping: [
    { id: 'breadboard', name: 'Breadboard Full', price: 5.95, color: '#FAFAFA' },
    { id: 'breadboard-half', name: 'Breadboard Half', price: 4.00, color: '#F5F5F5' },
    { id: 'jumpers-mm', name: 'Jumper Wires M-M', price: 3.95, color: '#FF9800' },
    { id: 'jumpers-mf', name: 'Jumper Wires M-F', price: 3.95, color: '#4CAF50' },
    { id: 'resistors', name: 'Resistor Kit 500pc', price: 7.95, color: '#8D6E63' },
  ],
  mechanical: [
    { id: 'chassis-2wd', name: '2WD Robot Chassis', price: 14.95, color: '#FFB300' },
    { id: 'chassis-4wd', name: '4WD Robot Chassis', price: 19.95, color: '#F57C00' },
    { id: 'wheels', name: 'Wheels 65mm Pair', price: 3.95, color: '#424242' },
  ],
};

const getAllParts = () => Object.values(PARTS).flat();

const TEMPLATES = [
  { id: 'line-follower', name: 'Line Following Robot', icon: '🚗', diff: 'Beginner', time: '2-3h' },
  { id: 'obstacle-avoider', name: 'Obstacle Avoider', icon: '🤖', diff: 'Beginner', time: '2-3h' },
  { id: 'weather-station', name: 'Weather Station', icon: '🌤️', diff: 'Intermediate', time: '3-4h' },
  { id: 'smart-plant', name: 'Smart Plant Monitor', icon: '🌱', diff: 'Beginner', time: '2h' },
  { id: 'robot-arm', name: 'Robotic Arm', icon: '🦾', diff: 'Advanced', time: '5-6h' },
  { id: 'bluetooth-car', name: 'Bluetooth RC Car', icon: '🎮', diff: 'Intermediate', time: '3-4h' },
  { id: 'custom', name: 'Custom Project', icon: '💡', diff: 'Varies', time: 'Varies' },
];

const WIRE_COLORS = { VCC: '#EF4444', GND: '#374151', DIGITAL: '#3B82F6', ANALOG: '#10B981', PWM: '#F59E0B', SDA: '#8B5CF6', SCL: '#EC4899' };

// AI Service Functions
async function callOpenRouter(prompt, system = '') {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEYS.openrouter}` },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [...(system ? [{ role: 'system', content: system }] : []), { role: 'user', content: prompt }],
        max_tokens: 4000,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (e) { console.error('OpenRouter error:', e); return ''; }
}

async function callGemini(prompt, imageBase64 = null) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEYS.gemini}`;
    const parts = [{ text: prompt }];
    if (imageBase64) parts.unshift({ inline_data: { mime_type: 'image/jpeg', data: imageBase64 } });
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts }] }) });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (e) { console.error('Gemini error:', e); return ''; }
}

async function generateBuildPlan(inventory, goal, mode) {
  const inv = inventory.map(p => `${p.qty}x ${p.name}`).join(', ') || 'No parts yet';
  const prompt = mode === 'forward'
    ? `Create a build plan for: "${goal}". Parts available: ${inv}. Return ONLY valid JSON: {"feasible":true,"projectName":"name","summary":"description","difficulty":"Beginner/Intermediate/Advanced","estimatedTime":"X hours","assemblySteps":[{"step":1,"title":"title","instruction":"detailed instruction","components":["part names"],"checkpoint":"verification","debugHint":"troubleshooting tip"}],"wiring":[{"from":"Component.Pin","to":"Component.Pin","wireType":"VCC/GND/DIGITAL/ANALOG"}],"pinMap":{"D2":"description"},"firmware":{"filename":"sketch.ino","libraries":["lib names"],"code":"// Arduino code"},"testChecklist":[{"test":"what to test","expected":"expected result","ifFails":"what to check"}]}`
    : `Create shopping list for: "${goal}". Return ONLY valid JSON: {"projectName":"name","summary":"description","difficulty":"level","estimatedTime":"X hours","totalCost":{"min":0,"recommended":0},"materials":{"essential":[{"name":"part name","qty":1,"price":10.00,"purpose":"why needed"}],"optional":[]},"assemblySteps":[],"wiring":[],"firmware":{"filename":"","code":"","libraries":[]}}`;

  const text = await callOpenRouter(prompt, 'Expert hardware engineer. Return ONLY valid JSON, no markdown.');
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (e) { console.error('Parse error:', e); }
  
  // Fallback plan
  return {
    feasible: true, projectName: goal || 'Custom Project', summary: 'AI-generated build plan',
    difficulty: 'Intermediate', estimatedTime: '3-4 hours',
    assemblySteps: [{ step: 1, title: 'Setup', instruction: 'Prepare your workspace and components', components: [], checkpoint: 'All parts ready', debugHint: 'Verify all parts present' }],
    wiring: [], pinMap: {}, firmware: { filename: 'sketch.ino', libraries: [], code: '// Code here\nvoid setup() {}\nvoid loop() {}' },
    testChecklist: [{ test: 'Power test', expected: 'LED lights up', ifFails: 'Check connections' }],
    totalCost: { min: 30, recommended: 50 }, materials: { essential: [], optional: [] }
  };
}

// Main App Component
export default function HardwareBuilderPro() {
  const [mode, setMode] = useState('forward');
  const [step, setStep] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [template, setTemplate] = useState(null);
  const [customDesc, setCustomDesc] = useState('');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ stage: '', pct: 0 });
  const [asmStep, setAsmStep] = useState(0);
  const [tab, setTab] = useState('assembly');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('microcontrollers');
  const [showAgent, setShowAgent] = useState(true);
  const [agentMsgs, setAgentMsgs] = useState([{ role: 'agent', text: '👋 Hi! I\'m your AI build assistant. What project are we working on today?', ts: Date.now() }]);
  const [agentInput, setAgentInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [show3D, setShow3D] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const addPart = (p) => setInventory(inv => {
    const exists = inv.find(x => x.id === p.id);
    return exists ? inv.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x) : [...inv, { ...p, qty: 1 }];
  });

  const removePart = (id) => setInventory(inv => {
    const p = inv.find(x => x.id === id);
    return p?.qty > 1 ? inv.map(x => x.id === id ? { ...x, qty: x.qty - 1 } : x) : inv.filter(x => x.id !== id);
  });

  const generate = async () => {
    setLoading(true);
    setStep(mode === 'forward' ? 2 : 1);
    const stages = ['Analyzing requirements...', 'Planning architecture...', 'Generating steps...', 'Creating wiring...', 'Writing code...'];
    for (let i = 0; i < stages.length; i++) {
      setProgress({ stage: stages[i], pct: (i + 1) * 20 });
      await new Promise(r => setTimeout(r, 400));
    }
    const goal = template?.id === 'custom' ? customDesc : template?.name || customDesc;
    const result = await generateBuildPlan(inventory, goal, mode);
    setPlan(result);
    setLoading(false);
    setAgentMsgs(m => [...m, { role: 'agent', text: `🎉 Your "${result.projectName}" plan is ready! ${result.assemblySteps?.length || 0} steps to complete. Ready to start?`, ts: Date.now() }]);
  };

  const sendAgent = async () => {
    if (!agentInput.trim()) return;
    setAgentMsgs(m => [...m, { role: 'user', text: agentInput, ts: Date.now() }]);
    const msg = agentInput;
    setAgentInput('');
    setThinking(true);
    const ctx = `Project: ${plan?.projectName || 'none'}. Inventory: ${inventory.map(p => p.name).join(', ') || 'empty'}. Current step: ${plan?.assemblySteps?.[asmStep]?.title || 'none'}`;
    const resp = await callOpenRouter(msg, `You're a helpful hardware assistant. Context: ${ctx}. Be specific and helpful.`);
    setAgentMsgs(m => [...m, { role: 'agent', text: resp || 'I can help with that! What specifically would you like to know?', ts: Date.now() }]);
    setThinking(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowUpload(false);
    setAgentMsgs(m => [...m, { role: 'agent', text: '📸 Analyzing your components...', ts: Date.now() }]);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const b64 = ev.target.result.split(',')[1];
      const partIds = getAllParts().map(p => p.id).join(', ');
      const resp = await callGemini(`Identify electronic components in this image. Match to these IDs: ${partIds}. Return JSON array: [{"id":"part-id","qty":1}]`, b64);
      try {
        const match = resp.match(/\[[\s\S]*\]/);
        const detected = match ? JSON.parse(match[0]) : [];
        detected.forEach(d => {
          const part = getAllParts().find(p => p.id === d.id);
          if (part) addPart(part);
        });
        setAgentMsgs(m => [...m, { role: 'agent', text: detected.length ? `✓ Found ${detected.length} components and added them!` : 'Could not identify parts. Try a clearer photo.', ts: Date.now() }]);
      } catch {
        setAgentMsgs(m => [...m, { role: 'agent', text: 'Had trouble analyzing. Please add parts manually.', ts: Date.now() }]);
      }
    };
    reader.readAsDataURL(file);
  };

  const parts = search ? getAllParts().filter(p => p.name.toLowerCase().includes(search.toLowerCase())) : PARTS[category] || [];
  const steps = mode === 'forward' ? ['Inventory', 'Goal', 'Build Plan'] : ['Idea', 'Materials'];

  return (
    <div style={{ minHeight: '100vh', background: '#0B0F19', fontFamily: 'system-ui, sans-serif', color: '#E5E7EB', display: 'flex', flexDirection: 'column' }}>
      {/* Background Grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.04) 1px, transparent 0)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{ padding: '12px 24px', background: 'rgba(11,15,25,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>⚡</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Hardware Builder Pro</div>
              <div style={{ fontSize: 10, color: '#6B7280', letterSpacing: '0.05em' }}>AI-POWERED PROTOTYPING</div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 3 }}>
            <button onClick={() => { setMode('forward'); setStep(0); setPlan(null); }} style={{ padding: '8px 16px', background: mode === 'forward' ? 'linear-gradient(135deg, #3B82F6, #6366F1)' : 'transparent', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: mode === 'forward' ? 600 : 400 }}>📦 Parts → Build</button>
            <button onClick={() => { setMode('reverse'); setStep(0); setPlan(null); }} style={{ padding: '8px 16px', background: mode === 'reverse' ? 'linear-gradient(135deg, #10B981, #06B6D4)' : 'transparent', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: mode === 'reverse' ? 600 : 400 }}>💡 Idea → Shop</button>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', gap: 4 }}>
            {steps.map((s, i) => (
              <button key={s} onClick={() => i < step && setStep(i)} style={{ padding: '8px 14px', background: i === step ? 'rgba(59,130,246,0.15)' : i < step ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', border: i === step ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent', borderRadius: 6, color: i <= step ? '#fff' : '#6B7280', cursor: i <= step ? 'pointer' : 'default', fontSize: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: i < step ? '#10B981' : i === step ? '#3B82F6' : 'rgba(255,255,255,0.1)', marginRight: 6, fontSize: 10, fontWeight: 700 }}>{i < step ? '✓' : i + 1}</span>
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 1, padding: 24, overflowY: 'auto', marginRight: showAgent ? 360 : 0, transition: 'margin 0.3s' }}>
          
          {/* Forward Mode - Step 0: Inventory */}
          {mode === 'forward' && step === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>Parts Library</h2>
                <p style={{ color: '#9CA3AF', margin: '0 0 16px', fontSize: 14 }}>Click parts to add to inventory</p>
                
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input type="text" placeholder="Search parts..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 13 }} />
                  <button onClick={() => setShowUpload(true)} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #10B981, #06B6D4)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>📷 Scan</button>
                </div>

                {!search && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                    {Object.keys(PARTS).map(cat => (
                      <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '6px 12px', background: category === cat ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', border: category === cat ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent', borderRadius: 6, color: category === cat ? '#60A5FA' : '#9CA3AF', cursor: 'pointer', fontSize: 11, textTransform: 'capitalize' }}>{cat}</button>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
                  {parts.map(p => {
                    const inInv = inventory.find(x => x.id === p.id);
                    return (
                      <button key={p.id} onClick={() => addPart(p)} style={{ padding: 14, background: inInv ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', border: inInv ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 10, cursor: 'pointer', textAlign: 'left', position: 'relative' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: p.color, marginBottom: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, color: '#F3F4F6' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>${p.price.toFixed(2)}</div>
                        {inInv && <span style={{ position: 'absolute', top: 8, right: 8, background: '#10B981', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>×{inInv.qty}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inventory Sidebar */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', padding: 20, height: 'fit-content', position: 'sticky', top: 100 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>📦 Your Inventory</h3>
                {inventory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: '#6B7280' }}>
                    <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>📭</div>
                    <p style={{ margin: 0, fontSize: 13 }}>Add parts to get started</p>
                  </div>
                ) : (
                  <>
                    <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 16 }}>
                      {inventory.map(p => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 6 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 4, background: p.color }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 500 }}>{p.name}</div>
                            <div style={{ fontSize: 10, color: '#6B7280' }}>×{p.qty} · ${(p.price * p.qty).toFixed(2)}</div>
                          </div>
                          <button onClick={() => removePart(p.id)} style={{ width: 22, height: 22, background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 4, color: '#EF4444', cursor: 'pointer' }}>−</button>
                          <button onClick={() => addPart(p)} style={{ width: 22, height: 22, background: 'rgba(16,185,129,0.15)', border: 'none', borderRadius: 4, color: '#10B981', cursor: 'pointer' }}>+</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: 14, background: 'rgba(59,130,246,0.1)', borderRadius: 8, marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>Total</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>${inventory.reduce((s, p) => s + p.price * p.qty, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
                <button onClick={() => setStep(1)} disabled={!inventory.length} style={{ width: '100%', padding: 14, background: inventory.length ? 'linear-gradient(135deg, #3B82F6, #6366F1)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: inventory.length ? 'pointer' : 'not-allowed' }}>Continue →</button>
              </div>
            </div>
          )}

          {/* Forward Mode - Step 1: Goal */}
          {mode === 'forward' && step === 1 && (
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>What Are You Building?</h2>
              <p style={{ color: '#9CA3AF', margin: '0 0 20px', fontSize: 14 }}>Select a template or describe your project</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t)} style={{ padding: 16, background: template?.id === t.id ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', border: template?.id === t.id ? '2px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#F3F4F6' }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: '#6B7280' }}>{t.diff} · {t.time}</div>
                  </button>
                ))}
              </div>

              {template?.id === 'custom' && (
                <textarea value={customDesc} onChange={e => setCustomDesc(e.target.value)} placeholder="Describe your project in detail..." style={{ width: '100%', height: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 14, color: '#fff', fontSize: 13, resize: 'none', marginBottom: 20 }} />
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(0)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13 }}>← Back</button>
                <button onClick={generate} disabled={!template || (template.id === 'custom' && !customDesc.trim())} style={{ flex: 1, padding: 14, background: template ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: template ? 'pointer' : 'not-allowed' }}>⚡ Generate Build Plan</button>
              </div>
            </div>
          )}

          {/* Forward Mode - Step 2: Build Plan */}
          {mode === 'forward' && step === 2 && (
            loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                <div style={{ width: 64, height: 64, border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 24 }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ fontSize: 15, color: '#3B82F6', marginBottom: 8 }}>{progress.stage}</div>
                <div style={{ width: 200, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <div style={{ width: `${progress.pct}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)', borderRadius: 2, transition: 'width 0.3s' }} />
                </div>
              </div>
            ) : plan && (
              <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                {/* Project Header */}
                <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(16,185,129,0.15)', borderRadius: 12, fontSize: 11, color: '#10B981', fontWeight: 600, marginBottom: 12 }}>✓ Ready to Build</span>
                      <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px' }}>{plan.projectName}</h2>
                      <p style={{ color: '#9CA3AF', margin: 0, fontSize: 14 }}>{plan.summary}</p>
                      <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                        <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: 12 }}>📊 {plan.difficulty}</span>
                        <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: 12 }}>⏱️ {plan.estimatedTime}</span>
                        <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: 12 }}>🔧 {plan.assemblySteps?.length || 0} steps</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setShow3D(!show3D)} style={{ padding: '8px 14px', background: show3D ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12 }}>🎮 3D View</button>
                      <button onClick={() => setStep(1)} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12 }}>← Edit</button>
                    </div>
                  </div>
                </div>

                {/* 3D Viewer */}
                {show3D && <Viewer3D step={asmStep} data={plan.assemblySteps?.[asmStep]} />}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                  {[{ id: 'assembly', icon: '🔧', label: 'Assembly' }, { id: 'wiring', icon: '⚡', label: 'Wiring' }, { id: 'code', icon: '💻', label: 'Code' }, { id: 'tests', icon: '✅', label: 'Tests' }].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 18px', background: tab === t.id ? 'rgba(59,130,246,0.15)' : 'transparent', border: tab === t.id ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent', borderRadius: 8, color: tab === t.id ? '#60A5FA' : '#9CA3AF', cursor: 'pointer', fontSize: 12, fontWeight: tab === t.id ? 600 : 400 }}>{t.icon} {t.label}</button>
                  ))}
                </div>

                {/* Tab Content */}
                {tab === 'assembly' && <AssemblyTab steps={plan.assemblySteps || []} curr={asmStep} setCurr={setAsmStep} />}
                {tab === 'wiring' && <WiringTab wiring={plan.wiring || []} pinMap={plan.pinMap || {}} />}
                {tab === 'code' && <CodeTab fw={plan.firmware || {}} />}
                {tab === 'tests' && <TestsTab tests={plan.testChecklist || []} />}
              </div>
            )
          )}

          {/* Reverse Mode - Step 0: Idea */}
          {mode === 'reverse' && step === 0 && (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>Describe Your Project</h2>
              <p style={{ color: '#9CA3AF', margin: '0 0 20px', fontSize: 14 }}>Get a complete shopping list with prices</p>
              
              <textarea value={customDesc} onChange={e => setCustomDesc(e.target.value)} placeholder="Example: Automatic plant watering system with soil moisture sensing and phone notifications..." style={{ width: '100%', height: 140, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 16, color: '#fff', fontSize: 14, resize: 'none', lineHeight: 1.5, marginBottom: 16 }} />

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' }}>Quick Ideas</div>
                {['Automatic plant watering', 'Security camera system', 'Weather station with display', 'Robot arm sorter', 'Bluetooth RC car'].map(ex => (
                  <button key={ex} onClick={() => setCustomDesc(ex)} style={{ display: 'block', width: '100%', padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#9CA3AF', cursor: 'pointer', textAlign: 'left', fontSize: 12, marginBottom: 6 }}>💡 {ex}</button>
                ))}
              </div>

              <button onClick={generate} disabled={!customDesc.trim()} style={{ width: '100%', padding: 16, background: customDesc.trim() ? 'linear-gradient(135deg, #10B981, #06B6D4)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: customDesc.trim() ? 'pointer' : 'not-allowed' }}>🛒 Generate Shopping List</button>
            </div>
          )}

          {/* Reverse Mode - Step 1: Materials */}
          {mode === 'reverse' && step >= 1 && (
            loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                <div style={{ width: 64, height: 64, border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 24 }} />
                <div style={{ fontSize: 15, color: '#10B981' }}>{progress.stage}</div>
              </div>
            ) : plan && (
              <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(16,185,129,0.2)' }}>
                  <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>{plan.projectName}</h2>
                  <p style={{ color: '#9CA3AF', margin: '0 0 16px', fontSize: 14 }}>{plan.summary}</p>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: '#6B7280' }}>Minimum</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>${plan.totalCost?.min?.toFixed(2) || '—'}</div>
                    </div>
                    <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: '#6B7280' }}>Recommended</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#3B82F6' }}>${plan.totalCost?.recommended?.toFixed(2) || '—'}</div>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>🛒 Shopping List</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.materials?.essential?.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>{m.purpose}</div>
                      </div>
                      <div style={{ textAlign: 'right', marginRight: 10 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#10B981' }}>${m.price?.toFixed(2)}</div>
                        <div style={{ fontSize: 10, color: '#6B7280' }}>×{m.qty || 1}</div>
                      </div>
                      <button onClick={() => addPart({ id: m.name.toLowerCase().replace(/\s+/g, '-'), name: m.name, price: m.price || 0, color: '#666', qty: m.qty || 1 })} style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.15)', border: 'none', borderRadius: 6, color: '#10B981', cursor: 'pointer', fontSize: 11 }}>+ Add</button>
                    </div>
                  )) || <div style={{ color: '#6B7280', textAlign: 'center', padding: 30 }}>No materials listed</div>}
                </div>
              </div>
            )
          )}
        </div>

        {/* Agent Sidebar */}
        <AgentPanel show={showAgent} setShow={setShowAgent} msgs={agentMsgs} input={agentInput} setInput={setAgentInput} onSend={sendAgent} thinking={thinking} />
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setShowUpload(false)}>
          <div style={{ background: '#1F2937', borderRadius: 16, padding: 28, width: 420, border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18 }}>📷 Scan Components</h3>
            <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 20 }}>Upload a photo and AI will identify your parts</p>
            <input type="file" accept="image/*" onChange={handleUpload} style={{ marginBottom: 16 }} />
            <button onClick={() => setShowUpload(false)} style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// 3D Viewer Component
function Viewer3D({ step, data }) {
  const [rot, setRot] = useState({ x: -25, y: 35 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const project = (x, y, z) => {
    const rx = rot.x * Math.PI / 180, ry = rot.y * Math.PI / 180;
    const x1 = x * Math.cos(ry) - z * Math.sin(ry);
    const z1 = x * Math.sin(ry) + z * Math.cos(ry);
    const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
    return { x: 400 + x1 * 1.8, y: 200 + y1 * 1.8 };
  };

  const box = (cx, cy, cz, w, h, d, color, label, opacity = 1) => {
    const v = [
      project(cx - w/2, cy - h/2, cz - d/2), project(cx + w/2, cy - h/2, cz - d/2),
      project(cx + w/2, cy + h/2, cz - d/2), project(cx - w/2, cy + h/2, cz - d/2),
      project(cx - w/2, cy - h/2, cz + d/2), project(cx + w/2, cy - h/2, cz + d/2),
      project(cx + w/2, cy + h/2, cz + d/2), project(cx - w/2, cy + h/2, cz + d/2),
    ];
    const toRgb = (hex, mult) => {
      const m = hex.match(/[A-Fa-f0-9]{2}/g);
      if (!m) return '#666';
      return `rgb(${Math.round(parseInt(m[0], 16) * mult)},${Math.round(parseInt(m[1], 16) * mult)},${Math.round(parseInt(m[2], 16) * mult)})`;
    };
    return (
      <g style={{ opacity, transition: 'all 0.5s ease' }}>
        <polygon points={`${v[4].x},${v[4].y} ${v[5].x},${v[5].y} ${v[6].x},${v[6].y} ${v[7].x},${v[7].y}`} fill={toRgb(color, 1)} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <polygon points={`${v[0].x},${v[0].y} ${v[1].x},${v[1].y} ${v[5].x},${v[5].y} ${v[4].x},${v[4].y}`} fill={toRgb(color, 0.85)} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <polygon points={`${v[1].x},${v[1].y} ${v[2].x},${v[2].y} ${v[6].x},${v[6].y} ${v[5].x},${v[5].y}`} fill={toRgb(color, 0.7)} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        {label && <text x={(v[4].x + v[6].x) / 2} y={(v[4].y + v[6].y) / 2} fill="#fff" fontSize="9" fontWeight="600" textAnchor="middle" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{label}</text>}
      </g>
    );
  };

  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>🎮 3D Assembly View</span>
        <span style={{ fontSize: 11, color: '#6B7280' }}>Drag to rotate • Step {step + 1}</span>
      </div>
      <svg width="100%" height="380" viewBox="0 0 800 400" style={{ cursor: dragging ? 'grabbing' : 'grab', background: 'radial-gradient(ellipse at center, #1E293B, #0B0F19)', borderRadius: 8 }}
        onMouseDown={e => { setDragging(true); setLastPos({ x: e.clientX, y: e.clientY }); }}
        onMouseMove={e => { if (dragging) { setRot(r => ({ x: Math.max(-60, Math.min(60, r.x + (e.clientY - lastPos.y) * 0.4)), y: r.y + (e.clientX - lastPos.x) * 0.4 })); setLastPos({ x: e.clientX, y: e.clientY }); }}}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}>
        
        {/* Breadboard */}
        {box(0, 50, 0, 140, 8, 80, '#F5F5F0', '')}
        {box(-55, 46, -35, 120, 3, 6, '#EF4444', '')}
        {box(-55, 46, 35, 120, 3, 6, '#3B82F6', '')}
        
        {/* Arduino */}
        <g style={{ transform: `translateY(${step >= 0 ? 0 : -40}px)`, opacity: step >= 0 ? 1 : 0.3 }}>
          {box(-40, 20, 0, 50, 12, 35, '#0066CC', 'Arduino')}
          {box(-40, 14, -12, 12, 6, 10, '#888888', '')}
        </g>
        
        {/* Sensor */}
        <g style={{ transform: `translateX(${step >= 1 ? 0 : 60}px)`, opacity: step >= 1 ? 1 : 0.3 }}>
          {box(50, 25, 0, 35, 15, 20, '#00BCD4', 'Sensor')}
          <circle cx={project(42, 20, 0).x} cy={project(42, 20, 0).y} r="8" fill="#333" stroke="#555" strokeWidth="1" />
          <circle cx={project(58, 20, 0).x} cy={project(58, 20, 0).y} r="8" fill="#333" stroke="#555" strokeWidth="1" />
        </g>
        
        {/* Motor Driver */}
        <g style={{ transform: `translateY(${step >= 2 ? 0 : 50}px)`, opacity: step >= 2 ? 1 : 0.3 }}>
          {box(0, 25, -45, 30, 18, 25, '#D32F2F', 'Driver')}
          {box(0, 16, -45, 22, 6, 18, '#212121', '')}
        </g>

        {/* Wires */}
        {step >= 1 && (
          <g>
            <line x1={project(-15, 20, 0).x} y1={project(-15, 20, 0).y} x2={project(30, 25, -5).x} y2={project(30, 25, -5).y} stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={project(-15, 20, 5).x} y1={project(-15, 20, 5).y} x2={project(30, 25, 5).x} y2={project(30, 25, 5).y} stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={project(-15, 20, -5).x} y1={project(-15, 20, -5).y} x2={project(30, 25, 0).x} y2={project(30, 25, 0).y} stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        <text x="20" y="25" fill="#60A5FA" fontSize="12" fontWeight="600">Step {step + 1}: {data?.title || 'Assembly'}</text>
        <text x="20" y="385" fill="#6B7280" fontSize="10">Drag to rotate the view</text>
      </svg>
    </div>
  );
}

// Assembly Tab
function AssemblyTab({ steps, curr, setCurr }) {
  const s = steps[curr] || {};
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, border: '1px solid rgba(255,255,255,0.08)', maxHeight: 450, overflowY: 'auto' }}>
        {steps.map((st, i) => (
          <button key={i} onClick={() => setCurr(i)} style={{ width: '100%', padding: 10, background: i === curr ? 'rgba(59,130,246,0.15)' : i < curr ? 'rgba(16,185,129,0.1)' : 'transparent', border: i === curr ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent', borderRadius: 6, cursor: 'pointer', textAlign: 'left', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: i < curr ? '#10B981' : i === curr ? '#3B82F6' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{i < curr ? '✓' : i + 1}</span>
            <span style={{ fontSize: 11, color: i <= curr ? '#F3F4F6' : '#6B7280' }}>{st.title}</span>
          </button>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{curr + 1}</span>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{s.title}</h3>
        </div>
        <p style={{ fontSize: 14, color: '#D1D5DB', lineHeight: 1.6, marginBottom: 20 }}>{s.instruction}</p>
        {s.components?.length > 0 && <div style={{ marginBottom: 16 }}><div style={{ fontSize: 10, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase' }}>Components</div><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{s.components.map((c, i) => <span key={i} style={{ padding: '4px 10px', background: 'rgba(59,130,246,0.15)', borderRadius: 4, fontSize: 11, color: '#93C5FD' }}>{c}</span>)}</div></div>}
        {s.checkpoint && <div style={{ padding: 14, background: 'rgba(16,185,129,0.1)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)', marginBottom: 12 }}><div style={{ fontSize: 10, color: '#10B981', fontWeight: 700, marginBottom: 4 }}>✓ CHECKPOINT</div><div style={{ fontSize: 12, color: '#6EE7B7' }}>{s.checkpoint}</div></div>}
        {s.debugHint && <div style={{ padding: 14, background: 'rgba(245,158,11,0.1)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}><div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700, marginBottom: 4 }}>💡 IF IT FAILS</div><div style={{ fontSize: 12, color: '#FCD34D' }}>{s.debugHint}</div></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button onClick={() => setCurr(Math.max(0, curr - 1))} disabled={curr === 0} style={{ padding: '10px 20px', background: curr > 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: curr > 0 ? '#fff' : '#6B7280', cursor: curr > 0 ? 'pointer' : 'not-allowed', fontSize: 12 }}>← Previous</button>
          <button onClick={() => setCurr(Math.min(steps.length - 1, curr + 1))} disabled={curr >= steps.length - 1} style={{ padding: '10px 20px', background: curr < steps.length - 1 ? 'linear-gradient(135deg, #3B82F6, #6366F1)' : 'rgba(255,255,255,0.02)', border: 'none', borderRadius: 6, color: '#fff', cursor: curr < steps.length - 1 ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600 }}>Next →</button>
        </div>
      </div>
    </div>
  );
}

// Wiring Tab
function WiringTab({ wiring, pinMap }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 18, border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>⚡ Wire Connections</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 350, overflowY: 'auto' }}>
          {wiring.length ? wiring.map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 6, borderLeft: `4px solid ${WIRE_COLORS[w.wireType] || '#6B7280'}` }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600 }}>{w.from}</div><div style={{ fontSize: 10, color: '#6B7280' }}>Source</div></div>
              <div style={{ width: 30, height: 3, background: WIRE_COLORS[w.wireType] || '#6B7280', borderRadius: 2 }} />
              <div style={{ flex: 1, textAlign: 'right' }}><div style={{ fontSize: 12, fontWeight: 600 }}>{w.to}</div><div style={{ fontSize: 10, color: '#6B7280' }}>Dest</div></div>
            </div>
          )) : <div style={{ color: '#6B7280', fontSize: 12, textAlign: 'center', padding: 20 }}>No wiring data available</div>}
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 18, border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>📍 Pin Assignments</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {Object.entries(pinMap).length ? Object.entries(pinMap).map(([pin, desc]) => (
            <div key={pin} style={{ padding: 10, background: 'rgba(59,130,246,0.1)', borderRadius: 6, border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#60A5FA' }}>{pin}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>{desc}</div>
            </div>
          )) : <div style={{ gridColumn: '1/-1', color: '#6B7280', fontSize: 12, textAlign: 'center', padding: 20 }}>No pin assignments</div>}
        </div>
      </div>
    </div>
  );
}

// Code Tab
function CodeTab({ fw }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(fw.code || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const download = () => { const b = new Blob([fw.code || ''], { type: 'text/plain' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = fw.filename || 'sketch.ino'; a.click(); URL.revokeObjectURL(u); };
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div><h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{fw.filename || 'sketch.ino'}</h3><p style={{ color: '#6B7280', margin: 0, fontSize: 12 }}>Arduino Firmware</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={copy} style={{ padding: '8px 14px', background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: copied ? '#10B981' : '#fff', cursor: 'pointer', fontSize: 11 }}>{copied ? '✓ Copied' : '📋 Copy'}</button>
          <button onClick={download} style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>⬇️ Download</button>
        </div>
      </div>
      {fw.libraries?.length > 0 && <div style={{ padding: 12, background: 'rgba(245,158,11,0.1)', borderRadius: 8, marginBottom: 14, border: '1px solid rgba(245,158,11,0.2)' }}><div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 600, marginBottom: 6 }}>📚 Required Libraries</div><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{fw.libraries.map((l, i) => <span key={i} style={{ padding: '3px 8px', background: 'rgba(245,158,11,0.15)', borderRadius: 4, fontSize: 10, color: '#FCD34D' }}>{l}</span>)}</div></div>}
      <div style={{ background: '#0D1117', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} /><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} /><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} /></div>
        <pre style={{ margin: 0, padding: 16, fontSize: 12, lineHeight: 1.5, color: '#E6EDF3', overflow: 'auto', maxHeight: 400, fontFamily: 'monospace' }}><code>{fw.code || '// No code generated'}</code></pre>
      </div>
    </div>
  );
}

// Tests Tab
function TestsTab({ tests }) {
  const [done, setDone] = useState({});
  const toggle = i => setDone(d => ({ ...d, [i]: !d[i] }));
  const pct = tests.length ? Object.values(done).filter(Boolean).length / tests.length * 100 : 0;
  
  return (
    <div>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, marginBottom: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Verification Checklist</h3><span style={{ padding: '4px 10px', background: pct === 100 ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', borderRadius: 10, fontSize: 11, color: pct === 100 ? '#10B981' : '#60A5FA', fontWeight: 600 }}>{Object.values(done).filter(Boolean).length}/{tests.length}</span></div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#10B981' : 'linear-gradient(90deg, #3B82F6, #8B5CF6)', transition: 'width 0.3s' }} /></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tests.length ? tests.map((t, i) => (
          <div key={i} onClick={() => toggle(i)} style={{ padding: 16, background: done[i] ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', borderRadius: 8, border: done[i] ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: done[i] ? '#10B981' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff' }}>{done[i] ? '✓' : i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, textDecoration: done[i] ? 'line-through' : 'none', opacity: done[i] ? 0.7 : 1 }}>{t.test}</div>
                <div style={{ fontSize: 11, color: '#10B981', marginBottom: 6 }}>Expected: {t.expected}</div>
                <div style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', borderRadius: 4, fontSize: 10, color: '#FCA5A5' }}>If fails: {t.ifFails}</div>
              </div>
            </div>
          </div>
        )) : <div style={{ color: '#6B7280', textAlign: 'center', padding: 30 }}>No tests available</div>}
      </div>
      {pct === 100 && <div style={{ marginTop: 16, padding: 20, background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.15))', borderRadius: 10, textAlign: 'center', border: '1px solid rgba(16,185,129,0.2)' }}><div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div><h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>All Tests Passed!</h3></div>}
    </div>
  );
}

// Agent Panel
function AgentPanel({ show, setShow, msgs, input, setInput, onSend, thinking }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  return (
    <>
      <button onClick={() => setShow(!show)} style={{ position: 'fixed', right: show ? 370 : 16, bottom: 16, width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20, boxShadow: '0 4px 20px rgba(59,130,246,0.4)', zIndex: 101, transition: 'right 0.3s' }}>{show ? '→' : '🤖'}</button>
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 360, background: 'rgba(11,15,25,0.98)', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', zIndex: 100, transform: show ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s', backdropFilter: 'blur(8px)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
          <div><div style={{ fontSize: 14, fontWeight: 700 }}>Build Assistant</div><div style={{ fontSize: 11, color: '#10B981' }}>● AI Powered</div></div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '85%', padding: 12, borderRadius: 12, background: m.role === 'user' ? 'linear-gradient(135deg, #3B82F6, #6366F1)' : 'rgba(255,255,255,0.05)', borderBottomRightRadius: m.role === 'user' ? 4 : 12, borderBottomLeftRadius: m.role === 'user' ? 12 : 4 }}>
                <div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.text}</div>
              </div>
            </div>
          ))}
          {thinking && <div style={{ display: 'flex', gap: 4, padding: 12 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 1s infinite' }} /><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 1s infinite 0.2s' }} /><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 1s infinite 0.4s' }} /><style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style></div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSend()} placeholder="Ask anything..." style={{ flex: 1, padding: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 13 }} />
            <button onClick={onSend} style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>↑</button>
          </div>
        </div>
      </div>
    </>
  );
}
'rgba(59,130,246,0.15)' : 'transparent', border: tab === t.id ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent', borderRadius: 6, color: tab === t.id ? '#60A5FA' : '#9CA3AF', cursor: 'pointer', fontSize: 11, fontWeight: tab === t.id ? 600 : 400 }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'assembly' && <AssemblyTab steps={plan.assemblySteps || []} curr={asmStep} setCurr={setAsmStep} />}
      {tab === 'wiring' && <WiringTab wiring={plan.wiring || []} pinMap={plan.pinMap || {}} />}
      {tab === 'code' && <CodeTab fw={plan.firmware || {}} />}
      {tab === 'tests' && <TestsTab tests={plan.testChecklist || []} />}
    </div>
  );
}

// ============================================================================
// MATERIALS VIEW (Reverse Mode)
// ============================================================================

function MaterialsView({ plan, addPart }) {
  return (
    <div style={{ maxWidth: 850, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))', borderRadius: 14, padding: 20, marginBottom: 20, border: '1px solid rgba(16,185,129,0.2)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>{plan.projectName}</h2>
        <p style={{ color: '#9CA3AF', margin: '0 0 14px', fontSize: 13 }}>{plan.summary}</p>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
            <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 2 }}>Minimum</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>${plan.totalCost?.min?.toFixed(2) || '—'}</div>
          </div>
          <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
            <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 2 }}>Recommended</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#3B82F6' }}>${plan.totalCost?.recommended?.toFixed(2) || '—'}</div>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>🛒 Essential Components</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {plan.materials?.essential?.length > 0 ? plan.materials.essential.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>{m.purpose}</div>
            </div>
            <div style={{ textAlign: 'right', marginRight: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>${m.price?.toFixed(2) || '—'}</div>
              <div style={{ fontSize: 9, color: '#6B7280' }}>×{m.qty || 1}</div>
            </div>
            {m.link && <a href={m.link} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 10px', background: 'rgba(59,130,246,0.15)', borderRadius: 5, color: '#60A5FA', fontSize: 10, textDecoration: 'none' }}>Buy →</a>}
            <button onClick={() => addPart({ id: m.name.toLowerCase().replace(/\s+/g, '-'), name: m.name, price: m.price || 0, color: '#666', qty: 1 })} style={{ padding: '5px 10px', background: 'rgba(16,185,129,0.15)', border: 'none', borderRadius: 5, color: '#10B981', cursor: 'pointer', fontSize: 10 }}>+ Add</button>
          </div>
        )) : <div style={{ color: '#6B7280', textAlign: 'center', padding: 24 }}>No materials listed</div>}
      </div>

      {plan.materials?.optional?.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>✨ Optional Upgrades</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.materials.optional.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.01)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: '#6B7280' }}>{m.purpose}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>${m.price?.toFixed(2) || '—'}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// 3D VIEWER
// ============================================================================

function Viewer3D({ step, data }) {
  const [rot, setRot] = useState({ x: -25, y: 35 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const project = (x, y, z) => {
    const rx = rot.x * Math.PI / 180, ry = rot.y * Math.PI / 180;
    const x1 = x * Math.cos(ry) - z * Math.sin(ry);
    const z1 = x * Math.sin(ry) + z * Math.cos(ry);
    const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
    return { x: 400 + x1 * 1.8, y: 200 + y1 * 1.8 };
  };

  const toRgb = (hex, mult) => {
    const m = hex.match(/[A-Fa-f0-9]{2}/g);
    if (!m) return '#666';
    return `rgb(${Math.round(parseInt(m[0], 16) * mult)},${Math.round(parseInt(m[1], 16) * mult)},${Math.round(parseInt(m[2], 16) * mult)})`;
  };

  const box = (cx, cy, cz, w, h, d, color, label, opacity = 1) => {
    const v = [
      project(cx - w/2, cy - h/2, cz - d/2), project(cx + w/2, cy - h/2, cz - d/2),
      project(cx + w/2, cy + h/2, cz - d/2), project(cx - w/2, cy + h/2, cz - d/2),
      project(cx - w/2, cy - h/2, cz + d/2), project(cx + w/2, cy - h/2, cz + d/2),
      project(cx + w/2, cy + h/2, cz + d/2), project(cx - w/2, cy + h/2, cz + d/2),
    ];
    return (
      <g style={{ opacity, transition: 'all 0.5s ease' }}>
        <polygon points={`${v[4].x},${v[4].y} ${v[5].x},${v[5].y} ${v[6].x},${v[6].y} ${v[7].x},${v[7].y}`} fill={toRgb(color, 1)} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <polygon points={`${v[0].x},${v[0].y} ${v[1].x},${v[1].y} ${v[5].x},${v[5].y} ${v[4].x},${v[4].y}`} fill={toRgb(color, 0.85)} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <polygon points={`${v[1].x},${v[1].y} ${v[2].x},${v[2].y} ${v[6].x},${v[6].y} ${v[5].x},${v[5].y}`} fill={toRgb(color, 0.7)} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        {label && <text x={(v[4].x + v[6].x) / 2} y={(v[4].y + v[6].y) / 2} fill="#fff" fontSize="8" fontWeight="600" textAnchor="middle" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{label}</text>}
      </g>
    );
  };

  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 16, marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>🎮 3D Assembly View</span>
        <span style={{ fontSize: 10, color: '#6B7280' }}>Drag to rotate • Step {step + 1}: {data?.title || 'Assembly'}</span>
      </div>
      <svg width="100%" height="340" viewBox="0 0 800 380" style={{ cursor: dragging ? 'grabbing' : 'grab', background: 'radial-gradient(ellipse at center, #1E293B, #0B0F19)', borderRadius: 8 }}
        onMouseDown={e => { setDragging(true); setLastPos({ x: e.clientX, y: e.clientY }); }}
        onMouseMove={e => { if (dragging) { setRot(r => ({ x: Math.max(-60, Math.min(60, r.x + (e.clientY - lastPos.y) * 0.4)), y: r.y + (e.clientX - lastPos.x) * 0.4 })); setLastPos({ x: e.clientX, y: e.clientY }); }}}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}>
        
        {/* Breadboard */}
        {box(0, 50, 0, 140, 8, 80, '#F5F5F0', '')}
        {/* Power rails */}
        {box(-55, 46, -35, 120, 3, 6, '#EF4444', '')}
        {box(-55, 46, 35, 120, 3, 6, '#3B82F6', '')}
        
        {/* Breadboard holes pattern */}
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={i}>
            <circle cx={project(-50 + i * 12, 50, -15).x} cy={project(-50 + i * 12, 50, -15).y} r="2" fill="rgba(0,0,0,0.2)" />
            <circle cx={project(-50 + i * 12, 50, 0).x} cy={project(-50 + i * 12, 50, 0).y} r="2" fill="rgba(0,0,0,0.2)" />
            <circle cx={project(-50 + i * 12, 50, 15).x} cy={project(-50 + i * 12, 50, 15).y} r="2" fill="rgba(0,0,0,0.2)" />
          </g>
        ))}
        
        {/* Arduino Uno */}
        <g style={{ transform: `translateY(${step >= 0 ? 0 : -50}px)`, opacity: step >= 0 ? 1 : 0.2, transition: 'all 0.6s ease' }}>
          {box(-40, 18, 0, 55, 14, 38, '#0066CC', 'Arduino Uno')}
          {/* USB port */}
          {box(-40, 11, -14, 14, 7, 12, '#888888', '')}
          {/* Power jack */}
          {box(-40, 11, 14, 10, 8, 10, '#333333', '')}
          {/* Reset button */}
          {box(-20, 11, 5, 5, 4, 5, '#CC0000', '')}
          {/* Power LED */}
          <circle cx={project(-55, 11, 5).x} cy={project(-55, 11, 5).y} r="3" fill="#10B981">
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* TX/RX LEDs */}
          <circle cx={project(-55, 11, 0).x} cy={project(-55, 11, 0).y} r="2" fill="#F59E0B" />
          <circle cx={project(-55, 11, -5).x} cy={project(-55, 11, -5).y} r="2" fill="#F59E0B" />
        </g>
        
        {/* Ultrasonic Sensor */}
        <g style={{ transform: `translateX(${step >= 1 ? 0 : 80}px)`, opacity: step >= 1 ? 1 : 0.2, transition: 'all 0.6s ease 0.2s' }}>
          {box(55, 22, 0, 40, 18, 22, '#00BCD4', 'HC-SR04')}
          {/* Ultrasonic transducers */}
          <circle cx={project(45, 16, 0).x} cy={project(45, 16, 0).y} r="9" fill="#333" stroke="#555" strokeWidth="1" />
          <circle cx={project(65, 16, 0).x} cy={project(65, 16, 0).y} r="9" fill="#333" stroke="#555" strokeWidth="1" />
          <circle cx={project(45, 16, 0).x} cy={project(45, 16, 0).y} r="6" fill="#444" />
          <circle cx={project(65, 16, 0).x} cy={project(65, 16, 0).y} r="6" fill="#444" />
        </g>
        
        {/* Motor Driver */}
        <g style={{ transform: `translateY(${step >= 2 ? 0 : 60}px)`, opacity: step >= 2 ? 1 : 0.2, transition: 'all 0.6s ease 0.4s' }}>
          {box(0, 22, -50, 35, 20, 28, '#D32F2F', 'L298N')}
          {/* Heatsink */}
          {box(0, 12, -50, 28, 10, 22, '#212121', '')}
          {/* Screw terminals */}
          {box(-12, 22, -60, 8, 8, 8, '#4CAF50', '')}
          {box(12, 22, -60, 8, 8, 8, '#4CAF50', '')}
        </g>

        {/* DC Motor */}
        <g style={{ transform: `translateX(${step >= 3 ? 0 : -60}px)`, opacity: step >= 3 ? 1 : 0.2, transition: 'all 0.6s ease 0.6s' }}>
          {box(-75, 28, -50, 22, 16, 22, '#9E9E9E', 'Motor')}
          {/* Motor shaft */}
          {box(-88, 28, -50, 10, 4, 4, '#666666', '')}
        </g>

        {/* Wires */}
        {step >= 1 && (
          <g>
            {/* VCC - Red */}
            <path d={`M ${project(-15, 18, -10).x} ${project(-15, 18, -10).y} Q ${project(20, 5, -5).x} ${project(20, 5, -5).y} ${project(35, 22, -8).x} ${project(35, 22, -8).y}`} fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            {/* GND - Black */}
            <path d={`M ${project(-15, 18, 10).x} ${project(-15, 18, 10).y} Q ${project(20, 8, 8).x} ${project(20, 8, 8).y} ${project(35, 22, 8).x} ${project(35, 22, 8).y}`} fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
            {/* TRIG - Blue */}
            <path d={`M ${project(-15, 18, -5).x} ${project(-15, 18, -5).y} Q ${project(15, 0, -3).x} ${project(15, 0, -3).y} ${project(35, 22, -3).x} ${project(35, 22, -3).y}`} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
            {/* ECHO - Green */}
            <path d={`M ${project(-15, 18, 0).x} ${project(-15, 18, 0).y} Q ${project(15, 3, 2).x} ${project(15, 3, 2).y} ${project(35, 22, 3).x} ${project(35, 22, 3).y}`} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {step >= 2 && (
          <g>
            {/* Motor driver connections */}
            <path d={`M ${project(-15, 18, -15).x} ${project(-15, 18, -15).y} Q ${project(-10, 5, -30).x} ${project(-10, 5, -30).y} ${project(-10, 22, -38).x} ${project(-10, 22, -38).y}`} fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            <path d={`M ${project(-15, 18, -12).x} ${project(-15, 18, -12).y} Q ${project(5, 5, -28).x} ${project(5, 5, -28).y} ${project(10, 22, -38).x} ${project(10, 22, -38).y}`} fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* Labels */}
        <text x="20" y="22" fill="#60A5FA" fontSize="11" fontWeight="600">Step {step + 1}</text>
        <text x="20" y="38" fill="#9CA3AF" fontSize="10">{data?.title || 'Assembly'}</text>
        
        {/* Wire Legend */}
        <g transform="translate(620, 15)">
          <rect x="0" y="0" width="160" height="80" rx="6" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.1)" />
          <text x="10" y="16" fill="#9CA3AF" fontSize="9" fontWeight="600">WIRE COLORS</text>
          <line x1="10" y1="28" x2="28" y2="28" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" /><text x="34" y="32" fill="#E5E7EB" fontSize="8">VCC (5V/3.3V)</text>
          <line x1="10" y1="42" x2="28" y2="42" stroke="#374151" strokeWidth="3" strokeLinecap="round" /><text x="34" y="46" fill="#E5E7EB" fontSize="8">GND</text>
          <line x1="10" y1="56" x2="28" y2="56" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" /><text x="34" y="60" fill="#E5E7EB" fontSize="8">Digital Signal</text>
          <line x1="10" y1="70" x2="28" y2="70" stroke="#10B981" strokeWidth="3" strokeLinecap="round" /><text x="34" y="74" fill="#E5E7EB" fontSize="8">Analog/PWM</text>
        </g>

        <text x="20" y="365" fill="#6B7280" fontSize="9">Drag to rotate view</text>
      </svg>
    </div>
  );
}

// ============================================================================
// ASSEMBLY TAB
// ============================================================================

function AssemblyTab({ steps, curr, setCurr }) {
  const s = steps[curr] || {};
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 12, border: '1px solid rgba(255,255,255,0.06)', maxHeight: 420, overflowY: 'auto' }}>
        {steps.map((st, i) => (
          <button key={i} onClick={() => setCurr(i)} style={{ width: '100%', padding: 9, background: i === curr ? 'rgba(59,130,246,0.15)' : i < curr ? 'rgba(16,185,129,0.08)' : 'transparent', border: i === curr ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent', borderRadius: 6, cursor: 'pointer', textAlign: 'left', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: i < curr ? '#10B981' : i === curr ? '#3B82F6' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{i < curr ? '✓' : i + 1}</span>
            <span style={{ fontSize: 10, color: i <= curr ? '#F3F4F6' : '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.title}</span>
          </button>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{curr + 1}</span>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{s.title}</h3>
        </div>
        <p style={{ fontSize: 13, color: '#D1D5DB', lineHeight: 1.6, marginBottom: 16 }}>{s.instruction}</p>
        {s.components?.length > 0 && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 9, color: '#6B7280', marginBottom: 5, textTransform: 'uppercase', fontWeight: 600 }}>Components Needed</div><div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{s.components.map((c, i) => <span key={i} style={{ padding: '3px 8px', background: 'rgba(59,130,246,0.15)', borderRadius: 4, fontSize: 10, color: '#93C5FD' }}>{c}</span>)}</div></div>}
        {s.checkpoint && <div style={{ padding: 12, background: 'rgba(16,185,129,0.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)', marginBottom: 10 }}><div style={{ fontSize: 9, color: '#10B981', fontWeight: 700, marginBottom: 3, textTransform: 'uppercase' }}>✓ Checkpoint</div><div style={{ fontSize: 11, color: '#6EE7B7' }}>{s.checkpoint}</div></div>}
        {s.debugHint && <div style={{ padding: 12, background: 'rgba(245,158,11,0.08)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}><div style={{ fontSize: 9, color: '#F59E0B', fontWeight: 700, marginBottom: 3, textTransform: 'uppercase' }}>💡 If It Fails</div><div style={{ fontSize: 11, color: '#FCD34D' }}>{s.debugHint}</div></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button onClick={() => setCurr(Math.max(0, curr - 1))} disabled={curr === 0} style={{ padding: '8px 16px', background: curr > 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: curr > 0 ? '#fff' : '#6B7280', cursor: curr > 0 ? 'pointer' : 'not-allowed', fontSize: 11 }}>← Previous</button>
          <button onClick={() => setCurr(Math.min(steps.length - 1, curr + 1))} disabled={curr >= steps.length - 1} style={{ padding: '8px 16px', background: curr < steps.length - 1 ? 'linear-gradient(135deg, #3B82F6, #6366F1)' : 'rgba(255,255,255,0.02)', border: 'none', borderRadius: 6, color: '#fff', cursor: curr < steps.length - 1 ? 'pointer' : 'not-allowed', fontSize: 11, fontWeight: 600 }}>Next Step →</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WIRING TAB
// ============================================================================

function WiringTab({ wiring, pinMap }) {
  const WIRE_COLORS = { VCC: '#EF4444', '5V': '#EF4444', GND: '#374151', DIGITAL: '#3B82F6', ANALOG: '#10B981', PWM: '#F59E0B', SDA: '#8B5CF6', SCL: '#EC4899' };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>⚡ Wire Connections</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
          {wiring.length > 0 ? wiring.map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 6, borderLeft: `4px solid ${WIRE_COLORS[w.wireType] || '#6B7280'}` }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 600 }}>{w.from}</div><div style={{ fontSize: 9, color: '#6B7280' }}>Source</div></div>
              <div style={{ width: 24, height: 3, background: WIRE_COLORS[w.wireType] || '#6B7280', borderRadius: 2 }} />
              <div style={{ flex: 1, textAlign: 'right' }}><div style={{ fontSize: 11, fontWeight: 600 }}>{w.to}</div><div style={{ fontSize: 9, color: '#6B7280' }}>Destination</div></div>
            </div>
          )) : <div style={{ color: '#6B7280', fontSize: 11, textAlign: 'center', padding: 16 }}>No wiring data</div>}
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>📍 Pin Assignments</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5 }}>
          {Object.entries(pinMap).length > 0 ? Object.entries(pinMap).map(([pin, desc]) => (
            <div key={pin} style={{ padding: 8, background: 'rgba(59,130,246,0.08)', borderRadius: 6, border: '1px solid rgba(59,130,246,0.15)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#60A5FA' }}>{pin}</div>
              <div style={{ fontSize: 9, color: '#9CA3AF' }}>{desc}</div>
            </div>
          )) : <div style={{ gridColumn: '1/-1', color: '#6B7280', fontSize: 11, textAlign: 'center', padding: 16 }}>No pin assignments</div>}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CODE TAB
// ============================================================================

function CodeTab({ fw }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(fw.code || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const download = () => { const b = new Blob([fw.code || ''], { type: 'text/plain' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = fw.filename || 'sketch.ino'; a.click(); URL.revokeObjectURL(u); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div><h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{fw.filename || 'sketch.ino'}</h3><p style={{ color: '#6B7280', margin: 0, fontSize: 11 }}>Arduino Firmware</p></div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={copy} style={{ padding: '6px 12px', background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: copied ? '#10B981' : '#fff', cursor: 'pointer', fontSize: 10 }}>{copied ? '✓ Copied' : '📋 Copy'}</button>
          <button onClick={download} style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>⬇️ Download</button>
        </div>
      </div>
      {fw.libraries?.length > 0 && <div style={{ padding: 10, background: 'rgba(245,158,11,0.08)', borderRadius: 8, marginBottom: 12, border: '1px solid rgba(245,158,11,0.15)' }}><div style={{ fontSize: 9, color: '#F59E0B', fontWeight: 600, marginBottom: 4 }}>📚 Required Libraries</div><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{fw.libraries.map((l, i) => <span key={i} style={{ padding: '2px 6px', background: 'rgba(245,158,11,0.15)', borderRadius: 4, fontSize: 9, color: '#FCD34D' }}>{l}</span>)}</div></div>}
      <div style={{ background: '#0D1117', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} /><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} /><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} /></div>
        <pre style={{ margin: 0, padding: 14, fontSize: 11, lineHeight: 1.5, color: '#E6EDF3', overflow: 'auto', maxHeight: 360, fontFamily: 'monospace' }}><code>{fw.code || '// No code generated'}</code></pre>
      </div>
    </div>
  );
}

// ============================================================================
// TESTS TAB
// ============================================================================

function TestsTab({ tests }) {
  const [done, setDone] = useState({});
  const toggle = i => setDone(d => ({ ...d, [i]: !d[i] }));
  const pct = tests.length ? Object.values(done).filter(Boolean).length / tests.length * 100 : 0;

  return (
    <div>
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 14, marginBottom: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Verification Checklist</h3><span style={{ padding: '3px 8px', background: pct === 100 ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', borderRadius: 8, fontSize: 10, color: pct === 100 ? '#10B981' : '#60A5FA', fontWeight: 600 }}>{Object.values(done).filter(Boolean).length}/{tests.length}</span></div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#10B981' : 'linear-gradient(90deg, #3B82F6, #8B5CF6)', transition: 'width 0.3s' }} /></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tests.length > 0 ? tests.map((t, i) => (
          <div key={i} onClick={() => toggle(i)} style={{ padding: 14, background: done[i] ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)', borderRadius: 8, border: done[i] ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: done[i] ? '#10B981' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', flexShrink: 0 }}>{done[i] ? '✓' : i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3, textDecoration: done[i] ? 'line-through' : 'none', opacity: done[i] ? 0.7 : 1 }}>{t.test}</div>
                <div style={{ fontSize: 10, color: '#10B981', marginBottom: 5 }}>Expected: {t.expected}</div>
                <div style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.08)', borderRadius: 4, fontSize: 9, color: '#FCA5A5' }}>If fails: {t.ifFails}</div>
              </div>
            </div>
          </div>
        )) : <div style={{ color: '#6B7280', textAlign: 'center', padding: 24 }}>No tests available</div>}
      </div>
      {pct === 100 && <div style={{ marginTop: 14, padding: 18, background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.15))', borderRadius: 10, textAlign: 'center', border: '1px solid rgba(16,185,129,0.2)' }}><div style={{ fontSize: 32, marginBottom: 6 }}>🎉</div><h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>All Tests Passed!</h3></div>}
    </div>
  );
}

// ============================================================================
// AGENT PANEL
// ============================================================================

function AgentPanel({ show, setShow, msgs, input, setInput, onSend, thinking }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  return (
    <>
      <button onClick={() => setShow(!show)} style={{ position: 'fixed', right: show ? 350 : 14, bottom: 14, width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, boxShadow: '0 4px 16px rgba(59,130,246,0.4)', zIndex: 101, transition: 'right 0.3s' }}>{show ? '→' : '🤖'}</button>
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 340, background: 'rgba(11,15,25,0.98)', borderLeft: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 100, transform: show ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s', backdropFilter: 'blur(8px)' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
          <div><div style={{ fontSize: 13, fontWeight: 700 }}>Build Assistant</div><div style={{ fontSize: 10, color: '#10B981' }}>● Claude AI Powered</div></div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ marginBottom: 10, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '85%', padding: 10, borderRadius: 10, background: m.role === 'user' ? 'linear-gradient(135deg, #3B82F6, #6366F1)' : 'rgba(255,255,255,0.05)', borderBottomRightRadius: m.role === 'user' ? 4 : 10, borderBottomLeftRadius: m.role === 'user' ? 10 : 4 }}>
                <div style={{ fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.text}</div>
              </div>
            </div>
          ))}
          {thinking && <div style={{ display: 'flex', gap: 4, padding: 10 }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 1s infinite' }} /><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 1s infinite 0.2s' }} /><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 1s infinite 0.4s' }} /><style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style></div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSend()} placeholder="Ask anything..." style={{ flex: 1, padding: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
            <button onClick={onSend} style={{ padding: '10px 14px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>↑</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

function Modal({ onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={onClose}>
      <div style={{ background: '#1F2937', borderRadius: 14, padding: 24, width: 400, maxWidth: '90%', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
        {children}
        <button onClick={onClose} style={{ width: '100%', marginTop: 14, padding: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12 }}>Close</button>
      </div>
    </div>
  );
}

function ProjectsList({ onLoad, projects, onSelect }) {
  useEffect(() => { onLoad(); }, []);
  return (
    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
      {projects.length > 0 ? projects.map(p => (
        <div key={p._id} onClick={() => onSelect(p)} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 6, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name || p.buildPlan?.projectName}</div>
          <div style={{ fontSize: 10, color: '#6B7280' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
        </div>
      )) : <div style={{ color: '#6B7280', textAlign: 'center', padding: 24, fontSize: 12 }}>No saved projects yet</div>}
    </div>
  );
}
