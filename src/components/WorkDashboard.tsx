import { useState } from 'react';
import { ArrowUpDown, ExternalLink, CheckCircle, XCircle, AlertCircle, MoreVertical, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { App, Deployment, DashboardData } from "@/hooks/useDashboardData";

export const WorkDashboard = ({ isLoading, mockData }: { isLoading: boolean; mockData: DashboardData | null }) => {
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [sortColumn, setSortColumn] = useState<keyof App>("appName");
    const [searchTerm, setSearchTerm] = useState<string>("");

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

    const handleSort = (column: keyof App) => {
        if (column === sortColumn) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const getDeploymentStatus = (deployments: Deployment[]) => {
        if (deployments.length === 0) return { status: "No Deployment", icon: <AlertCircle className="text-yellow-500" />, color: "bg-yellow-100 text-yellow-800" };
        if (deployments.length === 1 && deployments[0].percentage === 100) {
            return { status: "Completed", icon: <CheckCircle className="text-green-500" />, color: "bg-green-100 text-green-800" };
        }
        if (deployments.length > 1 || deployments[0].percentage < 100) {
            return { status: "In Progress", icon: <AlertCircle className="text-blue-500" />, color: "bg-blue-100 text-blue-800" };
        }
        return { status: "Unknown", icon: <XCircle className="text-red-500" />, color: "bg-red-100 text-red-800" };
    };

    return (
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold">Work Dashboard: {mockData.repoName}</CardTitle>
                    <div className="flex space-x-2">
                        <a
                            href={mockData.repoBitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                            <Button variant="outline" size="sm">
                                Repository <ExternalLink className="ml-1 w-4 h-4" />
                            </Button>
                        </a>
                        <a
                            href={mockData.argocd.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                            <Button variant="outline" size="sm">
                                ArgoCD <ExternalLink className="ml-1 w-4 h-4" />
                            </Button>
                        </a>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort("appName")}
                                        className="font-bold"
                                    >
                                        App Name <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort("type")}
                                        className="font-bold"
                                    >
                                        Type <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="font-bold">Version</TableHead>
                                <TableHead className="font-bold">Deployment Status</TableHead>
                                <TableHead className="font-bold">Pods</TableHead>
                                <TableHead className="font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedApps.map((app) => {
                                const deploymentStatus = getDeploymentStatus(app.deployment.deployments);
                                return (
                                    <TableRow key={app.appName} className="hover:bg-gray-50 transition-colors duration-200">
                                        <TableCell className="font-medium">{app.appName}</TableCell>
                                        <TableCell>
                                            <Badge variant={app.type === "primary" ? "default" : "secondary"}>
                                                {app.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {app.deployment.deployments.map((deployment, index) => (
                                                <div key={index} className="mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant="outline">{deployment.version}</Badge>
                                                        <span className="text-xs text-gray-500">({deployment.type})</span>
                                                    </div>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Progress value={deployment.percentage} className="h-2 w-full mt-1" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{deployment.percentage}% deployed</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${deploymentStatus.color} flex items-center space-x-1 w-fit`}>
                                                {deploymentStatus.icon}
                                                <span>{deploymentStatus.status}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono">
                                                {app.deployment.totalPods}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <a
                                                            href={app.argocd.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="cursor-pointer"
                                                        >
                                                            View in ArgoCD
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <a
                                                            href={app.grafana.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="cursor-pointer"
                                                        >
                                                            View in Grafana
                                                        </a>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}