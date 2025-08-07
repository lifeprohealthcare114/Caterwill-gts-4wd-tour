// src/constants/wheelchairParts.js
export const wheelchairParts = [
  {
    id: 'headrest',
    name: 'Headrest',
    frontPosition: { x: 46, y: 5},
    backPosition: null,
    description: 'Adjustable headrest provides comfortable support for the user\'s head and neck during operation.',
    howItWorks: 'The headrest can be adjusted for height and angle to accommodate different user preferences and medical needs.',
    media: {
      type: 'image',
      src: '/assets/images/headrest1.jpg',
      poster: '/assets/images/headrest-poster.jpg'
    },
    icon: '🧑‍🦽',
    specs: [
      { name: 'Adjustment Range', value: '150-300mm' },
      { name: 'Material', value: 'Breathable mesh' }
    ],
    safetyNote: 'Ensure headrest is securely locked in position before use.'
  },
  {
    id: 'seat',
    name: 'Seat',
    frontPosition: { x: 43, y: 25 },
    backPosition: null,
    description: 'Fire-resistant cushioned seat with automatic tilt system for optimal positioning during different terrains.',
    howItWorks: 'The seat automatically adjusts its angle during stair climbing to maintain user comfort and safety. It can tilt within a 14-degree range.',
    media: {
      type: 'image',
      src: '/assets/images/seat.jpg',
      poster: '/assets/images/seat-poster.jpg'
    },
    icon: '🪑',
    specs: [
      { name: 'Width', value: '45 cm' },
      { name: 'Tilt Range', value: '14 degrees' },
      { name: 'Material', value: 'Fire-resistant fabric' }
    ]
  },
  {
    id: 'remote-controller',
    name: 'Remote Controller',
    frontPosition: { x: 53, y: 38},
    backPosition: null,
    description: 'Advanced control system with joystick and LCD display for operating the wheelchair.',
    howItWorks: 'Features customizable sensitivity settings, speed control, mode selection (wheels/tracks), and displays battery status and error codes.',
    media: {
      type: 'image',
      src: '/assets/images/controller.jpg',
      poster: '/assets/images/controller-poster.jpg'
    },
    icon: '🎮',
    specs: [
      { name: 'Input Type', value: 'Joystick + buttons' },
      { name: 'Display', value: 'LCD screen' },
      { name: 'Range', value: '5 meters' }
    ],
    safetyNote: 'Keep controller dry and away from extreme temperatures.'
  },
  {
    id: 'armrest',
    name: 'Armrest',
    frontPosition: null,
    backPosition:  null,
    description: 'Adjustable armrests for user comfort and support.',
    howItWorks: 'Height adjustable from 150-300mm to accommodate different user needs and preferences.',
    media: {
      type: 'image',
      src: '/assets/images/armrest.jpg',
      poster: '/assets/images/armrest-poster.jpg'
    },
    icon: '🫳',
    specs: [
      { name: 'Adjustment Range', value: '150-300mm' },
      { name: 'Material', value: 'Padded vinyl' }
    ],
    safetyNote: 'Never lift wheelchair by armrests.'
  },
  {
    id: 'legrest',
    name: 'Legrest/Footrest',
    frontPosition: { x: 79, y: 60 },
    backPosition: null,
    description: 'Adjustable leg support with footrest platform.',
    howItWorks: 'Length adjustable from 380-540mm. Can be adjusted mechanically or electrically depending on model.',
    media: {
      type: 'image',
      src: '/assets/images/legrest.jpg',
      poster: '/assets/images/legrest-poster.jpg'
    },
    icon: '🦵',
    specs: [
      { name: 'Adjustment Range', value: '380-540mm' },
      { name: 'Swing Away', value: 'Yes' }
    ],
    safetyNote: 'Never stand on footrests or use them for lifting the wheelchair.'
  },
  {
    id: 'drive-wheels',
    name: 'Drive Wheels',
    frontPosition: { x: 47, y: 69 },
    backPosition: { x: 82, y: 71 },
    description: 'Large 320-355mm drive wheels for smooth movement on flat surfaces.',
    howItWorks: 'Powered by 24V motors, these wheels provide movement up to 7-8 km/h on flat terrain with 18-25km range.',
    media: {
      type: 'image',
      src: '/assets/images/wheels1.jpg',
      poster: '/assets/images/wheels-poster.jpg'
    },
    icon: '🛞',
    specs: [
      { name: 'Diameter', value: '320-355mm' },
      { name: 'Motor Power', value: '24V' },
      { name: 'Max Speed', value: '8 km/h' }
    ]
  },
  {
    id: 'track-system',
    name: 'Track Platform',
    frontPosition: { x: 74, y: 90 },
    backPosition: null,
    description: 'Revolutionary track system for climbing stairs and obstacles.',
    howItWorks: 'Activates via control panel to deploy tracks that can climb stairs up to 35° angle and steps up to 180mm high.',
    media: {
      type: 'video',
      src: '/assets/videos/tracks.mp4',
      poster: '/assets/images/tracks-poster.jpg'
    },
    icon: '⛓️',
    specs: [
      { name: 'Max Stair Angle', value: '35°' },
      { name: 'Max Step Height', value: '180mm' },
      { name: 'Steps per Charge', value: '600-900' }
    ],
    safetyNote: 'Ensure proper training before attempting stair climbing.'
  },
  {
    id: 'battery',
    name: 'Battery Module',
    frontPosition: null,
    backPosition: { x: 63, y: 83 },
    description: 'High-capacity AGM or Lithium battery system.',
    howItWorks: '33-42 A*h capacity batteries charged with included 220V charger. Features automatic monitoring and safety systems.',
    media: {
      type: 'image',
      src: '/assets/images/battery.jpg',
      poster: '/assets/images/battery-poster.jpg'
    },
    icon: '🔋',
    specs: [
      { name: 'Capacity', value: '33-42 A*h' },
      { name: 'Type', value: 'AGM/Lithium' },
      { name: 'Charge Time', value: '6-8 hours' }
    ],
    safetyNote: 'Only use approved charger and follow charging instructions.'
  },
  {
    id: 'safety-handle',
    name: 'Safety Handle',
   frontPosition: null,
    backPosition: { x: 60, y: 35 },
    description: 'Special handles for safe transport and assistance.',
    howItWorks: 'Reinforced handles designed specifically for lifting and maneuvering the wheelchair safely.',
    media: {
      type: 'image',
      src: '/assets/images/handle.jpg',
      poster: '/assets/images/handle-poster.jpg'
    },
    icon: '🫴',
    specs: [
      { name: 'Material', value: 'Reinforced steel' },
      { name: 'Weight Capacity', value: '115 kg' }
    ],
    safetyNote: 'Attendants should use these handles or front frame beam only for lifting.'
  },
  {
    id: 'backrest',
    name: 'Backrest',
    frontPosition: null,
    backPosition: null,
    description: 'Ergonomic back support with adjustable recline feature.',
    howItWorks: 'Can be adjusted to multiple angles for optimal comfort and support during different activities.',
    media: {
      type: 'image',
      src: '/assets/images/backrest.jpg',
      poster: '/assets/images/backrest-poster.jpg'
    },
    icon: '🪑',
    specs: [
      { name: 'Recline Angles', value: '5 positions' },
      { name: 'Lumbar Support', value: 'Adjustable' }
    ]
  },
  {
    id: 'footplate',
    name: 'Footplate',
    frontPosition: { x: 80, y: 76 },
    backPosition: null,
    description: 'Adjustable foot support platform.',
    howItWorks: 'Can be raised, lowered, and angled to accommodate different leg lengths and positions.',
    media: {
      type: 'image',
      src: '/assets/images/footplate1.jpg',
      poster: '/assets/images/footplate-poster.jpg'
    },
    icon: '👣',
    specs: [
      { name: 'Adjustment', value: 'Height and angle' },
      { name: 'Swivel', value: 'Yes' }
    ],
    safetyNote: 'Ensure footplate is properly secured before moving.'
  },
  {
    id: 'control-panel',
    name: 'Control Panel',
   frontPosition: null,
    backPosition: null,
    description: 'User interface for wheelchair operation.',
    howItWorks: 'Includes joystick for movement control, mode selection buttons, and status indicators.',
    media: {
      type: 'image',
      src: '/assets/images/controller.jpg',
      poster: '/assets/images/control-panel-poster.jpg'
    },
    icon: '🕹️',
    specs: [
      { name: 'Controls', value: 'Joystick + buttons' },
      { name: 'Display', value: 'Status indicators' }
    ],
    safetyNote: 'Familiarize yourself with all controls before operation.'
  }
];

