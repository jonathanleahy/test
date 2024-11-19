import { useState } from 'react';
import * as React from 'react';
import {
    ArrowUpDown,
    ExternalLink,
    MoreVertical,
    Search,
    CheckCircle2,
    XCircle,
    RotateCw,
    Star,
    Activity,
    PauseCircle, PlayCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const getStatusIcon = (status: string, argocdStep: string) => {
    let parsedStep;
    try {
        parsedStep = JSON.parse(argocdStep);
    } catch (e) {
        parsedStep = {};
    }

    console.log("Status:", status);
    switch (status) {
        case 'In Progress': {
            const duration = parsedStep.pause?.duration ? `Paused for ${parsedStep.pause.duration}` : 'Paused';
            return (
                <div className="flex items-center">
                    {parsedStep.pause?.duration ? (
                        <RotateCw className="text-blue-500 animate-spin" />
                    ) : (
                        <PlayCircle className="text-orange-500" />
                    )}
                    <span className="ml-2">{status} {duration}</span>
                </div>
            );
        }
        case 'Up to date':
            return (
                <div className="flex items-center">
                    <CheckCircle2 className="text-green-500" />
                    <span className="ml-2">{status}</span>
                </div>
            );
        case 'No Deployment':
            return (
                <div className="flex items-center">
                    <XCircle className="text-yellow-500" />
                    <span className="ml-2">{status}</span>
                </div>
            );
        default: {
            const duration = parsedStep.pause?.duration ? `Paused for ${parsedStep.pause.duration}` : 'Paused';
            return (
                <div className="flex items-center">
                    {parsedStep.pause?.duration ? (
                        <RotateCw className="text-orange-500 animate-spin" />
                    ) : (
                        <PlayCircle className="text-orange-500" />
                    )}
                    <span className="ml-2">{duration}</span>
                </div>
            );
        }
    }
};

const getTypeIcon = (type: string) => {
    return type === 'primary' ?
        <Star className="h-5 w-5 text-primary"/> :
        <Activity className="h-5 w-5 text-secondary" />
}

const DeploymentProgress: React.FC<{
    deployments: { type: string; percentage: number }[];
    status: string;
    argocdWeight: number;
}> = ({ deployments, status, argocdWeight }) => {
    const stable = deployments.find(d => d.type === "stable");
    const canary = deployments.find(d => d.type === "canary");

    if (!stable || !canary) {
        return null;
    }

    const totalPercentage = stable.percentage + canary.percentage;

    if (totalPercentage !== 100) {
        console.error("The total percentage of stable and canary deployments must be 100%");
        return null;
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span>{status}</span>
                <span className="text-xs text-muted-foreground">
        {`${100 - argocdWeight}% / ${argocdWeight}%`}
    </span>
            </div>
            <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full relative">
                <div
                    className="h-full bg-gray-500 absolute left-0 top-0"
                    style={{width: `${100 - argocdWeight}%`}}
                />
                <div
                    className="h-full bg-green-500 absolute left-0 top-0"
                    style={{width: `${argocdWeight}%`, marginLeft: `${100 - argocdWeight}%`}}
                />
                <div
                    className="h-full bg-green-500 absolute left-0 top-0"
                    style={{width: `${argocdWeight}%`, marginLeft: `${stable.percentage + canary.percentage}%`}}
                />
            </div>
        </div>
    );
};

export const WorkDashboard = ({isLoading, mockData}: { isLoading: boolean; mockData: any | null }) => {
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [sortColumn, setSortColumn] = useState("appName");
    const [searchTerm, setSearchTerm] = useState("");

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!mockData) {
        return <div>No data available</div>;
    }

    const sortedApps = [...(mockData.apps || [])].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    const handleSort = (column: string) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const getDeploymentStatus = (deployments: any[]) => {
        if (deployments.length === 0) return { status: "No Deployment", color: "text-yellow-500" };
        if (deployments.length === 1 && deployments[0].percentage === 100) {
            return { status: "Up to date", color: "text-green-500" };
        }
        if (deployments.length > 1 || deployments[0].percentage < 100) {
            return { status: "In Progress", color: "text-blue-500" };
        }
        return { status: "Unknown", color: "text-gray-500" };
    };


    return (
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl">Work Dashboard: {mockData.repoName}</CardTitle>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={mockData.repoBitUrl} target="_blank" rel="noopener noreferrer">
                                Repository <ExternalLink className="ml-1 h-4 w-4" />
                            </a>
                        </Button>
                        <span className="text-sm text-gray-500">
                            ArgoCD
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative w-64">
                            <Input
                                type="text"
                                placeholder="Search applications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-500">
                            Total Apps: {sortedApps.length}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                            <tr className="bg-muted/50">
                                <th className="p-4 text-left text-xs font-medium text-muted-foreground">Type</th>
                                <th className="p-4 text-left text-xs font-medium text-muted-foreground">
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort("appName")}
                                        className="h-8 px-2 text-xs font-medium"
                                    >
                                        App Name
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </th>
                                <th className="p-4 text-left text-xs font-medium text-muted-foreground">Version</th>
                                <th className="p-4 text-left text-xs font-medium text-muted-foreground">Deployment Status</th>
                                <th className="p-4 text-left text-xs font-medium text-muted-foreground">ArgoCD Status</th>
                                <th className="p-4 text-left text-xs font-medium text-muted-foreground">.---</th>

                            </tr>
                            </thead>
                            <tbody className="text-sm space-y-1">
                            {sortedApps.map((app) => {
                                const deploymentStatus = getDeploymentStatus(app.deployment.deployments);
                                return (
                                    <tr key={app.appName} className="border-b border-muted/50 hover:bg-muted/50">
                                        <td className="p-4">
                                            {getTypeIcon(app.type)}
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-2 text-left">
                                                <div>{app.appName.replace(mockData.repoName + '-', '')}</div>
                                                <div
                                                    className="text-xs text-muted-foreground capitalize">{app.type}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-2">
                                                {app.deployment.deployments.map((deployment: any, index: number) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <span className="font-medium">{deployment.type}:</span>
                                                        <span>{deployment.version}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <DeploymentProgress
                                                deployments={app.deployment.deployments}
                                                status={deploymentStatus.status}
                                                argocdWeight={parseFloat(app.argocd.status.weight)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="h-10 px-6 text-xs flex items-center justify-center w-36 rounded">
                                                        {getStatusIcon(deploymentStatus.status, app.argocd?.status?.step?.[0] || '{}')}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <a href={app.argocd.url} target="_blank" rel="noopener noreferrer">
                                                            View in ArgoCD
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <a href={app.grafana.url} target="_blank" rel="noopener noreferrer">
                                                            View in Grafana
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>View logs</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WorkDashboard;