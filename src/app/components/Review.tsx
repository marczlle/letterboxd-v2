import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";

export default function Review({
    reviewerName = "Anônimo",
    reviewText = "Nenhum comentário fornecido.",
    reviewerAvatar = "/images/reviewer1.jpg",
    stars = "0"
} : {
    reviewerName?: string;
    reviewText?: string;
    reviewerAvatar?: string;
    stars?: string;
}) {
    return (
        <div className="flex flex-row gap-4 my-4 border-b border-[#CC083E] pb-4">
            <Image
                src={reviewerAvatar}
                width={64}
                height={64}
                alt="Reviewer Avatar"
                className="w-12 h-12 rounded-full"
            />
            <div className="flex flex-col">

                <div className="flex flex-row justify-center items-center gap-2 place-self-start">
                    <span className="font-bold">{reviewerName}</span>
                    <Star className="w-6 h-6 shrink-0 text-[#fff455] fill-[#fff455]"/>
                    <span className="text-[#fff455]">0.0</span>
                </div>

                <p className="text-slate-300 mt-2 text-left whitespace-pre-wrap wrap-break-words">{reviewText}</p>

            </div>
        </div>
    );
}