import React, { useEffect, useMemo, useState } from 'react';

const STORAGE = {
  users: 'sharebite_v2_users',
  foods: 'sharebite_v2_foods',
  session: 'sharebite_v2_session',
  claims: 'sharebite_v2_claims',
  pickups: 'sharebite_v2_pickups'
};

const demoFoods = [
  { id: 101, title: 'Fresh vegetable meal boxes', category: 'Meals', quantity: 12, unit: 'boxes', location: 'Tadepalle', expiry: futureDate(1), donor: 'Green Bowl Cafe', donorEmail: 'donor@sharebite.demo', contact: '9876543210', description: 'Freshly prepared vegetarian lunch boxes. Please collect in the evening.', status: 'Available', createdAt: Date.now() },
  { id: 102, title: 'Bakery bread and buns', category: 'Bakery', quantity: 25, unit: 'packs', location: 'Vijayawada', expiry: futureDate(2), donor: 'Sunrise Bakery', donorEmail: 'bakery@sharebite.demo', contact: '9876543211', description: 'Packed bread and buns from today. Stored hygienically.', status: 'Available', createdAt: Date.now() },
  { id: 103, title: 'Seasonal fresh fruits', category: 'Fruits', quantity: 8, unit: 'kg', location: 'Mangalagiri', expiry: futureDate(3), donor: 'Fresh Mart', donorEmail: 'fresh@sharebite.demo', contact: '9876543212', description: 'A mix of bananas, apples and oranges.', status: 'Available', createdAt: Date.now() },
  { id: 104, title: 'Farm fresh vegetables', category: 'Vegetables', quantity: 10, unit: 'kg', location: 'Guntur', expiry: futureDate(2), donor: 'Community Farm', donorEmail: 'farm@sharebite.demo', contact: '9876543213', description: 'Fresh seasonal vegetables for community kitchens.', status: 'Available', createdAt: Date.now() },
  { id: 105, title: 'Packaged grocery essentials', category: 'Groceries', quantity: 15, unit: 'packs', location: 'Vijayawada', expiry: futureDate(7), donor: 'Helping Hands Store', donorEmail: 'help@sharebite.demo', contact: '9876543214', description: 'Sealed grocery packs. Check labels before use.', status: 'Available', createdAt: Date.now() }
];

function futureDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
function makeId() { return Date.now() + Math.floor(Math.random() * 1000); }
function daysLeft(date) {
  const end = new Date(`${date}T23:59:59`);
  return Math.ceil((end - new Date()) / 86400000);
}
function moneyFreeDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString();
}
function App() {
  const [users, setUsers] = useState(() => read(STORAGE.users, [
    { id: 1, name: 'Demo Donor', email: 'donor@sharebite.demo', password: 'donor123', role: 'user' },
    { id: 2, name: 'Community NGO', email: 'ngo@sharebite.demo', password: 'ngo123', role: 'ngo' },
    { id: 3, name: 'Volunteer One', email: 'volunteer@sharebite.demo', password: 'vol123', role: 'volunteer' }
  ]));
  const [foods, setFoods] = useState(() => read(STORAGE.foods, demoFoods));
  const [claims, setClaims] = useState(() => read(STORAGE.claims, []));
  const [pickups, setPickups] = useState(() => read(STORAGE.pickups, []));
  const [currentUser, setCurrentUser] = useState(() => read(STORAGE.session, null));
  const [page, setPage] = useState('home');
  const [authMode, setAuthMode] = useState('login');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [selectedFood, setSelectedFood] = useState(null);
  const [claimFood, setClaimFood] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => localStorage.setItem(STORAGE.users, JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem(STORAGE.foods, JSON.stringify(foods)), [foods]);
  useEffect(() => localStorage.setItem(STORAGE.claims, JSON.stringify(claims)), [claims]);
  useEffect(() => localStorage.setItem(STORAGE.pickups, JSON.stringify(pickups)), [pickups]);
  useEffect(() => {
    if (currentUser) localStorage.setItem(STORAGE.session, JSON.stringify(currentUser));
    else localStorage.removeItem(STORAGE.session);
  }, [currentUser]);

  const availableFoods = foods.filter(f => f.status === 'Available' && daysLeft(f.expiry) >= 0);
  const filteredFoods = useMemo(() => availableFoods.filter(food => {
    const q = search.toLowerCase();
    const matchesText = [food.title, food.location, food.donor, food.description].some(v => String(v).toLowerCase().includes(q));
    const matchesCategory = category === 'All' || food.category === category;
    const matchesLocation = locationFilter === 'All' || food.location === locationFilter;
    return matchesText && matchesCategory && matchesLocation;
  }), [foods, search, category, locationFilter]);

  const go = (next) => {
    setPage(next);
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const notify = (message) => {
    setNotice(message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const login = (email, password) => {
    if (email.toLowerCase() === 'admin@sharebite.com' && password === 'admin123') {
      setCurrentUser({ id: 0, name: 'ShareBite Admin', email, role: 'admin' });
      go('dashboard');
      return;
    }
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return notify('Incorrect email or password. Please try again.');
    setCurrentUser(found);
    go('dashboard');
  };
  const register = (data) => {
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) return notify('This email is already registered.');
    const user = { id: makeId(), ...data };
    setUsers(old => [...old, user]);
    setCurrentUser(user);
    go('dashboard');
    notify('Your account has been created successfully!');
  };
  const logout = () => {
    setCurrentUser(null);
    go('home');
    notify('You have logged out.');
  };
  const addFood = (data) => {
    const food = { id: makeId(), ...data, donor: currentUser.name, donorEmail: currentUser.email, status: 'Available', createdAt: Date.now() };
    setFoods(old => [food, ...old]);
    go('dashboard');
    notify('Your food donation has been published!');
  };
  const submitClaim = (food, pickupDate, pickupTime, note) => {
    if (!currentUser) { setAuthMode('login'); go('auth'); return; }
    if (food.status !== 'Available') return notify('Sorry, this food has already been claimed.');
    const claim = { id: makeId(), foodId: food.id, foodTitle: food.title, claimant: currentUser.name, claimantEmail: currentUser.email, pickupDate, pickupTime, note, status: 'Requested' };
    setClaims(old => [claim, ...old]);
    setPickups(old => [claim, ...old]);
    setFoods(old => old.map(f => f.id === food.id ? { ...f, status: 'Claimed', claimedBy: currentUser.name } : f));
    setClaimFood(null);
    go('dashboard');
    notify('Food claimed! Your pickup request has been saved.');
  };
  const deleteFood = (id) => {
    setFoods(old => old.filter(f => f.id !== id));
    notify('Food listing deleted.');
  };
  const updatePickup = (id, status) => {
    setPickups(old => old.map(p => p.id === id ? { ...p, status } : p));
    setClaims(old => old.map(p => p.id === id ? { ...p, status } : p));
    notify(`Pickup request marked as ${status.toLowerCase()}.`);
  };
  const resetDemo = () => {
    if (!window.confirm('Reset demo data? This restores sample food listings and removes demo registrations and claims.')) return;
    setUsers([{ id: 1, name: 'Demo Donor', email: 'donor@sharebite.demo', password: 'donor123', role: 'user' }, { id: 2, name: 'Community NGO', email: 'ngo@sharebite.demo', password: 'ngo123', role: 'ngo' }, { id: 3, name: 'Volunteer One', email: 'volunteer@sharebite.demo', password: 'vol123', role: 'volunteer' }]);
    setFoods(demoFoods); setClaims([]); setPickups([]); setCurrentUser(null); go('home'); notify('Demo data has been reset.');
  };

  const impactMeals = claims.length * 4;
  const impactKg = (claims.length * 2.5).toFixed(1);
  const navItems = [{ id: 'home', label: 'Home' }, { id: 'find', label: 'Find Food' }, { id: 'about', label: 'About' }, { id: 'impact', label: 'Our Impact' }];
  return <div className="app-shell">
    <header className="site-header">
      <nav className="navbar navbar-expand-lg container">
        <button className="brand-button" onClick={() => go('home')}><span className="brand-mark">S</span><span>share<span className="brand-green">bite</span><small>SHARE MORE. WASTE LESS.</small></span></button>
        <div className="nav-links">
          {navItems.map(item => <button key={item.id} className={page === item.id ? 'nav-link active' : 'nav-link'} onClick={() => go(item.id)}>{item.label}</button>)}
          {currentUser && <button className={page === 'dashboard' ? 'nav-link active' : 'nav-link'} onClick={() => go('dashboard')}>Dashboard</button>}
        </div>
        <div className="nav-actions">
          {currentUser ? <><span className="welcome-user">Hi, {currentUser.name.split(' ')[0]}</span><button className="btn btn-outline-success btn-sm" onClick={logout}>Log out</button></> : <><button className="btn btn-link login-link" onClick={() => { setAuthMode('login'); go('auth'); }}>Log in</button><button className="btn btn-success btn-sm px-3" onClick={() => { setAuthMode('register'); go('auth'); }}>Join ShareBite</button></>}
        </div>
      </nav>
    </header>

    <main>
      {notice && <div className="container pt-3"><div className="alert alert-success alert-dismissible fade show mb-0" role="alert">{notice}<button className="btn-close" onClick={() => setNotice('')} aria-label="Close"/></div></div>}
      {page === 'home' && <HomePage go={go} foods={availableFoods} claims={claims} />}
      {page === 'find' && <FindFoodPage foods={filteredFoods} search={search} setSearch={setSearch} category={category} setCategory={setCategory} locationFilter={locationFilter} setLocationFilter={setLocationFilter} onDetails={setSelectedFood} onClaim={food => { if (!currentUser) { setAuthMode('login'); go('auth'); } else setClaimFood(food); }} currentUser={currentUser} />}
      {page === 'about' && <AboutPage />}
      {page === 'impact' && <ImpactPage foods={foods} claims={claims} users={users} impactMeals={impactMeals} impactKg={impactKg} />}
      {page === 'auth' && <AuthPage mode={authMode} setMode={setAuthMode} onLogin={login} onRegister={register} notify={notify} />}
      {page === 'donate' && <DonatePage onSubmit={addFood} onCancel={() => go('dashboard')} />}
      {page === 'dashboard' && <Dashboard user={currentUser} foods={foods} users={users} claims={claims} pickups={pickups} go={go} onDelete={deleteFood} onUpdatePickup={updatePickup} onCertificate={() => setShowCertificate(true)} />}
    </main>

    <footer className="site-footer"><div className="container footer-inner"><div><div className="footer-brand">share<span>bite</span></div><p>Good food deserves a second chance.</p></div><div className="footer-links"><button onClick={() => go('find')}>Find food</button><button onClick={() => go('donate')}>Donate food</button><button onClick={() => go('about')}>About us</button></div><small>© {new Date().getFullYear()} ShareBite. Frontend demonstration project.</small></div></footer>

    {selectedFood && <FoodDetails food={selectedFood} onClose={() => setSelectedFood(null)} onClaim={() => { const food = selectedFood; setSelectedFood(null); if (!currentUser) { setAuthMode('login'); go('auth'); } else setClaimFood(food); }} />}
    {claimFood && <ClaimModal food={claimFood} onClose={() => setClaimFood(null)} onSubmit={submitClaim} />}
    {showCertificate && <Certificate user={currentUser} claims={claims} onClose={() => setShowCertificate(false)} />}
  </div>;
}

function HomePage({ go, foods, claims }) {
  return <><section className="hero-section"><div className="container hero-grid"><div className="hero-copy"><span className="eyebrow"><span className="eyebrow-dot"/> A LITTLE SHARE CAN MAKE A BIG DIFFERENCE</span><h1>Good food deserves<br/><em>a second chance.</em></h1><p className="hero-text">We connect people with surplus food to the communities who need it. Share a meal, spread kindness, and help build a world with less waste.</p><div className="hero-buttons"><button className="btn btn-success btn-lg" onClick={() => go('find')}>Explore food <span>→</span></button><button className="btn btn-outline-dark btn-lg" onClick={() => go('auth')}>Become a donor</button></div><div className="hero-note"><span>✓</span> Simple sharing. Meaningful impact.</div></div><div className="hero-visual"><div className="hero-photo"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85" alt="Fresh healthy meal in a bowl"/><div className="photo-tag"><span>♥</span> Good food. Good purpose.</div></div><div className="floating-card"><span className="float-icon">♧</span><div><strong>{foods.length} food listings</strong><small>ready to be shared</small></div></div><div className="hero-sticker">LESS<br/>WASTE<br/><b>♡</b></div></div></div></section>
  <section className="stats-strip"><div className="container stats-grid"><Stat value={foods.length + claims.length} label="Food sharing activities"/><Stat value={claims.length} label="Successful claims"/><Stat value="100%" label="Community spirit"/><Stat value="1 goal" label="A world with less waste"/></div></section>
  <section className="section-pad"><div className="container"><SectionHeading eyebrow="HOW IT WORKS" title="A simple way to make" italic="a real difference." text="Three small steps can turn surplus food into a meaningful meal."/><div className="steps-grid"><Step number="01" icon="♧" title="Share surplus food" text="Have extra food? Add a listing with quantity, location and collection details."/><Step number="02" icon="⌕" title="Find what you need" text="Browse nearby donations, check food details and choose a suitable pickup time."/><Step number="03" icon="♡" title="Collect and care" text="Connect with the donor, collect the food safely and help prevent waste."/></div></div></section>
  <section className="cta-section"><div className="container cta-inner"><div><span className="eyebrow light">BE PART OF THE CHANGE</span><h2>Have extra food?<br/><em>Pass it forward.</em></h2><p>Your small contribution can make someone's day better.</p></div><button className="btn btn-light btn-lg" onClick={() => go('auth')}>Start sharing <span>→</span></button></div></section>
  <section className="section-pad"><div className="container"><SectionHeading eyebrow="FRESHLY SHARED" title="Food waiting for" italic="a new home." text="Explore a few of the latest available community donations."/><div className="food-grid">{foods.slice(0,3).map(food => <FoodCard key={food.id} food={food} onDetails={() => go('find')}/>)}</div><div className="text-center mt-4"><button className="btn btn-outline-success px-4" onClick={() => go('find')}>View all food listings →</button></div></div></section></>;
}
function Stat({ value, label }) { return <div className="stat-item"><strong>{value}</strong><span>{label}</span></div>; }
function SectionHeading({ eyebrow, title, italic, text }) { return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}<br/><em>{italic}</em></h2><p>{text}</p></div>; }
function Step({ number, icon, title, text }) { return <article className="step-card"><div className="step-top"><span className="step-icon">{icon}</span><span>{number}</span></div><h3>{title}</h3><p>{text}</p></article>; }

function FindFoodPage({ foods, search, setSearch, category, setCategory, locationFilter, setLocationFilter, onDetails, onClaim, currentUser }) {
  const locations = ['All', ...new Set(foods.map(f => f.location))];
  return <section className="page-section"><div className="container"><div className="page-intro"><span className="eyebrow">COMMUNITY FOOD BOARD</span><h1>Find good food.<br/><em>Do good things.</em></h1><p>Browse surplus food shared by local donors. Use the filters to find something that works for you.</p></div><div className="filter-panel"><div className="search-box"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search food, donor or location..." aria-label="Search food"/></div><select className="form-select" value={category} onChange={e => setCategory(e.target.value)}><option>All</option>{['Meals','Bakery','Fruits','Vegetables','Groceries','Other'].map(c => <option key={c}>{c}</option>)}</select><select className="form-select" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}><option>All</option>{locations.filter(l => l !== 'All').map(l => <option key={l}>{l}</option>)}</select><button className="btn btn-outline-success" onClick={() => { setSearch(''); setCategory('All'); setLocationFilter('All'); }}>Reset</button></div><div className="results-line"><strong>{foods.length} available listing{foods.length !== 1 ? 's' : ''}</strong><span>Only non-expired available donations are shown</span></div>{foods.length ? <div className="food-grid">{foods.map(food => <FoodCard key={food.id} food={food} onDetails={() => onDetails(food)} onClaim={() => onClaim(food)}/>)}</div> : <div className="empty-state"><div>♧</div><h3>No food listings found</h3><p>Try another search or category, or check back soon for new donations.</p><button className="btn btn-outline-success" onClick={() => { setSearch(''); setCategory('All'); setLocationFilter('All'); }}>Clear filters</button></div>}</div></section>;
}
function FoodCard({ food, onDetails, onClaim }) {
  const categoryIcons = { Meals: '🍱', Bakery: '🥖', Fruits: '🍎', Vegetables: '🥬', Groceries: '🛍️', Other: '🍽️' };
  const left = daysLeft(food.expiry);
  return <article className="food-card"><div className="food-card-image"><div className="food-placeholder">{categoryIcons[food.category] || '🍽️'}</div><span className="available-pill">● Available</span><span className="category-pill">{food.category}</span></div><div className="food-card-body"><div className="food-card-meta"><span>⌖ {food.location}</span><span>{left === 0 ? 'Expires today' : `${left} day${left === 1 ? '' : 's'} left`}</span></div><h3>{food.title}</h3><p>{food.description}</p><div className="food-quantity"><strong>{food.quantity} {food.unit}</strong><span>by {food.donor}</span></div><div className="food-card-actions"><button className="btn btn-outline-success" onClick={onDetails || (() => {})}>Details</button>{onClaim && <button className="btn btn-success" onClick={onClaim}>Claim food</button>}</div></div></article>;
}
function FoodDetails({ food, onClose, onClaim }) {
  return <Modal onClose={onClose}><div className="modal-symbol">🍽️</div><span className="eyebrow">DONATION DETAILS</span><h2>{food.title}</h2><p>{food.description}</p><div className="detail-list"><p><b>Category:</b> {food.category}</p><p><b>Quantity:</b> {food.quantity} {food.unit}</p><p><b>Pickup location:</b> {food.location}</p><p><b>Donor:</b> {food.donor}</p><p><b>Contact:</b> {food.contact || 'Contact donor after claim'}</p><p><b>Best before:</b> {moneyFreeDate(food.expiry)}</p></div><button className="btn btn-success w-100" onClick={onClaim}>Claim this food</button></Modal>;
}
function ClaimModal({ food, onClose, onSubmit }) {
  const [date, setDate] = useState(futureDate(0));
  const [time, setTime] = useState('17:00');
  const [note, setNote] = useState('');
  return <Modal onClose={onClose}><span className="eyebrow">RESERVE A PICKUP</span><h2>Claim {food.title}</h2><p>Choose when you plan to collect this donation.</p><form onSubmit={e => { e.preventDefault(); onSubmit(food, date, time, note); }}><label className="form-label">Pickup date</label><input className="form-control mb-3" type="date" min={futureDate(0)} value={date} onChange={e => setDate(e.target.value)} required/><label className="form-label">Pickup time</label><input className="form-control mb-3" type="time" value={time} onChange={e => setTime(e.target.value)} required/><label className="form-label">Note for donor (optional)</label><textarea className="form-control mb-3" rows="2" value={note} onChange={e => setNote(e.target.value)} placeholder="Example: I will collect for a community group."/><button className="btn btn-success w-100">Confirm food claim</button></form></Modal>;
}
function Modal({ children, onClose }) { return <div className="modal-backdrop-custom" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className="custom-modal"><button className="modal-close" onClick={onClose}>×</button>{children}</div></div>; }

function AuthPage({ mode, setMode, onLogin, onRegister, notify }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [role, setRole] = useState('user');
  const submit = e => { e.preventDefault(); if (mode === 'login') onLogin(email.trim(), password); else { if (password.length < 6) return notify('Password must contain at least 6 characters.'); if (password !== confirm) return notify('Passwords do not match.'); onRegister({ name: name.trim(), email: email.trim(), password, role }); } };
  return <section className="auth-section"><div className="auth-art"><div className="auth-art-content"><span className="eyebrow light">WELCOME TO SHAREBITE</span><h1>Kindness is<br/><em>always in season.</em></h1><p>Join a community that believes good food should be shared, not wasted.</p><div className="auth-art-emoji">🥗 🍊 🥖</div></div></div><div className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><span className="eyebrow">{mode === 'login' ? 'GOOD TO SEE YOU AGAIN' : 'START MAKING A DIFFERENCE'}</span><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p>{mode === 'login' ? 'Log in to continue sharing good food.' : 'A few details and you are part of the community.'}</p>{mode === 'register' && <><label className="form-label">Full name</label><input className="form-control mb-3" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name"/><label className="form-label">I am joining as</label><select className="form-select mb-3" value={role} onChange={e => setRole(e.target.value)}><option value="user">Individual / Donor</option><option value="ngo">NGO / Community group</option><option value="volunteer">Volunteer</option></select></>}<label className="form-label">Email address</label><input className="form-control mb-3" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"/><label className="form-label">Password</label><input className="form-control mb-3" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="At least 6 characters"/>{mode === 'register' && <><label className="form-label">Confirm password</label><input className="form-control mb-3" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Enter password again"/></>}<button className="btn btn-success w-100 btn-lg mt-2">{mode === 'login' ? 'Log in' : 'Create account'} →</button><div className="auth-switch">{mode === 'login' ? "New to ShareBite? " : 'Already have an account? '}<button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create an account' : 'Log in'}</button></div>{mode === 'login' && <div className="demo-credentials"><b>Demo accounts</b><small>Admin: admin@sharebite.com / admin123</small><small>Donor: donor@sharebite.demo / donor123</small><small>NGO: ngo@sharebite.demo / ngo123</small><small>Volunteer: volunteer@sharebite.demo / vol123</small></div>}</form></div></section>;
}

function DonatePage({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ title: '', category: 'Meals', quantity: '', unit: 'servings', location: '', expiry: futureDate(1), contact: '', description: '' });
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = e => { e.preventDefault(); if (daysLeft(form.expiry) < 0) return alert('Please choose a future expiry date.'); onSubmit({ ...form, quantity: Number(form.quantity) }); };
  return <section className="page-section"><div className="container narrow-container"><div className="page-intro compact"><span className="eyebrow">MAKE A DONATION</span><h1>Share what you <em>can.</em></h1><p>Tell the community about surplus food that is safe and suitable to share.</p></div><form className="form-panel" onSubmit={submit}><div className="form-grid"><div className="form-field full"><label className="form-label">Food name</label><input className="form-control" name="title" value={form.title} onChange={change} required placeholder="e.g. Vegetable meal boxes"/></div><div className="form-field"><label className="form-label">Category</label><select className="form-select" name="category" value={form.category} onChange={change}>{['Meals','Bakery','Fruits','Vegetables','Groceries','Other'].map(c => <option key={c}>{c}</option>)}</select></div><div className="form-field"><label className="form-label">Quantity</label><div className="input-group"><input className="form-control" type="number" min="1" name="quantity" value={form.quantity} onChange={change} required placeholder="e.g. 10"/><select className="form-select" name="unit" value={form.unit} onChange={change}><option>servings</option><option>boxes</option><option>packs</option><option>kg</option><option>litres</option></select></div></div><div className="form-field"><label className="form-label">Pickup location</label><input className="form-control" name="location" value={form.location} onChange={change} required placeholder="Area / city"/></div><div className="form-field"><label className="form-label">Best-before / expiry date</label><input className="form-control" type="date" min={futureDate(0)} name="expiry" value={form.expiry} onChange={change} required/></div><div className="form-field full"><label className="form-label">Contact number</label><input className="form-control" name="contact" value={form.contact} onChange={change} required pattern="[0-9]{10}" title="Enter a 10 digit phone number" placeholder="10 digit mobile number"/></div><div className="form-field full"><label className="form-label">Food description and storage details</label><textarea className="form-control" rows="4" name="description" value={form.description} onChange={change} required placeholder="Describe the food, preparation time and storage details..."/></div></div><div className="safety-note">♧ <span><b>Food safety reminder:</b> Only list food that has been handled and stored safely. Clearly mention allergens and collection instructions in the description.</span></div><div className="form-actions"><button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button><button className="btn btn-success px-4">Publish donation →</button></div></form></div></section>;
}

function Dashboard({ user, foods, users, claims, pickups, go, onDelete, onUpdatePickup, onCertificate }) {
  if (!user) return <section className="page-section"><div className="container empty-state"><h3>Please log in first</h3><button className="btn btn-success" onClick={() => go('auth')}>Go to login</button></div></section>;
  const myDonations = foods.filter(f => f.donorEmail === user.email);
  const myClaims = claims.filter(c => c.claimantEmail === user.email);
  const isAdmin = user.role === 'admin';
  const isCoordinator = user.role === 'ngo' || user.role === 'volunteer';
  return <section className="page-section dashboard-section"><div className="container"><div className="dashboard-heading"><div><span className="eyebrow">{isAdmin ? 'ADMIN CONTROL CENTER' : isCoordinator ? 'COMMUNITY WORKSPACE' : 'YOUR SHAREBITE SPACE'}</span><h1>Hello, <em>{user.name.split(' ')[0]}.</em></h1><p>{isAdmin ? 'Here is what is happening across the platform.' : 'Every small action helps create a community with less food waste.'}</p></div>{!isAdmin && <button className="btn btn-success" onClick={() => go('donate')}>＋ Donate food</button>}</div>
  <div className="dashboard-stats">{isAdmin ? <><DashStat value={foods.length} label="Total listings"/><DashStat value={foods.filter(f => f.status === 'Available').length} label="Available food"/><DashStat value={users.length} label="Registered users"/><DashStat value={claims.length} label="Food claims"/></> : <><DashStat value={myDonations.length} label="Your donations"/><DashStat value={myClaims.length} label="Items claimed"/><DashStat value={myDonations.filter(f => f.status === 'Available').length} label="Active listings"/><DashStat value={myClaims.length * 4} label="Meals supported"/></>}</div>
  {isAdmin ? <AdminDashboard foods={foods} users={users} claims={claims} onDelete={onDelete}/> : <><div className="dashboard-columns"><div className="dashboard-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR CONTRIBUTION</span><h3>My food donations</h3></div><button className="text-action" onClick={() => go('donate')}>Add new +</button></div>{myDonations.length ? <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Food item</th><th>Quantity</th><th>Best before</th><th>Status</th></tr></thead><tbody>{myDonations.map(f => <tr key={f.id}><td>{f.title}</td><td>{f.quantity} {f.unit}</td><td>{moneyFreeDate(f.expiry)}</td><td><Status value={f.status}/></td></tr>)}</tbody></table></div> : <div className="small-empty">You have not published a donation yet. <button onClick={() => go('donate')}>Add your first donation</button></div>}</div><div className="dashboard-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR REQUESTS</span><h3>Food I claimed</h3></div></div>{myClaims.length ? myClaims.map(c => <div className="claim-row" key={c.id}><div><b>{c.foodTitle}</b><small>Pickup: {c.pickupDate} at {c.pickupTime}</small></div><Status value={c.status}/></div>) : <div className="small-empty">No claims yet. <button onClick={() => go('find')}>Find food</button></div>}</div></div>{isCoordinator && <CoordinatorPanel pickups={pickups} onUpdate={onUpdatePickup}/>}<div className="dashboard-bottom-actions"><button className="btn btn-outline-success" onClick={() => go('find')}>Browse food</button><button className="btn btn-outline-success" onClick={onCertificate}>View appreciation certificate</button></div></>}</div></section>;
}
function DashStat({ value, label }) { return <div className="dash-stat"><strong>{value}</strong><span>{label}</span></div>; }
function Status({ value }) { const cls = value === 'Available' || value === 'Completed' ? 'status-green' : value === 'Claimed' || value === 'Requested' ? 'status-amber' : 'status-grey'; return <span className={`status-pill ${cls}`}>{value}</span>; }
function AdminDashboard({ foods, users, claims, onDelete }) {
  const [tab, setTab] = useState('foods');
  return <div className="dashboard-panel admin-panel"><div className="panel-heading"><div><span className="eyebrow">PLATFORM MANAGEMENT</span><h3>Manage ShareBite</h3></div><div className="tab-buttons"><button className={tab === 'foods' ? 'selected' : ''} onClick={() => setTab('foods')}>Food listings</button><button className={tab === 'users' ? 'selected' : ''} onClick={() => setTab('users')}>Users</button><button className={tab === 'claims' ? 'selected' : ''} onClick={() => setTab('claims')}>Claims</button></div></div>{tab === 'foods' && <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Food</th><th>Donor</th><th>Location</th><th>Status</th><th>Action</th></tr></thead><tbody>{foods.map(f => <tr key={f.id}><td>{f.title}</td><td>{f.donor}</td><td>{f.location}</td><td><Status value={f.status}/></td><td><button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(f.id)}>Delete</button></td></tr>)}</tbody></table></div>}{tab === 'users' && <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>{users.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td><Status value={u.role}/></td></tr>)}</tbody></table></div>}{tab === 'claims' && <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Food</th><th>Claimed by</th><th>Pickup</th><th>Status</th></tr></thead><tbody>{claims.map(c => <tr key={c.id}><td>{c.foodTitle}</td><td>{c.claimant}</td><td>{c.pickupDate} {c.pickupTime}</td><td><Status value={c.status}/></td></tr>)}</tbody></table></div>}</div>;
}
function CoordinatorPanel({ pickups, onUpdate }) { return <div className="dashboard-panel coordinator-panel"><div className="panel-heading"><div><span className="eyebrow">COLLECTION SUPPORT</span><h3>Pickup coordination</h3></div></div>{pickups.length ? pickups.map(p => <div className="claim-row" key={p.id}><div><b>{p.foodTitle}</b><small>{p.claimant} · {p.pickupDate} · {p.pickupTime}</small></div><div className="d-flex gap-2"><Status value={p.status}/>{p.status !== 'Completed' && <button className="btn btn-sm btn-outline-success" onClick={() => onUpdate(p.id, 'Completed')}>Mark completed</button>}</div></div>) : <div className="small-empty">No pickup requests are available yet.</div>}</div>;}

