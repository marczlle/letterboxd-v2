import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const sizeClasses: Record<string, string> = {
    small: "w-32",
    medium: "w-48",
    large: "w-64",
};

// Placeholder de fallback (pode trocar por um asset local ou outro link)
const FALLBACK_POSTER = "/images/template.png";

export default function Movie({
    size = "medium",
    posterPath = "",
    title = "Sem título",
    popularity = "0",
    averageRating = "0",
    id = "0",
}: {
    size?: "small" | "medium" | "large";
    posterPath?: string;
    title?: string;
    popularity?: string;
    averageRating?: string;
    id?: string;
}) {
    const [imgSrc, setImgSrc] = useState(
        posterPath
            ? `https://image.tmdb.org/t/p/original/${posterPath}`
            : FALLBACK_POSTER
    );

    const formattedPopularity = parseFloat(popularity);
    const formattedRating = parseFloat(averageRating).toFixed(1);
    const encodedPosterPath = encodeURIComponent(posterPath);

    return (
        <Link href={`/movie/${encodedPosterPath}`}>
            <div className={`relative ${sizeClasses[size]} h-auto group cursor-pointer`}>
                <Image
                    src={imgSrc}
                    width={1000}
                    height={1500}
                    alt={title}
                    className={`object-cover w-full h-auto rounded-lg shadow-lg
                                group-hover:scale-105 transition-transform duration-300
                                bg-slate-300`}
                    onError={() => setImgSrc(FALLBACK_POSTER)} // 👈 Fallback se der erro
                />

                {/* Overlay de informações */}
                <div
                    className={`
                        absolute inset-0 bg-black bg-opacity-75 rounded-lg
                        flex flex-col items-center justify-center p-2
                        opacity-0 group-hover:opacity-75
                        transition-opacity duration-300
                        pointer-events-none
                        ${sizeClasses[size]} h-full
                    `}
                >
                    <h3 className="text-white text-lg font-bold text-center mb-2 leading-tight">
                        {title}
                    </h3>
                    <div className="flex items-center text-white text-sm mb-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 mr-1 text-blue-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                        <span className="text-2xl">{formattedPopularity}</span>
                    </div>
                    <div className="flex items-center text-white text-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 mr-1 text-yellow-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-2xl">{formattedRating}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
