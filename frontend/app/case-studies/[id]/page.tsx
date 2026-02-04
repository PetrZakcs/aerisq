export default function CaseStudyPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen bg-aeris-black text-white flex items-center justify-center font-mono">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">CASE STUDY: ID #{params.id}</h1>
                <p className="text-gray-500">CLASSIFIED DATA. ACCESS LEVEL TOO LOW.</p>
                <a href="/" className="mt-8 inline-block text-radar-green border border-radar-green px-4 py-2 hover:bg-radar-green hover:text-black transition-colors">
                    RETURN TO BASE
                </a>
            </div>
        </div>
    )
}
