migrate(
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('site_settings')
      const records = app.findRecordsByFilter('site_settings', '', '-created', 1, 0)
      const visualParams = {
        transparent_background: true,
        blend_mode: 'transparent',
        bg_color: 'transparent',
        remove_white_box: true,
        logo_variant: 'orange',
        aspect_ratio: '380/140',
        hero_logo_transparent: true,
        updated_at: new Date().toISOString(),
      }
      if (records.length === 0) {
        const rec = new Record(collection)
        rec.set('logo_visual_params', visualParams)
        rec.set('updated', new Date().toISOString())
        app.save(rec)
      } else {
        const rec = records[0]
        rec.set('logo_visual_params', visualParams)
        rec.set('updated', new Date().toISOString())
        app.save(rec)
      }
    } catch (err) {
      console.log('Migration 0121_fix_logo_visual_integrity error:', err)
    }
  },
  (app) => {},
)
