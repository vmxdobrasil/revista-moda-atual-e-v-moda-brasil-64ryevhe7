migrate(
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('site_settings')
      let records = []
      try {
        records = app.findRecordsByFilter('site_settings', '', '-created', 10, 0)
      } catch (_) {}

      const visualParams = {
        transparent_background: true,
        blend_mode: 'transparent',
        bg_color: 'transparent',
        remove_white_box: true,
        use_vector_logo: true,
        logo_variant: 'orange',
        aspect_ratio: '380/140',
        hero_logo_transparent: true,
        header_single_logo: true,
        reader_single_logo: true,
        updated_at: new Date().toISOString(),
      }

      if (records.length === 0) {
        const rec = new Record(collection)
        rec.set('logo_file', null)
        rec.set('logo_visual_params', visualParams)
        rec.set('updated', new Date().toISOString())
        app.save(rec)
      } else {
        for (const rec of records) {
          rec.set('logo_file', null)
          rec.set('logo_visual_params', visualParams)
          rec.set('updated', new Date().toISOString())
          app.save(rec)
        }
      }
    } catch (err) {
      console.log('Migration 0126_fix_reader_single_logo_transparency error:', err)
    }
  },
  (app) => {},
)
