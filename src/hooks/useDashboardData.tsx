import { useState, useEffect } from 'react';

// Types definition (unchanged)
export type Deployment = {
    nodeCount: number,
    nodeNames: string[],
    percentage: number,
    podCount: number,
    type: string,
    version: string,
};

export type App = {
    appName: string,
    argocd: { url: string },
    deployment: {
        deployments: Deployment[],
        totalPods: number,
    },
    grafana: { url: string },
    images: string[],
    type: string,
};

export type DashboardData = {
    apps: App[],
    argocd: { url: string },
    repoBitUrl: string,
    repoName: string,
};

export const useDashboardData = (url: string): { data: DashboardData | null, loading: boolean, error: Error | null } => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result: DashboardData = await response.json();
                setData(result);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, loading, error };
};