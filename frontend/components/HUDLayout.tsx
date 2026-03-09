export default function HUDLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative w-full min-h-screen">
            {children}
        </div>
    )
}
