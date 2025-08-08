import React from 'react';
import type {Pill} from '../types';

interface PillDrawerProps {
    pill: Pill | null;
}

const PillDrawer: React.FC<PillDrawerProps> = ({ pill }) => {
    if (!pill) return null;

    return (
        <div
            className={`absolute border-2 border-gray-600 ${pill.color} opacity-70`}
            style={{
                left: pill.x,
                top: pill.y,
                width: pill.width,
                height: pill.height,
                borderRadius: '20px'
            }}
        />
    );
};

export default PillDrawer;
