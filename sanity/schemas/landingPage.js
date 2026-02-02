export default {
    name: 'landingPage',
    title: 'Landing Page Content',
    type: 'document',
    fields: [
        {
            name: 'heroHeadline',
            title: 'Hero Headline',
            type: 'string',
            description: 'Main title, e.g., Physics, not Art.',
            validation: Rule => Rule.required()
        },
        {
            name: 'ctaText',
            title: 'CTA Button Text',
            type: 'string',
            initialValue: 'Join Waitlist'
        },
        {
            name: 'truthTestOpticalLabel',
            title: 'Optical Slider Label',
            type: 'string',
            initialValue: 'Optical (False)'
        },
        {
            name: 'truthTestRadarLabel',
            title: 'Radar Slider Label',
            type: 'string',
            initialValue: 'Radar (Truth)'
        }
    ]
}
