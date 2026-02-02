export default {
  name: 'missionReport',
  title: 'Mission Report (Case Study)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g., Invisible Drought Pilot',
      validation: Rule => Rule.required()
    },
    {
      name: 'location',
      title: 'Location / Scale',
      type: 'string',
      description: 'e.g., South Moravia [500ha]',
      validation: Rule => Rule.required()
    },
    {
      name: 'detection',
      title: 'Detection Metric',
      type: 'string',
      description: 'e.g., -4.2dB Drop',
      validation: Rule => Rule.required()
    },
    {
      name: 'outcome',
      title: 'Operational Outcome',
      type: 'string',
      description: 'e.g., Yield Saved',
      validation: Rule => Rule.required()
    },
    {
      name: 'visual',
      title: 'Visual Evidence',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }
      ],
      description: 'Comparison Image or Radar Overlay',
      validation: Rule => Rule.required()
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: (new Date()).toISOString(),
    }
  ]
}
