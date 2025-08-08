import React from 'react';

const Instructions: React.FC = () => (
    <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-md">
        <h2 className="font-bold text-lg mb-2">Pill Splitter</h2>
        <ul className="text-sm space-y-1">
            <li>• <strong>Draw:</strong> Click and drag in empty space to create pills</li>
            <li>• <strong>Split:</strong> Single click in empty space to split intersecting pills</li>
            <li>• <strong>Move:</strong> Click and drag pills to move them around</li>
            <li>• Red lines follow your cursor and show where splits will occur</li>
        </ul>
    </div>
);

export default Instructions;
