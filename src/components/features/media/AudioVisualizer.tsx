export function AudioVisualizer() {
    return (
        <div className="flex items-end justify-between h-8 gap-0.5">
            <div className="w-1 bg-primary/20 rounded-full h-[40%]"></div>
            <div className="w-1 bg-primary/40 rounded-full h-[60%]"></div>
            <div className="w-1 bg-primary/60 rounded-full h-[80%]"></div>
            <div className="w-1 bg-primary rounded-full h-[50%] animate-pulse"></div>
            <div className="w-1 bg-primary rounded-full h-[90%]"></div>
            <div className="w-1 bg-primary/80 rounded-full h-[70%]"></div>
            <div className="w-1 bg-primary/60 rounded-full h-[45%]"></div>
            <div className="w-1 bg-primary/40 rounded-full h-[30%]"></div>
            <div className="w-1 bg-primary/20 rounded-full h-[20%]"></div>
            <div className="w-1 bg-primary/20 rounded-full h-[20%]"></div>
        </div>
    );
}
