interface MetricItem {
    label: string
    value: number | string
}

interface MetricsCardsProps {
    metrics: MetricItem[]
    className?: string
}

export default function MetricsCards({ metrics, className = '' }: MetricsCardsProps) {
    return (
        <div className={`flex gap-2 max-w-[100%] overflow-x-auto pb-2 ${className}`}>
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className='flex-none bg-white border border-gray-200 rounded-xl py-2 px-4 text-left min-w-[140px]'
                >
                    <div className='whitespace-nowrap text-sm text-gray-600 mb-0'>{metric.label}</div>
                    <div className='text-md font-semibold text-gray-900'>{metric.value}</div>
                </div>
            ))}
        </div>
    )
}
