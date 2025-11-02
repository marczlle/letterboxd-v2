import Image from "next/image";

const sizeClasses: Record<string, string> = {
    small: "w-32",
    medium: "w-48",
    large: "w-64",
};

export default function Movie({
    size = "medium",
    posterPath = "",
    title = "Sem título",
    popularity = "0",
    averageRating = "0",
}: {
    size?: "small" | "medium" | "large";
    posterPath?: string;
    title?: string;
    popularity?: string;
    averageRating?: string;
}) {
    return (
    <div>
        <Image
            src={`https://image.tmdb.org/t/p/original/${posterPath}`}
            width={1000}
            height={1500}
            alt={title}
            className={`object-contain ${sizeClasses[size]} h-auto rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 bg-slate-300`}
        />
    </div>
    );
}
