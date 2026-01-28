export type FeatureFlag = 'use-new-dashboard' | 'enable-financial-reports' | 'show-trial-banner';

interface FeatureFlags {
    [key: string]: boolean;
}

const defaultFlags: FeatureFlags = {
    'use-new-dashboard': true,
    'enable-financial-reports': false,
    'show-trial-banner': true,
};

export const featureFlagService = {
    getFlags(): FeatureFlags {
        // In a real app, this could fetch from an API or Supabase
        const storedFlags = localStorage.getItem('feature_flags');
        if (storedFlags) {
            return { ...defaultFlags, ...JSON.parse(storedFlags) };
        }
        return defaultFlags;
    },

    isEnabled(flag: FeatureFlag): boolean {
        return this.getFlags()[flag] || false;
    },

    setFlag(flag: FeatureFlag, value: boolean) {
        const flags = this.getFlags();
        flags[flag] = value;
        localStorage.setItem('feature_flags', JSON.stringify(flags));
    }
};
