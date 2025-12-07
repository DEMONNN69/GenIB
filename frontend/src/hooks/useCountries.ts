import { useState, useEffect } from 'react';

export interface Country {
  name: string;
  code: string;
  flag: string; // SVG or PNG URL
}

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
        
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }

        const data = await response.json();
        
        // Transform the data to our format
        const formattedCountries: Country[] = data
          .map((country: any) => ({
            name: country.name.common,
            code: country.cca2,
            flag: country.flags.svg || country.flags.png, // Use SVG flag URL
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load countries');
        // Fallback to common countries if API fails
        setCountries([
          { name: 'India', code: 'IN', flag: 'https://flagcdn.com/in.svg' },
          { name: 'United States', code: 'US', flag: 'https://flagcdn.com/us.svg' },
          { name: 'United Kingdom', code: 'GB', flag: 'https://flagcdn.com/gb.svg' },
          { name: 'Canada', code: 'CA', flag: 'https://flagcdn.com/ca.svg' },
          { name: 'Australia', code: 'AU', flag: 'https://flagcdn.com/au.svg' },
          { name: 'Singapore', code: 'SG', flag: 'https://flagcdn.com/sg.svg' },
          { name: 'United Arab Emirates', code: 'AE', flag: 'https://flagcdn.com/ae.svg' },
          { name: 'Saudi Arabia', code: 'SA', flag: 'https://flagcdn.com/sa.svg' },
          { name: 'Malaysia', code: 'MY', flag: 'https://flagcdn.com/my.svg' },
          { name: 'New Zealand', code: 'NZ', flag: 'https://flagcdn.com/nz.svg' },
        ].sort((a, b) => a.name.localeCompare(b.name)));
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};
