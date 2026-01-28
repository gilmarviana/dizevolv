import React, { createContext, useContext, useState, useEffect } from 'react';
import { featureFlagService, type FeatureFlag } from '@/services/featureFlagService';

interface FeatureFlagContextType {
    isEnabled: (flag: FeatureFlag) => boolean;
    toggleFlag: (flag: FeatureFlag) => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [flags, setFlags] = useState(featureFlagService.getFlags());

    useEffect(() => {
        // Sync flags if they change elsewhere
        const interval = setInterval(() => {
            setFlags(featureFlagService.getFlags());
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const isEnabled = (flag: FeatureFlag) => flags[flag] || false;

    const toggleFlag = (flag: FeatureFlag) => {
        const newValue = !isEnabled(flag);
        featureFlagService.setFlag(flag, newValue);
        setFlags({ ...flags, [flag]: newValue });
    };

    return (
        <FeatureFlagContext.Provider value={{ isEnabled, toggleFlag }}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagContext);
    if (!context) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
    }
    return context;
};