export const keySpecs = [
  { title: 'Max Load', value: '115 kg', icon: '⚖️' },
  { title: 'Max Speed', value: '8 km/h', icon: '🚀' },
  { title: 'Stair Angle', value: '35°', icon: '📐' },
  { title: 'Battery Life', value: '12 hours', icon: '⏳' },
  { title: 'Weight Capacity', value: '300 lbs', icon: '🏋️' },
  { title: 'Max Incline', value: '35°', icon: '⛰️' },
  { title: 'Range (Wheel Mode)', value: '18-25 km', icon: '🛣️' },
  { title: 'Steps per Charge', value: '600-900', icon: '🔄' },
  { title: 'Charging Time', value: '6-8 hours', icon: '🔌' },
  { title: 'Weight', value: '95 kg', icon: '🏋️' },
  { title: 'Seat Width', value: '45 cm', icon: '📏' },
  { title: 'Turning Radius', value: '80 cm', icon: '🔄' }
];

export const wheelchairFeatures = [
  {
    title: 'Dual Mode Operation',
    description: 'Switch between wheels for flat surfaces and tracks for stairs and rough terrain',
    icon: '🔄'
  },
  {
    title: 'Safety Mechanisms',
    description: 'Anti-tip system, emergency brakes, and stability control for all conditions',
    icon: '🛡️'
  },
  {
    title: 'Ergonomic Design',
    description: 'Adjustable seating, armrests, and controls for individual comfort',
    icon: '🪑'
  },
  {
    title: 'All-Terrain Capability',
    description: 'Handles various surfaces including grass, gravel, and uneven terrain',
    icon: '🌿'
  },
  {
    title: 'Long Battery Life',
    description: 'Extended operation time with efficient power management',
    icon: '🔋'
  },
  {
    title: 'Easy Maintenance',
    description: 'Modular design with easily accessible components',
    icon: '🛠️'
  }
];