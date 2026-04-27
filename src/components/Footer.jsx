import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-20" style={{ borderWidth: '0.5px' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} MedProof. All rights reserved.
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm">
            <a href="#privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
              Privacy
            </a>
            <a href="#terms" className="text-gray-600 hover:text-gray-900 transition-colors">
              Terms
            </a>
            <a href="#whitepaper" className="text-gray-600 hover:text-gray-900 transition-colors">
              Whitepaper
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
