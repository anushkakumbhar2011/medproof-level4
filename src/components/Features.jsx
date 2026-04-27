import React from 'react'

const features = [
  {
    icon: 'lock',
    title: 'Encrypted storage',
    description: 'Your medical records are encrypted end-to-end and stored on IPFS, ensuring complete privacy.',
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary'
  },
  {
    icon: 'shield',
    title: 'Doctor verification',
    description: 'Every healthcare provider is verified on-chain with cryptographic credentials you can trust.',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    icon: 'grid',
    title: 'Blockchain proof',
    description: 'Immutable verification records stored on Ethereum ensure tamper-proof medical history.',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    icon: 'eye',
    title: 'Zero-knowledge sharing',
    description: 'Share specific records without revealing your entire medical history using ZK proofs.',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600'
  }
]

function FeatureIcon({ type, className }) {
  const icons = {
    lock: <path d="M5 11h14v10H5V11zm2-4a5 5 0 0110 0v4H7V7z" />,
    shield: <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4zm0 10l-3 3 3 3 5-5-1.5-1.5L12 15l-1.5-1.5L12 12z" />,
    grid: <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />,
    eye: <path d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zM12 17c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z" />
  }
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
      {icons[type]}
    </svg>
  )
}

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="text-xs uppercase tracking-wider text-primary font-medium mb-4">
          Platform features
        </div>
        <h2 className="text-4xl md:text-5xl font-medium">
          Built for trust at every step
        </h2>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white border border-gray-200 rounded-card p-6 hover:border-gray-300 transition-colors"
            style={{ borderWidth: '0.5px' }}
          >
            <div className={`w-12 h-12 ${feature.bgColor} rounded-button flex items-center justify-center mb-4`}>
              <FeatureIcon type={feature.icon} className={feature.iconColor} />
            </div>
            <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
