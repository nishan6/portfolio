// All site content lives here so it's easy to update without touching layout code.

export const person = {
  name: 'Nishan Abraham Pani',
  first: 'Nishan',
  last: 'Abraham Pani',
  role: 'Live visuals director',
  roles: ['Online director', 'Vision mixer', 'Broadcast DOP'],
  tagline: 'Cutting cameras, creating moments',
  email: 'worknishanwork@gmail.com',
  emailAlt: 'nishan@hmbl.in',
  phone: '+91 76570 21140',
  whatsapp: 'https://wa.me/917657021140',
  linkedin: 'https://www.linkedin.com/in/nishanhere',
};

// Camera plan for the multiviewer, laid out like a real show.
// `shot` is the position, `want` describes the ideal picture for that slot (swap `src`/`sm` when new photos arrive).
export const cams = [
  { id: 1, label: 'WIDE', want: 'Full stage wide from FOH, whole rig lit', src: 'img/stage-bw.webp', sm: 'img/stage-bw-sm.webp' },
  { id: 2, label: 'JIB', want: 'High sweeping angle over the crowd to the stage', src: 'img/sps-lan.webp', sm: 'img/sps-lan-sm.webp' },
  { id: 3, label: 'CLOSE', want: 'Tight shot of the artist or player at a peak moment', src: 'img/cherry-blossom.webp', sm: 'img/cherry-blossom-sm.webp' },
  { id: 4, label: 'CROWD', want: 'Hands up, faces lit by the stage', src: 'img/crowd-fireworks.webp', sm: 'img/crowd-fireworks-sm.webp' },
  { id: 5, label: 'HANDHELD', want: 'Pit or Steadicam shot with flares and movement', src: 'img/broadcast-cam.webp', sm: 'img/broadcast-cam-sm.webp' },
  { id: 6, label: 'REVERSE', want: 'From the stage looking back at the crowd', src: 'img/bgis-2025.webp', sm: 'img/bgis-2025-sm.webp' },
  { id: 7, label: 'GALLERY', want: 'The PCR: multiviewer wall and switcher during a show', src: 'img/pkl-ipl-gallery.webp', sm: 'img/pkl-ipl-gallery-sm.webp' },
  { id: 8, label: 'DIRECTOR', want: 'You at the desk, hand on the T-bar', src: 'img/nishan-gallery.webp', sm: 'img/nishan-gallery-sm.webp' },
];

// The order the auto-director cuts in (indexes into cams), like calling a song:
// open wide, go tight, give the crowd, sweep, back to the artist, reverse, pit energy, then the gallery.
export const sequence = [0, 2, 3, 1, 2, 5, 4, 0, 3, 2, 6, 7];

// How a show runs, from first recce to the live cut. `when` is the countdown to show day.
export const crafts = [
  { when: 'T-30', title: 'Recce and camera plan', body: 'Walk the venue, place every camera and build a 3D plot so the client signs off on sightlines before anything is rigged.' },
  { when: 'T-7', title: 'Shot list and show flow', body: 'Learn the setlist or run of show, decide who covers what, and lock the graphics and sponsor moments.' },
  { when: 'T-1', title: 'Rehearsal', body: 'Run the show with the crew, rehearse transitions and talkback calls, and fix anything that does not land.' },
  { when: 'SHOW', title: 'Camera direction', body: 'Calling shots on talkback so every operator is already on the moment before it happens.' },
  { when: 'SHOW', title: 'Vision mixing', body: 'Cutting the program live: on the beat for music, on the play for sport and esports, feeding LED walls and the stream at once.' },
];

export const formats = ['Concerts and festivals', 'Esports', 'Live sport', 'Corporate and brand shows'];

// LED wall rows, alphabetical. Each non-empty list becomes one scrolling row.
export const wall = [
  { label: 'Clients', items: ['BookMyShow', 'Ferrari', 'Google', 'HCL', 'HSBC', 'IIT-BOM', 'Magnanimous Ventures', 'Me.gong', 'Meta', 'Mysuru Yuva Dasara', 'Nodwin', 'Rockski EMG', 'Tesseract', 'TM Talent Management', 'VAS.Inc', 'Zomato'] },
  { label: 'Artists', items: ['Akon', 'Alan Walker', 'Arijit Singh', 'Blue', 'Boney M.', 'Clean Bandit', 'Euphoria', 'Europe', 'Gajendra Verma', 'Girish and the Chronicles', "Guns N' Roses", 'Hybrid Theory', 'Indus Creed', 'Jasleen Royal', 'Jay Sean', 'Jonas Blue', 'Karan Aujla', 'Marcin', 'Michael Learns to Rock', 'Mr. Big', 'Ne-Yo', 'Pink Panda', 'Post Malone', 'Pritam', 'R3HAB', 'Rito Riba', 'Ronan Keating', 'Salim-Sulaiman', 'Sanam', 'Shankuraj Konwar', 'Shilpa Rao', 'Sunidhi Chauhan', 'Tsumyoki', 'Udita Goswami', 'Yungblud', 'And many more'] },
  { label: 'Shows', items: ['Bandland', 'Bollywood Music Project', 'Cherry Blossom Festival', 'Coke Studio Bharat', 'Coke Studio Bharat Live', 'Ensemble Valhalla', 'Hornbill Music Festival', 'Karbi Youth Festival', 'Lollapalooza India', 'Makar Sankranti Festival Sonar', 'Me.Gong Festival', 'Mising Youth Festival', 'Mood Indigo', 'Myntra Glamfest', 'One8 Global Premiere', 'Rolling Loud', 'Royal Stag Boombox', 'Ziro Music Festival', 'And many more'] },
]

