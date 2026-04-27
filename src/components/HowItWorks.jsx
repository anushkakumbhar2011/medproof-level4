import React from 'react'

const steps = [
  {
    number: '1',
    title: 'Upload',
    description: 'Securely upload your medical records to encrypted IPFS storage'
  },
  {
    number: '2',
    title: 'Verify',
    description: 'Doctor signs and verifies records on-chain with their credentials'
  },
  {
    number: '3',
    title: 'Access',
    description: 'Share verified records instantly with full cryptographic proof'
  }
]

export default function HowItWorks({ onStepClick }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="bg-gray-50 rounded-card p-12 md:p-16">
        <h2 className="text-4xl md:text-5xl font-medium text-center mb-16">
          How it works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <button onClick={onStepClick} className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-medium mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                <p className="text-gray-600 max-w-xs mx-auto">{step.description}</p>
              </button>
              
              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center">
                  <div className="w-px h-24 bg-gray-300"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
