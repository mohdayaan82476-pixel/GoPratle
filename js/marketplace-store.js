/**
 * GoPratle Event Marketplace - Central Store & Workflow Controller
 */

const STORAGE_KEY = 'gopratle_requirement_draft';

export const defaultState = {
  // Step 1: Basics
  eventName: 'Neon Horizon Gala 2025',
  eventType: 'corporate-gala',
  eventTypeName: 'Corporate Gala & Conference',
  dateType: 'single',
  eventDate: 'Nov 14, 2025',
  eventTime: '6:30 PM - 11:30 PM PST',
  city: 'San Francisco, CA',
  venue: 'The Pearl SF (Rooftop & Main Hall)',
  selectedRoles: ['planner', 'performer'],

  // Step 2: Planner Details
  plannerScope: 'Full Planning & Production',
  plannerGuestCount: 250,
  plannerServices: ['venue', 'decor', 'production', 'catering', 'logistics'],
  plannerVenueStatus: 'confirmed',

  // Step 2: Performer Details
  performerType: 'DJ',
  performerGenres: ['House / Tech', 'Electronic', 'Bollywood', 'Commercial Pop'],
  performerDuration: '3 Hours (2 Sets of 90m)',
  performerSound: 'venue-provides',
  performerNotes: 'High-energy closing set needed for corporate attendees.',

  // Step 2: Crew Details
  crewRoles: [
    { id: 'usher', name: 'Usher / Front of House', count: 4, category: 'Guest Facing' },
    { id: 'tech', name: 'Stage & AV Tech', count: 2, category: 'Technical' },
    { id: 'security', name: 'Event Security & Bouncers', count: 4, category: 'Security' },
    { id: 'hospitality', name: 'Hospitality & VIP Hostess', count: 2, category: 'Hospitality' }
  ],
  crewShift: 'Evening Shift (5:00 PM - 12:30 AM)',
  crewDressCode: 'Formal Black Suit / Uniform',

  // Step 3: Planner Preferences
  plannerThemes: ['Modern', 'Luxury'],
  plannerBudget: '₹15,00,000 – ₹30,00,000',
  plannerExperience: 'Established Specialist (5-8 yrs exp)',

  // Step 3: Performer Preferences
  performerBudgetMin: 60000,
  performerBudgetMax: 150000,
  performerBudgetDisplay: '₹60,000 – ₹1,50,000',
  performerStageSetup: 'Indoor Banquet / Stage',
  performerLanguage: 'English & Hindi',
  performerHospitality: ['Green Room', 'Local Transport', 'Meals Included'],

  // Meta
  status: 'draft',
  lastUpdated: new Date().toISOString()
};

export function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      return { ...defaultState };
    }
    return { ...defaultState, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading localStorage', e);
    return { ...defaultState };
  }
}

export function saveStore(updates) {
  try {
    const current = getStore();
    const updated = { ...current, ...updates, lastUpdated: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('gopratle_state_change', { detail: updated }));
    return updated;
  } catch (e) {
    console.error('Error writing localStorage', e);
    return defaultState;
  }
}

export function resetStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  window.dispatchEvent(new CustomEvent('gopratle_state_change', { detail: defaultState }));
  return { ...defaultState };
}

export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-msg flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container-high border border-white/10 shadow-2xl text-on-surface text-sm font-medium';
  
  let iconName = 'info';
  let iconColor = 'text-primary';
  if (type === 'success') {
    iconName = 'check_circle';
    iconColor = 'text-green-400';
  } else if (type === 'error') {
    iconName = 'error';
    iconColor = 'text-red-400';
  }

  toast.innerHTML = 
    <span class=\"material-symbols-outlined  text-[20px]\"></span>
    <span></span>
    <button class=\"ml-2 text-secondary hover:text-on-surface\">&times;</button>
  ;

  toast.querySelector('button').onclick = () => toast.remove();
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3500);
}

