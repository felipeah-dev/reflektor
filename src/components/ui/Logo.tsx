import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    showText?: boolean;
    textSize?: string;
}

export function Logo({ className, showText = true, textSize = "text-xl" }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <img
                src="/brand/logo.jpg"
                alt="Reflektor Logo"
                className="size-8 object-contain"
            />
            {showText && (
                <h2 className={cn("font-display font-black tracking-tighter text-white", textSize)}>
                    REFLEKTOR
                </h2>
            )}
        </div>
    );
}
