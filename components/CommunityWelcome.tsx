import React from 'react';

interface CommunityWelcomeProps {
  contributorName?: string;
  contributionCount?: number;
}

export default function CommunityWelcome({ 
  contributorName = "Community Member", 
  contributionCount = 0 
}: CommunityWelcomeProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to the GRC Resume Builder Community! 🎉
          </h2>
          <p className="text-gray-700 mb-4">
            Thank you <span className="font-semibold text-blue-600">{contributorName}</span> for contributing to our community project!
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              🚀 Contributions: <span className="font-bold ml-1">{contributionCount}</span>
            </span>
            <span className="flex items-center">
              🌟 Status: <span className="font-bold ml-1 text-green-600">Active Contributor</span>
            </span>
          </div>
        </div>
        <div className="text-4xl">🎯</div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">Your Impact:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Helping GRC professionals find better jobs</li>
          <li>• Improving open source collaboration</li>
          <li>• Learning modern development skills</li>
          <li>• Building your professional portfolio</li>
        </ul>
      </div>
    </div>
  );
}