function ImpactPage({ foods, claims, users, impactMeals, impactKg }) {
  const total = foods.length;
  const claimed = foods.filter(f => f.status === 'Claimed').length;
  const categories = ['Meals','Bakery','Fruits','Vegetables','Groceries'];
  return <section className="page-section"><div className="container"><div className="page-intro"><span className="eyebrow">OUR COMMUNITY IMPACT</span><h1>Small actions.<br/><em>Big change.</em></h1><p>Every donation is a step towards a more thoughtful and less wasteful community.</p></div><div className="impact-hero-grid"><div className="impact-feature"><span>♧</span><strong>{impactMeals}</strong><p>Estimated meals supported</p></div><div className="impact-feature"><span>↗</span><strong>{impactKg} kg</strong><p>Illustrative food rescued estimate</p></div><div className="impact-feature"><span>♡</span><strong>{users.length}</strong><p>Community accounts</p></div><div className="impact-feature"><span>✓</span><strong>{claimed}</strong><p>Food listings claimed</p></div></div><div className="impact-content-grid"><div className="dashboard-panel"><span className="eyebrow">DONATION SNAPSHOT</span><h3>Food listing status</h3><div className="bar-line"><div><span>Available</span><b>{foods.filter(f => f.status === 'Available').length}</b></div><div className="bar-track"><i style={{ width: `${total ? foods.filter(f => f.status === 'Available').length / total * 100 : 0}%` }}/></div></div><div className="bar-line"><div><span>Claimed</span><b>{claimed}</b></div><div className="bar-track"><i style={{ width: `${total ? claimed / total * 100 : 0}%` }}/></div></div><p className="impact-footnote">These figures are calculated from the food listings saved in this browser.</p></div><div className="dashboard-panel"><span className="eyebrow">COMMUNITY CHALLENGE</span><h3>Be a food-saving hero</h3><p>Donate surplus food, help a neighbour collect a meal, or invite a local business to join ShareBite.</p><div className="challenge-badge">🌱 One community. Less waste.</div><p className="impact-footnote">Impact estimates are illustrative demo metrics, not independently measured environmental savings.</p></div></div><div className="dashboard-panel leaderboard"><div className="panel-heading"><div><span className="eyebrow">COMMUNITY RECOGNITION</span><h3>Top food-sharing contributors</h3></div></div>{users.map((u, i) => <div className="leader-row" key={u.id}><span className="leader-rank">{i + 1}</span><b>{u.name}</b><span>{foods.filter(f => f.donorEmail === u.email).length} donations</span></div>)}</div></div></section>;
}
function AboutPage() {
  return <section className="page-section"><div className="container"><div className="page-intro"><span className="eyebrow">WHY SHAREBITE EXISTS</span><h1>Food is too good<br/>to <em>go to waste.</em></h1><p>ShareBite is a community-focused frontend concept that makes it easier to share surplus food responsibly.</p></div><div className="about-grid"><div className="about-photo"><img src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80" alt="" onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80'; }}/></div><div className="about-copy"><span className="eyebrow">OUR PURPOSE</span><h2>Make sharing the<br/><em>natural choice.</em></h2><p>Good food can be left over for many reasons: a restaurant prepares extra portions, a shop has surplus produce, or an event has unopened food packs. ShareBite provides a simple place to list that surplus so nearby people and community groups can discover it.</p><p>Our goal is to encourage responsible sharing while reminding donors to provide accurate expiry, storage and collection details.</p><div className="about-values"><div><b>01</b><span>Reduce avoidable waste</span></div><div><b>02</b><span>Support local communities</span></div><div><b>03</b><span>Make sharing simple</span></div></div></div></div><div className="safety-banner"><div><span className="eyebrow">A RESPONSIBLE COMMUNITY</span><h3>Safety comes before sharing.</h3><p>Only share food that has been stored and handled safely. Clearly communicate allergens, preparation time and collection requirements.</p></div><span className="safety-icon">♡</span></div></div></section>;
}
function Certificate({ user, claims, onClose }) {
  const count = claims.filter(c => c.claimantEmail === user?.email).length;
  return <Modal onClose={onClose}><div className="certificate"><div className="certificate-leaf">✿</div><span className="eyebrow">SHAREBITE COMMUNITY</span><h2>Certificate of Appreciation</h2><p>This is to appreciate</p><h3>{user?.name || 'Community Member'}</h3><p>for being part of the food-sharing community and helping make good food go further.</p><strong>{count} food claim(s) recorded</strong><div className="certificate-footer">Share more. Waste less. ♡</div></div><button className="btn btn-success w-100 mt-3" onClick={() => window.print()}>Print / Save certificate</button></Modal>;
}

export default App;