export const work = [
  {
    slug: 'festivals',
    title: 'Music festivals and concerts',
    years: 'Festival main stages',
    role: 'Live visual director and vision mixer',
    detail: 'Multi-cam IMAG for festival main stages and headline concerts, including Shillong Cherry Blossom Festival, Me.Gong Festival, Myntra Glamfest, Coke Studio Bharat Live and Royal Stag Boombox.',
    specs: ['Multi-cam IMAG', 'LED walls', 'Cut to the music'],
    img: 'img/cherry-blossom.webp',
  },
  {
    slug: 'sps-lan',
    title: 'SPS LAN Esports Championship',
    years: '2023 to present',
    role: 'Broadcast DOP',
    detail: 'A 16-team arena production with live commentary and sponsor graphics, covered by 77 cameras.',
    specs: ['77 cameras', '16 teams', 'Live commentary'],
    img: 'img/sps-lan.webp',
  },
  {
    slug: 'bgis',
    title: 'Battlegrounds India Series',
    years: '2025',
    role: 'Broadcast DOP',
    detail: 'Camera plan and coverage for BGIS: 77 cameras, live commentary and sponsor integration.',
    specs: ['77 cameras', '16 teams', 'Sponsor graphics'],
    img: 'img/bgis-2025.webp',
  },
  {
    slug: 'pkl-ipl',
    title: 'PKL and IPL',
    years: '2021 to present',
    role: 'Assistant producer',
    detail: 'Full seasons of live sport with 24+ cameras, live commentary and sponsor graphics.',
    specs: ['Full season', '24+ cameras', 'Live sport'],
    img: 'img/pkl-ipl-gallery.webp',
  },
  {
    slug: 'corporate',
    title: 'Corporate and brand broadcasts',
    years: 'Multiple clients',
    role: 'Creative producer',
    detail: 'Multi-platform live shows with sponsor integration and highlight reels turned around fast.',
    specs: ['Multi-platform', 'Sponsor integration', 'Highlight reels'],
    img: 'img/corporate-rig.webp',
  },
  {
    slug: 'artists',
    title: 'Touring and headline artists',
    years: 'Large-scale concerts',
    role: 'Live visual direction',
    detail: 'Lighting, SFX, camera direction and laser programming for large-scale concerts.',
    specs: ['Lighting', 'SFX and laser', 'DOP'],
    img: null,
    strip: ['img/artist-1.webp', 'img/artist-2.webp', 'img/artist-3.webp', 'img/artist-4.webp', 'img/artist-5.webp'],
  },
];

// Gear rack: one rack unit per category.
export const gear = [
  { unit: 'Production switchers', items: ['Blackmagic ATEM Constellation', 'ATEM 2 M/E Production Studio', 'Ross Carbonite', 'Sony XVS', 'Roland V-160HD', 'vMix'] },
  { unit: 'Cameras and systems', items: ['Sony HDC-3100', 'Sony HDC-4300', 'Sony PXW-Z750', 'Blackmagic URSA Broadcast G2', 'Blackmagic PYXIS 6K', 'Panasonic AK-UC4000', 'RED', 'ARRI', 'Jib / crane', 'Steadicam / gimbal'] },
  { unit: 'Routing, monitoring and comms', items: ['Blackmagic Smart Videohub', 'Blackmagic MultiView 16', 'AJA Kumo', 'Decimator', 'Riedel Bolero', 'Clear-Com', 'RTS'] },
  { unit: 'Replay and graphics', items: ['EVS XT-VIA', 'vMix replay', 'Ross XPression', 'Vizrt', 'Singular.live'] },
  { unit: 'Recording, capture and streaming', items: ['Blackmagic HyperDeck', 'Blackmagic UltraStudio 4K', 'AJA Ki Pro', 'Atomos', 'Teradek', 'LiveU'] },
  { unit: 'Lighting, visuals and previz', items: ['grandMA3', 'Pangolin Beyond', 'Resolume Arena', 'Notch', 'TouchDesigner', 'disguise', 'ShowKontrol', 'Novastar', 'Depence', 'Capture', 'Vectorworks'] },
]
