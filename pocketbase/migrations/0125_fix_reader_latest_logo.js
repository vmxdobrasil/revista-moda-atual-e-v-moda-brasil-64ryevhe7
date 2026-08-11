migrate(
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('site_settings')
      const records = app.findRecordsByFilter('site_settings', '', '-created', 10, 0)
      const visualParams = {
        transparent_background: true,
        blend_mode: 'normal',
        bg_color: 'transparent',
        remove_white_box: true,
        logo_variant: 'orange',
        aspect_ratio: '380/140',
        hero_logo_transparent: true,
        dropShadow: false,
        rounded: false,
        overflowVisible: true,
        bgTransparent: true,
        use_vector_logo: true,
        updated_at: new Date().toISOString(),
      }
      if (records.length === 0) {
        const rec = new Record(collection)
        rec.set('logo_file', null)
        rec.set('logo_visual_params', visualParams)
        app.save(rec)
      } else {
        for (const rec of records) {
          rec.set('logo_file', null)
          rec.set('logo_visual_params', visualParams)
          app.save(rec)
        }
      }
    } catch (err) {
      console.log('Migration 0125_fix_reader_latest_logo error:', err)
    }
  },
  (app) => {},
)