export function renderLiveSummary(store, currentStepIndex = 1) {
  const container = document.getElementById('live-preview-container');
  if (!container) return;

  const rolesHtml = store.selectedRoles.map(role => {
    let name = 'Event Planner';
    if (role === 'performer') name = 'Performer (' + store.performerType + ')';
    if (role === 'crew') {
      const totalCrew = store.crewRoles.reduce((acc, r) => acc + (parseInt(r.count) || 0), 0);
      name = Crew ( staff);
    }
    return <span class=\"px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-badge-micro text-badge-micro border border-primary/20 uppercase tracking-wider\"></span>;
  }).join(' ');

  container.innerHTML = 
    <div class=\"bg-surface-container-low/70 backdrop-blur-2xl rounded-xl p-space-lg shadow-2xl flex flex-col gap-space-md relative overflow-hidden border border-white/[0.08]\">
      <div class=\"absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary-container/20 blur-2xl pointer-events-none\"></div>
      
      <div class=\"flex items-center justify-between\">
        <div class=\"flex items-center gap-2\">
          <span class=\"w-2 h-2 rounded-full bg-primary-container animate-pulse\"></span>
          <span class=\"font-badge-micro text-badge-micro tracking-widest text-primary uppercase font-bold\">Live Preview</span>
        </div>
        <span class=\"text-secondary font-label-sm text-label-sm\">Step  of 4</span>
      </div>

      <div class=\"relative w-full h-40 rounded-lg overflow-hidden bg-surface-container-high\">
        <img class=\"w-full h-full object-cover brightness-90 hover:scale-105 transition-transform duration-500\" src=\"https://lh3.googleusercontent.com/aida-public/AB6AXuCtR9Ch4--yRgckMNjXK-fU7vkyT8fjuB6L-MARGPtdbN4m-fkkO0G9BStMZH3lWt2wKwAIO96EBVt8CB0hhiGhVu6yjViVNrATF9LJZWkeVfAW6ZyidCrsN6bYlkXXp9SwShWE54Sm8-0x9TzR8FOOlfBmZX_15og2zlLupXZYy-kX2ts8IHo2Nr9C-vqvMp_RsL9xFRVLqFXLqSFrjYWa8Fe3BPEDo_t74OAHeSUaeOay-ujODB71\" alt=\"Event Visual\" />
        <div class=\"absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-transparent\"></div>
        <div class=\"absolute bottom-3 left-3 right-3 flex items-center justify-between\">
          <span class=\"px-2.5 py-1 rounded-md bg-surface-container-lowest/90 backdrop-blur-md text-primary font-badge-micro text-badge-micro tracking-wider uppercase font-bold\">
            
          </span>
          <span class=\"font-label-sm text-label-sm text-on-surface bg-surface-container-lowest/80 backdrop-blur-sm px-2 py-0.5 rounded\">
            
          </span>
        </div>
      </div>

      <div class=\"flex flex-col gap-space-xs pt-1\">
        <h3 class=\"font-headline-sm text-headline-sm text-on-surface font-extrabold truncate\">
          
        </h3>
        <div class=\"flex items-center gap-2 text-secondary font-body-sm text-body-sm\">
          <span class=\"material-symbols-outlined text-[16px] text-primary\">calendar_month</span>
          <span> • </span>
        </div>
        <div class=\"flex items-center gap-2 text-secondary font-body-sm text-body-sm\">
          <span class=\"material-symbols-outlined text-[16px] text-primary\">location_on</span>
          <span class=\"truncate\"></span>
        </div>
      </div>

      <div class=\"border-t border-white/[0.08] pt-3 flex flex-col gap-2\">
        <span class=\"font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold\">Roles Being Sourced:</span>
        <div class=\"flex flex-wrap gap-1.5\">
          
        </div>
      </div>

      <div class=\"border-t border-white/[0.08] pt-3 flex flex-col gap-1 text-xs text-secondary\">
        <div class=\"flex justify-between items-center\">
          <span>Est. Planner Budget:</span>
          <span class=\"text-on-surface font-bold\"></span>
        </div>
        <div class=\"flex justify-between items-center\">
          <span>Artist Fee Range:</span>
          <span class=\"text-primary font-bold\"></span>
        </div>
      </div>
    </div>
  ;
}
