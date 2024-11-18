// src/components/JsonFetcher.tsx
import React, { useEffect, useState } from 'react';

const JsonFetcher: React.FC = () => {
    const [jsonData, setJsonData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/example.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setJsonData(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>JSON Data</h1>
            <pre>{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
    );
};

export default JsonFetcher;