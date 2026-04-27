import React from 'react'

export default function Hero({ onGetStarted, onVerify }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span className="text-sm text-gray-700">Powered by blockchain verification</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium mb-6 leading-tight">
          Medical records you can{' '}
          <span className="text-primary">trust</span>,{' '}
          <span className="text-primary">verify</span>,{' '}
          <span className="text-primary">share</span>
        </h1>

        {/* Subtext */}
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Own your health data with decentralized storage and cryptographic proof that puts you in control.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button onClick={onGetStarted} className="px-8 py-3 bg-primary text-white rounded-button hover:bg-primary/90 transition-colors font-medium">
            Get started as patient
          </button>
          <button onClick={onVerify} className="px-8 py-3 border border-gray-300 rounded-button hover:border-gray-400 transition-colors font-medium">
            Verify a record
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-gray-200">
          <div>
            <div className="text-3xl font-medium mb-1">12,400+</div>
            <div className="text-sm text-gray-600">Records verified</div>
          </div>
          <div>
            <div className="text-3xl font-medium mb-1">830+</div>
            <div className="text-sm text-gray-600">Verified doctors</div>
          </div>
          <div>
            <div className="text-3xl font-medium mb-1">100%</div>
            <div className="text-sm text-gray-600">On-chain proof</div>
          </div>
          <div>
            <div className="text-3xl font-medium mb-1">0</div>
            <div className="text-sm text-gray-600">Data breaches</div>
          </div>
        </div>
      </div>
    </section>
  )
}
