import MetricsCards from './MetricCards'

export default function Demo() {
    const sampleMetrics = [
        { label: 'Total Agents', value: 50 },
        { label: 'Interested', value: 2 },
        { label: 'Calls', value: 100 },
        { label: 'Connects', value: 350 },
        { label: 'RNR', value: 125 },
        { label: 'Enquiry', value: 125 },
        { label: 'Agents Enquired', value: 10 },
        { label: 'App Installed', value: 125 },
        { label: 'App Installed', value: 125 },
        { label: 'App Installed', value: 125 },
        { label: 'App Installed', value: 125 },
        { label: 'App Installed', value: 125 },
    ]

    return (
        <div className='p-6 bg-gray-50 min-h-screen'>
            <div className='max-w-7xl mx-auto'>
                <h2 className='text-2xl font-bold mb-6 text-gray-900'>Dashboard Metrics</h2>
                <MetricsCards metrics={sampleMetrics} />
            </div>
        </div>
    )
}
