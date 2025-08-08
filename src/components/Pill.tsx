import React from 'react';
import type {Pill as PillType} from '../types';

interface PillProps {
    pill: PillType;
}

const Pill: React.FC<PillProps> = ({ pill }) => {
    return (
        <div
            className={`absolute border-2 border-gray-600 ${pill.color} cursor-move`}
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

export default Pill;
