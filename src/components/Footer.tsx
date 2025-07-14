import React from 'react';
import { ExternalLink, Github, Shield, Database } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-700 border-t border-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Disclaimer Section */}
        <div className="mb-6 p-4 bg-gray-900/20 border border-gray-600 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-200">
              <p className="mb-2">
                <strong>Disclaimer:</strong> Uniswap LP Dashboard is not affiliated with Uniswap Labs or any other third-party projects. 
                It's an open-source project developed by <span className="text-gray-300 font-semibold">HexaOne Labs</span> to 
                help users track their LP positions and performances. All data is fetched on-chain and is not stored on any server. 
                Uniswap LP Dashboard is not responsible for any losses or damages incurred while using this application. Use at your own risk.
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-300">
                <span className="flex items-center space-x-1">
                  <Database className="h-3 w-3" />
                  <span>On-chain data only</span>
                </span>
                <span>•</span>
                <span>No server storage</span>
                <span>•</span>
                <span>Use at your own risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Uniswap LP Dashboard</h3>
            <p className="text-sm text-gray-400">
              Track and analyze your Uniswap V3 liquidity positions in real-time.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">
                Open Source
              </span>
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
                Decentralized
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="text-md font-semibold text-white">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                <span>Real-time LP position tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                <span>Performance analytics</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                <span>100% on-chain data</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                <span>Intuitive interface</span>
              </li>
            </ul>
          </div>

          {/* Links & Credits */}
          <div className="space-y-3">
            <h4 className="text-md font-semibold text-white">Links</h4>
            <div className="space-y-2">
              <a 
                href="https://github.com/hexaonelabs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>Source code</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://uniswap.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Uniswap Protocol</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div className="text-sm text-gray-400">
            © 2025 HexaOne Labs. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>Made with ❤️ by</span>
            <a 
              href="https://hexaonelabs.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              HexaOne Labs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;