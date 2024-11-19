import * as React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap } from 'lucide-react';

interface ReleaseInfo {
    version: string;
    percentage: number;
    type: "stable" | "canary";
}

interface ReleaseProgressProps {
    stableVersion: string;
    canaryVersion: string;
    stablePercentage: number;
    canaryPercentage: number;
    duration?: string;
}

export const ReleaseProgress: React.FC<ReleaseProgressProps> = ({
                                                                    stableVersion,
                                                                    canaryVersion,
                                                                    stablePercentage,
                                                                    canaryPercentage,
                                                                    duration = "Deploying"
                                                                }) => {
    const releases: ReleaseInfo[] = [
        { version: stableVersion, percentage: stablePercentage, type: "stable" },
        { version: canaryVersion, percentage: canaryPercentage, type: "canary" },
    ];

    return (
        <div className="w-full">
            <div className="mb-1 flex justify-between text-sm font-medium">
                <span>Stable</span>
                <span>Canary ({duration})</span>
            </div>
            <div className="h-10 flex rounded-full overflow-hidden">
                {releases.map((release) => (
                    <TooltipProvider key={release.type}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className={`h-full flex items-center justify-center ${
                                        release.type === "stable"
                                            ? "bg-blue-600"
                                            : "bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 relative overflow-hidden"
                                    }`}
                                    style={{ width: `${release.percentage}%` }}
                                    role="progressbar"
                                    aria-valuenow={release.percentage}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-label={`${release.type} release ${release.version}`}
                                >
                                    {release.type === "canary" && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-30 animate-slow-wave" />
                                    )}
                                    {release.type === "stable" ? (
                                        <>
                                            <Zap className="w-4 h-4 mr-1 text-white" />
                                            <span className="text-white font-semibold text-sm drop-shadow-md relative z-10">
                        {`${release.percentage}%`}
                      </span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4 mr-1 text-white animate-pulse" />
                                            <span className="text-white font-semibold text-sm drop-shadow-md relative z-10">
                        {`${release.percentage}%`}
                      </span>
                                        </>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{`${release.type === "stable" ? "Stable" : "Canary"} ${release.version}: ${release.percentage}%`}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
            <div className="mt-1 text-xs text-gray-500 flex justify-between">
                <span>v{stableVersion}</span>
                <span>v{canaryVersion}</span>
            </div>
        </div>
    );
};