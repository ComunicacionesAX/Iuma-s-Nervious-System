export const LAYERS = {
  sento: {
    code: '01', name: 'SENTO', sub: 'Hardware Layer',
    tag: 'Biomarkers',
    title: 'High-frequency biological signal acquisition.',
    desc: 'Proprietary MEMS sensors capturing metabolic markers and thermal deltas at 120Hz. Designed for zero-latency edge processing.',
    metrics: [
      { label: 'Sampling', value: '120 Hz' },
      { label: 'Precision', value: '±0.01°C' },
      { label: 'Uptime', value: '99.98%' }
    ],
    deepDive: [
      { label: 'Active Nodes', value: '2,847' },
      { label: 'Signal Stability', value: '99.9%' },
      { label: 'Calibration', value: 'Auto-sync' }
    ]
  },
  insylo: {
    code: '02', name: 'INSYLO', sub: 'Inventory Layer',
    tag: 'Silo-to-consumption',
    title: 'Silo-to-consumption autonomous supply chain.',
    desc: 'Volumetric laser sensing for real-time inventory precision. Eliminates manual audit and reduces feed oxidation through optimized FIFO rotation.',
    metrics: [
      { label: 'Precision', value: '±0.5%' },
      { label: 'Waste Reduction', value: '12%' },
      { label: 'Logic', value: 'FIFO' }
    ],
    deepDive: [
      { label: 'Silos Monitored', value: '14,200' },
      { label: 'Avg. Inventory', value: '72%' },
      { label: 'OOS Prevention', value: '100%' }
    ]
  },
  bluesensor: {
    code: '03', name: 'BLUE SENSOR', sub: 'Connectivity Layer',
    tag: 'Massive Data Flow',
    title: 'Sovereign industrial communication stack.',
    desc: 'Military-grade AES-256 encryption over proprietary LPWAN mesh. Engineered for high-humidity and high-interference agricultural environments.',
    metrics: [
      { label: 'Encryption', value: 'AES-256' },
      { label: 'Latency', value: '<10 ms' },
      { label: 'Protocol', value: 'Sovereign Mesh' }
    ],
    deepDive: [
      { label: 'Network Uptime', value: '99.99%' },
      { label: 'Packet Loss', value: '0.001%' },
      { label: 'Range', value: '15km/node' }
    ]
  },
  asimetrix: {
    code: '04', name: 'ASIMETRIX', sub: 'Intelligence Layer',
    tag: 'Prescriptive AI',
    title: 'Prescriptive Causal AI for ROI & ESG.',
    desc: 'Translating biological signals into autonomous decisions. Real-time FCR optimization and carbon footprint reduction. ESG Tier 1 certified.',
    metrics: [
      { label: 'FCR Impact', value: '−0.05' },
      { label: 'CO₂ Reduction', value: '8.5%' },
      { label: 'Model Accuracy', value: '94.3%' }
    ],
    deepDive: [
      { label: 'Causal Models', value: '47' },
      { label: 'ROI Proj.', value: '+18.7%' },
      { label: 'ESG Score', value: 'Tier 1' }
    ]
  }
}

export const LAYER_KEYS = ['sento', 'insylo', 'bluesensor', 'asimetrix']
